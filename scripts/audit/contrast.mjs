// Výpočet WCAG kontrastu pre páry farieb v light aj dark téme.
// Beh: node scripts/audit/contrast.mjs
const lum = h => {
  const r = parseInt(h.slice(1,3),16)/255, g=parseInt(h.slice(3,5),16)/255, b=parseInt(h.slice(5,7),16)/255;
  const f = c => c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
};
const cr = (a,b) => { const la=lum(a), lb=lum(b); return (Math.max(la,lb)+0.05)/(Math.min(la,lb)+0.05); };
const fmt = x => x.toFixed(2);
const pass = (v, big=false) => v >= (big ? 3 : 4.5) ? 'OK' : 'FAIL';
const nonText = v => v >= 3 ? 'OK' : 'FAIL';

const pairs = {
  light: [
    ['--accent #8a6a12', '#8a6a12', '--surface #ffffff', '#ffffff', 'text'],
    ['--accent #8a6a12', '#8a6a12', '--surface-alt #f7f5f0', '#f7f5f0', 'text'],
    ['--text #171717', '#171717', '--surface #ffffff', '#ffffff', 'text'],
    ['--muted #52525b', '#52525b', '--surface #ffffff', '#ffffff', 'text'],
    ['--muted #52525b', '#52525b', '--surface-alt #f7f5f0', '#f7f5f0', 'text'],
    ['--gold #d4af37 ako text', '#d4af37', '--surface #ffffff', '#ffffff', 'text'],
    ['tailwind gold #c59d24 ako text', '#c59d24', '--surface #ffffff', '#ffffff', 'text'],
    ['--on-gold #111111', '#111111', '--gold #d4af37', '#d4af37', 'text'],
  ],
  dark: [
    ['--text #f5f5f5', '#f5f5f5', '--surface #0a0a0a', '#0a0a0a', 'text'],
    ['--text #f5f5f5', '#f5f5f5', '--surface-alt #121212', '#121212', 'text'],
    ['--muted #a1a1aa', '#a1a1aa', '--surface #0a0a0a', '#0a0a0a', 'text'],
    ['--muted #a1a1aa', '#a1a1aa', '--surface-alt #121212', '#121212', 'text'],
    ['--muted #a1a1aa', '#a1a1aa', '--card #171717', '#171717', 'text'],
    ['--accent #d4af37', '#d4af37', '--surface #0a0a0a', '#0a0a0a', 'text'],
    ['--accent #d4af37', '#d4af37', '--surface-alt #121212', '#121212', 'text'],
    ['--accent #d4af37', '#d4af37', '--card #171717', '#171717', 'text'],
  ],
};
for (const theme of ['light','dark']) {
  console.log(`\n### ${theme.toUpperCase()}`);
  for (const [la, a, lb, b, kind] of pairs[theme]) {
    const v = cr(a,b);
    const verdict = kind === 'text' ? pass(v) : nonText(v);
    console.log(`${fmt(v).padStart(6)}:1  ${verdict.padEnd(4)}  ${la}  /  ${lb}`);
  }
}
