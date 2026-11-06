# Spustenie novej verzie papihairdesign.sk

Stav vetvy `refactor/home-ui-ux` (november 2026). Web je hotový na nasadenie; tento dokument je
kontrolný zoznam pre spustenie a údržbu.

## Čo je nové

- **AI funkcie odstránené** (AI Studio, virtuálny stylista, diagnostika, admin, Gemini/OpenAI/Hugging Face/Replicate).
  Staré adresy presmerujú 301 na `/`. Regresný test stráži, aby sa do webu nevrátili kľúče ani AI volania.
- **Predgenerované stránky (prerendering)** – každá verejná stránka je hotové HTML (`dist/app/browser/<cesta>/index.html`):
  obsah vidí Google aj bez JavaScriptu, prvé vykreslenie je okamžité. Neznáme adresy → `404.html` so statusom 404.
- **Rýchlosť** – bez zone.js, lenivé animácie, vlastné písma (Inter + Syne, slovenská podmnožina), AVIF/WebP hero.
- **SEO** – unikátne titulky a popisy, canonical, JSON-LD `HairSalon` (adresa, hodiny, geo), sitemap, robots.
- **Dizajn** – domov v 100dvh sekciách, podstránky v rovnakom dizajne (svetlý aj tmavý režim), jednotný cenník.

## Kontrolný zoznam pred spustením

### 1. Kód
- [ ] Prejsť a zlúčiť PR `refactor/home-ui-ux` → `main`.
- [ ] Lokálne / v CI: `pnpm install --frozen-lockfile && pnpm run build:prod && pnpm run test:site && pnpm run lh`.

### 2. Hosting – vyberte jednu možnosť

**A) Vercel (odporúčané – `vercel.json` je pripravený)**
- [ ] Projekt `papi-studio-2020`: Node.js 22.x, build a výstup sa berú z `vercel.json` (netreba nič meniť v UI).
- [ ] Premenné prostredia: žiadne tajné kľúče nie sú potrebné. Voliteľne `VAPID_PUBLIC_KEY` (verejný kľúč pre push).
  Ak sa neskôr doplní synchronizácia recenzií, `GOOGLE_PLACES_API_KEY` patrí **iba** do serverovej funkcie, nikdy nie do `environment.ts`.
- [ ] Settings → Domains: pridať `papihairdesign.sk` aj `www.papihairdesign.sk` (www presmerovať na hlavnú doménu).
- [ ] Cloudflare DNS: nastaviť záznamy presne podľa toho, čo zobrazí Vercel pri doméne
  (zvyčajne `A @ 76.76.21.21` a `CNAME www cname.vercel-dns.com`), proxy (oranžový obláčik) **vypnúť** – SSL vydá Vercel.
- [ ] Deployment Protection: preview zostáva chránený, produkčná doména musí byť verejná.
- Pozn.: `vercel.json` používa `routes` (nie `rewrites`). Vercel podľa závislosti `@angular/cli` automaticky pridá
  SPA fallback `/(.*) → /index.html`; po prerenderingu by tak neznáme adresy vracali domovskú stránku so statusom 200.
  Vlastné `routes` končia pravidlom `404 → /404.html`, ktoré má prednosť pred týmto fallbackom.

**B) Súčasný FORPSI VPS (nginx)**
- [ ] `./scripts/deploy-forpsi.sh` – skript je upravený pre predgenerované stránky
  (`try_files $uri $uri/index.html =404`, `error_page 404 /404.html`, presmerovania /booking, /shop a starých AI adries).
- [ ] Na serveri overiť `sudo nginx -t` a po nasadení otestovať: `/`, `/cennik`, `/cennik/` (→ 301 bez lomky),
  `/neexistuje` (→ 404), `/booking` (→ Bookio), `/ai-studio` (→ 301 na `/`).
- [ ] **Nikdy** nevracať fallback `try_files … /index.html` – `index.html` je teraz domovská stránka, nie prázdny shell.

Docker (`Dockerfile`, `nginx.conf`, `docker-compose.yml`) je zosúladený s tým istým správaním (Node 22, pnpm 8.15, `build:prod`).

### 3. Google a profily
- [ ] Google Search Console: overiť doménu, odoslať `https://papihairdesign.sk/sitemap.xml`, cez „Kontrola URL“ požiadať o indexovanie
  `/`, `/cennik`, `/kontakt`, `/sluzby/damske-strihy`, `/sluzby/panske-strihy`, `/sluzby/ombre-farbenie`.
