import { Directive, ElementRef, AfterViewInit, Input, inject } from '@angular/core';

@Directive({
  selector: 'img[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements AfterViewInit {
  private el = inject(ElementRef<HTMLImageElement>);

  @Input() src!: string;

  ngAfterViewInit() {
    const img = this.el.nativeElement;

    // Check if browser supports native lazy loading
    if ('loading' in img) {
      // Native lazy loading is supported, let the browser handle it
      return;
    }

    // Fallback for browsers without native lazy loading support
    this.implementLazyLoading(img);
  }

  private implementLazyLoading(img: HTMLImageElement) {
    // Initially set src to a placeholder or empty, and store real src in data attribute
    const realSrc = img.src || this.src;
    img.src = ''; // or a placeholder image
    img.setAttribute('data-src', realSrc);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          const src = target.getAttribute('data-src');
          if (src) {
            target.src = src;
            target.removeAttribute('data-src');
            observer.unobserve(target);
          }
        }
      });
    }, {
      rootMargin: '50px' // Start loading 50px before the image enters the viewport
    });

    observer.observe(img);
  }
}