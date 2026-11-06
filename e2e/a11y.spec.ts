import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PUBLIC_ROUTES } from './public-routes';

/** axe-core (WCAG 2.1 A/AA) – 0 porušení s dopadom serious/critical na každej verejnej route. */
for (const theme of ['light', 'dark'] as const) {
    for (const vp of [{ width: 360, height: 740 }, { width: 1440, height: 900 }]) {
        test(`a11y ${vp.width} ${theme}`, async ({ page }) => {
            test.setTimeout(180_000);
            await page.setViewportSize(vp);
            await page.addInitScript(t => localStorage.setItem('theme', t), theme);
            for (const route of PUBLIC_ROUTES) {
                await page.goto(route, { waitUntil: 'networkidle' });
                await page.waitForTimeout(900); // úvodné animácie (opacity) dobehnú
                const result = await new AxeBuilder({ page })
                    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                    .analyze();
                const serious = result.violations
                    .filter(v => v.impact === 'serious' || v.impact === 'critical')
                    .map(v => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
                expect.soft(serious, `${route} axe`).toEqual([]);
            }
        });
    }
}
