import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { BlogPost } from '../models/blog-post.interface';
import { RouteData } from '../models';

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private jsonLdElements: HTMLElement[] = [];

  constructor() {
    // Automatické nastavenie SEO na základe route data
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe((data: RouteData) => {
        if (data.seo) {
          this.setSeoData(data.seo);
        }
      });
  }

  /**
   * Nastaví SEO meta tagy na základe poskytnutých dát
   */
  setSeoData(seoData: SeoData): void {
    if (seoData.title) {
      this.title.setTitle(seoData.title);
      this.meta.updateTag({ property: 'og:title', content: seoData.title });
      this.meta.updateTag({ name: 'twitter:title', content: seoData.title });
    }

    if (seoData.description) {
      this.meta.updateTag({ name: 'description', content: seoData.description });
      this.meta.updateTag({ property: 'og:description', content: seoData.description });
      this.meta.updateTag({ name: 'twitter:description', content: seoData.description });
    }

    if (seoData.keywords) {
      this.meta.updateTag({ name: 'keywords', content: seoData.keywords });
    }

    if (seoData.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: seoData.ogImage });
      this.meta.updateTag({ name: 'twitter:image', content: seoData.ogImage });
    }

    // Nastavenie spoločných meta tagov
    const currentUrl = this.router.url;
    const fullUrl = `https://papihairdesign.sk${currentUrl}`;
    this.meta.updateTag({ property: 'og:url', content: fullUrl });
    this.meta.updateTag({ property: 'og:type', content: seoData.ogType || 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    // Canonical URL pre Google indexovanie
    this.setCanonicalUrl(fullUrl);
  }

  /**
   * Nastaví canonical URL pre správne indexovanie
   */
  setCanonicalUrl(url: string): void {
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Pridá JSON-LD štruktúrované dáta do hlavičky
   */
  addJsonLd(data: Record<string, unknown>): void {
    // Odstrániť predchádzajúce JSON-LD elementy
    this.removeJsonLd();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    this.jsonLdElements.push(script);
  }

  /**
   * Odstráni všetky JSON-LD elementy
   */
  removeJsonLd(): void {
    this.jsonLdElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.jsonLdElements = [];
  }

  /**
   * Aktualizuje meta tagy na základe poskytnutých dát
   */
  updateMetaTags(data: Partial<SeoData>): void {
    this.setSeoData(data);
  }

  /**
   * Nastaví SEO pre blog príspevok
   */
  setBlogPostSeo(post: BlogPost): void {
    const baseUrl = 'https://papihairdesign.sk/';
    const absoluteImageUrl = post.imageUrl.startsWith('http') ? post.imageUrl : baseUrl + post.imageUrl;

    const seoData: SeoData = {
      title: `${post.title} | PAPI HAIR DESIGN`,
      description: post.perex,
      keywords: post.tags.join(', '),
      ogImage: absoluteImageUrl,
      ogType: 'article'
    };
    this.setSeoData(seoData);

    // Pridanie JSON-LD pre blog príspevok
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.perex,
      "image": absoluteImageUrl,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "PAPI HAIR DESIGN",
        "logo": {
          "@type": "ImageObject",
          "url": "https://papihairdesign.sk/assets/logo.png"
        }
      },
      "datePublished": post.date,
      "dateModified": post.date,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://papihairdesign.sk/blog/${post.slug}`
      }
    };
    this.addJsonLd(jsonLd);
  }

  /**
   * Nastaví SEO pre zoznam blog príspevkov
   */
  setBlogListSeo(): void {
    const seoData: SeoData = {
      title: 'Blog | PAPI HAIR DESIGN',
      description: 'Objavte najnovšie trendy vo vlasoch, tipy na starostlivosť a inšpiráciu od našich kaderníkov v PAPI HAIR DESIGN.',
      keywords: 'blog, vlasy, kaderníctvo, trendy, tipy, PAPI HAIR DESIGN',
      ogType: 'website'
    };
    this.setSeoData(seoData);
  }
}
