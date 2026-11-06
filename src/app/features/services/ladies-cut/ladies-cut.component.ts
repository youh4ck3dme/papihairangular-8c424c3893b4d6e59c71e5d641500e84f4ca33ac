import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ServicePageComponent, ServicePageConfig } from '../service-page.component';

@Component({
  selector: 'app-ladies-cut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ServicePageComponent],
  template: `<app-service-page [config]="config" />`,
})
export class LadiesCutComponent {
  readonly config: ServicePageConfig = {
    eyebrow: 'Služby',
    title: 'Dámske strihy Košice',
    lead: 'Precíznosť, elegancia a štýl, ktorý podčiarkne vašu osobnosť. Každý strih začína konzultáciou.',
    heroImage: '/images/miska.webp',
    heroAlt: 'Miška – senior stylistka PAPI HAIR DESIGN',
    introTitle: 'Individuálny prístup',
    intro: [
      'Každá žena je jedinečná, a preto ku každému strihu pristupujeme individuálne. Pred začatím služby prebehne konzultácia, kde zohľadníme typ vašich vlasov, tvar tváre a váš životný štýl.',
      'Naši stylisti sú pravidelne školení v najnovších trendoch a technikách, aby sme vám mohli ponúknuť to najlepšie zo sveta vlasového dizajnu.',
    ],
    introImage: '/assets/salon-interior-mirrored.jpg',
    introAlt: 'Interiér salónu PAPI HAIR DESIGN',
    benefits: [
      { title: 'Konzultácia', text: 'Poradíme strih podľa tvaru tváre, typu vlasov a toho, koľko času venujete úprave.' },
      { title: 'Umytie a masáž hlavy', text: 'Umývanie prémiovou kozmetikou GOLD Haircare s relaxačnou masážou.' },
      { title: 'Strih a styling', text: 'Precízny strih na mieru a záverečný styling, aby ste odchádzali hotová.' },
    ],
    priceItems: ['Dámsky strih', 'Fúkaná polodlhé vlasy', 'Fúkaná dlhé vlasy', 'Finálny styling', 'Spoločenský účes'],
    reviewMatch: /strih|kaderníčk|vlasy vyzerajú|prvá návšteva/i,
  };
}
