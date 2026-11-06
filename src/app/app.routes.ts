import { Routes } from '@angular/router';

/**
 * Verejné routes. Každá má unikátny title (≤ 60 znakov) a description (≤ 155 znakov),
 * kontroluje to e2e/seo.spec.ts. Externé /booking a /shop sú redirecty vo vercel.json.
 * Nové routes doplň aj do vercel.json → rewrites a scripts/gen-sitemap.mjs.
 */
const OG = 'https://papihairdesign.sk/images/og-default.jpg';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Kaderníctvo a barber Košice | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Kaderníctvo PAPI HAIR DESIGN v Košiciach – dámske strihy, farbenie, balayage, barber a regenerácia vlasov s GOLD Haircare. Rezervácia online 24/7.',
        ogImage: OG,
      },
    },
    loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'blog',
    loadChildren: () => import('./features/blog/blog.routes').then(r => r.BLOG_ROUTES),
  },
  {
    path: 'cennik',
    title: 'Cenník kaderníctva Košice | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Ceny dámskych a pánskych strihov, farbenia, balayage, ombre a vlasových kúr v PAPI HAIR DESIGN Košice. Konečnú cenu upresníme pri konzultácii.',
        ogImage: OG,
      },
    },
    loadComponent: () => import('./features/pricing/pricing.component').then(c => c.PricingComponent),
  },
  {
    path: 'o-nas',
    title: 'O nás – Róbert Papcun a tím | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Spoznajte Róberta Papcuna, ambasádora GOLD Haircare, a tím salónu PAPI HAIR DESIGN na Triede SNP 61 v Košiciach.',
        ogImage: 'https://papihairdesign.sk/assets/papi.webp',
      },
    },
    loadComponent: () => import('./features/about/about.component').then(c => c.AboutComponent),
  },
  {
    path: 'sluzby/damske-strihy',
    title: 'Dámske strihy Košice | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Dámske strihy v Košiciach s konzultáciou, umytím a stylingom. Strih podľa tvaru tváre a typu vlasov v PAPI HAIR DESIGN.',
        ogImage: OG,
      },
    },
    loadComponent: () => import('./features/services/ladies-cut/ladies-cut.component').then(m => m.LadiesCutComponent),
  },
  {
    path: 'sluzby/panske-strihy',
    title: 'Pánske strihy a barber Košice | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Pánske strihy, úprava brady a hot towel rituál v Košiciach. Barber PAPI HAIR DESIGN na Triede SNP 61 – rezervácia online.',
        ogImage: OG,
      },
    },
    loadComponent: () => import('./features/services/mens-cut/mens-cut.component').then(m => m.MensCutComponent),
  },
  {
    path: 'sluzby/ombre-farbenie',
    title: 'Ombre a balayage Košice | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Ombre, balayage a AirTouch farbenie v Košiciach s farbami GOLD Haircare. Každé farbenie začína diagnostikou vlasov a konzultáciou.',
        ogImage: OG,
      },
    },
    loadComponent: () => import('./features/services/ombre/ombre.component').then(m => m.OmbreComponent),
  },
  {
    path: 'kontakt',
    title: 'Kontakt a otváracie hodiny | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Trieda SNP 61 (Spoločenský pavilón), Košice. Po–Pi 8:00–17:00, sobota podľa objednávok. Tel. +421 949 459 624, rezervácia online.',
        ogImage: OG,
      },
    },
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: '**',
    title: 'Stránka sa nenašla | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Stránka sa nenašla. Pozrite si cenník, kontakt alebo si rovno rezervujte termín v PAPI HAIR DESIGN Košice.',
        robots: 'noindex, follow',
      },
    },
    loadComponent: () => import('./features/not-found/not-found.component').then(c => c.NotFoundComponent),
  },
];
