# 🔍 Chatbot Performance Diagnosis

## 10 Najpravdepodobnejších Príčin Pomalosti a Zaseknutia "Píše..."

### 1. **Chýbajúci Timeout Handling** ⚠️ KRITICKÉ
- **Problém**: HTTP request môže čakať nekonečne dlho
- **Dôkaz**: `isLoading` zostáva `true`, "Píše..." sa nikdy nezmení
- **Dopad**: UX sa zasekne, používateľ musí refreshnúť

### 2. **Veľký System Prompt (3000+ tokenov)** 🐌
- **Problém**: System prompt je ~2000 znakov, každý request ho posiela
- **Dôkaz**: `systemPrompt` v `openai.service.ts` je obrovský
- **Dopad**: Zvyšuje latenciu o 500-1000ms, zvyšuje náklady

### 3. **Chýbajúci AbortController** ⚠️
- **Problém**: Používateľ nemôže zrušiť požiadavku
- **Dôkaz**: Žiadny `AbortSignal` v HTTP requeste
- **Dopad**: Ak používateľ pošle novú správu, stará stále beží

### 4. **Chýbajúca Error Recovery** ⚠️
- **Problém**: Ak API zlyhá, `isLoading` môže zostať `true`
- **Dôkaz**: `finalize()` sa volá, ale ak error handler vráti `of(null)`, state sa nemusí resetovať
- **Dopad**: "Píše..." zostane navždy

### 5. **max_tokens: 500 je Príliš Veľa** 🐌
- **Problém**: Pre jednoduché otázky stačí 150-200 tokenov
- **Dôkaz**: `max_tokens: 500` v každom requeste
- **Dopad**: OpenAI generuje dlhšie odpovede = pomalšie

### 6. **Žiadna Cache Pre FAQ** 🐌
- **Problém**: "Koľko stojí strih?" sa posiela do API zakaždým
- **Dôkaz**: Žiadna cache v service
- **Dopad**: Zbytočné API volania, pomalšie odpovede

### 7. **Chýbajúce Streamovanie** 🐌
- **Problém**: Používateľ čaká na celú odpoveď naraz
- **Dôkaz**: `subscribe()` čaká na kompletný response
- **Dopad**: Pocit pomalosti, aj keď API je rýchle

### 8. **Conversation History Bez Truncation** 🐌
- **Problém**: Posiela sa posledných 10 správ, môže byť 2000+ tokenov
- **Dôkaz**: `conversationHistory.slice(-10)` bez kontroly dĺžky
- **Dopad**: Veľké payloady = pomalšie requesty

### 9. **Žiadne Retry Logic** ⚠️
- **Problém**: Ak API zlyhá (rate limit, network), request sa nezopakuje
- **Dôkaz**: `catchError` len vráti error
- **Dopad**: Používateľ musí manuálne skúsiť znova

### 10. **Chýbajúci Loading State Management** ⚠️
- **Problém**: Ak subscribe zlyhá pred `finalize()`, `isLoading` zostane `true`
- **Dôkaz**: `isLoading = true` na začiatku, `finalize()` ho resetuje, ale ak error nastane pred subscribe, state sa nemusí resetovať
- **Dopad**: "Píše..." zostane navždy

---

## 📊 Odhadovaný Dopad (Prioritizácia)

| Príčina | Dopad na UX | Náročnosť Fixu | Priorita |
|---------|-------------|----------------|----------|
| 1. Timeout | 🔴 KRITICKÉ | 🟢 15 min | **P0** |
| 4. Error Recovery | 🔴 KRITICKÉ | 🟢 10 min | **P0** |
| 3. AbortController | 🟠 VYSOKÉ | 🟢 20 min | **P1** |
| 10. Loading State | 🟠 VYSOKÉ | 🟢 5 min | **P1** |
| 2. System Prompt | 🟡 STREDNÉ | 🟡 30 min | **P2** |
| 5. max_tokens | 🟡 STREDNÉ | 🟢 5 min | **P2** |
| 6. Cache | 🟡 STREDNÉ | 🟡 1h | **P2** |
| 8. History Truncation | 🟡 STREDNÉ | 🟢 15 min | **P2** |
| 7. Streamovanie | 🟢 NÍZKE | 🔴 3h | **P3** |
| 9. Retry Logic | 🟢 NÍZKE | 🟡 30 min | **P3** |

