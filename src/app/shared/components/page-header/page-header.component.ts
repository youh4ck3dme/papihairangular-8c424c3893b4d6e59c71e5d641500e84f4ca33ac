import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Hlavička podstránky: eyebrow + H1 + lead (+ voliteľný obrázok a CTA cez <ng-content>).
 * Na každej podstránke je to jediný H1.
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header" [class.has-image]="!!image()">
      <div class="container-site page-header-grid">
        <div class="page-header-text">
          @if (eyebrow()) { <p class="eyebrow text-accent">{{ eyebrow() }}</p> }
          <h1 class="page-title">{{ title() }}</h1>
          @if (lead()) { <p class="page-lead">{{ lead() }}</p> }
          <div class="page-header-actions"><ng-content /></div>
        </div>
        @if (image()) {
          <img class="page-header-img" [src]="image()" [alt]="imageAlt()" width="800" height="600"
            fetchpriority="high" decoding="async" />
        }
      </div>
    </header>
  `,
  styles: `
    :host { display: block; }
    .page-header {
      background: var(--surface-alt);
      color: var(--text);
      padding: 48px 0 32px;
    }
    .page-header-grid { display: grid; gap: 24px; align-items: center; }
    .page-title {
      font-family: var(--font-heading);
      font-size: 34px;
      line-height: 40px;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin: 0 0 16px;
      color: var(--text);
    }
    .page-lead {
      max-width: 640px;
      font-size: 16px;
      line-height: 26px;
      color: var(--muted);
      margin: 0;
    }
    .page-header-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
    .page-header-actions:empty { display: none; }
    .page-header-img {
      width: 100%;
      aspect-ratio: 16 / 10;
      max-height: 280px;
      object-fit: cover;
      object-position: center 25%;
      border-radius: var(--radius);
      display: block;
    }
    @media (min-width: 768px) {
      .page-header { padding: 80px 0 48px; }
      .page-title { font-size: 56px; line-height: 60px; }
      .page-lead { font-size: 18px; line-height: 30px; }
      .has-image .page-header-grid { grid-template-columns: 7fr 5fr; gap: 48px; }
      .page-header-img { max-height: 420px; aspect-ratio: 4 / 5; }
    }
  `,
})
export class PageHeaderComponent {
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
  readonly lead = input<string>('');
  readonly image = input<string>('');
  readonly imageAlt = input<string>('');
}
