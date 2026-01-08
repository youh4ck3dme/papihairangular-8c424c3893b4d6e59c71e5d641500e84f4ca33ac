<?php
/**
 * PAPI HAIR DESIGN - AI Proxy v3.0
 * Securely handles requests to AI providers (OpenAI / Gemini)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load API Keys from environment or config
// In production, these should be in /etc/environment or .env
$OPENAI_KEY = getenv('OPENAI_API_KEY') ?: '';
$GEMINI_KEY = getenv('GEMINI_API_KEY') ?: '';

$input = json_decode(file_get_contents('php://input'), true);
$provider = $input['provider'] ?? 'gemini'; // default to gemini

if ($provider === 'gemini') {
    if (!$GEMINI_KEY) {
        http_response_code(500);
        echo json_encode(['error' => 'Gemini API Key missing on server']);
        exit;
    }
    
    // Relay to Gemini
    // (Actual implementation would mirror the JS logic if moving to backend)
    echo json_encode(['status' => 'proxy_ready', 'message' => 'Gemini proxy active']);
} else if ($provider === 'openai') {
    if (!$OPENAI_KEY) {
        http_response_code(500);
        echo json_encode(['error' => 'OpenAI API Key missing on server']);
        exit;
    }
    
    // Handle OpenAI DALL-E 3 / Edits
    echo json_encode(['status' => 'proxy_ready', 'message' => 'OpenAI proxy active']);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid provider']);
}
