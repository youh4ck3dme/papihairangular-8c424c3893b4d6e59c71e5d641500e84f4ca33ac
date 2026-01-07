<?php
/**
 * LEVEL 3: Rate limiting (simple in-memory, 10 requests per minute per IP)
 */
function rateLimit(): bool {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ip = explode(',', $ip)[0]; // Get first IP if forwarded
    $key = 'rate_limit_' . md5($ip);
    
    $hitsFile = __DIR__ . '/rate-limit.json';
    $hits = file_exists($hitsFile) ? json_decode(file_get_contents($hitsFile), true) ?? [] : [];
    $now = time();
    
    if (!isset($hits[$key]) || ($now - $hits[$key]['resetAt']) > 60) {
        $hits[$key] = ['count' => 0, 'resetAt' => $now + 60];
    }
    
    $hits[$key]['count']++;
    file_put_contents($hitsFile, json_encode($hits));
    
    if ($hits[$key]['count'] > 10) {
        http_response_code(429);
        echo json_encode(['error' => 'rate_limited', 'message' => 'Príliš veľa požiadaviek. Skúste to znova o chvíľu.'], JSON_UNESCAPED_UNICODE);
        return false;
    }
    
    return true;
}

// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// LEVEL 3: Rate limiting (skip for OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !rateLimit()) {
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

// Get input data
$body = json_decode(file_get_contents('php://input'), true) ?? [];
$message = trim((string)($body['message'] ?? ''));
$history = $body['history'] ?? [];
$maxTokens = (int)($body['max_tokens'] ?? 200);

if ($message === '') {
    echo json_encode(['reply' => 'Napíš mi otázku 🙂'], JSON_UNESCAPED_UNICODE);
    exit;
}

// LEVEL 2: Server-side cache (APCu if available)
$cacheKey = 'chat_' . sha1(mb_strtolower(trim($message)));
$cached = false;

if (function_exists('apcu_fetch')) {
    $cached = apcu_fetch($cacheKey);
    if ($cached !== false) {
        // Cache hit - return immediately
        echo json_encode(['reply' => $cached], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// System prompt je na serveri (LEVEL1: neposielame ho z klienta)
$systemPrompt = "Si PAPI AI – virtuálny vlasový expert salónu PAPI HAIR DESIGN v Košiciach. Tvoja misia: radiť klientom s účesmi, farbami a rezerváciami.

OSOBNOSŤ:
- Profesionálny, ale uvoľnený a priateľský tón (tykanie/vykanie podľa kontextu, defaultne priateľské vykanie).
- Expert na coloristiku (balayage, ombré, airtouch) a moderné strihy.
- Stručné odpovede (max 3 vety), používaj emoji 💇‍♀️✨.

FAKTY O SALÓNE:
- 📍 Adresa: Trieda SNP 61, Košice (Spoločenský pavilón)
- 📞 Tel: +421 949 459 624
- ✉️ Email: papihairdesign@gmail.com
- 🕒 Otváracie: Po-Pi 8:00-17:00 (objednávky), So (len objednávky), Ne (zatvorené).
- 📅 Rezervácie: https://services.bookio.com/papi-hair-design/widget?lang=sk

CENNÍK (Orientačný):
- Pánsky strih: 19€ - 25€ (podľa náročnosti/fade)
- Dámsky strih: 30€ - 45€ (podľa dĺžky/hustoty)
- Farbenie: 70€ - 120€
- Balayage/Ombré/Airtouch: 150€ - 250€ (časovo náročné, 4-6 hodín)
- Kúry (Olaplex/Malibu C): od 40€

ODPORÚČANIA:
- Pre zmenu farby VŽDY odporuč osobnú konzultáciu alebo zaslanie fotky vlasov na Instagram/Messenger.
- Ak sa klient pýta na nový účes, odporuč mu našu funkciu 'AI Hair Styler' v menu.
- Ak klient mešká alebo ruší, odkáž ho na telefón.

Prikázané: Odpovedaj IBA po slovensky.";

// Build messages array with system prompt
$messages = [
    ['role' => 'system', 'content' => $systemPrompt],
    ...array_map(function($msg) {
        return [
            'role' => $msg['role'] ?? 'user',
            'content' => $msg['content'] ?? ''
        ];
    }, $history),
    ['role' => 'user', 'content' => $message]
];

// Prepare OpenAI request
$data = [
    'model' => 'gpt-3.5-turbo', // Faster than gpt-4o-mini
    'messages' => $messages,
    'max_tokens' => min($maxTokens, 150), // LEVEL1: 150 max for speed
    'temperature' => 0.7
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_TIMEOUT, 20); // LEVEL1: timeout 20s

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'Curl error: ' . $curlError], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'API error', 'details' => $response], JSON_UNESCAPED_UNICODE);
    exit;
}

// Parse OpenAI response
$responseData = json_decode($response, true);
$reply = '';

if (isset($responseData['choices'][0]['message']['content'])) {
    $reply = trim($responseData['choices'][0]['message']['content']);
}

// LEVEL1: Nikdy nevrátiť prázdnu odpoveď
if (empty($reply)) {
    $reply = 'Prepáčte, nepodarilo sa mi vygenerovať odpoveď. Skúste to prosím znova.';
}

// LEVEL 2: Store in cache (APCu if available)
if (function_exists('apcu_store')) {
    apcu_store($cacheKey, $reply, 3600); // 1 hour TTL
}

echo json_encode(['reply' => $reply], JSON_UNESCAPED_UNICODE);
?>
