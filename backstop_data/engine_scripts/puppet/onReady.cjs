/**
 * BackstopJS onReady script
 * Runs when the page is ready (after delay)
 */
module.exports = async (page, scenario, viewport) => {
    console.log('SCENARIO READY > ' + scenario.label);

    // Wait for Angular to finish rendering
    await page.waitForFunction(() => {
        return !document.querySelector('.animate-pulse') ||
            document.readyState === 'complete';
    }, { timeout: 10000 }).catch(() => {
        console.log('Angular rendering wait timeout - continuing anyway');
    });

    // Wait for images to load
    await page.evaluate(async () => {
        const images = Array.from(document.querySelectorAll('img'));
        await Promise.all(
            images.map((img) => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                    img.addEventListener('load', resolve);
                    img.addEventListener('error', resolve);
                });
            })
        );
    });

    // Hide any dynamic content that might cause false positives
    await page.evaluate(() => {
        // Hide any timestamps that might change
        const dateElements = document.querySelectorAll('[data-testid="timestamp"]');
        dateElements.forEach(el => el.style.visibility = 'hidden');
    });

    // Scroll handling for specific scenarios
    if (scenario.scrollToSelector) {
        const scrollElement = await page.$(scenario.scrollToSelector);
        if (scrollElement) {
            await page.evaluate((selector) => {
                const el = document.querySelector(selector);
                if (el) {
                    el.scrollIntoView({ behavior: 'instant', block: 'center' });
                }
            }, scenario.scrollToSelector);
        }
    }

    // Handle hover scenarios
    if (scenario.hoverSelector) {
        const hoverElement = await page.$(scenario.hoverSelector);
        if (hoverElement) {
            await hoverElement.hover();
            await page.waitForTimeout(300);
        }
    }
};
