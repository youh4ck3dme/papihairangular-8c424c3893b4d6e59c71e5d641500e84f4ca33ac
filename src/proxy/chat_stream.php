<?php
/**
 * LEVEL 3: Chat Stream Endpoint (SSE-like chunked response)
 * 
 * Returns progressive text chunks as they're generated
 * For Nginx: add proxy_buffering off; gzip off;
 */

// Disable output buffering for streaming
@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', '0');
@ini_set('implicit_flush', '1');
while (ob_get_level() > 0) { ob_end_flush(); }
ob_implicit_flush(true);

// Headers for streaming
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Nginx directive

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load configuration
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    echo "Chyba: Server configuration missing";
    exit;
}

$config = require $configFile;
$apiKey = $config['openai_key'] ?? '';

if (empty($apiKey)) {
    echo "Chyba: API key not configured";
    exit;
}

// Get input data
$body = json_decode(file_get_contents('php://input'), true) ?? [];
$message = trim((string)($body['message'] ?? ''));
$history = $body['history'] ?? [];
$maxTokens = (int)($body['max_tokens'] ?? 200);

if ($message === '') {
    echo "Napíš mi otázku 🙂";
    exit;
}

// System prompt (same as chat.php)
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

// Build messages
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

// Prepare OpenAI request with streaming
$data = [
    'model' => 'gpt-3.5-turbo', // Faster than gpt-4o-mini
    'messages' => $messages,
    'max_tokens' => min($maxTokens, 150),
    'temperature' => 0.7,
    'stream' => true // Enable streaming
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) {
    // Parse SSE format: data: {...}\n\n
    $lines = explode("\n", $data);
    foreach ($lines as $line) {
        if (strpos($line, 'data: ') === 0) {
            $json = substr($line, 6);
            if ($json === '[DONE]') {
                return strlen($data);
            }
            $decoded = json_decode($json, true);
            if (isset($decoded['choices'][0]['delta']['content'])) {
                $content = $decoded['choices'][0]['delta']['content'];
                echo $content;
                flush();
            }
        }
    }
    return strlen($data);
});
curl_setopt($ch, CURLOPT_TIMEOUT, 20);

// Execute request
curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError || $httpCode !== 200) {
    // On error, send error marker for frontend fallback
    echo "\n[stream_error]";
    flush();
}
?>

