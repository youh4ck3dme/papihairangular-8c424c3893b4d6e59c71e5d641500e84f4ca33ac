<?php
// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load configuration
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration missing']);
    exit;
}

$config = require $configFile;
$apiKey = $config['openai_key'] ?? '';

if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured']);
    exit;
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['image']) || !isset($input['prompt'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input data. Required: image, prompt']);
    exit;
}

// Extract parameters
$imageBase64 = $input['image'];
$prompt = $input['prompt'];
$model = $input['model'] ?? 'dall-e-2';
$size = $input['size'] ?? '1024x1024';
$n = $input['n'] ?? 1;

// Remove data URL prefix if present
if (strpos($imageBase64, 'data:image') === 0) {
    $imageBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $imageBase64);
}

// Decode base64 to binary
$imageData = base64_decode($imageBase64);
if ($imageData === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid base64 image data']);
    exit;
}

// Create temporary file for the image
$tempFile = tempnam(sys_get_temp_dir(), 'img_');
file_put_contents($tempFile, $imageData);

// Prepare multipart form data for OpenAI API
$boundary = uniqid();
$delimiter = '-------------' . $boundary;

$postData = '';

// Add image file
$postData .= "--" . $delimiter . "\r\n";
$postData .= 'Content-Disposition: form-data; name="image"; filename="image.png"' . "\r\n";
$postData .= 'Content-Type: image/png' . "\r\n\r\n";
$postData .= $imageData . "\r\n";

// Add prompt
$postData .= "--" . $delimiter . "\r\n";
$postData .= 'Content-Disposition: form-data; name="prompt"' . "\r\n\r\n";
$postData .= $prompt . "\r\n";

// Add model
$postData .= "--" . $delimiter . "\r\n";
$postData .= 'Content-Disposition: form-data; name="model"' . "\r\n\r\n";
$postData .= $model . "\r\n";

// Add n (number of images)
$postData .= "--" . $delimiter . "\r\n";
$postData .= 'Content-Disposition: form-data; name="n"' . "\r\n\r\n";
$postData .= $n . "\r\n";

// Add size
$postData .= "--" . $delimiter . "\r\n";
$postData .= 'Content-Disposition: form-data; name="size"' . "\r\n\r\n";
$postData .= $size . "\r\n";

$postData .= "--" . $delimiter . "--\r\n";

// Initialize cURL
$ch = curl_init('https://api.openai.com/v1/images/edits');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: multipart/form-data; boundary=' . $delimiter,
    'Content-Length: ' . strlen($postData)
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_TIMEOUT, 120); // 2 minute timeout for image generation

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Clean up temp file
unlink($tempFile);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Curl error: ' . curl_error($ch)]);
} else {
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>

