// Záťažový test pre VPS/Docker (nginx). Na Vercel ho nespúšťať – CDN škáluje sama a test by sa
// vyhodnotil ako útok. Spustenie (k6 nainštalovaný lokálne, nie na serveri):
//   k6 run -e BASE_URL=https://papihairdesign.sk scripts/perf/k6-vps.js
// Kritérium: 50 súbežných návštevníkov 1 minútu, p95 TTFB < 600 ms, < 1 % chýb.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:4300';
const PAGES = ['/', '/cennik', '/kontakt', '/o-nas', '/blog', '/sluzby/damske-strihy', '/blog/trendove-ucesy-2026'];

export const options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_waiting: ['p(95)<600'], // TTFB
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const path = PAGES[Math.floor(Math.random() * PAGES.length)];
  const res = http.get(`${BASE}${path}`, { headers: { 'Accept-Encoding': 'br, gzip' } });
  check(res, {
    'status 200': (r) => r.status === 200,
    'komprimované': (r) => /br|gzip/.test(r.headers['Content-Encoding'] || ''),
  });
  sleep(1 + Math.random() * 2); // návštevník číta stránku
}
