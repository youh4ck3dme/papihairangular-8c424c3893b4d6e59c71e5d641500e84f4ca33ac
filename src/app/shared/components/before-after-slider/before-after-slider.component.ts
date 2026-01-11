import { Component, Input, signal, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-before-after-slider',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative w-full overflow-hidden select-none group rounded-2xl shadow-2xl border border-white/10"
         [class.h-64]="!isLarge" [class.h-[500px]]="isLarge"
         (mousemove)="onMove($event)" (touchmove)="onMove($event)"
         (mouseenter)="showLabel.set(true)" (mouseleave)="showLabel.set(false)">

      <!-- Image Container -->
      <div class="relative w-full h-full">
        <!-- After Image (Background) -->
        <img [src]="afterImage" alt="After" class="absolute inset-0 w-full h-full object-cover">
        
        <!-- Before Image (Foreground with Clip) -->
        <div class="absolute inset-0 w-full h-full overflow-hidden" [style.width.%]="position()">
           <img [src]="beforeImage" alt="Before" class="absolute inset-0 w-full h-full object-cover max-w-none" [style.width]="width() + 'px'">
        </div>
      </div>

      <!-- Slider Handle -->
      <div class="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
           [style.left.%]="position()">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
          </svg>
        </div>
      </div>

      <!-- Labels -->
      <div class="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-xs font-bold uppercase tracking-widest z-10 pointer-events-none transition-opacity duration-300"
           [class.opacity-100]="showLabel()" [class.opacity-0]="!showLabel()">
        Pred
      </div>
      <div class="absolute bottom-4 right-4 bg-gold/80 backdrop-blur px-3 py-1 rounded text-black text-xs font-bold uppercase tracking-widest z-10 pointer-events-none transition-opacity duration-300"
           [class.opacity-100]="showLabel()" [class.opacity-0]="!showLabel()">
        Po
      </div>
      
      <!-- Title -->
      @if (title) {
      <div class="absolute top-4 left-0 right-0 text-center pointer-events-none z-10">
          <span class="bg-black/40 backdrop-blur px-4 py-2 rounded-full text-white font-serif text-sm border border-white/10 md:text-base">
              {{ title }}
          </span>
      </div>
      }

    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class BeforeAfterSliderComponent implements AfterViewInit, OnDestroy {
    @Input() beforeImage!: string;
    @Input() afterImage!: string;
    @Input() title?: string;
    @Input() isLarge = false;

    position = signal(50);
    width = signal(0);
    showLabel = signal(false);

    private el = inject(ElementRef);
    private resizeObserver: ResizeObserver | null = null;

    ngAfterViewInit() {
        this.updateWidth();

        this.resizeObserver = new ResizeObserver(() => {
            this.updateWidth();
        });
        this.resizeObserver.observe(this.el.nativeElement);
    }

    ngOnDestroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    updateWidth() {
        this.width.set(this.el.nativeElement.offsetWidth);
    }

    onMove(event: MouseEvent | TouchEvent) {
        const rect = this.el.nativeElement.getBoundingClientRect();
        let clientX: number;

        if (event instanceof MouseEvent) {
            clientX = event.clientX;
        } else {
            clientX = event.touches[0].clientX;
        }

        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;

        this.position.set(percentage);
    }
}
