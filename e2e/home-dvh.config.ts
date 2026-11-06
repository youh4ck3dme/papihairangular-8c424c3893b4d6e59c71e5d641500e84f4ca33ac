import { defineConfig } from '@playwright/test';

/**
 * Samostatná konfigurácia pre akceptačný test 100dvh layoutu.
 * Spustenie: HOME_URL=http://127.0.0.1:4300 npx playwright test -c e2e/home-dvh.config.ts
 * (bez HOME_URL ide na dev server https://localhost:3002)
 */
export default defineConfig({
    testDir: '.',
    testMatch: 'home-dvh.spec.ts',
    reporter: 'list',
    workers: 4,
    use: {
        baseURL: process.env['HOME_URL'] ?? 'https://localhost:3002',
        ignoreHTTPSErrors: true,
    },
});
