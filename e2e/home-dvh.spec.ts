import { test, expect } from '@playwright/test';

/**
 * Akceptačný test: každá sekcia domovskej stránky = presne 1 obrazovka (100svh),
 * nič sa neoreže, žiadny horizontálny scroll, text nepresahuje sekciu.
 */
const VIEWPORTS = [
    { width: 360, height: 740 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
];
const THEMES = ['light', 'dark'] as const;

for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
        test(`home 100svh ${vp.width}x${vp.height} ${theme}`, async ({ page }) => {
            await page.setViewportSize(vp);
            await page.addInitScript(t => localStorage.setItem('theme', t), theme);
            await page.goto('/', { waitUntil: 'networkidle' });
            await page.evaluate(() => document.fonts.ready);
            await page.waitForTimeout(900); // fade-in animácia

            const report = await page.evaluate(() => {
                const sections = Array.from(document.querySelectorAll('app-home section.screen')) as HTMLElement[];
                const vh = window.innerHeight;
                const vw = window.innerWidth;
                const textSel = 'h1,h2,h3,p,li,a,summary,blockquote,dt,dd';
                const isClippedInside = (el: Element, root: Element) => {
                    for (let a = el.parentElement; a && a !== root; a = a.parentElement) {
                        const cs = getComputedStyle(a);
                        if (a.hasAttribute('data-scroller')) return true;
                        // obsah zatvoreného <details> nie je viditeľný
                        if (a.tagName === 'DETAILS' && !(a as HTMLDetailsElement).open && el.tagName !== 'SUMMARY' && !el.closest('summary')) return true;
                        if (cs.overflowY !== 'visible' || cs.overflowX !== 'visible') return true;
                    }
                    return false;
                };
                return {
                    count: sections.length,
                    pageOverflowX: document.documentElement.scrollWidth - vw,
                    sections: sections.map((s, i) => {
                        const r = s.getBoundingClientRect();
                        const outside: string[] = [];
                        s.querySelectorAll(textSel).forEach(el => {
                            const er = el.getBoundingClientRect();
                            const cs = getComputedStyle(el);
                            if (er.width === 0 || er.height === 0 || cs.visibility === 'hidden') return;
                            if (isClippedInside(el, s)) return;
                            if (er.top < r.top - 1 || er.bottom > r.bottom + 1 || er.left < -1 || er.right > vw + 1) {
                                outside.push(`${el.tagName.toLowerCase()}.${(el as HTMLElement).className || ''} [${Math.round(er.top - r.top)}..${Math.round(er.bottom - r.top)}]`);
                            }
                        });
                        return {
                            i: i + 1,
                            id: s.id || 'hero',
                            height: Math.round(r.height * 10) / 10,
                            vh,
                            overflowY: s.scrollHeight - s.clientHeight,
                            outside,
                        };
                    }),
                };
            });

            expect(report.count, 'počet sekcií').toBe(6);
            expect(report.pageOverflowX, 'horizontálny scroll').toBeLessThanOrEqual(0);

            const tag = `${vp.width}x${vp.height}-${theme}`;
            const sections = page.locator('app-home section.screen');
            for (const s of report.sections) {
                expect.soft(Math.abs(s.height - s.vh), `S${s.i} (${s.id}) výška ${s.height} vs ${s.vh}`).toBeLessThanOrEqual(1);
                expect.soft(s.overflowY, `S${s.i} (${s.id}) orezaný obsah o ${s.overflowY}px`).toBeLessThanOrEqual(0);
                expect.soft(s.outside, `S${s.i} (${s.id}) text mimo sekcie`).toEqual([]);
                await sections.nth(s.i - 1).scrollIntoViewIfNeeded();
                await sections.nth(s.i - 1).screenshot({ path: `e2e/screens/${tag}-s${s.i}.png` });
            }
        });
    }
}

/** Otvorené rozbaľovacie bloky (Príbeh značky, FAQ) nesmú pretiecť sekciu – scrollujú vo vnútri. */
for (const vp of [VIEWPORTS[0], VIEWPORTS[3]]) {
    test(`home 100svh ${vp.width}x${vp.height} otvorené details`, async ({ page }) => {
        await page.setViewportSize(vp);
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.evaluate(() => {
            document.querySelector<HTMLDetailsElement>('app-home .read-more')!.open = true;
            document.querySelector<HTMLDetailsElement>('app-home .faq-item:nth-child(4)')!.open = true;
        });
        const overflow = await page.evaluate(() =>
            ['gold-haircare', 'faq'].map(id => {
                const s = document.getElementById(id)!;
                return { id, overflowY: s.scrollHeight - s.clientHeight };
            }));
        for (const o of overflow) expect.soft(o.overflowY, `${o.id} pretečie`).toBeLessThanOrEqual(0);
    });
}
