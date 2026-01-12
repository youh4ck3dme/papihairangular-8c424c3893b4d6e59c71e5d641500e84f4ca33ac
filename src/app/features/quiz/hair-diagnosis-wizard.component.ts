import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';


interface QuizState {
    problem: string | null;
    length: string | null;
    goal: string | null;
}

@Component({
    selector: 'app-hair-diagnosis-wizard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-brand-dark text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold rounded-full filter blur-[150px] animate-pulse"></div>
          <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900 rounded-full filter blur-[150px] opacity-60"></div>
      </div>

      <!-- Progress Bar -->
      @if (step() < 4) {
      <div class="w-full max-w-2xl mb-12 relative z-10">
          <div class="flex justify-between text-xs text-gold/60 uppercase tracking-widest mb-2 font-mono">
              <span>Krok {{step()}} z 3</span>
              <span>Diagnostika</span>
          </div>
          <div class="h-1 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-gold transition-all duration-500 ease-out" [style.width.%]="(step() / 3) * 100"></div>
          </div>
      </div>
      }

      <!-- Content Container -->
      <div class="w-full max-w-4xl relative z-10 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
        
        <!-- STEP 1: Problem -->
        @if (step() === 1) {
        <div class="animate-fadeIn">
            <h2 class="text-3xl md:text-5xl font-serif text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Čo vás trápi najviac?
            </h2>
            <p class="text-center text-brand-light/60 mb-12 text-lg">Vyberte jeden hlavný problém vašich vlasov</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (option of problems; track option.id) {
                <button (click)="selectProblem(option.id)" 
                        class="group relative p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-gold/50 transition-all duration-300 transform hover:scale-[1.02] text-left">
                    <span class="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">{{option.emoji}}</span>
                    <h3 class="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">{{option.label}}</h3>
                    <p class="text-sm text-brand-light/60">{{option.desc}}</p>
                </button>
                }
            </div>
        </div>
        }

        <!-- STEP 2: Length -->
        @if (step() === 2) {
        <div class="animate-fadeIn">
            <button (click)="step.set(1)" class="text-sm text-gold/60 hover:text-gold mb-6 flex items-center gap-2">
                &larr; Späť
            </button>
            <h2 class="text-3xl md:text-5xl font-serif text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Akú máte dĺžku vlasov?
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                @for (option of lengths; track option.id) {
                <button (click)="selectLength(option.id)" 
                        class="group p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-gold/50 transition-all duration-300 text-center">
                    <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-black/50 border border-gold/20 flex items-center justify-center group-hover:border-gold transition-colors">
                        <span class="text-gold font-serif italic text-2xl">{{option.letter}}</span>
                    </div>
                    <h3 class="text-xl font-bold text-white group-hover:text-gold transition-colors">{{option.label}}</h3>
                </button>
                }
            </div>
        </div>
        }

        <!-- STEP 3: Goal -->
        @if (step() === 3 && !isGenerating()) {
        <div class="animate-fadeIn">
            <button (click)="step.set(2)" class="text-sm text-gold/60 hover:text-gold mb-6 flex items-center gap-2">
                &larr; Späť
            </button>
            <h2 class="text-3xl md:text-5xl font-serif text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Aký je váš cieľ?
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (option of goals; track option.id) {
                <button (click)="selectGoal(option.id)" 
                        class="group p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-gold/50 transition-all duration-300 flex items-center gap-6 text-left">
                    <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-colors shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white mb-1 group-hover:text-gold transition-colors">{{option.label}}</h3>
                        <p class="text-sm text-brand-light/60">{{option.desc}}</p>
                    </div>
                </button>
                }
            </div>
        </div>
        }

        <!-- LOADING STEP -->
        @if (isGenerating()) {
        <div class="flex flex-col items-center justify-center py-12 animate-fadeIn">
            <div class="relative w-32 h-32 mb-8">
                <div class="absolute inset-0 border-4 border-gold/20 rounded-full animate-pulse"></div>
                <!-- Spinning Black Logo (icon) -->
                <img src="assets/logo-icon.webp" alt="PAPI" 
                     class="w-full h-full object-contain animate-spin-slow">
            </div>
            
            <div class="text-center">
                <p class="text-gold font-mono text-sm uppercase tracking-[0.3em] mb-4 animate-pulse">Generujeme analýzu</p>
                <h3 class="text-2xl font-serif text-white h-8 overflow-hidden">
                    <span class="block animate-slideUp">{{ generationMessages[generationStep()] }}</span>
                </h3>
                
                <div class="w-48 h-1 bg-white/5 rounded-full mx-auto mt-8 overflow-hidden">
                    <div class="h-full bg-gold animate-progress"></div>
                </div>
            </div>
        </div>
        }

        <!-- STEP 4: Result -->
        @if (step() === 4 && result()) {
        <div class="animate-scaleIn text-center max-w-2xl mx-auto">
            <div class="inline-block px-4 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
                Vaša Diagnostika je hotová
            </div>
            
            <h2 class="text-4xl md:text-6xl font-serif text-white mb-6">
                {{ result()?.title }}
            </h2>
            
            <p class="text-lg text-brand-light/80 leading-relaxed mb-12">
                {{ result()?.description }}
            </p>

            <div class="bg-white/5 rounded-2xl p-8 border border-gold/20 mb-12 relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                
                <h3 class="text-gold font-mono text-sm uppercase tracking-widest mb-4">Odporúčané riešenie</h3>
                
                <div class="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div class="text-left">
                        <div class="text-2xl font-bold text-white mb-2">{{ result()?.service }}</div>
                        <div class="text-brand-light/60 text-sm">Profesionálna kúra v salóne</div>
                    </div>
                    <div class="h-12 w-px bg-white/10 hidden md:block"></div>
                    <div class="text-left">
                        <div class="text-2xl font-bold text-white mb-2">{{ result()?.product }}</div>
                        <div class="text-brand-light/60 text-sm">Na domáce ošetrenie</div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-4 justify-center">
                <a href="https://services.bookio.com/papi-hair-design/widget?lang=sk" target="_blank"
                   class="px-8 py-4 bg-gold text-black font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all transform hover:scale-105 shadow-xl shadow-gold/20">
                    Objednať sa Online
                </a>
                <button (click)="restart()" 
                        class="px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                    Spustiť znova
                </button>
            </div>
            
            <p class="mt-8 text-xs text-brand-light/40">
                *Toto je orientačná diagnostika. Presný postup určí kaderník pri osobnej konzultácii.
            </p>
        </div>
        }

      </div>
    </div>
  `,
    styles: [`
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    @keyframes slideUp {
        0% { transform: translateY(100%); opacity: 0; }
        10% { transform: translateY(0); opacity: 1; }
        90% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-100%); opacity: 0; }
    }
    @keyframes progress {
        0% { width: 0; }
        100% { width: 100%; }
    }
    @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
    .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }
    .animate-slideUp { animation: slideUp 1s ease-in-out forwards; }
    .animate-progress { animation: progress 3s linear forwards; }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HairDiagnosisWizardComponent {
    step = signal(1);
    state = signal<QuizState>({ problem: null, length: null, goal: null });
    isGenerating = signal(false);
    generationStep = signal(0);

    generationMessages = [
        'Analyzujeme textúru vašich vlasov...',
        'Prepočítavame optimálne ošetrenie...',
        'Pripravujeme váš personalizovaný plán...'
    ];

    problems = [
        { id: 'dry', label: 'Suché a zničené', desc: 'Vlasy sú matné, lámu sa a chýba im život.', emoji: '🍂' },
        { id: 'frizz', label: 'Krepaté a nepoddajné', desc: 'Vlasy elektrizujú a ťažko sa upravujú.', emoji: '🦁' },
        { id: 'fade', label: 'Vyblednutá farba', desc: 'Farba stratila sýtosť a lesk.', emoji: '🎨' },
        { id: 'thin', label: 'Jemné bez objemu', desc: 'Vlasy sú spľasnuté a rýchlo sa mastia.', emoji: '🪶' }
    ];

    lengths = [
        { id: 'short', label: 'Krátke', letter: 'S' },
        { id: 'medium', label: 'Polodlhé', letter: 'M' },
        { id: 'long', label: 'Dlhé', letter: 'L' }
    ];

    goals = [
        { id: 'heal', label: 'Uzdravenie a Regenerácia', desc: 'Chcem hĺbkovú obnovu štruktúry.' },
        { id: 'shine', label: 'Maximálny Lesk', desc: 'Chcem, aby moje vlasy žiarili.' },
        { id: 'volume', label: 'Objem a Textúra', desc: 'Chcem plnší a vzdušnejší účes.' },
        { id: 'change', label: 'Totálna Zmena', desc: 'Som pripravená na nový look.' }
    ];

    result = computed(() => {
        const s = this.state();
        if (!s.problem || !s.goal) return null;

        // Logic Engine
        if (s.problem === 'dry' || s.goal === 'heal') {
            return {
                title: 'Hĺbková SOS Regenerácia',
                description: 'Vaše vlasy volajú po hydratácii a proteínoch. Odporúčame našu intenzívnu keratínovú kúru, ktorá vyplní štruktúru vlasu a vráti mu pružnosť.',
                service: 'Keratínová Kúra',
                product: 'Olaplex No. 3 Hair Perfector'
            };
        }

        if (s.problem === 'frizz' || s.goal === 'shine') {
            return {
                title: 'Hodvábny Dotyk',
                description: 'Pre skrotenie nepoddajných vlasov a dodanie zrkadlového lesku je ideálna naša botoxová kúra alebo glossing.',
                service: 'Botox na vlasy',
                product: 'Kerastase Discipline Mask'
            };
        }

        if (s.problem === 'fade') {
            return {
                title: 'Oživenie Farby',
                description: 'Vaša farba potrebuje nový dych. Odporúčame tónovanie "Gloss", ktoré vlasy nezaťaží, ale dodá im pigment a neskutočný lesk.',
                service: 'Farbenie & Gloss',
                product: 'Farebný kondicionér na mieru'
            };
        }

        if (s.problem === 'thin' || s.goal === 'volume') {
            return {
                title: 'Volume Boost',
                description: 'Pre jemné vlasy je kľúčový precízny strih a ľahká výživa, ktorá nezaťažuje. Navrhneme vám strih, ktorý opticky zdvojnásobí objem.',
                service: 'Kreatívny Strih & Styling',
                product: 'Objemový púder & Ľahký kondicionér'
            };
        }

        // Default fallback
        return {
            title: 'Kompletná Premena',
            description: 'Pre vašu špecifickú požiadavku bude najlepšia osobná konzultácia. Spolu nájdeme to najlepšie riešenie pre váš nový ja.',
            service: 'Konzultácia & Premena',
            product: 'Sada pre váš typ vlasov'
        };
    });

    selectProblem(id: string) {
        this.state.update(s => ({ ...s, problem: id }));
        this.step.set(2);
    }

    selectLength(id: string) {
        this.state.update(s => ({ ...s, length: id }));
        this.step.set(3);
    }

    selectGoal(id: string) {
        this.state.update(s => ({ ...s, goal: id }));

        // Start simulated generation
        this.isGenerating.set(true);

        // Cycle messages
        let count = 0;
        const interval = setInterval(() => {
            count++;
            if (count < 3) {
                this.generationStep.set(count);
            } else {
                clearInterval(interval);
                this.isGenerating.set(false);
                this.step.set(4);
            }
        }, 1000);
    }

    restart() {
        this.state.set({ problem: null, length: null, goal: null });
        this.step.set(1);
    }
}
