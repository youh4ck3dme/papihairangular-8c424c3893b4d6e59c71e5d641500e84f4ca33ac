// Web Vitals v laboratóriu: mobil 390×844, Slow 4G + 4× CPU.
//   pnpm run build:prod && node scripts/serve-dist.mjs 4300
//   node scripts/perf/vitals-bench.mjs [--base URL] [--runs 3] [--json out.json]
// LCP (+ prvok), FCP, CLS, TTFB z navigation timing a INP (najdlhšia interakcia: menu, téma, FAQ, cenník).
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://127.0.0.1:4300');
const RUNS = Number(arg('runs', '3'));
const JSON_OUT = arg('json', '');
const PAGES = ['/', '/cennik', '/o-nas', '/kontakt', '/sluzby/damske-strihy', '/blog', '/blog/trendove-ucesy-2026'];
// Slow 4G (Lighthouse): 150 ms RTT, 1,6 Mb/s dole, 750 kb/s hore
const SLOW_4G = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };

const median = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] ?? 0; };

async function run(browser, path) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, serviceWorkers: 'block' });
  await ctx.addInitScript(() => {
    const w = window; w.__v = { lcp: 0, lcpEl: '', cls: 0, inp: 0, fcp: 0 };
    new PerformanceObserver(l => l.getEntries().forEach(e => { w.__v.lcp = e.startTime; w.__v.lcpEl = e.element ? (e.element.tagName.toLowerCase() + (e.element.className ? '.' + String(e.element.className).split(' ')[0] : '')) : e.url; })).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) w.__v.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.name === 'first-contentful-paint') w.__v.fcp = e.startTime; })).observe({ type: 'paint', buffered: true });
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.interactionId) w.__v.inp = Math.max(w.__v.inp, e.duration); })).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', SLOW_4G);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForTimeout(2500);
  // interakcie pre INP (ťuknutia ako na mobile)
  const tap = async sel => { const el = page.locator(sel).first(); if (await el.count() && await el.isVisible()) { await el.tap({ timeout: 5000 }).catch(() => {}); await page.waitForTimeout(400); } };
  await tap('app-header button[aria-label="Otvoriť menu"]');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  if (path === '/') { await page.locator('details.faq-item summary').first().scrollIntoViewIfNeeded(); await tap('details.faq-item summary'); }
  if (path === '/cennik') await tap('details summary');
  const v = await page.evaluate(() => ({ ...window.__v, ttfb: performance.getEntriesByType('navigation')[0].responseStart }));
  await ctx.close();
  return v;
}

const browser = await chromium.launch();
const rows = [];
for (const path of PAGES) {
  const r = [];
  for (let i = 0; i < RUNS; i++) r.push(await run(browser, path));
  const m = k => median(r.map(x => x[k]));
  rows.push({ page: path, LCP: Math.round(m('lcp')), lcpEl: r[0].lcpEl.slice(0, 40), FCP: Math.round(m('fcp')), CLS: +m('cls').toFixed(3), INP: Math.round(m('inp')), TTFB: Math.round(m('ttfb')) });
}
await browser.close();
console.table(rows);
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(rows, null, 2));
