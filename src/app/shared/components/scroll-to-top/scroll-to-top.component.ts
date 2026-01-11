import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-scroll-to-top',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      *ngIf="isVisible()"
      (click)="scrollToTop()"
      class="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-br from-black via-zinc-800 to-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.5)] border border-gold/30 transition-all duration-300 overflow-hidden"
      aria-label="Scroll to top">
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shine_4s_infinite]"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
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

    @HostListener('window:scroll')
    onWindowScroll() {
        this.isVisible.set(window.scrollY > 300);
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
