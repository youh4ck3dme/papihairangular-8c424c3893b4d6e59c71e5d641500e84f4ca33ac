// Po builde: 404.html = kópia index.html. Vercel ho vráti so statusom 404 pre cesty,
// ktoré nie sú v rewrites (vercel.json); Angular v ňom zobrazí NotFound s noindex.
import { copyFileSync, existsSync } from 'node:fs';
const dist = 'dist/app/browser';
if (!existsSync(`${dist}/index.html`)) throw new Error('[postbuild] chýba dist/app/browser/index.html');
copyFileSync(`${dist}/index.html`, `${dist}/404.html`);
console.log('[postbuild] 404.html vytvorený');
