import { Component, HostListener, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scroll-progress-container">
      <div
        class="scroll-progress-bar"
        [style.transform]="'scaleX(' + scrollProgress() / 100 + ')'"
        role="progressbar"
        [attr.aria-valuenow]="scrollProgress() | number: '1.0-0'"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Priebeh čítania"
      ></div>
    </div>
  `,
  styles: [`
    /* Iba transform (kompozitor) – žiadna nekonečná animácia ani backdrop-filter,
       ktoré predtým prekresľovali stránku v každom snímku (TBT). */
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
      transition: transform 0.1s ease-out;
      will-change: transform;
    }

    @media (prefers-reduced-motion: reduce) {
      .scroll-progress-bar { transition: none; }
    }

    /* Dark mode support */
    :host-context(.dark) .scroll-progress-container {
      background: rgba(255, 255, 255, 0.05);
    }

    :host-context(.dark) .scroll-progress-bar {
      box-shadow: 0 0 15px rgba(212, 175, 55, 0.7),
                  0 0 25px rgba(212, 175, 55, 0.4);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollProgressComponent {
  scrollProgress = signal(0);

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.calculateScrollProgress();
  }

  private calculateScrollProgress(): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Calculate the maximum scrollable distance
    const maxScroll = documentHeight - windowHeight;

    if (maxScroll <= 0) {
      this.scrollProgress.set(0);
      return;
    }

    // Calculate percentage (0-100)
    const progress = Math.min(Math.max((scrollTop / maxScroll) * 100, 0), 100);
    this.scrollProgress.set(Math.round(progress));
  }
}
