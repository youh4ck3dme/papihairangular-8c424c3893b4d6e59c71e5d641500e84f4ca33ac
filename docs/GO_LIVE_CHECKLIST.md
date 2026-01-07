# ✅ GO LIVE Checklist + Test Príkazy

## 1) Frontend Checklist

### ✅ Chatbot Component
- [x] `cancel$` Subject existuje
- [x] Pri `send()` sa volá `this.cancel$.next()`
- [x] "Píše..." je placeholder objekt (`botPlaceholder`)
- [x] Placeholder sa **prepíše** (`botPlaceholder.text = ...`)
- [x] Request má `timeout(20000)` (20s)
- [x] `finalize(() => { isLoading = false; botPlaceholder.pending = false })`
- [x] Stream sa accumuluje do `acc` a prepisuje `botPlaceholder.text`

### ✅ Chat Service
- [x] `max_tokens: 200`
- [x] History `clampHistoryByChars(history, 1800)` (pragmatic truncation)
- [x] `askStream()` - stream endpoint
- [x] `askJson()` - JSON fallback
- [x] Fallback pri chybe streamu

### ✅ Image Service
- [x] `createJob()` - vytvorí job, vráti `jobId`
- [x] `pollJob()` - polluje každých 900ms
- [x] `takeWhile()` - zastaví polling keď `done` alebo `error`

---

## 2) Backend Checklist

### ✅ PHP Endpoints
- [x] `/proxy/chat.php` → `{ reply: "..." }`
- [x] `/proxy/chat_stream.php` → text stream (chunked)
- [x] `/proxy/image-job.php` (POST) → `{ jobId: "..." }`
- [x] `/proxy/image-job.php?jobId=xxx` (GET) → `{ status, url?, error? }`

### ✅ Rate Limiting
- [x] 10 requests per minute per IP
- [x] 429 error pri prekročení

### ✅ Streaming
- [x] `ob_implicit_flush(true)`
- [x] `X-Accel-Buffering: no` header
- [x] OpenAI streaming API support

---

## 3) Test Príkazy

### Test 1: Chat JSON Endpoint

```bash
# Lokálne (dev server)
curl -sS -X POST http://localhost:3002/proxy/chat.php \
  -H "Content-Type: application/json" \
  -d '{"message":"Koľko stojí strih?","history":[],"max_tokens":200}' | jq

# Produkcia (nahraď TVOJ-DOMEN)
curl -sS -X POST https://TVOJ-DOMEN/proxy/chat.php \
  -H "Content-Type: application/json" \
  -d '{"message":"Koľko stojí strih?","history":[],"max_tokens":200}' | jq
```

**Očakávaný výstup:**
```json
{
  "reply": "Pánsky strih stojí od 19€, dámsky strih od 30€..."
}
```

---

### Test 2: Chat Stream Endpoint

```bash
# Lokálne (dev server)
curl -N -X POST http://localhost:3002/proxy/chat_stream.php \
  -H "Content-Type: application/json" \
  -d '{"message":"Koľko stojí strih?","history":[],"max_tokens":200}'

# Produkcia (nahraď TVOJ-DOMEN)
curl -N -X POST https://TVOJ-DOMEN/proxy/chat_stream.php \
  -H "Content-Type: application/json" \
  -d '{"message":"Koľko stojí strih?","history":[],"max_tokens":200}'
```

**Očakávaný výstup:**
Text by mal "padať" po kusoch (nie až na konci).

**Ak to stojí a nič netečie:**
- Nginx: Pridaj do configu:
```nginx
location /proxy/chat_stream.php {
  proxy_buffering off;
  gzip off;
  proxy_read_timeout 20s;
}
```

---

### Test 3: Image Job Creation

```bash
# Vytvor job (potrebuješ base64 image - použij malý test obrázok)
# Pre test môžeš použiť malý base64 string
JOB=$(curl -sS -X POST http://localhost:3002/proxy/image-job.php \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "prompt": "test prompt",
    "model": "gpt-image-1",
    "size": "1024x1024"
  }' | jq -r '.jobId')

echo "JOB=$JOB"
```

**Očakávaný výstup:**
```
JOB=abc123def456...
```

---

### Test 4: Image Job Polling

```bash
# Použij JOB z predchádzajúceho príkazu
curl -sS "http://localhost:3002/proxy/image-job.php?jobId=$JOB" | jq
```

**Očakávaný výstup:**
```json
{
  "status": "queued" | "running" | "done" | "error",
  "url": "...",
  "error": "..."
}
```

---

### Test 5: Rate Limiting

```bash
# Pošli 11 requestov za sebou
for i in {1..11}; do
  echo "Request $i:"
  curl -sS -X POST http://localhost:3002/proxy/chat.php \
    -H "Content-Type: application/json" \
    -d '{"message":"test","history":[],"max_tokens":200}' | jq
  sleep 1
done
```

