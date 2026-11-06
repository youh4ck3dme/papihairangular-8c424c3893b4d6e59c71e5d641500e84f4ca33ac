# PAPI HAIR DESIGN

## Project Description

PAPI HAIR DESIGN is a modern, responsive web application built with Angular for a premium hair salon located in Košice, Slovakia. The application serves as a comprehensive digital platform for the salon, offering clients an intuitive way to explore services, book appointments, view stylist profiles, browse the gallery, read blog posts, and interact with the salon's social media presence. The project emphasizes user experience with a sleek, mobile-first design using TailwindCSS. Every public page is prerendered to static HTML at build time (fast first paint, full content for search engines) and hydrated in the browser. Booking is handled by Bookio.

## Repository

**GitHub**: [https://github.com/youh4ck3dme/papihairdesign-angular](https://github.com/youh4ck3dme/papihairdesign-angular)

## Recent Updates

### Version 3.0.0 - Redesign, Prerendering & AI Removal (November 2026)

- **AI removed**: AI Studio / virtual stylist / diagnostics and all Gemini, OpenAI, Hugging Face and Replicate integrations were deleted. Old URLs (`/ai-studio`, `/ai-stylista`, `/virtualny-stylista`, `/virtual-salon`, `/diagnostika`, `/admin`) redirect 301 to `/`.
- **Prerendering**: `@angular/build:application` with `outputMode: "static"` – 12 public routes are generated as HTML (`dist/app/browser/<route>/index.html`), unknown URLs get `404.html` with status 404.
- **Performance**: zoneless change detection, lazy animations, self-hosted fonts (Inter + Syne, Slovak subset), AVIF/WebP hero. Lighthouse mobile: Performance 93–98, Accessibility / Best Practices / SEO 100.
- **SEO**: unique titles/descriptions, canonical URLs, JSON-LD `HairSalon`, sitemap generated from routes.
- **Design**: home page in 100dvh sections; all subpages (pricing, about, contact, service pages, blog) use the same design system in light and dark mode.
- **Tests**: Playwright suite `pnpm run test:site` (security, SEO, prerender, interactions, routes, a11y/axe, home 100dvh) and Lighthouse CI `pnpm run lh`. See [docs/LAUNCH.md](docs/LAUNCH.md).

### Version 2.0.0 - VPS Migration & AI Studio (January 2026)

**Infrastructure Migration:**

- **New VPS**: Migrated from old VPS (57.129.4.22) to FORPSI VPS (194.182.87.6)
- **SSL Certificates**: Successfully installed Let's Encrypt certificates for:
  - `papihairdesign.sk` + `www.papihairdesign.sk`
  - `app.papihairdesign.sk` (testing subdomain)
- **DNS Management**: Configured via Cloudflare with proper A records
- **Nginx Optimization**: Implemented default catch-all server to prevent domain conflicts

**AI Studio Feature:**

- **New Route**: `/ai-studio` with redirect from legacy `/ai-stylista`
- **Components**: 
  - `VirtualStylistComponent` - Premium UI with camera support and hairstyle preview
  - `AiVisageService` - Google Gemini AI integration for facial analysis and image generation
- **Navigation**: Added "AI Studio !" to Header and Footer with `isNew` badge
- **Backend**: Prepared `ai-proxy.php` for secure API relay (skeleton implementation)

**Content Updates:**

- Renamed "Botox" to "Nová Kúra" across all components and blog posts

### Version 1.1.0 - Blog SEO & VPS Organization (January 2026)

**Blog Improvements:**

- **Strict White Theme**: Enforced a 100% white background across the entire blog section (`/blog`).
- **Global Background Protection**: Implemented a router-based mechanism in `AppComponent` to force `background-color: #ffffff` on the `body` for all blog routes, preventing dark theme bleed-through.
- **SEO Heading Hierarchy**: Automated logic to enforce a single `<h1>` per article and a maximum of four `<h2>` tags. Subsequent headings are automatically demoted to `<h3>`.
- **Typing & Compatibility**: Fixed TypeScript `ContentBlock` typing and resolved `line-clamp` CSS compatibility warnings.

### Version 1.0.1 - Repository Update & TypeScript Fixes (December 2025)

**Repository Changes:**

- Project renamed to `papihairdesign-angular` on GitHub.
- Updated git remote URL and `package.json`.

**TypeScript Fixes:**

- Fixed all compilation errors and corrected import statements.
- Added missing type definitions and environment tokens (`hfToken`).

## Features

### Core Features

- **Home Page**: Hero section with salon introduction, Instagram feed integration, and navigation to key sections.
- **Services & Pricing**: Comprehensive pricing list for women's and men's services.
- **About Us**: Salon philosophy, team profiles, and company story.
- **Blog System**: Full archive and individual posts with SEO optimization.
- **Service pages**: Ladies' cuts, men's cuts, ombre & balayage – prices from the single price list.

### Advanced Technology

- **Prerendering + hydration**: static HTML for every public route, hydrated with event replay.
- **Theme System**: Dynamic light/dark toggle with localStorage persistence (Default: Light).
- **Service Worker**: PWA capabilities for offline functionality and caching.

## Technologies Used

- **Framework**: Angular 20.3.x (Standalone Components)
- **Styling**: TailwindCSS & Vanilla CSS
- **Build Tools**: Angular CLI (`@angular/build:application`, esbuild, static prerendering)
- **Infrastructure**: Nginx Reverse Proxy on Ubuntu VPS

## Development Guide

### Prerequisites

- Node.js (LTS version)
- pnpm (`npm install -g pnpm`)

### Installation

```bash
git clone https://github.com/youh4ck3dme/papihairdesign-angular.git
cd papihairdesign-angular
pnpm install
```

### Running Locally

To start the local development server with SSL (required for some PWA features):

```bash
# Regular development (Port 3002)
pnpm run dev

# Specific evaluation port (Port 6767)
pnpm ng serve --ssl --port 6767
```

### Building for Production

```bash
pnpm run build:prod      # sitemap + prerendered build + 404.html → dist/app/browser
pnpm run serve:dist      # local static server that behaves like Vercel/nginx (port 4300)
pnpm run test:site       # Playwright: security, SEO, prerender, interactions, routes, a11y, 100dvh
pnpm run lh              # Lighthouse CI (mobile) on /, /cennik, /kontakt, /sluzby/damske-strihy
```

> Static hosting must serve `/<route>/index.html` for `/<route>` and `404.html` (status 404) for unknown URLs –
> never fall back to `/index.html` (that is the prerendered home page). See `vercel.json` and `nginx.conf`.

## Deployment

The project is deployed to a **FORPSI VPS** using automated deployment scripts.

### Production Deployment

**Primary Domain**: [https://papihairdesign.sk](https://papihairdesign.sk)  
**Testing Subdomain**: [https://app.papihairdesign.sk](https://app.papihairdesign.sk)

```bash
# Deploy to main domain
./scripts/deploy-forpsi.sh

# Deploy to app subdomain
./scripts/deploy-app-subdomain.sh
```

### VPS Configuration (194.182.87.6)

**Infrastructure:**

- **Server**: Ubuntu 22.04 LTS on FORPSI VPS
- **Web Server**: Nginx 1.18.0
- **PHP**: PHP 8.1-FPM (for proxy endpoints)
- **SSL**: Let's Encrypt (auto-renewal enabled)

**Hosted Sites:**

- `papihairdesign.sk` + `www` → `/var/www/papihairdesign.sk` (SSL ✓)
- `app.papihairdesign.sk` → `/var/www/app.papihairdesign.sk` (SSL ✓)
- `app.h4ck3d.cloud` → CarScraper app on port 5000 (SSL ✓)
- `pandora.h4ck3d.cloud` → Pandora Browser on port 9090 (SSL ✓)

**DNS Provider**: Cloudflare (Nameservers: `adrian.ns.cloudflare.com`, `wilson.ns.cloudflare.com`)

**Security Features:**

- Default catch-all server returns 404 for unmatched domains
- HTTPS redirection for all domains
- Regular automated SSL certificate renewal
