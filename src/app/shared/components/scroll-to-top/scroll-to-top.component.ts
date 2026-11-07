import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

@Component({
    selector: 'app-scroll-to-top',
    standalone: true,
    imports: [],
    template: `
    @if (isVisible()) {
    <button
      type="button"
      (click)="scrollToTop()"
      class="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 p-3 rounded-full bg-gradient-to-br from-black via-zinc-800 to-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.5)] border border-gold/30 transition-all duration-300 overflow-hidden"
      aria-label="Späť na začiatok stránky">
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shine_4s_infinite]"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
    }
  `,
    styles: [`
    :host {
      display: block;
    }
    @keyframes shine {
      0%, 10% { transform: translateX(-100%) skewX(-15deg); }
      50%, 100% { transform: translateX(200%) skewX(-15deg); }
    }
  `]
})
export class ScrollToTopComponent {
    isVisible = signal(false);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        // Tlačidlo sa ukáže po 300 px. Namiesto scroll eventu (beží pri každom pixeli posunu)
        // sleduje neviditeľnú 300 px značku na začiatku stránky – signál sa zmení iba pri prekročení hranice.
        afterNextRender(() => {
            const sentinel = document.createElement('div');
            sentinel.setAttribute('aria-hidden', 'true');
            sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:300px;pointer-events:none;visibility:hidden';
            document.body.prepend(sentinel);
            const observer = new IntersectionObserver(([entry]) => this.isVisible.set(!entry.isIntersecting));
            observer.observe(sentinel);
            this.destroyRef.onDestroy(() => {
                observer.disconnect();
                sentinel.remove();
            });
        });
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
