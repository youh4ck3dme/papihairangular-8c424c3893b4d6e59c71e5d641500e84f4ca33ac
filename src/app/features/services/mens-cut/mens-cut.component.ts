import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-mens-cut',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-black text-white pt-20">
      <!-- Hero Section -->
      <section class="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 to-black z-10"></div>
        <img src="/assets/mens-hero.jpg" alt="Pánske strihy" class="absolute inset-0 w-full h-full object-cover opacity-50" onerror="this.src='https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop'">
        
        <div class="relative z-20 text-center px-4">
          <h1 class="text-4xl md:text-7xl font-heading font-bold text-gold mb-6 tracking-wider animate-fade-in-up">BARBER & PÁNSKE</h1>
          <p class="text-xl md:text-2xl text-neutral-300 font-primary max-w-2xl mx-auto animate-fade-in-up delay-100">
            Tradičné remeslo, moderný štýl. Gentleman's choice.
          </p>
        </div>
      </section>

      <!-- Content Section -->
      <section class="py-20 px-6 max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div class="space-y-8">
            <h2 class="text-3xl md:text-4xl font-heading font-bold text-gold">Viac než len strih</h2>
            <p class="text-lg text-neutral-300 leading-relaxed font-primary">
              Pre moderného muža je upravený vzhľad vizitkou. Ponúkame komplexnú starostlivosť, 
              od precíznych strihov nožnicami a strojčekom, až po úpravu brady a holenie britvou (Hot Towel).
            </p>
            <p class="text-lg text-neutral-300 leading-relaxed font-primary">
              Vychutnajte si relax v našom kresle, kvalitnú kávu a profesionálny prístup, 
              ktorý z návštevy kaderníctva urobí zážitok.
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
            <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000&auto=format&fit=crop" 
                 alt="Barber služby" 
                 class="relative rounded-2xl shadow-2xl border border-gold/20 w-full h-auto object-cover aspect-[4/5]">
          </div>
        </div>
      </section>

      <!-- Services List -->
      <section class="py-20 bg-white/5 border-t border-gold/10">
        <div class="max-w-4xl mx-auto px-6">
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-gold text-center mb-16">Cenník Služieb</h2>
          
          <div class="space-y-8">
            <div class="flex justify-between items-center border-b border-white/10 pb-6 group hover:border-gold/50 transition-colors">
              <div>
                <h3 class="text-xl font-bold text-white group-hover:text-gold transition-colors">Pánsky strih</h3>
                <p class="text-neutral-400 mt-2">Konzultácia, umývanie, strih, styling</p>
              </div>
              <span class="text-gold font-bold text-xl">25€</span>
            </div>

            <div class="flex justify-between items-center border-b border-white/10 pb-6 group hover:border-gold/50 transition-colors">
              <div>
                <h3 class="text-xl font-bold text-white group-hover:text-gold transition-colors">Úprava brady</h3>
                <p class="text-neutral-400 mt-2">Zastrihnutie, kontúrovanie, olej</p>
              </div>
              <span class="text-gold font-bold text-xl">15€</span>
            </div>

            <div class="flex justify-between items-center border-b border-white/10 pb-6 group hover:border-gold/50 transition-colors">
              <div>
                <h3 class="text-xl font-bold text-white group-hover:text-gold transition-colors">Komplet (Vlasy + Brada)</h3>
                <p class="text-neutral-400 mt-2">Kompletná starostlivosť vrátane Hot Towel</p>
              </div>
              <span class="text-gold font-bold text-xl">35€</span>
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
export class MensCutComponent { }
