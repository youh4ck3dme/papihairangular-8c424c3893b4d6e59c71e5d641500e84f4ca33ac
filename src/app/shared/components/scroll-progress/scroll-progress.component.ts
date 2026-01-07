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
        [style.width.%]="scrollProgress()"
        role="progressbar"
        [attr.aria-valuenow]="scrollProgress()"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Reading progress"
      ></div>
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
      backdrop-filter: blur(10px);
    }

    .scroll-progress-bar {
      height: 100%;
      background: linear-gradient(
        90deg,
        #d4af37 0%,
        #f4c542 25%,
        #d4af37 50%,
        #c9a961 75%,
        #d4af37 100%
      );
      background-size: 200% 100%;
      animation: shimmer 3s linear infinite;
      transition: width 0.1s ease-out;
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.5),
                  0 0 20px rgba(212, 175, 55, 0.3);
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
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
