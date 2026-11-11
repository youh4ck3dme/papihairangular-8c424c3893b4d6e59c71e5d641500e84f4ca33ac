# PAPI HAIR DESIGN — značka a pravidlá vizuálu

## Pozicionovanie

**PAPI HAIR DESIGN** je štúdiové kaderníctvo a barber v Košiciach, kde striháme, farbíme a staráme sa o vlasy s rovnakou pozornosťou pre dámy aj pánov.

## Osobnosť značky

- Precízna
- Teplá, nie korporátna
- Štýlová bez pozérstva
- Dostupná, nie lacná
- Local-first (Košice, nie „svetový luxus")

## Tón hlasu

- Vykanie (klienti sú širokého veku; vykanie aj v blogu).
- Aktívny čas: „Postaráme sa", nie „Postaral by sa pre Vás".
- Slovenčina bez anglických výpožičiek, ak existuje slovenský ekvivalent („strih", nie „cut"; „farbenie", nie „color").
- Žiadne pretlačené superlatívy („najlepšie v Košiciach", „svetová úroveň"). Jedna silná veta namiesto troch slabších.
- Žiadne emoji v produkčných textoch, výnimky len v sociálnych sieťach.

## Vizuálne klišé, ktorým sa vyhnúť

- Lesklá žltá (`#FFD700`), zlato-hnedé gradienty v hero sekcii, olivovo-zlatá (`#B8860B`).
- „Luxusná" čierna 100 % + zlatá na tele textu (padá na kontraste).
- Serifové dekorácie v ozdobách (Playfair, Baskerville ako display písmo mimo loga).
- Stock fotografie s americkými modelkami, ktoré nereprezentujú skutočných klientov.
- Diagonálne linky a trojuholníkové ozdoby bez funkčného významu.

## Farby (aktualizované 2026-11-11)

Všetky hodnoty sú v `tokens/tokens.json` a generujú sa do `src/styles/tokens.css`.

### Značková paleta (svetlá téma)

| Rola | Hodnota | Overený pomer |
|---|---|---|
| Pozadie stránky | `#faf8f3` (teplé krémové) | – |
| Pozadie sekcie (alt) | `#efeadf` | – |
| Karta | `#ffffff` + `--shadow-card` | – |
| Text | `#111111` | 15,74:1 na surface-alt |
| Tlmený text | `#45454d` | 7,92:1 na surface-alt |
| Akcent (text) | `#7a5c0c` | 5,20:1 na surface-alt |
| Akcent (plocha) | `#d4af37` (gold-400) | – |
| Akcent (grafika, hviezdy) | `#9a7614` | 3,52:1 na surface-alt (nontext AA) |
| Text na akcente | `#111111` | 8,98:1 |
| Okraj (dekoratívny) | `rgba(23,23,23,0.16)` | – |
| Silný okraj (inputy) | `rgba(23,23,23,0.50)` | 3,28:1 na surface-alt |
| Úspech | `#166534` | 5,94:1 na surface-alt |
| Chyba formulára | `#b91c1c` | 5,39:1 na surface-alt |

### Značková paleta (tmavá téma)

| Rola | Hodnota | Overený pomer |
|---|---|---|
| Pozadie | `#0a0a0a` | – |
| Pozadie sekcie (alt) | `#121212` | – |
| Karta | `#171717` | – |
| Text | `#f5f5f5` | 17–18:1 |
| Tlmený text | `#a1a1aa` | 7–7,7:1 |
| Akcent (text aj plocha) | `#d4af37` | 8,5–9,4:1 |
| Akcent (grafika) | `#d4af37` | 9,4:1 na surface |

**Pravidlá pre zlatú:**
- Nikdy `#d4af37` ako text na svetlom pozadí (2,10:1 FAIL). Text len `#7a5c0c`.
- `#9a7614` je medzi gold-500 a gold-600; nižšie odtiene (gold-500 `#b8922b` = 2,44:1, gold-400 `#d4af37` = 1,98:1) na svetlom pozadí **nespĺňajú 3:1 pre grafiku**, preto hviezdy musia byť tmavšie, než hovorí pôvodný prompt. `#9a7614` je najtmavší odtieň, ktorý ešte pôsobí zlato, nie olivovo.

## Typografia

- **Nadpisy a text: Satoshi** (variabilné 300–900).
- Nadpisy Satoshi váha 800 (H1) a 700 (H2–H3); lead 500; telo 400.
- Záložné písma (kým sa nenačíta Satoshi) podľa platformy:
  - macOS/iOS → `'Satoshi Fallback HN'` (Helvetica Neue),
  - Windows → `'Satoshi Fallback Segoe'` (Segoe UI),
  - Android → `'Satoshi Fallback Roboto'` (Roboto),
  - ostatné → `'Satoshi Fallback'` (Arial / Liberation Sans).
- Každá rodina má vlastný `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` prepočítaný frekvenčne váženou šírkou znaku voči Satoshi (metóda capsize `xWidthAvg`). Tučné rezy idú zo skutočného Bold variantu, aby prehliadač tučné nesyntetizoval z Regular.
- Veľkosti cez `clamp()`, telo min. 16 px.
- Eyebrow: veľké písmená, `letter-spacing: 0.2em`, 12 px.
- Ceny: `font-variant-numeric: tabular-nums`.
- `text-wrap: balance` pre H1–H3, `text-wrap: pretty` pre odseky.
- `hyphens: auto` s `lang="sk"`.

## Priestor

Mriežka 4/8 px (`--space-1` až `--space-24`). Kontajner 1320 px.

**Bočné okraje (`--pad-x`):**
| Šírka displeja | `--pad-x` |
|---|---|
| do 479 px | 12 px |
| 480–767 px | 16 px |
| 768–1023 px | 24 px |
| od 1024 px | 32 px |

Záchytné pre iPhone s výrezom: `padding-inline = max(--pad-x, env(safe-area-inset-*))`.

**Zvislé medzery sekcií:**
- Podstránky: 48 px (mobil) / 72 px (desktop).
- Home: 7 sekcií po 100dvh (overené `e2e/home-dvh.spec.ts`).

## Tvar a hĺbka

Polomery: `--radius-sm 8`, `--radius-md 16`, `--radius-lg 24`, `--radius-pill 9999`. Karty majú jemný tieň `--shadow-card` (len v svetlej téme). V tmavej sa oddelia vlastnou farbou karty `#171717`.

## Pohyb

150 ms / 300 ms / 800 ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`. `prefers-reduced-motion` zastavuje všetky transformácie, pás recenzií aj slide + fade prechod medzi stránkami (ten sa redukuje na fade 0,15 s).

## Wordmark

Súbor loga **PAPI HAIR DESIGN** v `public/` ani `src/assets/` nie je. Zatiaľ sa používa textový wordmark v Satoshi 800. Ochranný priestor: minimálne výška veľkého písmena po každej strane. Minimálna šírka: 160 px.

**Otvorené:** dodať SVG wordmark; tento dokument sa potom aktualizuje o súbory, favicon a OG obrázok.

## Fotografia

- Jednotný teplý tón (warmness +8 v Lightroom), zdvihnuté tiene (+10), znížené highlighty (–15).
- Orez 3:2 (horizontálny) alebo 4:5 (portrét).
- Skutoční klienti a tím; Unsplash len ako dočasná výplň.
- `alt` text opisuje službu/stav, nie technický detail: „Dámsky bob strih po farbení", nie „Žena so svetlými vlasmi".

## Komponenty

Katalóg v `src/styles/components.css`. Kľúčové:

- **Tlačidlo primary**: plocha `--color-accent-fill`, text `--color-on-accent`, výška `--size-cta-h` (56 px).
- **Tlačidlo outline**: bez pozadia, border `--color-border-strong`, hover plocha `--color-surface-alt`.
- **Karta**: pozadie `--color-card`, border `--color-border`, polomer `--radius-md`, tieň `--shadow-card`.
- **Input**: border `--color-border-strong` (3,3:1), focus zlatý outline 2 px, chyba `--color-semantic-danger`.
- **Pill stavu**: pevné hex farby (axe nevie `color-mix`), text „Otvorené" / „Zatvorené" aj vedľa bodky.
- **Odkaz v odseku**: `text-decoration: underline`, `text-underline-offset: 3px`.

## CTA hierarchia

Na obrazovke jedno primárne CTA (Rezervovať), jedno sekundárne (Zavolať) vizuálne slabšie. Cieľová plocha min. 44×44 px (plus 24 px pre textové odkazy mimo odsekov).

## Dostupnosť

- WCAG 2.2 AA minimum; overené `e2e/a11y.spec.ts` (axe-core) v light aj dark na 360 a 1440 px.
- `focus-visible` viditeľný v oboch témach (zlatý outline 3 px, offset 2 px).
- `prefers-reduced-motion` rešpektované.
- Farba nie je jediný nosič informácie (stavy pill, odkazy podčiarknuté, chyby s ikonou).
- `e2e/responsive.spec.ts` overuje 11 viewportov × každá route × obe témy: žiadny vodorovný scroll, prvky v rámci viewportu, žiadny text pod 12 px, dotykové ciele ≥ 44 px.
