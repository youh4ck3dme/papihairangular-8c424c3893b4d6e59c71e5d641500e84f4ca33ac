# Dizajn tokeny — PAPI HAIR DESIGN

Zdroj pravdy: `tokens/tokens.json` (W3C DTCG). Generované do `src/styles/tokens.css` cez `node scripts/build-tokens.mjs`. Tailwind `tailwind.config.js` mapuje farby na CSS premenné (sémantické) alebo hex hodnoty (gold škála).

## Prečo to takto

1. **Jediný zdroj.** Tokeny sa menia na jednom mieste (`tokens.json`), prejdú cez generátor a nikto nenapíše `#d4af37` do CSS súboru ručne.
2. **Dve zlaté dnes, jedna zajtra.** Repo malo tri konkurenčné zlaté: `--gold #d4af37`, Tailwind `gold #c59d24`, `gold-light #FFD700`, `gold-dark #B8860B`. Nahradené jednou OKLCH škálou 50–900.
3. **Kontrast je overený, nie tipovaný.** Každá dvojica text/pozadie prešla `scripts/audit/contrast.mjs` (relatívna luminancia WCAG 2.2).
4. **Sémantika pred farbou.** Namiesto `text-gold-600` sa v šablónach píše `text-accent-text` — v tmavom režime sa pretočí na správny odtieň automaticky.

## Kontrastová matica

### Svetlá téma

| Pár | Pomer | AA text | AA veľký text | AA ovládač |
|---|--:|:-:|:-:|:-:|
| `--color-text` / `--color-surface` | 17,93:1 | ✅ | ✅ | ✅ |
| `--color-text` / `--color-surface-alt` | 17,18:1 | ✅ | ✅ | ✅ |
| `--color-text-muted` / `--color-surface` | 7,73:1 | ✅ | ✅ | ✅ |
| `--color-text-muted` / `--color-surface-alt` | 7,09:1 | ✅ | ✅ | ✅ |
| `--color-accent-text` / `--color-surface` | 5,06:1 | ✅ | ✅ | ✅ |
| `--color-accent-text` / `--color-surface-alt` | 4,64:1 | ✅ | ✅ | ✅ |
| `--color-on-accent` / `--color-accent-fill` | 8,98:1 | ✅ | ✅ | ✅ |
| `--color-accent-fill` ako text / `--color-surface` | 2,10:1 | ❌ | ❌ | — |
| `--color-border` / `--color-surface` | ~1,2:1 | — | — | ❌ (dekoratívny) |
| `--color-border-strong` / `--color-surface` | ~4,3:1 | — | — | ✅ (inputy, 1.4.11) |
| `--color-semantic-success` / `--color-surface` | 4,53:1 | ✅ | ✅ | ✅ |
| `--color-semantic-danger` / `--color-surface` | 5,89:1 | ✅ | ✅ | ✅ |

### Tmavá téma

| Pár | Pomer | AA text | AA veľký text | AA ovládač |
|---|--:|:-:|:-:|:-:|
| `--color-text` / `--color-surface` | 18,16:1 | ✅ | ✅ | ✅ |
| `--color-text` / `--color-surface-alt` | 17,18:1 | ✅ | ✅ | ✅ |
| `--color-text-muted` / `--color-surface` | 7,72:1 | ✅ | ✅ | ✅ |
| `--color-text-muted` / `--color-surface-alt` | 7,31:1 | ✅ | ✅ | ✅ |
| `--color-text-muted` / `--color-card` | 7,00:1 | ✅ | ✅ | ✅ |
| `--color-accent-text` / `--color-surface` | 9,42:1 | ✅ | ✅ | ✅ |
| `--color-accent-text` / `--color-surface-alt` | 8,91:1 | ✅ | ✅ | ✅ |
| `--color-accent-text` / `--color-card` | 8,53:1 | ✅ | ✅ | ✅ |

Overenie: `node scripts/audit/contrast.mjs`.

## Zlatá škála (OKLCH)

| Krok | Hex | OKLCH (lightness/chroma) | Použitie |
|---|---|---|---|
| gold-50 | `#faf6e7` | 97 / 0.03 | jemné pozadie |
| gold-100 | `#f3ecc9` | 93 / 0.07 | pill pozadie |
| gold-200 | `#e8d99a` | 87 / 0.11 | |
| gold-300 | `#dec36a` | 80 / 0.14 | |
| gold-400 | `#d4af37` | 74 / 0.12 | **plocha, ikony, tlačidlá** |
| gold-500 | `#b8922b` | 65 / 0.11 | hover |
| gold-600 | `#8a6a12` | 50 / 0.10 | **text na svetlom (AA)** |
| gold-700 | `#6b530e` | 40 / 0.08 | |
| gold-800 | `#4a3908` | 28 / 0.06 | |
| gold-900 | `#2a2005` | 16 / 0.04 | |

## Priestor, tvar, pohyb, typografia

Pozri `tokens/tokens.json` — sekcie `space`, `radius`, `size`, `font`, `shadow`, `motion`, `z`. Všetky majú zdokumentovaný význam v `$description`.

## Použitie v kóde

```html
<!-- Správne -->
<p class="text-text">Text</p>
<p class="text-text-muted">Vedľajší text</p>
<a class="text-accent-text underline">Odkaz</a>
<button class="bg-accent-fill text-on-accent">Rezervovať</button>

<!-- Zlé — nikdy neurobiť -->
<p class="text-gold">Padne na kontrast na bielom</p>
<p class="text-[#c59d24]">Arbitrárna hodnota</p>
```
