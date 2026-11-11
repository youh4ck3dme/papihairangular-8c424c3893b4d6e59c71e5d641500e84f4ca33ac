// Generátor src/styles/tokens.css z W3C DTCG tokens/tokens.json.
// Spracúva referencie {color.gold.600} a vypisuje len tokeny, zachováva @font-face blok v tokens.css nad značkou GENERATED.
// Spustenie: node scripts/build-tokens.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'tokens/tokens.json');
const dst = path.join(root, 'src/styles/tokens.css');
const MARK = '/* GENERATED FROM tokens/tokens.json — nemeniť ručne pod touto čiarou */';

const data = JSON.parse(fs.readFileSync(src, 'utf8'));

// Rozbaľ referencie {a.b.c}
function resolve(value, data) {
  if (typeof value !== 'string') return value;
  const m = value.match(/^\{([\w.-]+)\}$/);
  if (!m) return value;
  const parts = m[1].split('.');
  let n = data;
  for (const p of parts) n = n?.[p];
  if (!n || !('$value' in n)) throw new Error('Unresolved: ' + m[1]);
  return resolve(n.$value, data);
}

// Flat prejdi strom; cesta sa stane CSS premennou cez spojenie '-' a odstránenie 'color.' prefixu z farieb
function* walk(node, pathArr = []) {
  if (node && typeof node === 'object' && '$value' in node) {
    yield { path: pathArr, value: resolve(node.$value, data) };
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    yield* walk(v, [...pathArr, k]);
  }
}

const sections = { root: [], light: [], dark: [] };

for (const entry of walk(data)) {
  const p = entry.path;
  if (p[0] === 'theme') {
    const theme = p[1]; // light / dark
    const name = p.slice(2).join('-'); // color-surface
    sections[theme].push([`--${name}`, entry.value]);
  } else {
    const name = p.join('-'); // color-gold-400, space-4, font-size-body
    sections.root.push([`--${name}`, entry.value]);
  }
}

// Legacy aliasy — existujúce premenné v kódovej báze: --surface, --surface-alt, --text, --muted, --border, --card, --accent, --gold, --gold-hover, --on-gold, --font-body, --font-heading, --container, --pad-x, --radius
const legacyLight = [
  ['--surface', 'var(--color-surface)'],
  ['--surface-alt', 'var(--color-surface-alt)'],
  ['--text', 'var(--color-text)'],
  ['--muted', 'var(--color-text-muted)'],
  ['--border', 'var(--color-border)'],
  ['--card', 'var(--color-card)'],
  ['--accent', 'var(--color-accent-text)'],
  ['--gold', 'var(--color-accent-fill)'],
  ['--gold-hover', '#e6c35c'],
  ['--on-gold', 'var(--color-on-accent)'],
  ['--font-body', 'var(--font-family-body)'],
  ['--font-heading', 'var(--font-family-heading)'],
  ['--container', 'var(--size-container)'],
  ['--pad-x', 'var(--size-pad-x)'],
  ['--radius', 'var(--radius-md)'],
  ['--header-h', 'var(--size-header-h)'],
  ['--cta-h', 'var(--size-cta-h)'],
];

// Preserved @font-face blok zo starého tokens.css
const current = fs.readFileSync(dst, 'utf8');
const preserved = current.split(MARK)[0].replace(/\n+:root\s*{[\s\S]*$/m, '').trimEnd();

const lines = [];
lines.push(preserved);
lines.push('');
lines.push(MARK);
lines.push(':root {');
for (const [k, v] of sections.root) lines.push(`  ${k}: ${v};`);
lines.push('');
lines.push('  /* Téma — svetlá (default) */');
for (const [k, v] of sections.light) lines.push(`  ${k}: ${v};`);
lines.push('');
lines.push('  /* Legacy aliasy pre existujúce selektory v kóde */');
for (const [k, v] of legacyLight) lines.push(`  ${k}: ${v};`);
lines.push('}');
lines.push('');
// Bočný okraj rastie so šírkou displeja: 12 → 16 → 24 → 32 px
lines.push('@media (min-width: 480px) {');
lines.push('  :root { --pad-x: var(--size-pad-x-sm); }');
lines.push('}');
lines.push('@media (min-width: 768px) {');
lines.push('  :root {');
lines.push('    --pad-x: var(--size-pad-x-md);');
lines.push('    --radius: var(--radius-lg);');
lines.push('  }');
lines.push('}');
lines.push('@media (min-width: 1024px) {');
lines.push('  :root { --pad-x: var(--size-pad-x-lg); }');
lines.push('}');
lines.push('');
lines.push('html.dark {');
for (const [k, v] of sections.dark) lines.push(`  ${k}: ${v};`);
lines.push('}');
lines.push('');

fs.writeFileSync(dst, lines.join('\n'));
console.log(`tokens.css prepísaný z tokens.json (${sections.root.length} základných, ${sections.light.length} light, ${sections.dark.length} dark, ${legacyLight.length} aliasov)`);
