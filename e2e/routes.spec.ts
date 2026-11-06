import { test, expect, Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { PUBLIC_ROUTES } from './public-routes';

/**
 * Každá verejná route na 360×740 a 1440×900, v light aj dark téme:
 * 1× H1, bez JS chýb, bez horizontálneho scrollu, obrázky s alt/width/height a načítané.
 */
const VIEWPORTS = [
    { name: '360', width: 360, height: 740 },
    { name: '1440', width: 1440, height: 900 },
];
const THEMES = ['light', 'dark'] as const;
// externé zdroje, ktoré v sandboxe/CI nemusia byť dostupné (fonty, Vercel live)
const IGNORED = /fonts\.g|vercel\.live|favicon/;

async function scrollThrough(page: Page) {
    await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
            // web má scroll-behavior: smooth – v teste skrolujeme okamžite
            window.scrollTo({ top: y, behavior: 'instant' });
            await new Promise(r => setTimeout(r, 60));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
    });
}

mkdirSync('e2e/screens/routes', { recursive: true });

for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
        test(`routes ${vp.name} ${theme}`, async ({ page }) => {
            test.setTimeout(120_000);
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.addInitScript(t => localStorage.setItem('theme', t), theme);
            const errors: string[] = [];
            page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
            page.on('console', m => { if (m.type() === 'error' && !IGNORED.test(m.text())) errors.push(`console: ${m.text()}`); });

            for (const route of PUBLIC_ROUTES) {
                errors.length = 0;
                const res = await page.goto(route, { waitUntil: 'networkidle' });
                expect.soft(res?.status(), `${route} HTTP`).toBeLessThan(400);
                await scrollThrough(page);
                await page.waitForLoadState('networkidle');
                await page.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 10_000 }).catch(() => undefined);

                const info = await page.evaluate(() => ({
                    h1: document.querySelectorAll('h1').length,
                    overflowX: document.documentElement.scrollWidth - window.innerWidth,
                    badImgs: [...document.images]
                        .filter(i => getComputedStyle(i).display !== 'none' && i.getBoundingClientRect().width > 0)
                        .filter(i => !i.hasAttribute('alt')
                            // NgOptimizedImage s `fill` nemá width/height – rozmery určuje rodič
                            || (!i.hasAttribute('fill') && (!i.getAttribute('width') || !i.getAttribute('height')))
                            || !(i.complete && i.naturalWidth > 0))
                        .map(i => `${i.getAttribute('src')} alt=${i.hasAttribute('alt')} w=${i.getAttribute('width')} h=${i.getAttribute('height')} nw=${i.naturalWidth}`),
                }));
                expect.soft(info.h1, `${route} počet H1`).toBe(1);
                expect.soft(info.overflowX, `${route} horizontálny scroll`).toBeLessThanOrEqual(0);
                expect.soft(info.badImgs, `${route} obrázky`).toEqual([]);
                expect.soft(errors, `${route} chyby v konzole`).toEqual([]);

                const tag = `${vp.name}-${theme}${route === '/' ? '-home' : route.replace(/\//g, '-')}`;
                await page.screenshot({ path: `e2e/screens/routes/${tag}.png`, fullPage: route !== '/' });
            }
        });
    }
}
