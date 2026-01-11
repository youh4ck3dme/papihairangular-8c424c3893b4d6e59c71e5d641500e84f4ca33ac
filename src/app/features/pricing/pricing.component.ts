import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceInfoModalComponent } from '../../shared/components/service-info-modal/service-info-modal.component';
import { SalonService } from '../../core/models';

@Component({
  selector: 'app-pricing',
  standalone: true,
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ServiceInfoModalComponent]
})
export class PricingComponent {
  selectedService = signal<SalonService | null>(null);

  openServiceInfo(name: string, price: number, duration: number, category: "Dámske" | "Pánske" | "Farbenie" | "Ostatné", description?: string) {
    this.selectedService.set({
      id: 'temp', // This ID is temporary and should ideally be generated or fetched
      name,
      price,
      duration,
      category,
      description
    });
  }

  openLookbook(look: any) {
    this.selectedService.set({
      id: 'look-' + look.name,
      name: look.name,
      price: look.price,
      duration: look.duration,
      category: 'Farbenie',
      description: look.description,
      breakdown: look.breakdown,
      isLookbook: true,
      imageUrl: look.image
    });
  }

  looks = [
    {
      name: 'Pearl Blonde Balayage',
      price: 230,
      duration: 240,
      badge: 'HIT SEZÓNY',
      image: 'assets/images/lookbook/pearl-blonde.webp',
      description: 'Luxusná perleťová blond, ktorá rozžiari vašu tvár. Ideálna pre klientky, ktoré túžia po studených, no žiarivých odtieňoch s prirodzeným prechodom.',
      breakdown: [
        { name: 'Balayage Komplet', price: '150 €', included: true },
        { name: 'Olaplex Ošetrenie', price: '35 €', included: true },
        { name: 'Tónovanie a Gloss', price: 'V cene', included: true },
        { name: 'Strih a Fúkaná', price: '45 €', included: true }
      ]
    },
    {
      name: 'Caramel Melt',
      price: 185,
      duration: 180,
      badge: 'BESTSELLER',
      image: 'assets/images/lookbook/caramel-melt.webp',
      description: 'Hrejivé karamelové tóny pre brunetky, ktoré chcú presvetliť svoj účes bez radikálnej zmeny. Dodá vlasom optický objem a pohyb.',
      breakdown: [
        { name: 'Foilayage / Melír', price: '120 €', included: true },
        { name: 'Tónovanie Root Melt', price: '20 €', included: true },
        { name: 'Regenerácia Methamorphyc', price: 'V cene', included: true },
        { name: 'Finálny Styling', price: '45 €', included: true }
      ]
    },
    {
      name: 'Copper Glow Transformation',
      price: 160,
      duration: 150,
      badge: 'NOVINKA',
      image: 'assets/images/lookbook/copper-glow-pro-v2.webp',
      description: 'Výrazná medená farba plná života. Tento look je o odvahe a elegancii. Perfektný pre jesenné a zimné mesiace.',
      breakdown: [
        { name: 'Kompletné farbenie', price: '70 €', included: true },
        { name: 'Extra Gloss Kúra', price: '15 €', included: true },
        { name: 'Kreatívny Strih', price: '45 €', included: true },
        { name: 'Vlny / Styling', price: '30 €', included: true }
      ]
    }
  ];

  closeServiceInfo() {
    this.selectedService.set(null);
  }
}