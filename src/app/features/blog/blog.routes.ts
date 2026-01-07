import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
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