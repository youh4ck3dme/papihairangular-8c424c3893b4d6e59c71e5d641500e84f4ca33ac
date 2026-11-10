// Lokálny statický server pre testy (Playwright, Lighthouse) – správa sa ako Vercel:
// /cennik → cennik/index.html, neexistujúca cesta → 404.html so statusom 404, brotli/gzip ako na CDN
// (bez kompresie by Lighthouse meral ~3× väčšie JS a výsledky by neboli porovnateľné s produkciou).
// Hlavičky (bezpečnostné, Cache-Control) berie z vercel.json – testy tak overujú skutočnú konfiguráciu.
// Použitie: node scripts/serve-dist.mjs [port] [priečinok]
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createBrotliCompress, createGzip } from 'node:zlib';

const port = Number(process.argv[2] ?? 4300);
const root = process.argv[3] ?? 'dist/app/browser';
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
};

// trasy z vercel.json, ktoré len pridávajú hlavičky (continue: true); neskoršia trasa prepíše rovnakú hlavičku
const headerRoutes = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')).routes
  .filter((r) => r.continue && r.headers)
  .map((r) => ({ re: new RegExp(r.src), headers: r.headers }));
const headersFor = (path) => Object.assign({}, ...headerRoutes.filter((r) => r.re.test(path)).map((r) => r.headers));

function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const base = join(root, clean);
  if (existsSync(base) && statSync(base).isFile()) return base;
  const index = join(base, 'index.html');
  if (existsSync(index)) return index;
  return null;
}

createServer((req, res) => {
  const file = resolve(req.url ?? '/');
  const target = file ?? join(root, '404.html');
  const type = types[extname(target)] ?? 'application/octet-stream';
  const accept = String(req.headers['accept-encoding'] ?? '');
  const compressible = /text|javascript|json|xml|svg|manifest/.test(type);
  const encoding = !compressible ? null : accept.includes('br') ? 'br' : accept.includes('gzip') ? 'gzip' : null;
  res.writeHead(file ? 200 : 404, {
    ...headersFor((req.url ?? '/').split('?')[0]),
    'Content-Type': type,
    ...(encoding ? { 'Content-Encoding': encoding, Vary: 'Accept-Encoding' } : {}),
  });
  const stream = createReadStream(target);
  if (encoding === 'br') stream.pipe(createBrotliCompress()).pipe(res);
  else if (encoding === 'gzip') stream.pipe(createGzip()).pipe(res);
  else stream.pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`[serve-dist] http://127.0.0.1:${port} (${root})`));
