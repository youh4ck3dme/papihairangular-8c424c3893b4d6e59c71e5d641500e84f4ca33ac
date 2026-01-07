import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../../core/services/seo.service';

@Component({
    selector: 'app-ombre',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-black text-white pt-20">
      <!-- Hero Section -->
      <section class="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 to-black z-10"></div>
        <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop" 
             alt="Ombre farbenie" 
             class="absolute inset-0 w-full h-full object-cover opacity-50">
        
        <div class="relative z-20 text-center px-4">
          <h1 class="text-4xl md:text-7xl font-heading font-bold text-gold mb-6 tracking-wider animate-fade-in-up">OMBRE FARBENIE</h1>
          <p class="text-xl md:text-2xl text-neutral-300 font-primary max-w-2xl mx-auto animate-fade-in-up delay-100">
            Prirodzený prechod farieb pre moderný look
          </p>
        </div>
      </section>

      <!-- Content Section -->
      <section class="py-20 px-6 max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div class="space-y-8">
            <h2 class="text-3xl md:text-4xl font-heading font-bold text-gold">Technika Ombre</h2>
            <p class="text-lg text-neutral-300 leading-relaxed font-primary">
              Ombre je moderná technika farbenia, ktorá vytvára jemný prechod od tmavších odtieňov pri korienk och 
              k svetlejším koncovým odtieňom. Výsledok je prirodzený, slnkom zbozknutý vzhľad.
            </p>
            <p class="text-lg text-neutral-300 leading-relaxed font-primary">
              Používame prémiové farby Gold Haircare, ktoré zabezpečujú dlhotrvajúci lesk a minimálne poškodenie vlasov.
            </p>
            
            <div class="pt-8">
              <a href="https://services.bookio.com/papi-hair-design/widget?lang=sk" target="_blank" 
                 class="inline-block bg-gold text-black font-bold py-4 px-10 rounded-full hover:bg-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-gold/20">
                REZERVOVAŤ TERMÍN
              </a>
            </div>
          </div>
          
          <div class="relative">
            <div class="absolute -inset-4 bg-gold/20 rounded-2xl blur-xl"></div>
            <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop" 
                 alt="Ombre styling" 
                 class="relative rounded-2xl shadow-2xl border border-gold/20 w-full h-auto object-cover aspect-[4/5]">
          </div>
        </div>
      </section>

      <!-- Price Section -->
      <section class="py-20 bg-white/5 border-t border-gold/10">
        <div class="max-w-4xl mx-auto px-6">
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gold text-center mb-16">Cenník</h2>
          
          <div class="space-y-8">
            <div class="flex justify-between items-center border-b border-white/10 pb-6 group hover:border-gold/50 transition-colors">
              <div>
                <h3 class="text-xl font-bold text-white group-hover:text-gold transition-colors">Ombre farbenie</h3>
                <p class="text-neutral-400 mt-2">Konzultácia, farbenie, umývanie, styling</p>
              </div>
              <span class="text-gold font-bold text-xl">od 50€</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
    styles: [`
    :host { display: block; }
    .font-heading { font-family: var(--font-heading); }
    .font-primary { font-family: var(--font-primary); }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OmbreComponent implements OnInit {
    private seoService = inject(SeoService);

    ngOnInit() {
        // Nastavenie špecifických meta tagov pre túto stránku (ak je potrebné prepísať route data)
        // this.seoService.setSeoData({
        //   title: 'Ombre farbenie Košice | PAPI HAIR DESIGN',
        //   description: 'Ombre farbenie vlasov v Košiciach. Profesionálne farbenie s technikou ombre v kaderníctve PAPI HAIR DESIGN.',
        //   keywords: 'ombre farbenie Košice, farbenie vlasov ombre, kaderníctvo farbenie',
        //   ogImage: 'https://papihairdesign.sk/images/logo.png'
        // });

        // Pridanie JSON-LD pre túto službu (Service)
        const serviceJsonLd = {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Ombre farbenie",
            "description": "Profesionálne ombre farbenie vlasov v kaderníctve PAPI HAIR DESIGN Košice. Moderná technika farbenia pre prirodzený prechod farieb.",
            "provider": {
                "@type": "LocalBusiness",
                "name": "PAPI HAIR DESIGN",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Košice",
                    "addressCountry": "SK"
                }
            },
            "areaServed": {
                "@type": "City",
                "name": "Košice"
            },
            "serviceType": "Farbenie vlasov",
            "offers": {
                "@type": "Offer",
                "priceCurrency": "EUR",
                "price": "od 50", // Nahraďte skutočnou cenou
                "availability": "https://schema.org/InStock"
            },
            "image": "https://papihairdesign.sk/images/logo.png"
        };

        this.seoService.addJsonLd(serviceJsonLd);
    }
}