- [ ] Po týždni skontrolovať v GSC prehľad „Stránky“ – staré AI adresy majú byť „Stránka s presmerovaním“.
- [ ] Google firemný profil: názov, adresa (Trieda SNP 61 – Spoločenský pavilón, 040 11 Košice), telefón +421 949 459 624,
  hodiny (Po–Pi 8:00–17:00, So podľa objednávok, Ne zatvorené), web `https://papihairdesign.sk`, rezervačný odkaz na Bookio.
  Údaje musia byť zhodné s webom (`src/app/core/config/salon-contact.ts`, `opening-hours.ts`).
- [ ] Bookio profil: rovnaké kontakty a hodiny, odkaz na web.
- [ ] Rich Results Test (`https://search.google.com/test/rich-results`) pre `/` – JSON-LD HairSalon bez chýb.

### 4. Ručný test na telefóne (po nasadení na produkčnú doménu)
- [ ] Rezervácia: tlačidlo „Rezervovať“ → Bookio → výber služby a termínu (rezerváciu stačí nedokončiť).
- [ ] Telefón (ťuknutím volá), e-mailový formulár (otvorí poštu s vyplnenou správou), mapa sa načíta až po kliknutí.
- [ ] Menu, prepínač témy, cenník (rozbalenie položiek), FAQ, karusel služieb.
- [ ] Inštalácia ako aplikácia (PWA); po prvej návšteve sa web otvorí aj bez siete (service worker).

## Testy a merania

| Príkaz | Čo overuje |
| --- | --- |
| `pnpm run build:prod` | sitemap → build s prerenderingom → `404.html` + kontrola, že sa predgenerovali všetky stránky zo sitemap |
| `pnpm run test:site` | Playwright: bezpečnosť (žiadne kľúče/AI v bundli), SEO meta, surové HTML každej stránky, interakcie po hydratácii, každá stránka na 360/1440 px v svetlom aj tmavom režime, axe WCAG 2.1 AA, domov 100dvh |
| `pnpm run test:unit` | unit testy (Karma, Chrome headless; `CHROME_BIN` = cesta k Chrome) |
| `pnpm run lh` | Lighthouse CI (mobil, 3 behy, medián) na `/`, `/cennik`, `/kontakt`, `/sluzby/damske-strihy` |
| `pnpm run serve:dist` | lokálny server, ktorý sa správa ako Vercel/nginx (port 4300) |

Lighthouse (mobil, simulované pomalé 4G, medián 3 behov, lokálny server s kompresiou) – výsledky sú v záverečnej
správe PR. Limity: výkon ≥ 90, prístupnosť ≥ 95, best practices ≥ 95, SEO = 100 (chyba); LCP ≤ 2,5 s a TBT ≤ 200 ms (upozornenie).

## Známe obmedzenia a ďalšie kroky

1. **Sekcia recenzií** (Bookio + Google, posúvanie sprava doľava) ešte nie je – zadanie je v projekte (`prompt-recenzie.md`).
   Servisné stránky zatiaľ zobrazujú statický výber recenzií z Bookio (`src/app/core/data/curated-reviews.ts`).
2. **Fotky balíčkov v cenníku** (lookbook) pôsobia ako generované – nahradiť skutočnými fotkami zo salónu.
3. **Kontaktný formulár** otvára e-mailového klienta (mailto) – bez servera; ak treba odosielanie priamo z webu,
   doplniť serverovú funkciu (napr. Vercel Function + e-mailová služba).
4. **Domovská stránka – LCP** ~2,6 s na simulovanom pomalom 4G (cieľ 2,5 s). Ďalšie zlepšenie: menší nadpis/písmo v hero,
   prípadne odložiť načítanie časti JavaScriptu.
5. Push notifikácie (VAPID) sú v kóde pripravené, ale nepoužívajú sa.

## Návrat späť
- Vercel: Deployments → predchádzajúci produkčný deployment → „Instant Rollback“.
- VPS: `scripts/deploy-forpsi.sh` pred nasadením zálohuje web do `/var/www/papihairdesign.sk_backup_<dátum>` – obnoviť zo zálohy alebo nasadiť predchádzajúci commit.
