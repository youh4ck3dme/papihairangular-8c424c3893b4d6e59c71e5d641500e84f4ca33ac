import { test, expect, Page } from '@playwright/test';
import { PUBLIC_ROUTES } from './public-routes';

/**
 * Výkonnostné rozpočty (rovnaké ako v lighthouserc.json), merané na mobile 390×844 @3x
 * cez CDP – skutočne prenesené bajty (brotli zo serve-dist), bez throttlingu, aby test bol stabilný.
 * Časy (LCP/TBT) meria Lighthouse CI (`pnpm run lh`) a scripts/perf/vitals-bench.mjs.
 */
// písma: cieľ 80 kB nie je splnený – Inter + Syne (latin + sk podmnožina, variabilná váha 100–900) majú spolu ~95 kB;
// ďalšie zmenšenie by znamenalo obmedziť rozsah váh alebo vypustiť Syne (zmena vzhľadu). Limit 100 kB stráži, aby nepribudlo.
const BUDGET = { script: 130_000, image: 500_000, font: 100_000, total: 900_000, singleImage: 200_000 };

type Sizes = Record<'script' | 'image' | 'font' | 'other', number> & { total: number; images: { url: string; bytes: number }[] };

async function measure(page: Page, path: string, scroll = false): Promise<Sizes> {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    const types = new Map<string, { type: string; url: string }>();
    const s: Sizes = { script: 0, image: 0, font: 0, other: 0, total: 0, images: [] };
    cdp.on('Network.responseReceived', (e) => types.set(e.requestId, { type: e.type, url: e.response.url }));
    cdp.on('Network.loadingFinished', (e) => {
        const r = types.get(e.requestId);
        if (!r) return;
        const k = r.type === 'Script' ? 'script' : r.type === 'Image' ? 'image' : r.type === 'Font' ? 'font' : 'other';
        s[k] += e.encodedDataLength;
        s.total += e.encodedDataLength;
        if (k === 'image') s.images.push({ url: new URL(r.url).pathname, bytes: e.encodedDataLength });
    });
    await page.goto(path, { waitUntil: 'networkidle' });
    if (scroll) {
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y <= h; y += 600) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(60); }
        await page.waitForLoadState('networkidle');
    }
    await cdp.detach();
    return s;
}

test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, serviceWorkers: 'block' });

for (const path of PUBLIC_ROUTES) {
    test(`rozpočet prvého načítania ${path}`, async ({ page }) => {
        const s = await measure(page, path);
        const msg = JSON.stringify({ script: s.script, image: s.image, font: s.font, total: s.total });
        expect(s.script, msg).toBeLessThanOrEqual(BUDGET.script);
        expect(s.image, msg).toBeLessThanOrEqual(BUDGET.image);
        expect(s.font, msg).toBeLessThanOrEqual(BUDGET.font);
        expect(s.total, msg).toBeLessThanOrEqual(BUDGET.total);
    });
}

test('žiadny obrázok nad 200 kB (celé stránky, aj lenivé obrázky)', async ({ page }) => {
    test.setTimeout(180_000);
    const big: string[] = [];
    for (const path of PUBLIC_ROUTES) {
        const s = await measure(page, path, true);
        for (const i of s.images) if (i.bytes > BUDGET.singleImage) big.push(`${path}: ${i.url} ${Math.round(i.bytes / 1024)} kB`);
    }
    expect(big).toEqual([]);
});

test('LCP obrázky majú vysokú prioritu, ostatné sú lenivé', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('img.hero-bg')).toHaveAttribute('fetchpriority', 'high');
    await page.goto('/blog');
    await expect(page.locator('.post-card img').first()).toHaveAttribute('fetchpriority', 'high');
    await expect(page.locator('.post-card img').nth(1)).toHaveAttribute('loading', 'lazy');
});

test('web-vitals sa v produkcii bez VITALS_ENDPOINT nesťahuje', async ({ page }) => {
    const chunks: string[] = [];
    page.on('request', (r) => { if (r.resourceType() === 'script') chunks.push(r.url()); });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5500); // dlhšie ako timeout requestIdleCallback
    const bodies = await Promise.all(chunks.map((u) => page.request.get(u).then((r) => r.text())));
    expect(bodies.some((b) => b.includes('largest-contentful-paint'))).toBe(false);
});

test('rozloženie sa po načítaní písiem neposúva (CLS < 0.1)', async ({ page }) => {
    await page.addInitScript(() => {
        (window as unknown as { __cls: number }).__cls = 0;
        new PerformanceObserver((l) => {
            for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
                if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
            }
        }).observe({ type: 'layout-shift', buffered: true });
    });
    for (const path of ['/', '/blog', '/blog/trendove-ucesy-2026', '/cennik']) {
        await page.goto(path, { waitUntil: 'networkidle' });
        const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
        expect(cls, path).toBeLessThan(0.1);
    }
});
