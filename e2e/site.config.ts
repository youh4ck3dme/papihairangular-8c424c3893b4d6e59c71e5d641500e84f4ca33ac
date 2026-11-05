import { defineConfig } from '@playwright/test';

/**
 * Testy celého webu (bezpečnosť, SEO, routes, a11y, home 100dvh).
 * Spustenie po `ng build --configuration production`:
 *   HOME_URL=http://127.0.0.1:4300 npx playwright test -c e2e/site.config.ts
 * (bez HOME_URL ide na dev server https://localhost:3002)
 */
export default defineConfig({
    testDir: '.',
    testMatch: ['security.spec.ts', 'seo.spec.ts', 'routes.spec.ts', 'a11y.spec.ts', 'home-dvh.spec.ts'],
    reporter: 'list',
    workers: 4,
    use: {
        baseURL: process.env['HOME_URL'] ?? 'https://localhost:3002',
        ignoreHTTPSErrors: true,
    },
});
