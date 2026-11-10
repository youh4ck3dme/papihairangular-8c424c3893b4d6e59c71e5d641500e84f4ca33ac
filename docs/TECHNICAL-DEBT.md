# Technický dlh — PAPI HAIR DESIGN

Stav k 2026-11-08 (vetva `refactor/home-ui-ux`).

## Otvorené položky

### P2 — kozmetika

**`service-info-modal` — zámerne tmavý dizajn**
- Súbor: `src/app/shared/components/service-info-modal/service-info-modal.component.html`
- Modal lookbook detailov je úmyselne tmavý luxusný glass bez svetlej varianty. Používa `bg-black/60` (overlay) a `bg-black/90` (panel) + `text-white`. Obrázky lookbook-u sú v hero režime na čiernom pozadí.
- Prečo nemigrované: konverzia na `bg-card`/`text-text` by v svetlej téme výrazne zmenila pocit modalu (biele pozadie s lookbook fotkou stráca luxusný dojem) a nie je to vizuálna chyba. Overlay `rgba(0,0,0,0.6)` cez biele pozadie je štandard.
- Riešenie keď príde čas: pridať `data-theme="dark"` wrapper na `.backdrop` div a odkazy na tokeny `--color-surface` atď. prepísať cez `[data-theme="dark"]` scope.

### P2 — chýbajúce assety

**Logo SVG wordmark**
- V `public/` ani `src/assets/` nie je dodaný. Momentálne sa používa textový wordmark v Syne 800.
- Potrebné: SVG wordmark 160×48 (light + dark variant), favicon, OG default.

**Fotografia salónu v jednotnom tóne**
- Aktuálne mix (Unsplash + vlastné). Odporúčanie v `docs/brand.md` je Lightroom preset (warmness +8, shadows +10). Do profesionálnej fotosession zostávajú ako sú.

### P3 — refactor kandidáti

**`scroll-to-top` button** — konvertovaný na tokeny (`bg-accent-fill`, `text-on-accent`), gradient shine efekt zostal.

**`notification` component** — konvertovaný (`text-copper-500` → `text-danger`).

**`index.html`** — `dark:bg-[#0a0a0a]` → `bg-surface`.

**Header overlay** — `rgba(0,0,0,0.5)` → `var(--color-overlay)`, `box-shadow` na `var(--shadow-lg)`.

**Status pill** — hardcoded red/green hex → `color-mix()` s `--color-semantic-danger/success`.

**Push notification `console.log`** — odstránený.

## Dokončené (pre záznam)

- Dve zlaté škály zjednotené na jednu (OKLCH gold-50..900).
- `tokens/tokens.json` W3C DTCG ako zdroj pravdy.
- Tailwind sémantické farby cez var() (surface, text, accent-text, accent-fill, border-strong...).
- `service-cards` komponent dedí tému z globálnych tokenov (duplikát `--card-*` odstránený).
- CSP s hashmi + Trusted Types politiky (angular, angular#unsafe-bypass, papi#jsonld, default pre ngsw-worker).
- Angular 20.3.35 + bezpečnostné overrides pre tar, fast-uri.
- Performance F1–F7 (NgOptimizedImage, IdlePreloadStrategy, metric-matched fonts, precompress, web-vitals lazy).
- `.github/workflows/` vymazané — testy bežia len v sandboxe.

## Plán ďalších krokov (pri ďalšej session)

1. Ak Erik dodá logo SVG, vložiť do `public/images/logo-wordmark.svg` a aktualizovať header + og-default.
2. Ak chce theme-aware service-info-modal, prerobiť podľa postupu vyššie.
3. Lighthouse CI v sandboxe (`pnpm exec @lhci/cli autorun`) a porovnať s prahmi v `lighthouserc.json`.
4. Playwright emulácia farbosleposti ako nový spec (`e2e/a11y-color-blindness.spec.ts`) — zatiaľ overené vizuálne.
