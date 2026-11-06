import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ServicePageComponent, ServicePageConfig } from '../service-page.component';

@Component({
  selector: 'app-mens-cut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ServicePageComponent],
  template: `<app-service-page [config]="config" />`,
})
export class MensCutComponent {
  readonly config: ServicePageConfig = {
    eyebrow: 'Barber',
    title: 'Pánske strihy a barber Košice',
    lead: 'Tradičné remeslo, moderný štýl. Strihy nožnicami aj strojčekom, úprava brady a rituál s horúcim uterákom.',
    heroImage: '/images/mato.webp',
    heroAlt: 'Maťo – master barber PAPI HAIR DESIGN',
    introTitle: 'Viac než len strih',
    intro: [
      'Pre moderného muža je upravený vzhľad vizitkou. Ponúkame komplexnú starostlivosť – od precíznych strihov nožnicami a strojčekom až po úpravu brady a holenie britvou (Hot Towel).',
      'Vychutnajte si relax v našom kresle, kvalitnú kávu a profesionálny prístup, ktorý z návštevy urobí zážitok.',
    ],
    introImage: '/images/salon-interior.webp',
    introAlt: 'Interiér salónu PAPI HAIR DESIGN',
    benefits: [
      { title: 'Fade a klasika', text: 'Precízne prechody strojčekom aj klasické strihy nožnicami podľa vašich vlasov.' },
      { title: 'Úprava brady', text: 'Zastrihnutie, kontúrovanie a starostlivosť o pokožku pod bradou.' },
      { title: 'Hot Towel rituál', text: 'Horúci uterák a holenie britvou pre dokonalý výsledok a relax.' },
    ],
    priceItems: ['Pánsky strih', 'Strih Junior (do 15r.)', 'Úprava brady', 'Kombinácia vlasy a brada', 'Pánsky špeciál'],
    reviewMatch: /barber|Maťo|Martin|syn bol/i,
  };
}
