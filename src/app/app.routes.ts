import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'PAPI HAIR DESIGN - Profesionálne kaderníctvo v Košiciach | Domov',
    data: {
      seo: {
        description: 'Profesionálne kaderníctvo v Košiciach. Ponúkame dámske a pánske strihy, farbenie vlasov, styling a ďalšie služby.',
        keywords: 'kaderníctvo Košice, strihy, farbenie vlasov, styling, PAPI HAIR DESIGN',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    },
    loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'blog',
    loadChildren: () => import('./features/blog/blog.routes').then(r => r.BLOG_ROUTES)
  },
  {
    path: 'cennik',
    title: 'Cenník služieb | PAPI HAIR DESIGN Košice',
    data: {
      seo: {
        description: 'Cenník služieb kaderníctva PAPI HAIR DESIGN v Košiciach. Dámske a pánske strihy, farbenie, styling.',
        keywords: 'cenník kaderníctvo Košice, ceny strihy, farbenie vlasov ceny',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    },
    loadComponent: () => import('./features/pricing/pricing.component').then(c => c.PricingComponent)
  },
  {
    path: 'o-nas',
    title: 'O nás | PAPI HAIR DESIGN - Kaderníctvo v Košiciach',
    data: {
      seo: {
        description: 'O nás - PAPI HAIR DESIGN. Profesionálne kaderníctvo v Košiciach s dlhoročnými skúsenosťami.',
        keywords: 'o nás kaderníctvo Košice, PAPI HAIR DESIGN história',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    },
    loadComponent: () => import('./features/about/about.component').then(c => c.AboutComponent)
  },
  {
    path: 'sluzby/damske-strihy',
    loadComponent: () => import('./features/services/ladies-cut/ladies-cut.component').then(m => m.LadiesCutComponent),
    title: 'Dámske strihy Košice | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Dámske strihy v Košiciach. Profesionálne kaderníctvo PAPI HAIR DESIGN ponúka moderné dámske účesy.',
        keywords: 'dámske strihy Košice, dámske účesy, kaderníctvo dámy',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    }
  },
  {
    path: 'sluzby/panske-strihy',
    loadComponent: () => import('./features/services/mens-cut/mens-cut.component').then(m => m.MensCutComponent),
    title: 'Pánske strihy Košice | Barber PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Pánske strihy v Košiciach. Barber služby v kaderníctve PAPI HAIR DESIGN pre moderných mužov.',
        keywords: 'pánske strihy Košice, barber, pánske účesy',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    }
  },
  {
    path: 'kontakt',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Kontakt | Kaderníctvo PAPI HAIR DESIGN Košice',
    data: {
      seo: {
        description: 'Kontakt na kaderníctvo PAPI HAIR DESIGN v Košiciach. Adresa, telefón, otváracie hodiny.',
        keywords: 'kontakt kaderníctvo Košice, PAPI HAIR DESIGN adresa',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    }
  },
  // {
  //   path: 'virtualny-stylista',
  //   title: 'Virtuálny stylista | PAPI HAIR DESIGN Košice',
  //   data: {
  //     seo: {
  //       description: 'Virtuálny stylista PAPI HAIR DESIGN. Vyskúšajte si účes online pred návštevou kaderníctva.',
  //       keywords: 'virtuálny stylista, online účes, PAPI HAIR DESIGN',
  //       ogImage: 'https://papihairdesign.sk/images/logo.png'
  //     }
  //   },
  //   loadComponent: () => import('./features/virtual-try-on/vto.component').then(c => c.VtoComponent)
  // },
  // {
  //   path: 'virtual-salon',
  //   title: 'Virtual Salon - AI Zmena Účesu | PAPI HAIR DESIGN Košice',
  //   data: {
  //     seo: {
  //       description: 'Virtual Salon - odfotťe sa cez webcam a nechajte AI magicky zmeniť váš účes. Vyskúšajte si nový look pred návštevou kaderníctva.',
  //       keywords: 'virtual salon, AI účes, zmena účesu, webcam účes, PAPI HAIR DESIGN',
  //       ogImage: 'https://papihairdesign.sk/images/logo.png'
  //     }
  //   },
  //   loadComponent: () => import('./features/virtual-salon/virtual-salon.component').then(c => c.VirtualSalonComponent)
  // },
  {
    path: 'ai-studio',
    title: 'AI Studio - Digitálna Transformácia | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'AI Studio - Objavte svoje nové ja. Najmodernejšia neurálna sieť vytvorí digitálnu vizualizáciu vášho vysnívaného štýlu.',
        keywords: 'AI Studio, virtuálny stylista, zmena účesu, PAPI HAIR DESIGN, kaderníctvo Košice',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    },
    loadComponent: () => import('./features/ai-studio/virtual-stylist.component').then(c => c.VirtualStylistComponent)
  },
  {
    path: 'ai-stylista',
    redirectTo: 'ai-studio'
  },
  {
    path: 'booking',
    title: 'Rezervácia termínu | PAPI HAIR DESIGN Košice',
    data: {
      seo: {
        description: 'Rezervujte si termín v kaderníctve PAPI HAIR DESIGN v Košiciach. Jednoduchá online rezervácia služieb.',
        keywords: 'rezervácia Košice, booking kaderníctvo, PAPI HAIR DESIGN termín',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    },
    loadComponent: () => import('./features/booking/booking.component').then(c => c.BookingComponent)
  },
  {
    path: 'shop',
    title: 'E-shop | PAPI HAIR DESIGN Košice',
    data: {
      seo: {
        description: 'E-shop s vlasovou kozmetikou v PAPI HAIR DESIGN. Kúpa produktov pre starostlivosť o vlasy online.',
        keywords: 'e-shop vlasová kozmetika, shop Košice, PAPI HAIR DESIGN produkty',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    },
    loadComponent: () => import('./features/shop/shop.component').then(c => c.ShopComponent)
  },

  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    title: 'Admin'
  },
  {
    path: 'sluzby/ombre-farbenie',
    title: 'Ombre farbenie Košice | PAPI HAIR DESIGN',
    data: {
      seo: {
        description: 'Ombre farbenie vlasov v Košiciach. Profesionálne farbenie s technikou ombre v kaderníctve PAPI HAIR DESIGN.',
        keywords: 'ombre farbenie Košice, farbenie vlasov ombre, kaderníctvo farbenie',
        ogImage: 'https://papihairdesign.sk/images/logo.png'
      }
    },
    loadComponent: () => import('./features/services/ombre/ombre.component').then(m => m.OmbreComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
