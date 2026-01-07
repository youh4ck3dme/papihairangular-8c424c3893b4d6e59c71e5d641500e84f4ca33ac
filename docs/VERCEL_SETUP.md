# 🚀 Vercel Deploy - Kompletný Návod

## ✅ Čo je pripravené

### Node.js Serverless Functions (namiesto PHP):
- ✅ `api/chat.js` → `/api/chat` (JSON endpoint)
- ✅ `api/chat/stream.js` → `/api/chat/stream` (Stream endpoint)
- ✅ `api/image/jobs.js` → `/api/image/jobs` (Image job queue)

### Konfigurácia:
- ✅ `vercel.json` - Vercel config s routing
- ✅ Angular services automaticky používajú správne endpointy (production vs dev)

---

## 📋 Krok 1: Vercel CLI Setup

```bash
# Inštalácia Vercel CLI
npm i -g vercel

# Login do Vercel
vercel login

# Link projekt (prvý raz)
vercel link
```

---

## 📋 Krok 2: Environment Variables

Nastavte OpenAI API key v Vercel dashboard alebo cez CLI:

```bash
# Cez CLI
vercel env add OPENAI_API_KEY
# Zadajte: sk-...

# Alebo v Vercel Dashboard:
# Settings → Environment Variables → Add
# Name: OPENAI_API_KEY
# Value: sk-...
```

---

## 📋 Krok 3: Deploy

```bash
# Production deploy
vercel --prod

# Alebo len preview
vercel
```

---

## 🧪 Test po Deploy

```bash
# Test na Vercel URL (napr. https://papihairdesign-angular.vercel.app)
./test-main-features.sh https://TVA-VERCEL-URL.vercel.app
```

---

## 📝 Endpointy

### Chat JSON:
```
POST /api/chat
Body: { message: "...", history: [], max_tokens: 200 }
Response: { reply: "..." }
```

### Chat Stream:
```
POST /api/chat/stream
Body: { message: "...", history: [], max_tokens: 200 }
Response: text/plain stream (chunked)
```

### Image Job:
```
POST /api/image/jobs
Body: { image: "base64...", prompt: "...", model: "gpt-image-1", size: "1024x1024" }
Response: { jobId: "..." }

GET /api/image/jobs?jobId=xxx
Response: { status: "queued"|"running"|"done"|"error", url?: "...", error?: "..." }
```

---

## ⚙️ Konfigurácia

### `vercel.json`:
- `buildCommand`: `npm run build:prod`
- `outputDirectory`: `dist/app/browser`
- `functions`: Timeout nastavenia (20s pre chat, 60s pre image)
- `env`: Environment variables

### Timeout Limits:
- Chat: 20s (Vercel Hobby: 10s, Pro: 60s)
- Chat Stream: 20s
- Image Job: 60s (Vercel Hobby: 10s, Pro: 300s)

**Poznámka:** Ak máš Vercel Hobby plan, image job môže trvať dlhšie ako 10s. V tom prípade:
1. Upgrade na Pro plan
2. Alebo použij externý service pre image generation

---

## 🔧 Troubleshooting

### Function timeout:
```
Error: Function execution exceeded timeout
```
**Riešenie:** Upgrade na Pro plan alebo znížte `max_tokens`

### Environment variable not found:
```
Error: OpenAI API key not configured
```
**Riešenie:** Skontrolujte `vercel env ls` a nastavte `OPENAI_API_KEY`

### Stream nefunguje:
**Riešenie:** Vercel automaticky podporuje streaming, ale skontrolujte:
- Function má `maxDuration: 20`
- Response headers sú správne nastavené

---

## 📊 Monitoring

Vercel Dashboard poskytuje:
- Function logs
- Performance metrics
- Error tracking

---

## ✅ Ready to Deploy!

```bash
# 1. Nastavte environment variable
vercel env add OPENAI_API_KEY

# 2. Deploy
vercel --prod

# 3. Testujte
./test-main-features.sh https://TVA-VERCEL-URL.vercel.app
```

---

## 🎯 Výhody Vercel

- ✅ Automatický HTTPS
- ✅ Global CDN
- ✅ Serverless functions (auto-scaling)
- ✅ Zero-config deployment
- ✅ Preview deployments pre každý PR

