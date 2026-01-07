/**
 * BackstopJS onBefore script
 * Runs before each scenario
 */
module.exports = async (page, scenario, viewport, isReference, browserContext) => {
    console.log('SCENARIO > ' + scenario.label);

    // Set viewport
    await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1
    });

    // Accept self-signed certificate for localhost HTTPS
    await page.setBypassCSP(true);
};
