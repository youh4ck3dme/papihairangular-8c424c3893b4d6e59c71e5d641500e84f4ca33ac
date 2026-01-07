# Service Worker - Caching & Update Stratégie

## 📋 Prehľad

PAPI HAIR DESIGN používa Angular Service Worker s pokročilými caching stratégiami pre optimálny výkon a offline support.

## 🎯 Caching Stratégie

### 1. **App Shell** (Prefetch)
```json
"installMode": "prefetch"
"updateMode": "prefetch"
```

**Čo sa cachuje:**
- HTML súbory (index.html)
- CSS súbory
- JavaScript bundles
- Favicons a manifest súbory

**Stratégia:** Všetky súbory sa stiahnu pri prvej inštalácii a aktualizujú pri každom novom deploye.

### 2. **Assets** (Lazy)
```json
"installMode": "lazy"
"updateMode": "prefetch"
```

**Čo sa cachuje:**
- Obrázky (PNG, JPG, WebP, SVG, GIF)
- Fonty (WOFF, WOFF2, TTF, EOT)
- Ostatné statické súbory

**Stratégia:** Cachujú sa len pri prvom použití (lazy loading), ale aktualizujú sa proaktívne.

### 3. **Fonts** (Lazy)
```json
"installMode": "lazy"
"updateMode": "lazy"
```

**Čo sa cachuje:**
- Google Fonts API
- Google Fonts Static Files

**Stratégia:** Cachujú sa len pri použití a aktualizujú sa len pri požiadavke.

## 🌐 Data Groups (API Caching)

### 1. **API Fresh** (Freshness Strategy)
```json
"strategy": "freshness"
"maxAge": "30m"
"timeout": "5s"
```

**Endpointy:**
- `/api/blog/**`
- `/api/services/**`
- `/api/gallery/**`

**Správanie:**
- Vždy sa pokúsi získať fresh data z API
- Ak zlyhá alebo timeout (5s), použije cache
- Cache sa automaticky invaliduje po 30 minútach

### 2. **API Performance** (Performance Strategy)
```json
"strategy": "performance"
"maxAge": "1d"
```

**Endpointy:**
- `/api/static/**`
- `/api/config/**`

**Správanie:**
- Vždy použije cache, ak je dostupná
- Sťahuje z API len ak cache neexistuje alebo je starší ako 1 deň
- Optimalizované pre rýchlosť

### 3. **External API** (Freshness Strategy)
```json
"strategy": "freshness"
"maxAge": "10m"
"timeout": "10s"
```

**Endpointy:**
- `https://generativelanguage.googleapis.com/**` (Gemini API)

**Správanie:**
- Pokúsi sa získať fresh data
- Timeout 10s pre external API
- Cache platná 10 minút

## 🔄 Update Stratégie

### Automatické Update Checks

**ServiceWorkerUpdateService** vykonáva:

1. **On App Stable** - Check pri prvom načítaní
2. **Periodic Checks** - Každých 6 hodín
3. **Manual Checks** - Programaticky cez service

### Update Flow

```
1. Nová verzia detekovaná
   ↓
2. Zobrazí sa notifikácia používateľovi
   ↓
3. Používateľ klikne "Aktualizovať"
   ↓
4. Aktivuje sa nová verzia
   ↓
5. Stránka sa reloadne
```

### Update Notification

Vlastný UI komponent s:
- ✅ Zlatý gradient dizajn
- ✅ Animovaná ikona
- ✅ Auto-dismiss po 10 sekundách
- ✅ Responsive dizajn
- ✅ Dark mode support

## 📴 Offline Support

### Offline Fallback Page

**Funkcie:**
- Krásny dizajn s PAPI branding
- Real-time connection monitoring
- Auto-reload pri obnovení pripojenia
- Užitočné tipy pre používateľa
- Breathing logo animácia

### Offline Behavior

```
Online → Offline:
  - Zobrazí sa offline.html
  - Cached content zostáva dostupný
  - API requesty zlyhajú gracefully

Offline → Online:
  - Auto-reload stránky
  - Sync cached data
  - Check for updates
```

## 🛠️ Konfigurácia

### angular.json
```json
{
  "assets": [
    "src/offline.html",
    // ... other assets
  ]
}
```

### main.ts
```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000'
})
```

### ngsw-config.json
- Kompletná konfigurácia caching stratégií
- Asset groups pre rôzne typy súborov
- Data groups pre API endpointy
- Navigation URL rules

## 🚀 Production Build

```bash
# Build s Service Worker
ng build --configuration production

# Serve production build locally
npx http-server dist/browser -p 8080
```

**Poznámka:** Service Worker funguje len v production mode a cez HTTPS (alebo localhost).

## 📊 Monitoring

### Console Logs

Service Worker loguje:
- ✅ Update checks
- ✅ New version availability
- ✅ Activation events
- ✅ Cache hits/misses
- ⚠️ Errors a warnings

### Chrome DevTools

**Application → Service Workers:**
- Status service workera
- Update on reload
- Unregister
- Skip waiting

**Application → Cache Storage:**
- Prezeranie cached súborov
- Manuálne mazanie cache
- Veľkosť cache

## 🔧 Troubleshooting

### Clear Cache
```javascript
// V konzole
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
```

### Force Update
```javascript
// V konzole alebo cez service
swUpdateService.checkForUpdate();
swUpdateService.activateUpdate();
```

### Disable Service Worker
```typescript
// main.ts
provideServiceWorker('ngsw-worker.js', {
  enabled: false  // Vypne SW
})
```

## 📈 Performance Benefits

- ⚡ **Instant Loading** - Cached app shell
- 🚀 **Fast API Responses** - Intelligent caching
- 📴 **Offline Access** - Funguje bez internetu
- 🔄 **Background Updates** - Seamless updates
- 💾 **Reduced Bandwidth** - Menej sťahovania

## 🎯 Best Practices

1. **Vždy testuj v production mode**
2. **Monitoruj veľkosť cache** (max 50MB odporúčané)
3. **Invaliduj cache pri breaking changes**
4. **Používaj versioning pre API**
5. **Testuj offline scenáre**

---

**Vytvorené pre:** PAPI HAIR DESIGN  
**Verzia:** 1.0.0  
**Dátum:** 2025-11-25
