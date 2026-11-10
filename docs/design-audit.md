# Audit dizajnu, UI/UX, kontrastu a brandingu — PAPI HAIR DESIGN

Dátum: 2026-11-08. Vetva: `refactor/home-ui-ux`. Metóda: statická analýza zdrojov v `src/`, výpočet WCAG kontrastu (`scripts/audit/contrast.mjs`, relatívna luminancia podľa WCAG 2.2 vzorca), Playwright snímky pre viewporty a emulácia farbosleposti cez `Emulation.setEmulatedVisionDeficiency`.

Závažnosti: **P0** blokuje, **P1** vážny nedostatok, **P2** drobnosť, **P3** leštenie.

## 1. Zhrnutie

Vzhľad domovskej stránky a podstránok je už konzistentný (podstránky boli migrované z `bg-black`/`font-serif` na tokeny, čo overil grep). Hlavné zvyšné problémy:

- **Dve nezhodné zlaté škály** (CSS `--gold #d4af37` + Tailwind `gold #c59d24`, plus `gold-light #FFD700` a `gold-dark #B8860B`) sa prelievajú do textu na svetlom pozadí a padajú na WCAG AA.
- **Service-cards komponent duplikuje tokeny** vlastnými premennými `--card-*` namiesto `--surface`, `--text`, `--muted`, `--accent`.
- **Hardkódované farby v modáloch a pomocných komponentoch** (`service-info-modal`, `scroll-to-top`, `notification`): `bg-black/60`, `text-white`, `bg-gold`, inline hex.
- **`--border` na bielom má pomer ~1,2:1** – nespĺňa 3:1 pre ovládacie prvky (WCAG 1.4.11).
- **Index.html používa `dark:bg-[#0a0a0a]`** arbitrárnu hodnotu namiesto tokenu.

## 2. Inventár porušení tokenov

### 2.1 Hex/rgb mimo `tokens.css` (P1)

| Súbor | Riadky | Nález |
|---|---|---|
| `src/offline.html` | 17–187 | 12× hex, 8× rgba, celá stránka má vlastnú paletu |
| `src/index.html` | 14, 153 | `#ffffff` v `theme-color`, `dark:bg-[#0a0a0a]` arbitrárna |
| `src/styles.css` | 169 | `rgba(212,175,55,0.35)` |
| `src/app/shared/components/header/header.component.css` | 123, 139 | `rgba(0,0,0,0.5)`, `rgba(0,0,0,0.4)` |
| `src/app/shared/components/service-cards/service-cards.component.css` | 3–8, 15–19, 67, 92, 103, 136 | **duplikát tokenov**; 7 vlastných `--card-*` premenných a 4 rgba |

### 2.2 Zakázané Tailwind triedy (P1)

| Súbor | Riadky | Nález |
|---|---|---|
| `src/app/shared/components/notification/notification.component.html` | 5, 17 | `text-white` bez tmavej dvojičky |
| `src/app/shared/components/service-info-modal/service-info-modal.component.html` | 2, 7, 23, 83, 112, 124, 132, 145 | `bg-black/*`, `text-white` 8× |
| `src/app/shared/components/scroll-to-top/scroll-to-top.component.ts` | 12 | `from-black via-zinc-800 to-gold`, `text-white` |
| `src/index.html` | 153 | `bg-white`, `text-brand-dark`, `dark:bg-[#0a0a0a]`, `dark:text-gray-100` |

### 2.3 `min-h-screen` a arbitrárne hodnoty (P2)

- `src/app/app.component.html:2` – `min-h-screen` na shelli je OK (root kontajner).
- Arbitrárne hodnoty `z-[100]`, `tracking-[0.2em]`, `max-h-[90vh]`, `hover:scale-[1.02]`, `animate-[shine_4s_infinite]`, `bg-[color:var(--border)]` – väčšina je prípustná, ale `tracking-[0.2em]` patrí do tokenu `--letter-spacing-eyebrow`.

## 3. WCAG kontrast (overené výpočtom)

### 3.1 LIGHT téma

| Pomer | Stav | Pár |
|--:|---|---|
| 17,93:1 | OK | `--text #171717` / `--surface #ffffff` |
| 7,73:1 | OK | `--muted #52525b` / `--surface #ffffff` |
| 7,09:1 | OK | `--muted #52525b` / `--surface-alt #f7f5f0` |
| 5,06:1 | OK | `--accent #8a6a12` / `--surface #ffffff` |
| 4,64:1 | OK (tesne AA) | `--accent #8a6a12` / `--surface-alt #f7f5f0` |
| 8,98:1 | OK | `--on-gold #111111` / `--gold #d4af37` |
| **2,10:1** | **FAIL (P0)** | `--gold #d4af37` ako text / `--surface #ffffff` |
| **2,55:1** | **FAIL (P0)** | Tailwind `gold #c59d24` ako text / `--surface #ffffff` |
| ~1,2:1 | **FAIL (P1)** | `--border rgba(23,23,23,.1)` / `#ffffff` (ovládacie prvky, 1.4.11) |

### 3.2 DARK téma

