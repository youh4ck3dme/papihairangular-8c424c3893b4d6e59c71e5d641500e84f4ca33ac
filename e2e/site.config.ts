import { defineConfig } from '@playwright/test';

/**
 * Testy celého webu (bezpečnosť, SEO, prerendering, routes, a11y, home 100dvh, výkonnostné rozpočty).
 * Spustenie po `pnpm run build:prod`:  pnpm run test:site
 * Server (scripts/serve-dist.mjs) sa spustí automaticky; HOME_URL=… otestuje iný web (napr. Vercel preview).
 */
const external = process.env['HOME_URL'];

export default defineConfig({
    testDir: '.',
    testMatch: ['security.spec.ts', 'seo.spec.ts', 'prerender.spec.ts', 'interactions.spec.ts', 'routes.spec.ts', 'a11y.spec.ts', 'home-dvh.spec.ts', 'perf.spec.ts', 'security-headers.spec.ts'],
    reporter: 'list',
    workers: 4,
    use: {
        baseURL: external ?? 'http://127.0.0.1:4300',
        ignoreHTTPSErrors: true,
    },
    webServer: external ? undefined : {
        command: 'node ../scripts/serve-dist.mjs 4300 ../dist/app/browser',
        url: 'http://127.0.0.1:4300/',
        reuseExistingServer: true,
    },
});
