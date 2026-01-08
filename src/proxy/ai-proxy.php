<?php
/**
 * PAPI HAIR DESIGN - AI Proxy v3.0
 * Securely handles requests to Gemini API
 */

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

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? 'generate';

try {
    if ($action === 'analyze') {
        // Facial analysis using Gemini
        $model = $input['model'] ?? 'gemini-2.0-flash';
        $imageData = $input['imageData'] ?? '';
        $prompt = $input['prompt'] ?? '';
        
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
        echo json_encode($response);
        
    } elseif ($action === 'generate_image') {
        // Image generation using Imagen
        $model = 'imagen-4.0-generate-001';
        $prompt = $input['prompt'] ?? '';
        
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:predict?key={$GEMINI_KEY}";
        
        $payload = [
            'instances' => [
                ['prompt' => $prompt]
            ],
            'parameters' => [
                'sampleCount' => 1,
                'aspectRatio' => '3:4',
                'safetySetting' => 'block_few',
                'personGeneration' => 'allow_all'
            ]
        ];
        
        $response = makeRequest($url, $payload);
        echo json_encode($response);
        
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

function makeRequest($url, $payload) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("API returned HTTP {$httpCode}: {$result}");
    }
    
    return json_decode($result, true);
}
