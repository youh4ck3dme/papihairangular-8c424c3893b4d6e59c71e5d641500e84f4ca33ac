import { Injectable, inject, DOCUMENT } from '@angular/core';
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
  /** napr. 'noindex, follow' pre 404; predvolene 'index, follow' */
  robots?: string;
  faqs?: FaqItem[];
}

const SITE_URL = 'https://papihairdesign.sk';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

/** Skráti text na max. dĺžku na hranici slova (meta description ≤ 155 znakov). */
function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 30)).replace(/[,;:–-]\s*$/, '') + '…';
}

export interface FaqItem {
  question: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private document = inject(DOCUMENT);

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
        // Každá route dostane og:title/description/canonical/robots – aj keď nemá data.seo
        // (title z route definície, inak by zdieľané odkazy mali titulok domovskej stránky).
        let snap = this.router.routerState.snapshot.root;
        while (snap.firstChild) snap = snap.firstChild;
        // Routes bez seo dát aj bez title (napr. /blog/:slug) si SEO nastavujú v komponente – neprepisovať.
        if (!data.seo && !snap.title) return;
        const seo = data.seo ?? {};
        this.setSeoData({ ...seo, title: seo.title ?? snap.title ?? undefined });
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
      const description = clip(seoData.description, 155);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ name: 'twitter:description', content: description });
    }

    if (seoData.keywords) {
      this.meta.updateTag({ name: 'keywords', content: seoData.keywords });
    }

    const ogImage = seoData.ogImage || DEFAULT_OG_IMAGE;
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    this.meta.updateTag({ name: 'robots', content: seoData.robots || 'index, follow' });

    // Canonical bez query parametrov a fragmentu
    const path = this.router.url.split(/[?#]/)[0];
    const fullUrl = `${SITE_URL}${path === '/' ? '/' : path.replace(/\/$/, '')}`;
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
    let link = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Pridá JSON-LD štruktúrované dáta do hlavičky
   */
  addJsonLd(data: Record<string, unknown>): void {
    // Odstrániť predchádzajúce JSON-LD elementy
    this.removeJsonLd();

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);

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

    const fullTitle = `${post.title} | PAPI HAIR DESIGN`;
    const seoData: SeoData = {
      title: fullTitle.length <= 60 ? fullTitle : clip(post.title, 60),
      description: post.perex,
      keywords: post.tags.join(', '),
      ogImage: absoluteImageUrl,
      ogType: 'article'
    };
    this.setSeoData(seoData);

    // Príprava grafu pre JSON-LD
    const graph: Record<string, unknown>[] = [
      {
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
            "url": "https://papihairdesign.sk/assets/logo.webp"
          }
        },
        "datePublished": post.date,
        "dateModified": post.date,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${baseUrl}blog/${post.slug}`
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Domov",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `${baseUrl}blog`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": `${baseUrl}blog/${post.slug}`
          }
        ]
      }
    ];

    // Pridanie FAQ Schema ak existujú FAQs
    if (post.faqs && post.faqs.length > 0) {
      graph.push({
        "@type": "FAQPage",
        "mainEntity": post.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      });
    }

    this.addJsonLd({
      "@context": "https://schema.org",
      "@graph": graph
    });
  }

  /**
   * Nastaví SEO pre zoznam blog príspevkov
   */
  setBlogListSeo(): void {
    const seoData: SeoData = {
      title: 'Blog – trendy a tipy na vlasy | PAPI HAIR DESIGN',
      description: 'Objavte najnovšie trendy vo vlasoch, tipy na starostlivosť a inšpiráciu od našich kaderníkov v PAPI HAIR DESIGN.',
      keywords: 'blog, vlasy, kaderníctvo, trendy, tipy, PAPI HAIR DESIGN',
      ogType: 'website'
    };
    this.setSeoData(seoData);
  }
}
