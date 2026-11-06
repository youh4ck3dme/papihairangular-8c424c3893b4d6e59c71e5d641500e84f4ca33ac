// Po builde (prerendering, outputMode: static):
//  • 404.html = index.csr.html (prázdny shell) – Vercel ho vráti so statusom 404 pre neznáme cesty
//    a Angular v ňom zobrazí NotFound s noindex.
//  • kontrola, že všetky verejné stránky sa naozaj predgenerovali.
import { copyFileSync, existsSync, readFileSync } from 'node:fs';

const dist = 'dist/app/browser';
const shell = `${dist}/index.csr.html`;
if (!existsSync(shell)) throw new Error('[postbuild] chýba index.csr.html – prerendering nebežal?');
copyFileSync(shell, `${dist}/404.html`);

const sitemap = readFileSync('src/sitemap.xml', 'utf8');
const paths = [...sitemap.matchAll(/<loc>https:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(m => m[1]);
const missing = paths.filter(p => !existsSync(`${dist}${p === '/' ? '' : p}/index.html`));
if (missing.length) throw new Error(`[postbuild] nepredgenerované stránky: ${missing.join(', ')}`);
console.log(`[postbuild] 404.html vytvorený, predgenerovaných stránok: ${paths.length}`);
