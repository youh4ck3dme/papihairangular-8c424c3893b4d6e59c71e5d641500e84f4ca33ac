import { test, expect } from '@playwright/test';
import { PUBLIC_ROUTES } from './public-routes';

/**
 * Pixel-perfect responzivita: každá verejná route na 11 šírkach (telefóny, tablety, desktop).
 * Kontroluje: žiadny vodorovný scroll, žiadny prvok mimo viewportu (okrem zámerných pásov),
 * žiadny text pod 12 px a dotykové ciele (tlačidlá a ovládanie min. 44 px, ostatné odkazy min. 24 px).
 */
const VIEWPORTS: [number, number][] = [
    [320, 568], [360, 740], [390, 844], [412, 915], [480, 854],
    [768, 1024], [820, 1180], [1024, 768], [1280, 800], [1440, 900], [1920, 1080],
];

for (const [width, height] of VIEWPORTS) {
    test(`responsive ${width}x${height}`, async ({ page }) => {
        test.setTimeout(180_000);
        await page.setViewportSize({ width, height });
        await page.addInitScript(() => localStorage.setItem('theme', 'light'));

        for (const route of PUBLIC_ROUTES) {
            await page.goto(route, { waitUntil: 'networkidle' });
            const report = await page.evaluate(() => {
                const vw = window.innerWidth;
                const visible = (el: Element) => {
                    const cs = getComputedStyle(el);
                    const r = el.getBoundingClientRect();
                    return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 1 && r.height > 1;
                };
                // zámerné vodorovné pásy a prvky v orezanom rodičovi sa nepočítajú
                const inScroller = (el: Element) => {
                    for (let p = el.parentElement; p; p = p.parentElement) {
                        const ox = getComputedStyle(p).overflowX;
                        if (ox === 'hidden' || ox === 'auto' || ox === 'scroll' || ox === 'clip') return true;
                    }
                    return false;
                };
                const label = (el: Element) =>
                    `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')} "${(el.textContent ?? '').trim().slice(0, 30)}"`;
                const srOnly = (el: Element) => el.closest('.sr-only') !== null;

                const outside: string[] = [];
                const tinyText: string[] = [];
                const smallTargets: string[] = [];

                for (const el of Array.from(document.body.querySelectorAll('*'))) {
                    if (!visible(el) || srOnly(el)) continue;
                    const r = el.getBoundingClientRect();
                    if ((r.right > vw + 1 || r.left < -1) && !inScroller(el) && getComputedStyle(el).position !== 'fixed') {
                        outside.push(`${label(el)} left=${Math.round(r.left)} right=${Math.round(r.right)}`);
                    }
                    const ownText = Array.from(el.childNodes).some(n => n.nodeType === 3 && (n.textContent ?? '').trim().length > 0);
                    if (ownText && parseFloat(getComputedStyle(el).fontSize) < 12) {
                        tinyText.push(`${label(el)} ${getComputedStyle(el).fontSize}`);
                    }
                }

                for (const el of Array.from(document.querySelectorAll('a[href], button, [role="button"], input, textarea, summary'))) {
                    if (!visible(el) || srOnly(el) || inScroller(el) && el.closest('[aria-hidden="true"]')) continue;
                    const r = el.getBoundingClientRect();
                    const isControl = el.matches('button, [role="button"], .btn, input, textarea, summary');
                    // odkaz uprostred vety je z pravidla vyňatý (WCAG 2.5.8 – inline)
                    const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p, li, blockquote') !== null;
                    const min = isControl ? 44 : 24;
                    if (!inline && (r.height < min - 0.5 || r.width < Math.min(min, 24) - 0.5)) {
                        smallTargets.push(`${label(el)} ${Math.round(r.width)}×${Math.round(r.height)} (min ${min})`);
                    }
                }
                return {
                    overflowX: document.documentElement.scrollWidth - vw,
                    outside: outside.slice(0, 8), tinyText: tinyText.slice(0, 8), smallTargets: smallTargets.slice(0, 12),
                };
            });
            expect.soft(report.overflowX, `${route} vodorovný scroll`).toBeLessThanOrEqual(0);
            expect.soft(report.outside, `${route} prvky mimo viewportu`).toEqual([]);
            expect.soft(report.tinyText, `${route} text pod 12 px`).toEqual([]);
            expect.soft(report.smallTargets, `${route} malé dotykové ciele`).toEqual([]);
        }
    });
}
