# PAPI HAIR DESIGN

## Project Description

PAPI HAIR DESIGN is a modern, responsive web application built with Angular for a premium hair salon located in Košice, Slovakia. The application serves as a comprehensive digital platform for the salon, offering clients an intuitive way to explore services, book appointments, view stylist profiles, browse the gallery, read blog posts, and interact with the salon's social media presence. The project emphasizes user experience with a sleek, mobile-first design using TailwindCSS, and incorporates advanced features like virtual try-on capabilities and AI-powered services through Google Gemini integration.

## Repository

**GitHub**: [https://github.com/youh4ck3dme/papihairdesign-angular](https://github.com/youh4ck3dme/papihairdesign-angular)

## Recent Updates

### Version 1.1.0 - Blog SEO & VPS Organization (January 2026)

**Blog Improvements:**

- **Strict White Theme**: Enforced a 100% white background across the entire blog section (`/blog`).
- **Global Background Protection**: Implemented a router-based mechanism in `AppComponent` to force `background-color: #ffffff` on the `body` for all blog routes, preventing dark theme bleed-through.
- **SEO Heading Hierarchy**: Automated logic to enforce a single `<h1>` per article and a maximum of four `<h2>` tags. Subsequent headings are automatically demoted to `<h3>`.
- **Typing & Compatibility**: Fixed TypeScript `ContentBlock` typing and resolved `line-clamp` CSS compatibility warnings.

**AI Stylista Status:**

- **Feature Disabled**: The "AI Stylista" (Hair Styler) link in the header is now visible but non-functional.
- **Visual Feedback**: The link is dimmed and unclickable to indicate temporary unavailability while maintaining UI consistency.

**VPS & Nginx Reorganization (57.129.4.22):**

- **Domain Standardization**: Standardized Nginx configurations for all hosted domains (`papihairdesign.sk`, `pop-mart.cloud`, `stahovanie.website`, `icoatlas.sk`, `h4ck3d.cloud`, etc.).
- **Security & Routing**:
  - Implemented HTTP-to-HTTPS redirection for domains with valid SSL.
  - Configured a `default_server` to drop unmatched connections (Error 444), preventing random domain routing.
  - Setup reverse proxies for specific applications (e.g., `pop-mart.cloud` to port 3002, `h4ck3d.cloud` to 3001).

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
- **Blog System**: Full archive, individual posts with SEO optimization, and a comment system.
- **Virtual Try-On**: AI-powered hair styling preview (Currently Disabled).

### Advanced Technology

- **AI Integration**: Google Gemini AI, OpenAI, and Hugging Face integration.
- **Theme System**: Dynamic light/dark toggle with localStorage persistence (Default: Light).
- **Service Worker**: PWA capabilities for offline functionality and caching.
- **Push Notifications**: Browser-based appointment reminders.

## Technologies Used

- **Framework**: Angular 20.3.x (Standalone Components)
- **Styling**: TailwindCSS & Vanilla CSS
- **AI Services**: Google Gemini, OpenAI, Hugging Face
- **Build Tools**: Angular CLI with esbuild
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
pnpm ng serve --ssl --proxy-config proxy.conf.json --port 6767
```

### Building for Production

```bash
pnpm run build:prod
```

## Deployment

The project is deployed using automated scripts that update the VPS server.

```bash
./deploy.sh
```

**VPS Configuration Highlights (57.129.4.22):**

- **Nginx Web Root**: `/var/www/papihairdesign.sk`
- **Reverse Proxies**:
  - `pop-mart.cloud` -> port 3002
  - `stahovanie.website` -> port 5005
  - `h4ck3d.cloud` -> port 3001
- **Security**: SSL via Certbot, `server_tokens off`, global port redirection.
