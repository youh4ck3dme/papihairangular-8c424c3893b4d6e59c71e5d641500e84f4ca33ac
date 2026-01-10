<?php
/**
 * PAPI HAIR DESIGN - AI Proxy v3.1
 * Securely handles requests to Gemini API
 * Fixed for mobile image uploads
 */

// Increase allowed POST size for large image data from mobile
ini_set('post_max_size', '20M');
ini_set('upload_max_filesize', '20M');
ini_set('max_execution_time', '300');
ini_set('memory_limit', '256M');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', '/tmp/ai-proxy-errors.log');

// Log file for request debugging
define('AI_LOG_FILE', '/tmp/ai-proxy.log');

function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    @file_put_contents(AI_LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load API Key from environment
$GEMINI_KEY = getenv('GEMINI_API_KEY') ?: '';

if (!$GEMINI_KEY) {
    http_response_code(500);
    echo json_encode(['error' => 'Gemini API Key missing on server. Set GEMINI_API_KEY in /etc/environment']);
    exit;
}

// Rate limiting: Unlimited (was 10)
$rateLimit = 1000000;
$ratePeriod = 86400; // 24 hours in seconds
// Use /tmp which is usually writable
$rateLimitFile = sys_get_temp_dir() . '/papi-rate-limit.json';

$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// Load rate limit data
$rateLimitData = [];
if (file_exists($rateLimitFile)) {
    $rateLimitData = json_decode(file_get_contents($rateLimitFile), true) ?: [];
}

// Clean up old entries (> 24h)
$now = time();
foreach ($rateLimitData as $ip => $data) {
    if ($now - $data['first_request'] > $ratePeriod) {
        unset($rateLimitData[$ip]);
    }
}

// Check rate limit for current IP
if (isset($rateLimitData[$clientIp])) {
    $ipData = $rateLimitData[$clientIp];
    if ($ipData['count'] >= $rateLimit && ($now - $ipData['first_request']) < $ratePeriod) {
        http_response_code(429);
        $remainingTime = ceil(($ipData['first_request'] + $ratePeriod - $now) / 3600);
        echo json_encode([
            'error' => 'Rate limit exceeded',
            'message' => "Dosiahli ste denný limit $rateLimit generovaní. Skúste znova o $remainingTime hodín.",
            'retry_after' => $remainingTime
        ]);
        exit;
    }
}

$input = json_decode(file_get_contents('php://input'), true);

// Log incoming request
$contentLength = $_SERVER['CONTENT_LENGTH'] ?? 0;
logMessage("Request received: action=" . ($input['action'] ?? 'unknown') . ", content_length=$contentLength bytes, IP=$clientIp");

$action = $input['action'] ?? 'generate';

try {
    if ($action === 'analyze') {
        // Facial analysis using Gemini
        $model = $input['model'] ?? 'gemini-2.0-flash';
        // Accept both 'imageData' and 'image' fields
        $imageData = $input['imageData'] ?? $input['image'] ?? '';
        $prompt = $input['prompt'] ?? '';
        
        if (empty($imageData)) {
            logMessage("ERROR: No image data provided for analyze action");
            http_response_code(400);
            echo json_encode(['error' => 'No image data provided', 'code' => 'MISSING_IMAGE']);
            exit;
        }
        
        logMessage("Analyze request: model=$model, image_size=" . strlen($imageData) . " chars");
        
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$GEMINI_KEY}";
        
        $payload = [
            'contents' => [
                'parts' => [
                    ['inlineData' => ['mimeType' => 'image/jpeg', 'data' => $imageData]],
                    ['text' => $prompt]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95
            ]
        ];
        
        $response = makeRequest($url, $payload);
        logMessage("Analyze success");
        echo json_encode($response);
        
    } elseif ($action === 'generate_image') {
        // Image generation using Gemini 2.0 Flash with native image generation
        $model = 'gemini-2.0-flash-exp';
        $prompt = $input['prompt'] ?? '';
        // Accept both 'image' and 'imageData' fields for flexibility
        $base64Image = $input['image'] ?? $input['imageData'] ?? null;
        
        logMessage("Generate image request: prompt_length=" . strlen($prompt) . ", has_image=" . ($base64Image ? 'yes' : 'no'));
        
        if ($base64Image) {
            // Validate base64 - remove data URI prefix if present
            if (strpos($base64Image, 'data:image') === 0) {
                $base64Image = preg_replace('/^data:image\/\w+;base64,/', '', $base64Image);
                logMessage("Stripped data URI prefix from image");
            }
            
            // Basic base64 validation
            if (!preg_match('/^[A-Za-z0-9+\/=]+$/', $base64Image)) {
                logMessage("ERROR: Invalid base64 image data");
                http_response_code(400);
                echo json_encode(['error' => 'Invalid base64 image data', 'code' => 'INVALID_BASE64']);
                exit;
            }
            
            logMessage("Image data validated, size=" . strlen($base64Image) . " chars");
        }
        
        // Use Cloudflare Worker Proxy to bypass geo-restrictions
        // $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$GEMINI_KEY}";
        $url = "https://ai.papihairdesign.sk/generate"; // Route via Worker
        
        // Build content parts for Gemini 2.0 Flash native image generation
        $parts = [];
        
        // Add reference image if provided (for style transfer)
        if ($base64Image) {
            $parts[] = [
                'inlineData' => [
                    'mimeType' => 'image/jpeg',
                    'data' => $base64Image
                ]
            ];
            $parts[] = ['text' => "Based on the hairstyle in this image, create a similar professional salon photo with the following modifications: $prompt"];
        } else {
            $parts[] = ['text' => "Generate a professional salon photo of: $prompt. The image should be high quality, realistic, and suitable for a professional hair salon website."];
        }
        
        // Worker expects simplified payload which it transforms
        $payload = [
            'action' => 'generate_image',
            'prompt' => $prompt,
            'image' => $base64Image, // Worker handles normalization
            'model' => $model
        ];
        
        // Worker uses secret key, so we don't need to pass it in URL usually, 
        // BUT our PHP proxy logic expects to sign the request. 
        // For now, let's keep the PHP proxy generic and let the Worker handle the key.
        // We will pass the payload to the worker.
        
        $response = makeRequest($url, $payload);
        
        // Increment rate limit counter on successful generation
        if (isset($rateLimitData[$clientIp])) {
            $rateLimitData[$clientIp]['count']++;
            $rateLimitData[$clientIp]['last_request'] = $now;
        } else {
            $rateLimitData[$clientIp] = [
                'count' => 1,
                'first_request' => $now,
                'last_request' => $now
            ];
        }
        
        // Try to save rate limit, but don't crash if it fails
        try {
            @file_put_contents($rateLimitFile, json_encode($rateLimitData, JSON_PRETTY_PRINT));
        } catch (Exception $e) {
            error_log("Rate limit write error: " . $e->getMessage());
        }
        
        echo json_encode($response);
        
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    error_log("AI Proxy Error: " . $e->getMessage());
    echo json_encode(['error' => 'Server error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
}

function makeRequest($url, $payload) {
    global $GEMINI_KEY; // Only needed if verifying key presence, but curl uses it in URL
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        throw new Exception('Curl error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    $decoded = json_decode($response, true);
    
    if ($httpCode >= 400 || isset($decoded['error'])) {
        $errorMessage = $decoded['error']['message'] ?? 'Unknown API error';
        throw new Exception("API Error ($httpCode): $errorMessage");
    }
    
    return $decoded;
}

