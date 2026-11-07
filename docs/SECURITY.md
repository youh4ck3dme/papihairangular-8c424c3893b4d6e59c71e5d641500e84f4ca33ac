# Bezpečnosť – PAPI HAIR DESIGN (Angular 20 PWA, statický prerendering)

Všeobecný „enterprise security baseline pre Angular PWA“ prispôsobený tomuto webu. Web je **statický**:
12 predgenerovaných stránok, žiadny backend, žiadne prihlásenie, žiadne cookies, žiadna databáza,
rezervácie bežia u Bookio (odkaz), kontaktný formulár otvára e-mailového klienta (mailto).
Preto veľká časť všeobecného zoznamu (JWT, RBAC, RLS, MFA, audit log, HIPAA/PCI) **nemá čo chrániť** –
nižšie je pri každom bode uvedené, čo platí, čo je hotové a prečo zvyšok neplatí.

> ⛔ Produkčný deploy (papihairdesign.sk) len so súhlasom majiteľa – pozri `AGENTS.md`.

## 1. HTTP hlavičky – hotové
Jedno miesto pravdy: `vercel.json` (prvá trasa `^/.*$`). Rovnaké hodnoty sú v `nginx.conf` (Docker/VPS)
a `scripts/deploy-forpsi.sh`; zhodu stráži `e2e/security-headers.spec.ts`. Lokálny `serve-dist.mjs`
číta hlavičky priamo z `vercel.json`, takže testy overujú skutočnú konfiguráciu.

| Hlavička | Hodnota | Poznámka |
|---|---|---|
| Content-Security-Policy | `frame-ancestors 'none'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests` | zvyšok CSP je v `<meta>` (bod 2) |
| Strict-Transport-Security | `max-age=63072000` | bez `includeSubDomains`/`preload` – najprv overiť HTTPS na všetkých subdoménach (napr. booking.*); `preload` sa ťažko odvoláva |
| X-Content-Type-Options | `nosniff` | |
| X-Frame-Options | `DENY` | pre staré prehliadače, inak frame-ancestors |
| Referrer-Policy | `strict-origin-when-cross-origin` | |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` | `interest-cohort` (FLoC) je zrušený → `browsing-topics` |
| Cross-Origin-Opener-Policy | `same-origin` | |
| Cross-Origin-Resource-Policy | `same-origin` | |
| X-XSS-Protection | `0` | starý filter vypnutý, chráni CSP |
| Cross-Origin-Embedder-Policy | **nepoužité** | `require-corp` by zablokoval mapu Google v iframe; web nepotrebuje SharedArrayBuffer |

## 2. CSP s hashmi + Trusted Types – hotové
Statický hosting nevie generovať nonce pri každej požiadavke, preto `scripts/csp.mjs` (spúšťa ho postbuild)
vloží do každého HTML `<meta http-equiv="Content-Security-Policy">` so **SHA-256 hashmi** práve tých inline
skriptov, ktoré stránka má (event replay Angularu, prepínač tmavého režimu, async CSS). Potom pregeneruje
`ngsw.json`, aby service worker sedel s hashmi súborov.

- `script-src 'self'` + hashe – bez `'unsafe-inline'` a `'unsafe-eval'`; vložený `<script>` z XSS sa nespustí.
- `style-src 'self' 'unsafe-inline'` – Angular vkladá štýly komponentov inline; štýly nevedia spustiť kód.
- `frame-src https://www.google.com` (mapa na /kontakt, načíta sa až po kliknutí), `connect-src 'self'`.
  Pri nastavení `VITALS_ENDPOINT` / `SENTRY_DSN` sa ich domény pridajú automaticky pri builde.
- `require-trusted-types-for 'script'` – zápis HTML/skriptov len cez politiky: `angular` (sanitizér),
  `angular#unsafe-bypass` (statické SVG ikony služieb), `papi#jsonld` (JSON-LD) a `default`, ktorá povolí
  **iba** `/ngsw-worker.js` (Angular registruje service worker obyčajným reťazcom). Pozri
  `src/app/core/security/trusted-types.ts`. Firefox/Safari Trusted Types nemajú – tam chráni CSP.

