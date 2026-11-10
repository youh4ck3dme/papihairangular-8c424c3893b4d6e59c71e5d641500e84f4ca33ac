# PAPI HAIR DESIGN — značka a pravidlá vizuálu

## Pozicionovanie

**PAPI HAIR DESIGN** je štúdiové kaderníctvo a barber v Košiciach, kde striháme, farbíme a staráme sa o vlasy s rovnakou pozornosťou pre dámy aj pánov.

## Osobnosť značky

- Precízna
- Teplá, nie korporátna
- Štýlová bez pozérstva
- Dostupná, nie lacná
- Local-first (Košice, nie "svetový luxus")

## Tón hlasu

- Vykanie (klienti sú širokého veku; vykanie aj v blogu).
- Aktívny čas: „Postaráme sa", nie „Postaral by sa pre Vás".
- Slovenčina bez anglických výpožičiek, ak existuje slovenský ekvivalent („strih", nie „cut"; „farbenie", nie „color").
- Žiadne pretlačené superlatívy („najlepšie v Košiciach", „svetová úroveň"). Jedna silná veta namiesto troch slabších.
- Žiadne emoji v produkčných textoch, výnimky len v sociálnych sieťach.

## Vizuálne klišé, ktorým sa vyhnúť

- Lesklá žltá (#FFD700), zlato-hnedé gradienty v hero sekcii, olivovo-zlatá (#B8860B).
- "Luxusná" čierna 100 % + zlatá na tele textu (padá na kontraste).
- Serifové dekorácie v ozdobách (Playfair, Baskerville ako display písmo mimo loga).
- Stock fotografie s americkými modelkami, ktoré nereprezentujú skutočných klientov.
- Diagonálne linky a trojuholníkové ozdoby bez funkčného významu.

## Farby

Všetky hodnoty sú v `tokens/tokens.json` a generujú sa do `src/styles/tokens.css`.

### Značková paleta

| Rola | Light | Dark | Overený pomer |
|---|---|---|---|
| Pozadie | `#ffffff` (surface) | `#0a0a0a` | — |
| Pozadie sekcie | `#f7f5f0` (teplé) | `#121212` | — |
| Text | `#171717` | `#f5f5f5` | 17–18:1 |
| Tlmený text | `#52525b` | `#a1a1aa` | 7–7,7:1 |
| Akcent (text) | `#8a6a12` (gold-600) | `#d4af37` (gold-400) | 5,06:1 / 9,42:1 |
| Akcent (plocha) | `#d4af37` (gold-400) | `#d4af37` | — |
| Text na akcente | `#171717` | `#171717` | 8,98:1 |
| Okraj | `rgba(23,23,23,0.10)` | `rgba(212,175,55,0.15)` | dekoratívny |
| Silný okraj | `rgba(23,23,23,0.35)` | `rgba(212,175,55,0.45)` | 3:1 pre inputy |
| Úspech (pill Otvorené) | `#16a34a` | `#16a34a` | 4,53:1 |
| Chyba (pole formulára) | `#c62828` | `#c62828` | 5,89:1 |

**Nikdy:** `#d4af37` ako text na bielom (2,10:1), `#c59d24` ako text na bielom (2,55:1), `#FFD700` kdekoľvek.

## Typografia

- Nadpisy: **Syne** (variabilné 400–800), `letter-spacing: -0.02em` pre H1.
- Text: **Inter** (variabilné 100–900).
- Záložné písmo: `Arial`/`Arial Bold` metricky zladené (`size-adjust`, `ascent-override`) — bez CLS pri výmene.
- Veľkosti cez `clamp()` — telo min. 16 px, H1 34–60 px.
- Eyebrow: veľké písmená, `letter-spacing: 0.2em`, 12 px.
- Ceny: `font-variant-numeric: tabular-nums`.
- `text-wrap: balance` pre H1 a H2.
- `hyphens: auto` s `lang="sk"`.

## Priestor

Mriežka 4/8 px (`--space-1` až `--space-24`). Sekcie 64/96 px. Kontajner 1200 px, bočný padding 20/48 px.

## Tvar a hĺbka

Polomery: `--radius-sm 8`, `--radius-md 16`, `--radius-lg 24`, `--radius-pill 9999`. Max 3 tiene (sm, md, lg) pre plávajúce prvky.

## Pohyb

150 ms / 300 ms / 800 ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`. `prefers-reduced-motion` zastavuje všetky transformácie a pás recenzií.

## Wordmark

Súbor loga **PAPI HAIR DESIGN** v `public/` ani `src/assets/` nie je. Zatiaľ sa používa textový wordmark v Syne 800. Ochranný priestor: minimálne výška veľkého písmena po každej strane. Minimálna šírka: 160 px.

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
- **Karta**: pozadie `--color-card`, border `--color-border`, polomer `--radius-md`.
- **Input**: border `--color-border-strong`, focus `--color-semantic-focus`, chyba `--color-semantic-danger`.
- **Pill stavu**: pozadie `--color-surface-alt`, text `--color-text`, bodka doplnená textovým „Otvorené"/„Zatvorené".
- **Odkaz v odseku**: `text-decoration: underline`, `text-underline-offset: 3px`.

## CTA hierarchia

Na obrazovke jedno primárne CTA (Rezervovať), jedno sekundárne (Zavolať) vizuálne slabšie. Cieľová plocha min. 44×44 px.

## Dostupnosť

- WCAG 2.2 AA minimum.
- `focus-visible` viditeľný v oboch témach (zlatý outline 2 px, offset 2 px).
- `prefers-reduced-motion` rešpektované.
- Farba nie je jediný nosič informácie (stavy pill, odkazy podčiarknuté, chyby s ikonou).
