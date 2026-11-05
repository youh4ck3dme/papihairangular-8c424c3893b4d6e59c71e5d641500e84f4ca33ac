// Generuje src/sitemap.xml z verejných routes a blog postov (spúšťa sa pred buildom).
// Vylúčené: externé presmerovania (/booking, /shop) a 404.
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://papihairdesign.sk';
const today = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/cennik', priority: '0.9', changefreq: 'monthly' },
  { path: '/sluzby/damske-strihy', priority: '0.8', changefreq: 'monthly' },
  { path: '/sluzby/panske-strihy', priority: '0.8', changefreq: 'monthly' },
  { path: '/sluzby/ombre-farbenie', priority: '0.8', changefreq: 'monthly' },
  { path: '/o-nas', priority: '0.7', changefreq: 'monthly' },
  { path: '/kontakt', priority: '0.7', changefreq: 'yearly' },
  { path: '/blog', priority: '0.6', changefreq: 'weekly' },
];

// Overenie, že každá statická route existuje v app.routes.ts
const routesSrc = readFileSync('src/app/app.routes.ts', 'utf8');
for (const r of staticRoutes) {
  const p = r.path === '/' ? "path: ''" : `path: '${r.path.slice(1)}'`;
  if (r.path !== '/blog' && !routesSrc.includes(p)) throw new Error(`[sitemap] route ${r.path} nie je v app.routes.ts`);
}

const blogSrc = readFileSync('src/app/core/services/blog.service.ts', 'utf8');
const slugs = [...new Set([...blogSrc.matchAll(/slug:\s*["']([a-z0-9-]+)["']/g)].map(m => m[1]))];
const blogRoutes = slugs.map(s => ({ path: `/blog/${s}`, priority: '0.6', changefreq: 'monthly' }));

const urls = [...staticRoutes, ...blogRoutes]
  .map(r => `  <url>\n    <loc>${SITE}${r.path === '/' ? '/' : r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`)
  .join('\n');

writeFileSync('src/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`[sitemap] ${staticRoutes.length + blogRoutes.length} URL (blog: ${slugs.join(', ')})`);
