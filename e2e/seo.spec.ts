import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { SALON_CONTACT } from '../src/app/core/config/salon-contact';
import { OPENING_HOURS } from '../src/app/core/config/opening-hours';
import { PUBLIC_ROUTES } from './public-routes';

const SITE = 'https://papihairdesign.sk';

function readLd(): Record<string, any> {
    const html = readFileSync('src/index.html', 'utf8');
    const m = html.match(/<script type="application\/ld\+json" id="ld-salon">([\s\S]*?)<\/script>/);
    expect(m, 'JSON-LD #ld-salon v index.html').toBeTruthy();
    return JSON.parse(m![1]);
}

test.describe('JSON-LD HairSalon = SALON_CONTACT + OPENING_HOURS', () => {
    test('kontakty, adresa, geo, sociálne siete', () => {
        const ld = readLd();
        expect(ld['@type']).toBe('HairSalon');
        expect(ld.telephone).toBe(SALON_CONTACT.phoneE164);
        expect(ld.email).toBe(SALON_CONTACT.email);
        expect(ld.url).toBe(SALON_CONTACT.siteUrl);
        expect(ld.hasMap).toBe(SALON_CONTACT.mapsUrl);
        expect(ld.address.streetAddress).toBe(SALON_CONTACT.address.street);
        expect(ld.address.addressLocality).toBe(SALON_CONTACT.address.city);
        expect(ld.address.postalCode).toBe(SALON_CONTACT.address.postalCode);
        expect(ld.address.addressCountry).toBe(SALON_CONTACT.address.country);
        expect(ld.geo.latitude).toBe(SALON_CONTACT.geo.lat);
        expect(ld.geo.longitude).toBe(SALON_CONTACT.geo.lng);
        expect([...ld.sameAs].sort()).toEqual(Object.values(SALON_CONTACT.social).sort());
    });

    test('otváracie hodiny zodpovedajú OPENING_HOURS', () => {
        const ld = readLd();
        const fromLd = (ld.openingHoursSpecification as any[]).flatMap(s =>
            (Array.isArray(s.dayOfWeek) ? s.dayOfWeek : [s.dayOfWeek]).map((d: string) => `${d} ${s.opens}-${s.closes}`));
        const expected = OPENING_HOURS.filter(h => h.schemaDay).map(h => `${h.schemaDay} ${h.open}-${h.close}`);
        expect(fromLd.sort()).toEqual(expected.sort());
        expect(ld.openingHours, 'staré pole openingHours').toBeUndefined();
    });

    test('bez self-serving review markup', () => {
        const ld = readLd();
        expect(ld.aggregateRating).toBeUndefined();
        expect(ld.review).toBeUndefined();
    });
});

test('index.html bez Font Awesome, importmapy a Material Symbols', () => {
    const html = readFileSync('src/index.html', 'utf8');
    expect(html).not.toMatch(/font-awesome|importmap|esm\.sh|Material\+Symbols/);
});

test('sitemap obsahuje všetky verejné routes a nič navyše', () => {
    const xml = readFileSync(existsSync('dist/app/browser/sitemap.xml') ? 'dist/app/browser/sitemap.xml' : 'src/sitemap.xml', 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(SITE, '') || '/');
    expect(locs.sort()).toEqual([...PUBLIC_ROUTES].sort());
});

test('meta: unikátny title ≤ 60, description ≤ 155, canonical, og:image, robots', async ({ page }) => {
    const seen = { title: new Map<string, string>(), desc: new Map<string, string>() };
    for (const route of PUBLIC_ROUTES) {
        await page.goto(route, { waitUntil: 'networkidle' });
        const m = await page.evaluate(() => ({
            title: document.title,
            desc: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
            canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href') ?? '',
            robots: document.querySelector('meta[name=robots]')?.getAttribute('content') ?? '',
            ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
            ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '',
        }));
        expect.soft(m.title.length, `${route} title „${m.title}“`).toBeLessThanOrEqual(60);
        expect.soft(m.desc.length, `${route} description`).toBeGreaterThan(50);
        expect.soft(m.desc.length, `${route} description`).toBeLessThanOrEqual(155);
        expect.soft(m.canonical, `${route} canonical`).toBe(SITE + route);
        expect.soft(m.robots, `${route} robots`).toBe('index, follow');
        expect.soft(m.ogImage, `${route} og:image`).toMatch(/^https:\/\//);
        expect.soft(m.ogTitle, `${route} og:title`).toBe(m.title);
        expect.soft(seen.title.get(m.title), `${route} duplicitný title`).toBeUndefined();
        expect.soft(seen.desc.get(m.desc), `${route} duplicitný description`).toBeUndefined();
        seen.title.set(m.title, route); seen.desc.set(m.desc, route);
    }
});

test('neexistujúca URL → NotFound s noindex', async ({ page }) => {
    await page.goto('/tato-stranka-neexistuje', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Stránka sa nenašla');
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, follow');
});
