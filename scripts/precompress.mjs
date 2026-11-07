// Predkomprimuje textové súbory v dist (gzip -9 + brotli q11) pre nginx gzip_static / brotli_static.
// Len pre VPS/Docker (npm run build:vps) – Vercel komprimuje sám, .gz/.br by tam boli zbytočné.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const root = process.argv[2] ?? 'dist/app/browser';
const EXT = /\.(html|js|mjs|css|json|webmanifest|svg|xml|txt)$/;
let n = 0, raw = 0, br = 0;

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!EXT.test(f)) continue;
    const buf = readFileSync(p);
    if (buf.length < 1024) continue; // malé súbory sa neoplatí komprimovať
    const b = brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: buf.length } });
    writeFileSync(`${p}.gz`, gzipSync(buf, { level: 9 }));
    writeFileSync(`${p}.br`, b);
    n++; raw += buf.length; br += b.length;
  }
}
walk(root);
console.log(`[precompress] ${n} súborov: ${Math.round(raw / 1024)} kB → brotli ${Math.round(br / 1024)} kB`);