---

## ❓ Otázky Pred Implementáciou (Max 12)

1. **Backend Stack**: Používate PHP proxy (`chat.php`) alebo máte Node.js/Express server? (Potrebujem vedieť pre SSE streamovanie)

2. **Cache Storage**: Preferujete localStorage (klient) alebo server-side cache (Redis/Memcached)? Alebo oboje?

3. **Streaming Priority**: Chcete streamovanie hneď (SSE/fetch stream) alebo najprv stabilitu (timeout + abort)?

4. **Timeout Duration**: Aký timeout chcete? (Odporúčam 15-20s pre chat, 30s pre image generation)

5. **FAQ Cache**: Máte zoznam najčastejších otázok, ktoré môžem cache-ovať? (napr. "Koľko stojí strih?", "Otváracie hodiny")

6. **Error Handling**: Chcete automatický retry (3x) alebo len zobraziť error a nechať používateľa skúsiť znova?

7. **Loading States**: Chcete rôzne loading stavy? (napr. "Píše...", "Generujem odpoveď...", "Skoro hotovo...")

8. **Metrics**: Chcete tracking latencie? (TTFB, p95, error rate) - ak áno, kam logovať? (Console, Analytics, vlastný endpoint)

9. **Image Generation**: Image generation má byť v tom istom pipeline alebo oddelený? (Odporúčam oddelený - queue system)

10. **Rate Limiting**: Potrebujete rate limiting na frontende? (napr. max 3 requesty za 10s)

11. **Model Selection**: Chcete použiť rýchlejší model pre jednoduché otázky? (napr. gpt-4o-mini pre FAQ, gpt-4o pre komplexné)

12. **Production vs Dev**: V produkcii máte PHP server s PHP-FPM alebo len statický hosting? (Ovplyvní to, či môžem použiť SSE)

---

## 🚀 Turbo Plan - 3 Úrovne

### ⚡ LEVEL 1: Quick Wins (30 min) - STABILITA
**Cieľ**: Eliminovať zaseknutie "Píše..." a pridať timeout

**Zmeny**:
1. ✅ Timeout handling (15s)
2. ✅ AbortController pre cancel
3. ✅ Error recovery (vždy reset `isLoading`)
4. ✅ Loading state guard (vždy sa resetuje)
5. ✅ Optimalizácia `max_tokens` (200 namiesto 500)

**Očakávaný výsledok**: 
- "Píše..." sa nikdy nezasekne
- Request sa zruší po 15s
- Používateľ môže zrušiť request

---

### 🛡️ LEVEL 2: Stabilita (2h) - PERFORMANCE
**Cieľ**: Znížiť latenciu a pridať cache

**Zmeny**:
1. ✅ FAQ cache (localStorage + server-side)
2. ✅ System prompt optimalizácia (zmenšiť na 1000 tokenov)
3. ✅ Conversation history truncation (max 5 správ, max 1500 tokenov)
4. ✅ Retry logic (3x s exponential backoff)
5. ✅ Request deduplication (ak používateľ pošle rovnakú otázku 2x za 2s, vráť cache)
6. ✅ Loading states (progressive: "Píše..." → "Generujem..." → "Skoro hotovo...")

**Očakávaný výsledok**:
- FAQ odpovede < 100ms (z cache)
- Nové otázky < 2s (optimalizovaný prompt)
- Retry automaticky pri chybách

---

### 🎯 LEVEL 3: Pro Setup (4-6h) - STREAMING + OBSERVABILITY
**Cieľ**: Streamovanie odpovedí a monitoring

**Zmeny**:
1. ✅ SSE/Fetch Stream pre chat odpovede
2. ✅ Image generation queue (background job + polling)
3. ✅ Performance dashboard (TTFB, p95, error rate)
4. ✅ Advanced cache (Redis/Memcached na serveri)
5. ✅ Request queuing (ak je viac requestov, queue ich)
6. ✅ A/B testing rôznych modelov

**Očakávaný výsledok**:
- Odpovede sa zobrazujú postupne (streaming)
- Image generation neblokuje chat
- Metriky v real-time dashboarde

---

## 📝 Implementácia - Začneme s LEVEL 1

