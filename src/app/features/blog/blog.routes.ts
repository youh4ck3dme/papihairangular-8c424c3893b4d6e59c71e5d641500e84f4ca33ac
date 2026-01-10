import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  // Sticky Featured Story - Always first
  {
    path: 'pribeh-znacky',
    title: 'Príbeh značky | PAPI HAIR DESIGN - From Streets to World Stages',
    data: {
      seo: {
        description: 'Príbeh Róberta Papcuna – od košického sídliska po svetové módne prehliadky. Zakladateľ PAPI HAIR DESIGN.',
        keywords: 'PAPI HAIR DESIGN, Róbert Papcun, príbeh, kaderníctvo, Košice, barbering, fashion week, zakladateľ',
        ogImage: 'https://papihairdesign.sk/assets/papi.webp'
      }
    },
    loadComponent: () => import('./pribeh-znacky/pribeh-znacky.component').then(c => c.PribehZnackyComponent)
  },
  {
    path: '',
    title: 'Blog | PAPI HAIR DESIGN - Trendy, tipy a novinky',
    data: {
      seo: {
        description: 'Objavte najnovšie trendy vo vlasoch, tipy na starostlivosť a inšpiráciu od našich kaderníkov v PAPI HAIR DESIGN Košice.',
        keywords: 'blog, vlasy, kaderníctvo, trendy, tipy, účesy, farbenie, PAPI HAIR DESIGN',
        ogImage: 'https://papihairdesign.sk/assets/papi-blog.webp'
      }
    },
    loadComponent: () => import('./blog-list.component').then(c => c.BlogListComponent)
  },
  {
    path: ':slug',
    loadComponent: () => import('./blog-post.component').then(c => c.BlogPostComponent)
  }
];