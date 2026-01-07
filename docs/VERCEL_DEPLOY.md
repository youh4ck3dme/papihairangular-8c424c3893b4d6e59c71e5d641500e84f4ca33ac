# 🚀 Vercel Deploy Guide

## ⚠️ Dôležité: Vercel nepodporuje PHP

Vercel podporuje len:
- ✅ Static sites (Angular build)
- ✅ Serverless Functions (Node.js, Python, Go, Ruby)
- ❌ **PHP nie je podporované**

## 📋 Možnosti pre Vercel

### Option 1: Vercel Serverless Functions (Node.js) - ODORÚČANÉ

Konvertovať PHP endpointy na Node.js serverless functions:

```
api/
  chat.js          → /api/chat
  chat-stream.js   → /api/chat/stream
  image-job.js     → /api/image/jobs
```

### Option 2: Externý PHP Server

Použiť externý PHP server (napr. Railway, Render, vlastný VPS) a volať ho z Vercel cez proxy.

### Option 3: Hybrid Deploy

- Angular app → Vercel (static)
- PHP endpoints → VPS (57.129.4.22) - už máš `deploy-ultimate.sh`

---

## 🧪 Test Pred Deployom

Spusti test skript:

```bash
./test-main-features.sh http://localhost:3002
```

Alebo manuálne:

```bash
# 1. Chat JSON
curl -X POST http://localhost:3002/proxy/chat.php \
  -H "Content-Type: application/json" \
  -d '{"message":"Koľko stojí strih?","history":[],"max_tokens":200}' | jq

# 2. Chat Stream
curl -N -X POST http://localhost:3002/proxy/chat_stream.php \
  -H "Content-Type: application/json" \
  -d '{"message":"Koľko stojí strih?","history":[],"max_tokens":200}'

# 3. Image Job
JOB=$(curl -X POST http://localhost:3002/proxy/image-job.php \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/png;base64,...","prompt":"test","model":"gpt-image-1","size":"1024x1024"}' | jq -r .jobId)
echo "JOB=$JOB"

# 4. Job Status
curl "http://localhost:3002/proxy/image-job.php?jobId=$JOB" | jq
```

---

## 🎯 Odporúčanie

**Pre Vercel:** Použi **Option 3 (Hybrid)**:
- Angular app → Vercel (rýchle, CDN)
- PHP endpoints → VPS (už máš `deploy-ultimate.sh`)

**Pre jednoduchosť:** Použi **Option 1** - konvertovať PHP na Node.js serverless functions.

---

## 📝 Ďalšie kroky

1. Spusti `./test-main-features.sh` - over že všetko funguje lokálne
2. Ak chceš Vercel → konvertuj PHP na Node.js functions
3. Ak chceš VPS → použij `./deploy-ultimate.sh`

