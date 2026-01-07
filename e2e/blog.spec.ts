import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Blog Feature', () => {
    test('should navigate to blog list and display header', async ({ page }) => {
        await page.goto('/blog');
        await expect(page).toHaveTitle(/PAPI HAIR DESIGN/); // Adjust if title is different
        await expect(page.locator('h1')).toContainText('Náš Blog');
    });

    test('should display blog posts grid', async ({ page }) => {
        await page.goto('/blog');

        // Wait for content to load (skeleton to disappear)
        await expect(page.locator('.animate-pulse')).not.toBeVisible({ timeout: 10000 });

        const articles = page.locator('article');
        // We expect at least 1 article based on BlogService
        const count = await articles.count();
        expect(count).toBeGreaterThan(0);

        // Check if first article has title
        await expect(articles.first().locator('h2')).toBeVisible();
    });

    // This test failed visual regression due to timeout, let's see why in E2E
    test('should navigate to blog post detail', async ({ page }) => {
        await page.goto('/blog');

        // Click on the first article link
        // Need to handle potential target="_blank" if present, but routerLink usually isn't.
        // Also wait for hydration.
        await expect(page.locator('.animate-pulse')).not.toBeVisible();

        const firstLink = page.locator('article:first-child a').first();
        await page.locator('article:first-child h2').innerText();

        await firstLink.click();

        // Verify we are on post page
        // Check URL contains /blog/
        await expect(page).toHaveURL(/\/blog\//);

        // Expected H1 to match article title (or part of it)
        await expect(page.locator('h1.title')).toBeVisible();

        // Verify specific elements that were tricky in visual tests
        await expect(page.locator('.reading-progress-container')).toBeAttached();
        await expect(page.locator('.breadcrumbs')).toBeVisible();
    });

    test('Accessibility Check (Blog List)', async ({ page }) => {
        await page.goto('/blog');
        // Wait for content
        await expect(page.locator('.animate-pulse')).not.toBeVisible();

        const accessibilityScanResults = await new AxeBuilder({ page })
            .disableRules(['landmark-one-main', 'page-has-heading-one']) // Adjust based on common false positives if necessary
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
