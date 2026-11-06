import { test, expect } from '@playwright/test';
import { PUBLIC_ROUTES } from './public-routes';

/**
 * Surové HTML (bez spustenia JS) – to, čo vidí Google, Facebook a prehliadač pred načítaním JS.
 * Každá verejná stránka musí byť predgenerovaná s vlastným titulkom, popisom, canonical a obsahom.
 */
const SITE = 'https://papihairdesign.sk';
const titles = new Map<string, string>();

for (const route of PUBLIC_ROUTES) {
    test(`prerender ${route}`, async ({ request }) => {
        const res = await request.get(route);
        expect(res.status()).toBe(200);
        const html = await res.text();

        const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? '';
        const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
        const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '';
        const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';

        expect(title.length, 'title').toBeGreaterThan(10);
        expect(title.length, 'title ≤ 60').toBeLessThanOrEqual(60);
        expect(description.length, 'meta description').toBeGreaterThan(50);
        expect(canonical, 'canonical').toBe(route === '/' ? `${SITE}/` : `${SITE}${route}`);
        expect(h1.length, 'H1 s textom v HTML').toBeGreaterThan(3);
        expect((html.match(/<h1[\s>]/g) ?? []).length, 'práve 1 H1').toBe(1);
        expect(html, 'hlavný obsah v HTML').toMatch(/<main[^>]*>[\s\S]{2000,}<\/main>/);
        // AI funkcie boli odstránené – nesmú sa vrátiť ani do HTML
        expect(html).not.toMatch(/gemini|openai|ai-studio|virtualny-stylista/i);

        for (const [other, t] of titles) expect(t, `duplicitný title s ${other}`).not.toBe(title);
        titles.set(route, title);
    });
}

test('neznáma stránka vráti 404 s noindex', async ({ request, page }) => {
    const res = await request.get('/tato-stranka-neexistuje');
    expect(res.status()).toBe(404);
    await page.goto('/tato-stranka-neexistuje');
    await expect(page.locator('h1')).toContainText(/nenašla|neexistuje|404/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
