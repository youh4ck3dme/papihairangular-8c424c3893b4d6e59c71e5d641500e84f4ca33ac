import { test, expect } from '@playwright/test';

/**
 * Interakcie po hydratácii (aplikácia beží bez zone.js – všetko musí ísť cez signals/udalosti).
 * Dlhšie timeouty pri navigácii: pri paralelnom behu celej sady je CPU vyťažené.
 */
test.describe('mobil 390×844', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('cenník prepája ceny s detailmi troch služieb', async ({ page }) => {
        const services = [
            { name: 'Viac o dámskych strihoch', slug: 'damske-strihy', heading: 'Dámske strihy Košice' },
            { name: 'Viac o pánskych strihoch', slug: 'panske-strihy', heading: 'Pánske strihy a barber Košice' },
            { name: 'Viac o ombre a balayage', slug: 'ombre-farbenie', heading: 'Ombre a balayage Košice' },
        ];
        for (const service of services) {
            await page.goto('/cennik');
            const link = page.getByRole('main').getByRole('link', { name: service.name });
            await expect(link).toHaveAttribute('href', '/sluzby/' + service.slug);
            await link.click();
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(service.heading);
        }
    });

    test('menu: otvorenie, Esc, navigácia cez menu', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });
        const btn = page.getByRole('button', { name: 'Otvoriť menu' });
        await btn.click();
        await expect(page.locator('#mobile-menu')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Zavrieť menu' })).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('Escape');
        await expect(page.locator('#mobile-menu')).toHaveCount(0);

        await btn.click();
        await page.locator('#mobile-menu').getByRole('link', { name: 'Cenník' }).click();
        await expect(page).toHaveURL(/\/cennik$/, { timeout: 15_000 });
        await expect(page.locator('h1')).toHaveText(/Cenník/);
        await expect(page.locator('#mobile-menu')).toHaveCount(0);
        await expect(page).toHaveTitle(/Cenník/);
    });

    test('karusel služieb prepína bodky', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });
        const scroller = page.locator('app-service-cards [data-scroller]');
        await scroller.scrollIntoViewIfNeeded();
        const dots = page.locator('app-service-cards .dot');
        await expect(dots.first()).toHaveClass(/is-active/);
        await scroller.evaluate(el => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
        await expect(dots.last()).toHaveClass(/is-active/);
    });
});

test.describe('desktop 1366×768', () => {
    test.use({ viewport: { width: 1366, height: 768 } });

    test('prepínač témy + zapamätanie po reloade', async ({ page }) => {
        await page.addInitScript(() => { if (!sessionStorage.getItem('init')) { localStorage.setItem('theme', 'light'); sessionStorage.setItem('init', '1'); } });
        await page.goto('/kontakt', { waitUntil: 'networkidle' });
        const toggle = page.getByRole('button', { name: 'Prepnúť na tmavú tému' });
        await toggle.click();
        await expect(page.locator('html')).toHaveClass(/dark/);
        await expect(page.getByRole('button', { name: 'Prepnúť na svetlú tému' })).toHaveAttribute('aria-pressed', 'true');
        await page.reload({ waitUntil: 'networkidle' });
        await expect(page.locator('html')).toHaveClass(/dark/);
    });

    test('navigácia v SPA mení title, H1 a skroluje hore', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
        await page.locator('app-header').getByRole('link', { name: 'Kontakt' }).click();
        await expect(page).toHaveURL(/\/kontakt$/, { timeout: 15_000 });
        await expect(page.locator('h1')).toHaveText('Kontakt a otváracie hodiny');
        await expect(page).toHaveTitle(/Kontakt/);
        await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://papihairdesign.sk/kontakt');
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('kontakt: validácia formulára a mapa na klik', async ({ page }) => {
        await page.goto('/kontakt', { waitUntil: 'networkidle' });
        await page.getByRole('button', { name: 'Odoslať správu' }).click();
        await expect(page.locator('.field-error')).toHaveCount(3);
        await page.locator('#name').fill('Test');
        await page.locator('#email').fill('test@example.sk');
        await page.locator('#message').fill('Dobrý deň');
        await expect(page.locator('.field-error')).toHaveCount(0);

        await expect(page.locator('iframe')).toHaveCount(0);
        await page.getByRole('button', { name: 'Zobraziť mapu' }).click();
        await expect(page.locator('iframe[title^="Mapa"]')).toHaveCount(1);
    });

    test('cenník: lookbook detail sa otvorí a zavrie', async ({ page }) => {
        await page.goto('/cennik', { waitUntil: 'networkidle' });
        await page.locator('.look-card').first().click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: 'Zatvoriť' }).first().click();
        await expect(page.getByRole('dialog')).toHaveCount(0);
    });

    test('FAQ na domovskej stránke sa rozbalí', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });
        const item = page.locator('details.faq-item').first();
        await item.locator('summary').click();
        await expect(item).toHaveAttribute('open', '');
    });
});

test.describe('meranie kliknutí po súhlase', () => {
    test.use({ serviceWorkers: 'block' });

    test('rezervácia, recenzie a telefón pridajú po jednej vlastnej udalosti', async ({ page, baseURL }) => {
        // Lokálny build dostane názov produkčného hostiteľa. Test neposiela udalosti do GA4.
        await page.route('https://papihairdesign.sk/**', async route => {
            const { pathname, search } = new URL(route.request().url());
            const response = await route.fetch({ url: new URL(pathname + search, baseURL).href });
            await route.fulfill({ response });
        });
        await page.route('https://www.googletagmanager.com/**', route =>
            route.fulfill({ contentType: 'application/javascript', body: '' }));
        await page.addInitScript(() => {
            document.addEventListener('click', event => {
                const link = event.target instanceof Element && event.target.closest<HTMLAnchorElement>('a[href]');
                if (link && link.origin !== location.origin) event.preventDefault();
            });
        });

        await page.goto('https://papihairdesign.sk/');
        const events = () => page.evaluate(() => {
            const browser = window as Window & { dataLayer?: Array<[string, string, { review_source?: string }?]> };
            return (browser.dataLayer ?? []).filter(command => command[0] === 'event')
                .map(([, name, params]) => [name, params?.review_source ?? null]);
        });
        const booking = page.getByRole('link', { name: /^Rezervovať online/ }).first();
        await booking.click();
        expect(await events()).toEqual([]);
        await page.getByRole('button', { name: 'Prijať analytiku' }).click();
        await booking.click();
        await page.locator('.reviews-source-pill strong').filter({ hasText: 'Bookio' }).click();
        await page.locator('.reviews-source-pill strong').filter({ hasText: 'Google' }).click();
        await page.locator('a[href^="tel:"]:visible').last().focus();
        await page.keyboard.press('Enter');
        expect(await events()).toEqual([
            ['booking_click', null], ['reviews_click', 'Bookio'], ['reviews_click', 'Google'], ['phone_click', null],
        ]);
    });
});
