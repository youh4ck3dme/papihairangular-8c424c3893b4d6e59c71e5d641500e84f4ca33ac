import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SALON_CONTACT } from '../../core/config/salon-contact';
import { PRICE_LISTS, PriceItem } from '../pricing/pricing.data';
import { reviewsMatching } from '../../core/data/curated-reviews';

export interface ServicePageConfig {
  eyebrow: string;
  title: string;
  lead: string;
  heroImage: string;
  heroAlt: string;
  introTitle: string;
  intro: string[];
  introImage: string;
  introAlt: string;
  benefits: { title: string; text: string }[];
  /** názvy položiek presne podľa pricing.data.ts; prvá je hlavná služba (zobrazí sa v hlavičke) */
  priceItems: string[];
  priceNote?: string;
  reviewMatch: RegExp;
}

/** Spoločná šablóna pre /sluzby/* – ceny z cenníka, recenzie zo schválených Bookio recenzií. */
@Component({
  selector: 'app-service-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeaderComponent],
  template: `
    @let c = config();
    <div class="page-bleed">
      <app-page-header [eyebrow]="c.eyebrow" [title]="c.title" [lead]="c.lead" [image]="c.heroImage" [imageAlt]="c.heroAlt">
        <a [href]="contact.bookingUrl" target="_blank" rel="noopener" class="btn btn-primary">
          Rezervovať termín<span class="sr-only"> (otvorí sa v novom okne)</span>
        </a>
        @if (mainItem(); as m) { <span class="from-price">{{ m.name }} <strong>{{ m.price }} €</strong></span> }
      </app-page-header>

      <section class="page-section" aria-labelledby="intro-title">
        <div class="container-site intro">
          <div>
            <h2 id="intro-title" class="h2">{{ c.introTitle }}</h2>
            @for (p of c.intro; track p) { <p class="body">{{ p }}</p> }
          </div>
          <img class="intro-img" [src]="c.introImage" [alt]="c.introAlt" width="800" height="1000" loading="lazy" decoding="async" />
        </div>
      </section>

      <section class="page-section is-alt" aria-labelledby="benefits-title">
        <div class="container-site">
          <h2 id="benefits-title" class="h2">Čo je v cene</h2>
          <ul class="benefits">
            @for (b of c.benefits; track b.title) {
            <li class="feature-card">
              <span class="feature-icon" aria-hidden="true">
                <svg class="ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
              <h3 class="h3">{{ b.title }}</h3>
              <p class="body benefit-text">{{ b.text }}</p>
            </li>
            }
          </ul>
        </div>
      </section>

      <section class="page-section" aria-labelledby="prices-title">
        <div class="container-site">
          <div class="prices-wrap">
          <h2 id="prices-title" class="h2">Ceny</h2>
          <ul class="feature-card service-prices">
            @for (i of items(); track i.name) {
            <li>
              <span class="sp-name">{{ i.name }}@if (i.description) {<span class="sp-desc">{{ short(i.description) }}</span>}</span>
              <span class="sp-price">{{ i.price }} €</span>
            </li>
            }
          </ul>
          <p class="sp-note">{{ c.priceNote || 'Ceny sú orientačné, konečnú cenu upresníme pri konzultácii.' }}
            <a routerLink="/cennik" class="inline-link">Celý cenník</a></p>
          </div>
        </div>
      </section>

      @if (reviews().length) {
      <section class="page-section is-alt" aria-labelledby="reviews-title">
        <div class="container-site">
          <h2 id="reviews-title" class="h2">Čo hovoria klienti</h2>
          <ul class="reviews">
            @for (r of reviews(); track r.name + r.date) {
            <li class="feature-card">
              <span class="stars" [attr.aria-label]="r.rating + ' z 5 hviezdičiek'">★★★★★</span>
              <blockquote class="review-text">{{ r.text }}</blockquote>
              <p class="review-meta">{{ r.name }} · {{ r.date }} · Bookio</p>
            </li>
            }
          </ul>
        </div>
      </section>
      }

      <section class="page-section" aria-label="Rezervácia">
        <div class="container-site cta">
          <h2 class="h2">Rezervujte si termín</h2>
          <div class="cta-actions">
            <a [href]="contact.bookingUrl" target="_blank" rel="noopener" class="btn btn-primary">
              Rezervovať online<span class="sr-only"> (otvorí sa v novom okne)</span>
            </a>
            <a [href]="contact.phoneHref" class="btn btn-outline">Zavolať {{ contact.phoneDisplay }}</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: `
    .from-price { display: inline-flex; align-items: center; min-height: 52px; color: var(--muted); }
    .from-price strong { margin-left: 6px; font-size: 24px; color: var(--text); }
    .intro { display: grid; gap: 32px; align-items: center; }
    .intro-img { width: 100%; max-width: 480px; aspect-ratio: 4 / 5; object-fit: cover; border-radius: var(--radius); display: block; }
    @media (min-width: 1024px) { .intro { grid-template-columns: 7fr 5fr; gap: 64px; } .intro-img { max-width: none; } }
    .benefits { display: grid; gap: 16px; margin-top: 24px; }
    @media (min-width: 768px) { .benefits { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; } }
    .benefit-text { margin: 0; font-size: 15px; line-height: 24px; }
    .prices-wrap { max-width: 880px; }
    .service-prices { padding: 8px 24px; gap: 0; }
    .service-prices li { display: flex; justify-content: space-between; gap: 16px; padding: 16px 0; }
    .service-prices li + li { border-top: 1px dashed var(--border); }
    .sp-name { display: flex; flex-direction: column; gap: 4px; font-weight: 600; color: var(--text); }
    .sp-desc { font-weight: 400; font-size: 14px; line-height: 21px; color: var(--muted); }
    .sp-price { flex-shrink: 0; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--text); }
    .sp-note { margin-top: 16px; font-size: 14px; line-height: 22px; color: var(--muted); }
    .reviews { display: grid; gap: 16px; margin-top: 24px; }
    @media (min-width: 768px) { .reviews { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; } }
    .stars { color: var(--gold); letter-spacing: 2px; }
    .review-text { margin: 0; font-size: 16px; line-height: 25px; color: var(--text); }
    .review-text::before { content: '„'; } .review-text::after { content: '“'; }
    .review-meta { margin: auto 0 0; font-size: 13px; color: var(--muted); }
    .cta { text-align: center; }
    .cta-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
  `,
})
export class ServicePageComponent {
  readonly config = input.required<ServicePageConfig>();
  readonly contact = SALON_CONTACT;

  private readonly allItems: PriceItem[] = PRICE_LISTS.flatMap(l => l.groups.flatMap(g => g.items));

  readonly items = computed(() =>
    this.config().priceItems.map(n => {
      const item = this.allItems.find(i => i.name === n);
      if (!item) throw new Error(`[service-page] položka „${n}“ nie je v pricing.data.ts`);
      return item;
    }));

  /** Hlavná služba stránky (prvá v priceItems) – v hlavičke namiesto zavádzajúceho „od“ minima. */
  readonly mainItem = computed(() => this.items()[0] ?? null);

  readonly reviews = computed(() => reviewsMatching(this.config().reviewMatch, 3));

  /** Popis bez technickej poznámky v zátvorke „(Služba zahŕňa: …)“. */
  short(desc: string): string {
    return desc.replace(/\s*\(Služba zahŕňa:[^)]*\)\s*$/, '');
  }
}
