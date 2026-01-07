<?php
/**
 * LEVEL 3: Image Generation Job Queue (PHP)
 * 
 * Endpoints:
 * - POST /proxy/image-job.php -> creates job, returns {jobId}
 * - GET /proxy/image-job.php?jobId=xxx -> returns {status, url?, error?}
 */

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load configuration
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration missing'], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require $configFile;
$apiKey = $config['openai_key'] ?? '';

if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Simple in-memory job store (in production, use Redis/Memcached/DB)
$jobsFile = __DIR__ . '/image-jobs.json';

function loadJobs(): array {
    global $jobsFile;
    if (!file_exists($jobsFile)) return [];
    $data = file_get_contents($jobsFile);
    return $data ? json_decode($data, true) ?? [] : [];
}

function saveJobs(array $jobs): void {
    global $jobsFile;
    // Clean old jobs (> 1 hour)
    $now = time();
    $jobs = array_filter($jobs, function($job) use ($now) {
        return ($now - ($job['created'] ?? 0)) < 3600;
    });
    file_put_contents($jobsFile, json_encode($jobs));
}

// GET: Check job status
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['jobId'])) {
    $jobId = $_GET['jobId'];
    $jobs = loadJobs();
    
    if (!isset($jobs[$jobId])) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Job not found'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    echo json_encode($jobs[$jobId], JSON_UNESCAPED_UNICODE);
    exit;
}

// POST: Create new job
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $imageBase64 = $body['image'] ?? '';
    $prompt = trim($body['prompt'] ?? '');
    $model = $body['model'] ?? 'gpt-image-1';
    $size = $body['size'] ?? '1024x1024';
    
    if (empty($imageBase64) || empty($prompt)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing image or prompt'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Generate job ID
    $jobId = bin2hex(random_bytes(16));
    
    // Create job entry
    $jobs = loadJobs();
    $jobs[$jobId] = [
        'status' => 'queued',
        'created' => time(),
        'prompt' => $prompt,
        'model' => $model,
        'size' => $size
    ];
    saveJobs($jobs);
    
    // Return job ID immediately (non-blocking)
    echo json_encode(['jobId' => $jobId], JSON_UNESCAPED_UNICODE);
    
    // Process job asynchronously (in background)
    // Note: In production, use proper job queue (Redis Queue, RabbitMQ, etc.)
    // For now, we'll process it immediately but return jobId first
    register_shutdown_function(function() use ($jobId, $imageBase64, $prompt, $model, $size, $apiKey) {
        processImageJob($jobId, $imageBase64, $prompt, $model, $size, $apiKey);
    });
    
    exit;
}

function processImageJob($jobId, $imageBase64, $prompt, $model, $size, $apiKey) {
    $jobs = loadJobs();
    
    if (!isset($jobs[$jobId])) return;
    
    // Update status to running
    $jobs[$jobId]['status'] = 'running';
    saveJobs($jobs);
    
    try {
        // Decode base64 image
        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageBase64));
        $tempFile = sys_get_temp_dir() . '/' . $jobId . '.png';
        file_put_contents($tempFile, $imageData);
        
        // Prepare multipart form data
        $cfile = new CURLFile($tempFile, 'image/png', 'image.png');
        
        $postFields = [
            'image' => $cfile,
            'prompt' => $prompt,
            'model' => $model,
            'n' => '1',
            'size' => $size
        ];
        
        // Call OpenAI API
        $ch = curl_init('https://api.openai.com/v1/images/edits');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        // Clean up temp file
        if (file_exists($tempFile)) {
            unlink($tempFile);
        }
        
        // Update job status
        $jobs = loadJobs();
        if (isset($jobs[$jobId])) {
            if ($httpCode === 200) {
                $responseData = json_decode($response, true);
                $url = $responseData['data'][0]['url'] ?? null;
                if ($url) {
                    $jobs[$jobId]['status'] = 'done';
                    $jobs[$jobId]['url'] = $url;
                } else {
                    $jobs[$jobId]['status'] = 'error';
                    $jobs[$jobId]['error'] = 'No URL in response';
                }
            } else {
                $jobs[$jobId]['status'] = 'error';
                $jobs[$jobId]['error'] = 'API error: ' . $httpCode;
            }
            saveJobs($jobs);
        }
    } catch (Exception $e) {
        $jobs = loadJobs();
        if (isset($jobs[$jobId])) {
            $jobs[$jobId]['status'] = 'error';
            $jobs[$jobId]['error'] = $e->getMessage();
            saveJobs($jobs);
        }
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
?>