## 3. OWASP Top 10 pre tento web
| # | Riziko | Stav |
|---|---|---|
| A01 Broken Access Control | N/A – nie je prihlásenie ani admin; staré `/admin` a AI cesty → 301 na `/` |
| A02 Cryptographic Failures | HTTPS + HSTS; žiadne osobné údaje sa neukladajú (localStorage len `theme`) |
| A03 Injection / XSS | šablóny Angularu escapujú; obsah blogu ide cez sanitizér (nie `bypassSecurityTrustHtml`); `bypass*` povolený len pre statické SVG ikony a URL mapy – stráži test; žiadne `eval`/`new Function`/`innerHTML` reťazcov (notifikácia o novej verzii je cez DOM API); CSP + Trusted Types |
| A04 Insecure Design | formulár neodosiela nič na server (mailto), polia validuje Reactive Forms |
| A05 Security Misconfiguration | produkčný build, žiadne source mapy (postbuild zlyhá), žiadne tajné kľúče v bundli (test), `server_tokens off` |
| A06 Vulnerable Components | Angular 20.3.35 (záplaty XSS/SSRF), `pnpm audit --prod --audit-level critical` v CI, Dependabot, `overrides` pre tar/fast-uri. Zostávajúce hlásenia sú v nástrojoch buildu a testov (karma, CLI), nie v kóde pre prehliadač |
| A07 Auth Failures | N/A – žiadna autentifikácia |
| A08 Integrity | service worker overuje SHA-1 hashe všetkých súborov (`ngsw.json`); lockfile `--frozen-lockfile` |
| A09 Logging & Monitoring | web-vitals (len s `VITALS_ENDPOINT`), chyby JS cez Sentry (len s `SENTRY_DSN`) |
| A10 SSRF / XXE / deserializácia | N/A – žiadny server, žiadne XML, žiadne načítanie URL od používateľa |

## 4. PWA / service worker
- `ngsw-config.json`: precache len statické súbory a predgenerované stránky; **žiadne dataGroups** (web nemá API).
- `ngsw.json` a `ngsw-worker.js` sa nikdy necachujú (hlavičky), nová verzia sa ukáže notifikáciou.
- Registrácia SW cez Trusted Types politiku obmedzenú na `/ngsw-worker.js`.

## 5. GDPR
- Web neukladá cookies ani identifikátory → **netreba cookie lištu**. `localStorage.theme` je nevyhnutné nastavenie.
- Mapa Google sa načíta až po kliknutí (dovtedy Google nedostane IP návštevníka).
- Web Vitals (ak sa zapnú) posielajú len metriku, hodnotu, cestu a selektor prvku. Sentry spracúva IP –
  pri zapnutí doplniť do zásad ochrany súkromia.
- Rezervácie a osobné údaje klientov spracúva Bookio – zmluvný vzťah salónu s Bookio.
- Neplatí: export dát / právo na zabudnutie (web nič neuchováva), HIPAA, PCI (žiadne platby).

## 6. Infraštruktúra – úlohy pre majiteľa (nič z toho sa nerobí bez súhlasu)
- **Vercel**: Settings → Deployment Protection pre preview (heslo/Vercel Auth), 2FA na účte.
- **Cloudflare** (ak je pred VPS): WAF managed rules, Bot Fight Mode, rate limit; pri Verceli len DNS (LAUNCH.md).
- **Po nasadení** overiť https://securityheaders.com a https://observatory.mozilla.org (cieľ A+ / A).
- **HSTS preload**: až po overení všetkých subdomén – pridať `includeSubDomains; preload` a prihlásiť na hstspreload.org.
- **GitHub**: 2FA, ochrana vetvy `main` (len cez PR, povinný workflow `security`).
- Penetračný test raz ročne nie je pre statický web nutný; stačí `OWASP ZAP baseline` proti preview URL.

## 7. Tajné kľúče
Pôvodná verzia tohto dokumentu riešila API kľúče AI služieb. AI je z webu odstránená, `environment` obsahuje
len verejné hodnoty (`scripts/ensure-env.mjs`) a test zlyhá, ak sa do bundlu dostane kľúč. Celá git história
(77 commitov, 7. 11. 2026) bola prehľadaná na kľúče OpenAI/Google/Replicate/GitHub/xAI – **nič sa nenašlo**.
Ak by sa niekedy kľúč do repozitára dostal: najprv ho **zneplatniť u poskytovateľa**, až potom riešiť históriu.

## 8. Overenie
```bash
pnpm run build:prod      # postbuild: 404, kontrola prerenderingu, žiadne .map, CSP + ngsw.json
pnpm run test:site       # vrátane e2e/security.spec.ts a e2e/security-headers.spec.ts
pnpm run audit:security  # kritické zraniteľnosti v runtime závislostiach
```
CI: `.github/workflows/security.yml` (PR + týždenne), `.github/dependabot.yml`.
