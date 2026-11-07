// Content-Security-Policy pre statický web bez servera (Vercel/nginx nevedia generovať nonce):
// do každého HTML v dist vloží <meta http-equiv="Content-Security-Policy"> s SHA-256 hashmi
// práve tých inline skriptov a inline handlerov, ktoré stránka obsahuje (Angular event replay,
// prepínač tmavého režimu, async CSS). Nič iné inline sa nespustí – ani vložený <script> z XSS.
// Direktívy, ktoré v <meta> nefungujú (frame-ancestors), posiela hosting v hlavičke (vercel.json, nginx.conf).
// Po zmene HTML sa pregeneruje ngsw.json – service worker overuje hashe súborov.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const sha = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const origin = (u) => { try { return new URL(u).origin; } catch { return null; } };

/** Zdroje tretích strán – len to, čo web naozaj používa. */
function externals() {
  const script = [];
  const connect = [];
  const vitals = origin(process.env.VITALS_ENDPOINT ?? '');
  if (vitals) connect.push(vitals);
  const dsn = /^https:\/\/[a-f0-9]+@([^/]+)\//.exec(process.env.SENTRY_DSN ?? '');
  if (dsn) {
    script.push('https://js.sentry-cdn.com', 'https://browser.sentry-cdn.com');
    connect.push(`https://${dsn[1]}`);
  }
  return { script, connect };
}

export function buildPolicy(html) {
  const scripts = new Set();
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs)) continue;
    // dátové bloky (JSON-LD, stav hydratácie) sa nespúšťajú – CSP sa ich netýka
    if (/type="application\/(ld\+)?json"/.test(attrs)) continue;
    scripts.add(sha(body));
  }
  const handlers = new Set([...html.matchAll(/\son[a-z]+="([^"]*)"/g)].map((m) => sha(m[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"'))));
  const ext = externals();
  const scriptSrc = ["'self'", ...scripts, ...(handlers.size ? ["'unsafe-hashes'", ...handlers] : []), ...ext.script];
  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    // Angular vkladá štýly komponentov do <style> a atribútov style – bez 'unsafe-inline' by web nemal vzhľad
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${["'self'", ...ext.connect].join(' ')}`,
    // mapa na /kontakt
    'frame-src https://www.google.com',
    "worker-src 'self'",
    "manifest-src 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    // DOM XSS: zápis HTML/skriptov len cez politiky Angularu (sanitizér, bypass statických SVG ikon)
    // a dve úzke politiky webu (src/app/core/security/trusted-types.ts)
    "require-trusted-types-for 'script'",
    'trusted-types angular angular#unsafe-bypass papi#jsonld default',
  ].join('; ');
}

export function applyCsp(dist) {
  const files = readdirSync(dist, { recursive: true }).map(String).filter((f) => f.endsWith('.html'));
  for (const f of files) {
    const p = join(dist, f);
    let html = readFileSync(p, 'utf8').replace(/\s*<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
    const meta = `<meta http-equiv="Content-Security-Policy" content="${buildPolicy(html)}">`;
    // musí byť pred prvým skriptom – hneď za <meta charset>
    if (!/<meta charset="[^"]*"\s*\/?>/i.test(html)) throw new Error(`[csp] ${f}: chýba <meta charset>`);
    html = html.replace(/(<meta charset="[^"]*"\s*\/?>)/i, `$1\n  ${meta}`);
    writeFileSync(p, html);
  }
  // service worker kontroluje hashe súborov z ngsw.json – po úprave HTML ho treba pregenerovať
  execFileSync(process.execPath, ['node_modules/@angular/service-worker/ngsw-config.js', dist, 'ngsw-config.json', '/'], { stdio: 'inherit' });
  return files.length;
}
