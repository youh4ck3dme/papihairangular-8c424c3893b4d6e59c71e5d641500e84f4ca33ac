import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { BlogService } from './core/services/blog.service';

/**
 * Ktoré stránky sa pri builde predgenerujú do statického HTML (rýchle LCP, obsah viditeľný pre Google bez JS).
 * Nové blog články sa predgenerujú automaticky (getPrerenderParams).
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => inject(BlogService).getAllPosts().map(p => ({ slug: p.slug })),
  },
  // 404 a všetko neznáme rieši klient (404.html = index.csr.html, NotFound s noindex)
  { path: '**', renderMode: RenderMode.Client },
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'cennik', renderMode: RenderMode.Prerender },
  { path: 'o-nas', renderMode: RenderMode.Prerender },
  { path: 'kontakt', renderMode: RenderMode.Prerender },
  { path: 'sluzby/damske-strihy', renderMode: RenderMode.Prerender },
  { path: 'sluzby/panske-strihy', renderMode: RenderMode.Prerender },
  { path: 'sluzby/ombre-farbenie', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
];
