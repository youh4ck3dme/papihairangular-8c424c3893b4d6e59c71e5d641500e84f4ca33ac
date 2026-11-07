import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PUBLIC_ROUTES } from './public-routes';

/**
 * Bezpečnostný základ statického webu: HTTP hlavičky (vercel.json = nginx.conf), CSP s hashmi
 * v každom HTML, Trusted Types a žiadne porušenia CSP pri bežnom používaní.
 */
const ROOT = process.cwd();
const DIST = join(ROOT, 'dist/app/browser');
const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
const SECURITY: Record<string, string> = vercel.routes.find((r: { src: string }) => r.src === '^/.*$').headers;
const REQUIRED = ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options',
    'Referrer-Policy', 'Permissions-Policy', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy'];

test('vercel.json má všetky bezpečnostné hlavičky a nginx.conf aj deploy-forpsi.sh rovnaké hodnoty', () => {
    for (const h of REQUIRED) expect(SECURITY[h], h).toBeTruthy();
    expect(SECURITY['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    for (const file of ['nginx.conf', 'scripts/deploy-forpsi.sh']) {
        const conf = readFileSync(join(ROOT, file), 'utf8');
        for (const [name, value] of Object.entries(SECURITY)) {
            if (name === 'Cache-Control') continue;
            expect(conf, `${file}: ${name}`).toContain(`add_header ${name} "${value}" always;`);
        }
    }
});

test('produkcia sa nenasadí automaticky z main (AGENTS.md)', () => {
    expect(vercel.git?.deploymentEnabled?.main).toBe(false);
});

for (const path of ['/', '/cennik', '/neexistuje-stranka']) {
    test(`hlavičky na ${path}`, async ({ request }) => {
        const res = await request.get(path);
        for (const h of REQUIRED) expect(res.headers()[h.toLowerCase()], h).toBe(SECURITY[h]);
    });
}

const htmlFiles = readdirSync(DIST, { recursive: true }).map(String).filter((f) => f.endsWith('.html'));

test('každé HTML má CSP v <meta> pred prvým skriptom, bez unsafe-inline/unsafe-eval pre skripty', () => {
    expect(htmlFiles.length).toBeGreaterThan(12);
    for (const f of htmlFiles) {
        const html = readFileSync(join(DIST, f), 'utf8');
        const meta = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(html);
        expect(meta, f).not.toBeNull();
        expect(html.indexOf(meta![0]), f).toBeLessThan(html.indexOf('<script') === -1 ? Infinity : html.indexOf('<script'));
        const scriptSrc = meta![1].split(';').find((d) => d.trim().startsWith('script-src'))!;
        expect(scriptSrc, f).not.toContain("'unsafe-inline'");
        expect(meta![1], f).not.toContain("'unsafe-eval'");
        expect(meta![1], f).toContain("require-trusted-types-for 'script'");
    }
});

test('nebezpečné obchádzanie sanitizéra len na schválených miestach', () => {
    const allowed = ['service-cards.component.ts', 'contact.component.ts'];
    const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true })
        .flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : /\.(ts|html)$/.test(e.name) ? [join(d, e.name)] : []));
    const hits = walk(join(ROOT, 'src/app')).filter((f) => !f.endsWith('.spec.ts'))
        .filter((f) => /bypassSecurityTrust|\.innerHTML\s*=|outerHTML\s*=|insertAdjacentHTML|document\.write|eval\(|new Function\(/.test(readFileSync(f, 'utf8')))
        .map((f) => f.split('/').pop()!);
    expect(hits.filter((f) => !allowed.includes(f))).toEqual([]);
});

test('žiadne porušenie CSP ani Trusted Types na verejných stránkach', async ({ page }) => {
    test.setTimeout(120_000);
    const violations: string[] = [];
    await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (e) => {
            (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI} ${e.sample}`);
        });
        (window as unknown as { __csp: string[] }).__csp = [];
    });
    page.on('console', (m) => { if (/Content Security Policy|Trusted|NG05604/.test(m.text())) violations.push(m.text()); });
    for (const path of PUBLIC_ROUTES) {
        await page.goto(path, { waitUntil: 'networkidle' });
        await page.mouse.wheel(0, 800);
        await page.waitForTimeout(300);
        const v = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
        violations.push(...v.map((x) => `${path}: ${x}`));
    }
    expect(violations).toEqual([]);
});

test('vložený HTML/skript z XSS prehliadač zablokuje (Trusted Types)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Trusted Types má zatiaľ len Chromium');
    await page.goto('/');
    const blocked = await page.evaluate(() => {
        const r: string[] = [];
        try { document.body.insertAdjacentHTML('beforeend', '<img src=x onerror="window.__pwned=1">'); } catch { r.push('html'); }
        try { const s = document.createElement('script'); s.text = 'window.__pwned=1'; document.body.append(s); } catch { r.push('script'); }
        return { r, pwned: (window as unknown as { __pwned?: number }).__pwned };
    });
    expect(blocked.r).toEqual(['html', 'script']);
    expect(blocked.pwned).toBeUndefined();
});
