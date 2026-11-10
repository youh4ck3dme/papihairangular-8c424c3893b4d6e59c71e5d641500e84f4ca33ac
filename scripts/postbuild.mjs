// Po builde (prerendering, outputMode: static):
//  • 404.html = index.csr.html (prázdny shell) – Vercel ho vráti so statusom 404 pre neznáme cesty
//    a Angular v ňom zobrazí NotFound s noindex.
//  • kontrola, že všetky verejné stránky sa naozaj predgenerovali.
//  • CSP s hashmi inline skriptov do každého HTML + nový ngsw.json (scripts/csp.mjs).
import { copyFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { applyCsp } from './csp.mjs';

const dist = 'dist/app/browser';
const shell = `${dist}/index.csr.html`;
if (!existsSync(shell)) throw new Error('[postbuild] chýba index.csr.html – prerendering nebežal?');
copyFileSync(shell, `${dist}/404.html`);

const sitemap = readFileSync('src/sitemap.xml', 'utf8');
const paths = [...sitemap.matchAll(/<loc>https:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(m => m[1]);
const missing = paths.filter(p => !existsSync(`${dist}${p === '/' ? '' : p}/index.html`));
if (missing.length) throw new Error(`[postbuild] nepredgenerované stránky: ${missing.join(', ')}`);
// produkcia nesmie obsahovať source mapy (zdrojový kód by bol verejný)
const maps = readdirSync(dist, { recursive: true }).filter(f => String(f).endsWith('.map'));
if (maps.length) throw new Error(`[postbuild] v dist sú source mapy: ${maps.slice(0, 5).join(', ')}`);
const withCsp = applyCsp(dist);
console.log(`[postbuild] 404.html vytvorený, predgenerovaných stránok: ${paths.length}, CSP v ${withCsp} HTML súboroch`);
