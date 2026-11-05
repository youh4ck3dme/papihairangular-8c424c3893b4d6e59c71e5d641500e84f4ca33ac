import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SALON_CONTACT } from '../../core/config/salon-contact';

/** 404 – route `**`. Robots `noindex` sa nastavuje cez route data (SeoService). */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <div class="page-bleed">
      <app-page-header eyebrow="Chyba 404" title="Stránka sa nenašla"
        lead="Adresa, ktorú hľadáte, neexistuje alebo bola presunutá. Skúste niektorú z týchto stránok:">
        <a [href]="contact.bookingUrl" target="_blank" rel="noopener" class="btn btn-primary">
          Rezervovať termín<span class="sr-only"> (otvorí sa v novom okne)</span>
        </a>
      </app-page-header>
      <section class="page-section" aria-label="Odporúčané stránky">
        <ul class="container-site nf-links">
          <li><a routerLink="/" class="feature-card"><span class="h3">Domov</span><span class="body">Kaderníctvo a barber v Košiciach</span></a></li>
          <li><a routerLink="/cennik" class="feature-card"><span class="h3">Cenník</span><span class="body">Ceny strihov, farbenia a kúr</span></a></li>
          <li><a routerLink="/kontakt" class="feature-card"><span class="h3">Kontakt</span><span class="body">Adresa, telefón a otváracie hodiny</span></a></li>
        </ul>
      </section>
    </div>
  `,
  styles: `
    .nf-links { display: grid; gap: 16px; list-style: none; margin-top: 0; margin-bottom: 0; }
    .nf-links .body { margin: 0; }
    @media (min-width: 768px) { .nf-links { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; } }
  `,
})
export class NotFoundComponent {
  readonly contact = SALON_CONTACT;
}
