// Meranie plynulosti posúvania prstom (mobil, 4× spomalené CPU).
//
//   pnpm run build:prod && node scripts/serve-dist.mjs 4300
//   node scripts/scroll-bench.mjs [--base URL] [--runs 3] [--pages /,/cennik] [--css "…"] [--js "…"] [--json out.json]
//
// --css / --js vložia štýl / skript pred načítaním stránky (A/B test: „čo ak toto vypnem?“).
// Výsledok: podiel snímok > 33 ms, p95 snímky, long-animation-frame, layout-shift počas posunu,
// prepočty štýlov a layoutu (CDP Performance.getMetrics), o koľko px snap posunul stránku po geste
// a kam dorazil švih (travel) – snap ho „skracuje“ alebo „predlžuje“ na najbližšiu sekciu.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const BASE = arg('base', 'http://127.0.0.1:4300');
const RUNS = Number(arg('runs', '3'));
const PAGES = arg('pages', '/,/cennik,/blog/trendove-ucesy-2026').split(',');
const CSS = arg('css', '');
const JS = arg('js', '');
const JSON_OUT = arg('json', '');

const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : 0; };

async function measure(browser, path) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  });
  if (JS) await ctx.addInitScript(JS);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  if (CSS) await page.addStyleTag({ content: CSS });
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.waitForTimeout(1000);

  // záznam snímok, dlhých snímok a posunov rozloženia
  await page.evaluate(() => {
    const w = window;
    w.__bench = { frames: [], loaf: [], shifts: 0, on: false };
    const tick = t => { if (w.__bench.on) w.__bench.frames.push(t); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    try {
      new PerformanceObserver(l => l.getEntries().forEach(e => w.__bench.on && w.__bench.loaf.push(e.duration)))
        .observe({ type: 'long-animation-frame' });
    } catch { /* starší Chrome */ }
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (w.__bench.on) w.__bench.shifts += e.value; }))
      .observe({ type: 'layout-shift' });
  });

  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const before = await metrics();
  await page.evaluate(() => { window.__bench.on = true; });

  // Posun prstom cez CDP touch udalosti (Input.synthesizeScrollGesture s „touch“ v headless Chrome neposúva).
  // flick: rýchly švih → po pustení pokračuje zotrvačnosťou; hold: pomalý posun a zastavenie pred pustením.
  const touch = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: 195, y, id: 1 }] });
  async function swipe(fromY, dy, steps, { hold = false } = {}) {
    await touch('touchStart', fromY);
    for (let i = 1; i <= steps; i++) {
      await touch('touchMove', fromY + (dy * i) / steps);
      await page.waitForTimeout(16);
    }
    if (hold) await page.waitForTimeout(250);
    await touch('touchEnd');
  }

  // 1) dva švihy dole a dva hore (so zotrvačnosťou)
  const travel = [];
  for (const dir of [-1, -1, 1, 1]) {
    await swipe(dir < 0 ? 650 : 200, dir * 450, 12);
    await page.waitForTimeout(1200);
    travel.push(await page.evaluate(() => Math.round(window.scrollY)));
  }

  await page.evaluate(() => { window.__bench.on = false; });
  const after = await metrics();

  // 2) posun bez zotrvačnosti: posunie snap stránku inam, než kam ju prst dotiahol?
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
  await swipe(700, -520, 26, { hold: true });
  await page.waitForTimeout(50);
  const atRelease = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(1500);
  const settled = await page.evaluate(() => window.scrollY);

  const b = await page.evaluate(() => window.__bench);
  const deltas = b.frames.slice(1).map((t, i) => t - b.frames[i]);
  const d = k => (after[k] ?? 0) - (before[k] ?? 0);
  await ctx.close();
  return {
    frames: deltas.length,
    slowPct: deltas.length ? (100 * deltas.filter(x => x > 33.4).length) / deltas.length : 0,
    p95: pct(deltas, 0.95),
    loafCount: b.loaf.filter(x => x > 50).length,
    loafMax: Math.max(0, ...b.loaf),
    cls: b.shifts,
    recalcCount: d('RecalcStyleCount'),
    recalcMs: d('RecalcStyleDuration') * 1000,
    layoutCount: d('LayoutCount'),
    layoutMs: d('LayoutDuration') * 1000,
    scriptMs: d('ScriptDuration') * 1000,
    snapPx: Math.round(settled - atRelease),
    travel: travel[0],
  };
}

const browser = await chromium.launch();
const rows = [];
for (const path of PAGES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await measure(browser, path));
  const m = k => median(runs.map(r => r[k]));
  rows.push({
    page: path, frames: m('frames'), 'slow%': +m('slowPct').toFixed(1), p95ms: +m('p95').toFixed(1),
    loaf50: m('loafCount'), loafMax: Math.round(m('loafMax')), cls: +m('cls').toFixed(3),
    recalc: m('recalcCount'), recalcMs: Math.round(m('recalcMs')), layout: m('layoutCount'),
    layoutMs: Math.round(m('layoutMs')), scriptMs: Math.round(m('scriptMs')), snapPx: m('snapPx'), travel: m('travel'),
  });
}
await browser.close();
console.table(rows);
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(rows, null, 2));