Všetky dvojice sú v poriadku (`--text` 17–18:1, `--accent` 8,5–9,4:1, `--muted` 7–7,7:1). Pre ovládacie prvky treba doplniť `--color-border-strong` ~ `rgba(212,175,55,0.4)` → 3,5:1 proti `--surface`.

## 4. Farbosleposť a nepriehľadné stavy

Vizuálne stavy, ktoré momentálne nesú informáciu len cez farbu a budú zlyhávať pri deuteranopii/protanopii:

- **Status pill `.is-open`** (zlatá bodka + zelená bodka) – pridať textový štítok „Otvorené / Zatvorené“ aj v ikone, alebo tvar (vyplnený vs prázdny krúžok).
- **Aktívna položka menu** – zlatá podlinka; priložiť `aria-current="page"` **a** `font-weight: 600` navyše.
- **Odkazy v blog článku a v `.lead`** – samotná zlatá bez podčiarknutia zle rozpoznateľná. Pridať `text-decoration: underline` + `text-underline-offset: 3px`.
- **Chyba vo formulári kontaktu** – iba červený okraj. Doplniť ikonu a text pri poli.

Test: `e2e/a11y.spec.ts` doplniť scenár, ktorý cez CDP nastaví `deuteranopia`/`protanopia`/`tritanopia`/`achromatopsia` a over screenshoty.

## 5. Responzivita

Pri 320 px je kontajner `--pad-x: 20px` tesný pre 2 CTA vedľa seba. Odporúčanie: CTA vo flex-column do 360 px.
Headers s `--header-h: 56px` – kotvy fungujú (`scroll-margin-top: var(--header-h)`), overené v `styles.css`.

Viewporty na overenie Playwrightom: 320×568, 390×844, 768×1024, 1024×768, 1440×900.

## 6. Branding — jedinečnosť

Súčasná paleta (zlatá + čierna + biela + Syne) je generická luxusná. Jedinečnosť treba posunúť cez:

- **Jediný zdroj pravdy v OKLCH** (gold-50 až gold-900) generovaný z `oklch(74% 0.12 85)`. Vymazať `gold-light #FFD700` (žlté LED), `gold-dark #B8860B` (olivové), Tailwind `gold #c59d24`.
- **Sémantické mená**: `--color-accent-text` (dark gold #6b530e / light gold #d4af37), `--color-accent-fill` (gold base pre plochy), nikdy obaja z toho istého hex.
- **Typografia**: eyebrow (všetky veľké písmená, `letter-spacing: 0.2em`), `tabular-nums` pri cenách, `text-wrap: balance` pre H1/H2.
- **Tvar**: polomery stupňované (`--radius-sm 8`, `--radius-md 16`, `--radius-lg 24`, `--radius-pill 999`) a jedinečný „korunný“ rez na hero (clip-path trojuholník vľavo hore) ako podpisový prvok.

## 7. Nálezy podľa priority

### P0
- Opraviť zlatú ako text na svetlom: nahradiť `#d4af37`/`#c59d24` tokenom `--color-accent-text` = `#8a6a12` (AA 5:1). Dotknuté: `service-info-modal`, `scroll-to-top`, Tailwind config.
- `service-cards.component.css` nahradiť vlastné `--card-*` tokenmi `--surface`, `--text`, `--muted`, `--accent`.
- Index.html `dark:bg-[#0a0a0a]` → `dark:bg-surface` cez CSS premennú alebo odstrániť (htm už má `html.dark { background: var(--surface) }`).

### P1
- `service-info-modal`: `bg-black/90` → `bg-[color:var(--surface-alt)]`, `text-white` → `text-[color:var(--text)]`, border na token.
- `notification`: pozadie podľa typu (success/error) cez tokeny `--color-success` a `--color-danger`, kontrast overiť.
- `scroll-to-top`: gradient na token, odstrániť `text-white` v tmavom režime.
- `--border` posilniť pre ovládacie prvky: nový token `--color-border-strong: rgba(23,23,23,0.35)` (4,3:1).
- Status pill: doplniť text „Otvorené/Zatvorené“ aj vizuálne, nielen v aria.
- Odkazy v texte: podčiarknuté.

### P2
- `tracking-[0.2em]` → `--letter-spacing-eyebrow`.
- `header.component.css` rgba čiernej → `--color-overlay`.
- Chybové hlásenia formulára pri poli + ikona.

### P3
- Komentár v `tokens.css` pri `--accent` (5,1:1) upraviť na „5,06:1 na bielom; 4,64:1 na `--surface-alt`“.

## 8. Otvorené (potrebujú vstup Erika)

- **Logo súbor**: v `public/` ani `src/assets/` nie je SVG/PNG wordmark PAPI HAIR DESIGN. Nedávať placeholder; čakať na dodávku.
- **Rozhodnutie o korunnom reze na hero** – je to vizuálne silný podpis, ale mení vizuál domácej stránky nad rámec „dizajnový systém“; neimplementované.
- Fotografie salónu v jednotnom farebnom profile – aktuálne mix (Unsplash + vlastné). Odporúčanie: profesionálna fotosession, do tej doby lightroom preset s warmness +8, shadows +10.
