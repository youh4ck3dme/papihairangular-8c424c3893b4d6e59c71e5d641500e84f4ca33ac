import { isDevMode } from '@angular/core';
import type { MetricWithAttribution } from 'web-vitals/attribution';
import { environment } from '../../../environments/environment';

/** Verejné hodnoty z environment (ensure-env.mjs); v type nemusia byť pri starších lokálnych súboroch. */
const env = environment as { vitalsEndpoint?: string; sentryDsn?: string };

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };

/** Úloha mimo kritickej cesty: keď je hlavné vlákno voľné (najneskôr po 5 s); Safari bez rIC → 2 s. */
function whenIdle(cb: () => void): void {
  const w = window as IdleWindow;
  if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout: 5000 });
  else setTimeout(cb, 2000);
}

/** Z metriky posiela len to, čo pomôže nájsť príčinu – žiadne cookies, žiadne identifikátory návštevníka. */
function payload(m: MetricWithAttribution) {
  const a = m.attribution as unknown as Record<string, unknown>;
  const target = (a['target'] ?? a['interactionTarget'] ?? a['largestShiftTarget'] ?? '') as string;
  return {
    name: m.name,
    value: Math.round(m.name === 'CLS' ? m.value * 1000 : m.value),
    rating: m.rating,
    id: m.id,
    nav: m.navigationType,
    path: location.pathname,
    target: target.slice(0, 120),
  };
}

/**
 * Meranie Core Web Vitals u skutočných návštevníkov (web-vitals v5, attribution build).
 * Knižnica (~4 kB br, samostatný chunk) sa sťahuje až v nečinnosti a len ak je kam posielať:
 *  - vývoj: výpis do konzoly,
 *  - produkcia: sendBeacon na VITALS_ENDPOINT; bez neho sa nič nesťahuje ani neposiela.
 * Sentry (chyby JS) sa načíta len pri nastavenom SENTRY_DSN cez ich Loader skript (bez npm balíka).
 */
export function startRealUserMonitoring(): void {
  const endpoint = env.vitalsEndpoint;
  const dev = isDevMode();
  if (dev || endpoint) {
    whenIdle(async () => {
      const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals/attribution');
      const report = (m: MetricWithAttribution) => {
        const data = payload(m);
        if (dev) { console.info('[web-vitals]', data); return; }
        const body = JSON.stringify(data);
        if (!navigator.sendBeacon?.(endpoint!, new Blob([body], { type: 'application/json' }))) {
          fetch(endpoint!, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => undefined); // meranie nesmie nikdy rozbiť stránku
        }
      };
      // metriky sa nahlásia pri skrytí stránky / ďalšej interakcii – buffered observer zachytí aj LCP pred načítaním knižnice
      onLCP(report); onINP(report); onCLS(report); onFCP(report); onTTFB(report);
    });
  }

  const key = /^https:\/\/([a-f0-9]+)@/.exec(env.sentryDsn ?? '')?.[1];
  if (key && !dev) {
    whenIdle(() => {
      const s = document.createElement('script');
      s.src = `https://js.sentry-cdn.com/${key}.min.js`;
      s.crossOrigin = 'anonymous';
      s.async = true;
      document.head.appendChild(s);
    });
  }
}