**Očakávaný výstup:**
- Prvých 10 requestov: `{"reply":"..."}`
- 11. request: `{"error":"rate_limited","message":"Príliš veľa požiadaviek..."}`

---

## 4) Frontend Test (v prehliadači)

### Test 1: "Píše..." sa prepíše
1. Otvor chatbot
2. Pošli správu
3. ✅ "Píše..." by sa malo zobraziť
4. ✅ Po odpovedi by sa "Píše..." malo **prepísať** na skutočnú odpoveď (nie vytvoriť nový message)

### Test 2: Stream funguje
1. Otvor chatbot
2. Pošli správu
3. ✅ Text by sa mal zobrazovať **postupne** (nie naraz)
4. ✅ Console: `[chat-stream] latency_ms=1234 chars=456`

### Test 3: Timeout funguje
1. Odpoj internet
2. Pošli správu
3. ✅ Po 20s by sa mal zobraziť timeout error
4. ✅ "Píše..." by sa malo **prepísať** na error message

### Test 4: Cancel funguje
1. Pošli správu
2. Hneď klikni ✕ alebo zatvor chatbot
3. ✅ Request by sa mal zrušiť
4. ✅ "Píše..." by sa malo **prepísať** alebo zmiznúť

### Test 5: Image Job Queue
1. Odfot sa v Virtual Salon
2. Vyber účes
3. Klikni "Zmeniť Účes"
4. ✅ Job sa vytvorí okamžite (nečaká na výsledok)
5. ✅ Status sa polluje každých 900ms
6. ✅ Keď je hotový, zobrazí sa obrázok

---

## 5) Najčastejšie Chyby

### ❌ "Píše..." ostane aj po finalize

**Príčina:**
Vytváraš **nový** bot message namiesto editovania existujúceho placeholderu.

**Správne:**
```typescript
// ✅ SPRÁVNE
const botPlaceholder: UiMsg = { role: 'assistant', text: 'Píše...', pending: true };
this.messages.push(botPlaceholder);
// ...
botPlaceholder.text = reply; // Prepíše existujúci

// ❌ ZLE
this.messages.push({ role: 'assistant', text: 'Píše...' });
// ...
this.messages.push({ role: 'assistant', text: reply }); // Vytvorí nový!
```

### ❌ Stream netečie

**Príčina:**
- Nginx buffering
- PHP output buffering

**Riešenie:**
```nginx
location /proxy/chat_stream.php {
  proxy_buffering off;
  gzip off;
  proxy_read_timeout 20s;
}
```

### ❌ Image job sa nezobrazí

**Príčina:**
- Job sa nevytvorí
- Polling sa zastaví predčasne

**Riešenie:**
- Skontroluj console logy: `[VirtualSalon] Job created: ...`
- Skontroluj polling: `[VirtualSalon] Job running...`

---

## 6) Production Deployment

### Nginx Config (ak používaš Nginx)

```nginx
server {
    listen 80;
    server_name papihairdesign.sk;

    root /path/to/dist/app/browser;
    index index.html;

    # Chat stream endpoint - disable buffering
    location /proxy/chat_stream.php {
        proxy_pass http://php-fpm;
        proxy_buffering off;
        gzip off;
        proxy_read_timeout 20s;
        proxy_set_header X-Accel-Buffering no;
    }

    # Other PHP endpoints
    location /proxy/ {
        proxy_pass http://php-fpm;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Angular app
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### PHP-FPM Config

```ini
; php.ini alebo php-fpm.conf
output_buffering = Off
implicit_flush = On
```

---

## 7) Monitoring

### Console Logs (Frontend)
- `[chat-stream] latency_ms=1234 chars=456` - Stream latency
- `[chat-json-fallback] latency_ms=1234 len=456` - JSON fallback latency
- `[VirtualSalon] Job created: abc123` - Image job created
- `[VirtualSalon] Job running...` - Image job polling

### Backend Logs (PHP)
- Rate limit hits: `rate-limit.json`
- Image jobs: `image-jobs.json`
- Errors: PHP error log

---

## ✅ Final Check

Pred GO LIVE skontroluj:

1. [ ] Všetky test príkazy fungujú
2. [ ] Frontend testy prechádzajú
3. [ ] "Píše..." sa vždy prepíše (nie vytvorí nový message)
4. [ ] Stream tečie postupne
5. [ ] Image jobs fungujú (non-blocking)
6. [ ] Rate limiting funguje
7. [ ] Timeout funguje (20s)
8. [ ] Cancel funguje (✕ button)
9. [ ] Fallback funguje (stream → JSON)

---

## 🚀 Ready to Deploy!

Ak všetko prechádza, môžeš ísť do produkcie! 🎉

