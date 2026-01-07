# 🎯 LEVEL 3 Skeleton - Image Job Queue (PHP)

## 📋 Prehľad

LEVEL 3 implementuje **asynchronný image generation** cez job queue, aby image generation **nikdy neblokovalo chat**.

### Endpoints:
- `POST /proxy/image-job.php` → vytvorí job, vráti `{jobId}`
- `GET /proxy/image-job.php?jobId=xxx` → vráti `{status, url?, error?}`

---

## 🏗️ Architektúra

### Flow:
1. Frontend pošle image + prompt → `POST /proxy/image-job.php`
2. Backend vytvorí job → vráti `jobId` **okamžite** (non-blocking)
3. Backend spracuje job **asynchronne** (background)
4. Frontend polluje `GET /proxy/image-job.php?jobId=xxx` každých 700ms-1s
5. Keď `status === 'done'`, frontend zobrazí výsledok

### Job States:
- `queued` - Job je vo fronte
- `running` - Job sa spracováva
- `done` - Job je hotový, `url` je dostupný
- `error` - Job zlyhal, `error` obsahuje dôvod

---

## 📁 Súbory

### 1. `src/proxy/image-job.php` (NOVÝ)
- **POST** - Vytvorí job, vráti `jobId`
- **GET** - Vráti status jobu
- **In-memory storage** - `image-jobs.json` (pre production použite Redis/DB)

### 2. Frontend Integration (TODO)
- Upraviť `virtual-salon.component.ts` aby používal job queue
- Polling každých 700ms-1s
- Progress indicator

---

## 🔧 Ako to funguje

### Backend (PHP):

```php
// POST: Vytvor job
POST /proxy/image-job.php
Body: { image: "base64...", prompt: "...", model: "gpt-image-1", size: "1024x1024" }
Response: { jobId: "abc123..." }

// GET: Check status
GET /proxy/image-job.php?jobId=abc123...
Response: { status: "queued" | "running" | "done" | "error", url?: "...", error?: "..." }
```

### Frontend (Angular) - TODO:

```typescript
// 1. Vytvor job
this.http.post('/proxy/image-job.php', { image, prompt, model, size })
  .subscribe(({ jobId }) => {
    // 2. Poll status
    const poll = setInterval(() => {
      this.http.get(`/proxy/image-job.php?jobId=${jobId}`)
        .subscribe(({ status, url, error }) => {
          if (status === 'done') {
            clearInterval(poll);
            this.showResult(url);
          } else if (status === 'error') {
            clearInterval(poll);
            this.showError(error);
          }
        });
    }, 700);
  });
```

---

## ⚠️ Limity aktuálnej implementácie

### In-memory storage:
- Jobs sú uložené v `image-jobs.json`
- **Nevhodné pre production** - ak server reštartuje, jobs sa stratia
- **Nevhodné pre multi-server** - každý server má vlastný storage

### Pre Production:
1. **Redis** - Pre job storage
2. **Queue system** - RabbitMQ, AWS SQS, alebo Redis Queue
3. **Worker process** - Background worker pre spracovanie jobov
4. **Database** - Pre persistent storage jobov

---

## 🚀 Production-ready verzia (TODO)

### Option 1: Redis Queue
```php
// Vytvor job
$jobId = uniqid();
$redis->lpush('image-jobs', json_encode([
  'jobId' => $jobId,
  'image' => $imageBase64,
  'prompt' => $prompt,
  // ...
]));

// Worker process (cron alebo daemon)
while ($job = $redis->brpop('image-jobs', 10)) {
  processImageJob($job);
}
```

### Option 2: Database Queue
```php
// Vytvor job
$jobId = $db->insert('image_jobs', [
  'status' => 'queued',
  'image' => $imageBase64,
  'prompt' => $prompt,
  // ...
]);

// Worker process (cron)
$jobs = $db->query("SELECT * FROM image_jobs WHERE status='queued' LIMIT 10");
foreach ($jobs as $job) {
  processImageJob($job);
}
```

---

## 📊 Výhody

### Pred LEVEL 3:
- ❌ Image generation blokuje chat (60s timeout)
- ❌ Používateľ nemôže písať počas generovania
- ❌ Ak zlyhá, musí začať odznova

### Po LEVEL 3:
- ✅ Image generation beží na pozadí
- ✅ Používateľ môže písať počas generovania
- ✅ Progress indicator
- ✅ Retry pri chybách (job zostáva vo fronte)

---

## 🧪 Testovanie

### Test 1: Vytvorenie jobu
```bash
curl -X POST http://localhost:3002/proxy/image-job.php \
  -H "Content-Type: application/json" \
  -d '{"image":"base64...","prompt":"pink mohawk","model":"gpt-image-1","size":"1024x1024"}'
```
✅ Mala by vrátiť: `{"jobId":"abc123..."}`

### Test 2: Check status
```bash
curl http://localhost:3002/proxy/image-job.php?jobId=abc123...
```
✅ Mala by vrátiť: `{"status":"queued"|"running"|"done","url":"..."}`

---

## 📝 Poznámky

- **Skeleton je hotový** - backend endpointy fungujú
- **Frontend integration** - treba upraviť `virtual-salon.component.ts`
- **Production ready** - treba nahradiť in-memory storage za Redis/DB
- **Worker process** - treba nastaviť cron alebo daemon pre spracovanie jobov

---

## 🔄 Migrácia z Sync na Async

### Starý kód (sync):
```typescript
this.openaiService.editImage(imageBase64, prompt)
  .subscribe(response => {
    // Čaká 60s na výsledok
    this.showResult(response.data[0].url);
  });
```

### Nový kód (async):
```typescript
// 1. Vytvor job
this.http.post('/proxy/image-job.php', { image: imageBase64, prompt })
  .subscribe(({ jobId }) => {
    // 2. Poll status
    this.pollJobStatus(jobId);
  });
```

