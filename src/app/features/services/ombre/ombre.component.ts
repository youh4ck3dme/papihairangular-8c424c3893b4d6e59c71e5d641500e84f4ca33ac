import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ServicePageComponent, ServicePageConfig } from '../service-page.component';

@Component({
  selector: 'app-ombre',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ServicePageComponent],
  template: `<app-service-page [config]="config" />`,
})
export class OmbreComponent {
  readonly config: ServicePageConfig = {
    eyebrow: 'Farbenie',
    title: 'Ombre a balayage Košice',
    lead: 'Prirodzený prechod farieb pre moderný look. Farbíme prémiovými farbami GOLD Haircare šetrnými k vlasom.',
    heroImage: '/images/salon-interior.webp',
    heroAlt: 'Interiér salónu PAPI HAIR DESIGN',
    introTitle: 'Technika ombre a balayage',
    intro: [
      'Ombre vytvára jemný prechod od tmavších odtieňov pri korienkoch k svetlejším končekom. Balayage je jemnejšie, ručne maľované zosvetlenie pre prirodzený „sun-kissed“ vzhľad.',
      'Každé farbenie začína diagnostikou vlasov a konzultáciou. Používame prémiové farby GOLD Haircare, ktoré zabezpečujú dlhotrvajúci lesk a minimálne poškodenie vlasov.',
    ],
    introImage: '/images/miska.webp',
    introAlt: 'Miška – špecialistka na balayage a melír',
    benefits: [
      { title: 'Diagnostika vlasov', text: 'Posúdime stav a východiskovú farbu vlasov a navrhneme vhodnú techniku.' },
      { title: 'Prémiové farby', text: 'GOLD Haircare – vegánska kozmetika šetrná k vlasom aj prírode.' },
      { title: 'Tónovanie a styling', text: 'Doladenie odtieňa, ošetrenie a záverečný styling.' },
    ],
    priceItems: ['Balayage komplet', 'Balayage dorábka', 'Melír komplet', 'Kompletné farbenie'],
    priceNote: 'Cena ombre závisí od dĺžky vlasov a východiskovej farby – orientačne zodpovedá balayage. Presnú cenu upresníme pri konzultácii.',
    reviewMatch: /farb|meli[rí]|balayage|ombre|Miš/i,
  };
}
