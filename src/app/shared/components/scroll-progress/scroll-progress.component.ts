import { Component, ChangeDetectionStrategy, DestroyRef, ElementRef, ViewEncapsulation, afterNextRender, inject } from '@angular/core';

/**
 * Tenký pásik priebehu čítania hore na stránke.
 *
 * Posúva ho priamo prehliadač (CSS scroll-driven animácia) – počas posúvania nebeží žiadny JavaScript.
 * Predtým sa pri každom scroll evente menil signál, spúšťala detekcia zmien a zapisovalo do DOM
 * (100 % prepočtov štýlov a ~80 % JS práce počas posúvania na mobile – scripts/scroll-bench.mjs).
 * Prehliadače bez animation-timeline (starší Safari/Firefox) dostanú záložné riešenie s requestAnimationFrame.
 * Pásik je čisto dekoratívny, preto aria-hidden.
 * ViewEncapsulation.None: Angular inak premenuje @keyframes a odkaz v @supports bloku by nesedel.
 */
@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  template: `
    <div class="scroll-progress-container" aria-hidden="true">
      <div class="scroll-progress-bar"></div>
    </div>
  `,
  styles: [`
    .scroll-progress-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: rgba(0, 0, 0, 0.1);
      z-index: 9999;
      pointer-events: none;
    }

    .scroll-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #d4af37 0%, #f4c542 50%, #c9a961 100%);
      transform-origin: 0 50%;
      transform: scaleX(0);
    }

    @supports (animation-timeline: scroll()) {
      .scroll-progress-bar {
        animation: scroll-progress linear both;
        animation-timeline: scroll(root block);
      }
    }

    @keyframes scroll-progress {
      to { transform: scaleX(1); }
    }

    .dark .scroll-progress-container {
      background: rgba(255, 255, 255, 0.05);
    }

    .dark .scroll-progress-bar {
      box-shadow: 0 0 15px rgba(212, 175, 55, 0.7), 0 0 25px rgba(212, 175, 55, 0.4);
    }
  `],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollProgressComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (CSS.supports('animation-timeline: scroll()')) return;

      // záloha: najviac jedna aktualizácia na snímku, mimo Angularu
      const bar = this.host.nativeElement.querySelector('.scroll-progress-bar') as HTMLElement;
      let queued = false;
      const update = () => {
        queued = false;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
      };
      const onScroll = () => {
        if (!queued) {
          queued = true;
          requestAnimationFrame(update);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      update();
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }
}
