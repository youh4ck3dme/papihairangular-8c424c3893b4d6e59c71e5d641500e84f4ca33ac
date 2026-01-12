import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router, NavigationEnd } from "@angular/router";
import { ThemeService } from "../../../core/services/theme.service";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private observer: IntersectionObserver | null = null;

  isMenuOpen = signal(false);
  isAnimatingOut = signal(false);
  isDark = this.themeService.isDark;
  activeSection = signal<string>('');

  navLinks = [
    { path: "/", label: "Domov", sectionId: "home" },
    { path: "/cennik", label: "Cenník", sectionId: "pricing" },
    // { path: "/diagnostika", label: "Diagnostika", sectionId: "quiz", isNew: true },
    { path: "/o-nas", label: "O nás", sectionId: "about" },
    { path: "/kontakt", label: "Kontakt", sectionId: "contact" },
    { path: "/blog", label: "Blog", sectionId: "blog" },
    { path: "https://services.bookio.com/papi-hair-design/widget?lang=sk", label: "Rezervácia", isExternal: true },
    { path: "http://www.goldhaircare.sk/affiliate/2208", label: "Shop", isExternal: true },
  ];

  ngOnInit() {
    // Close mobile menu on any route change (e.g., clicking a link)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.closeMenu());
  }

  ngAfterViewInit() {
    // Initialize observer after view is ready
    setTimeout(() => this.initIntersectionObserver(), 100);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /**
   * Initialize IntersectionObserver to track visible sections
   */
  private initIntersectionObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when section is in the middle of viewport
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const sectionId = entry.target.id;
          this.activeSection.set(sectionId);
        }
      });
    }, options);

    // Observe all sections with IDs
    const sections = document.querySelectorAll('section[id], div[id]');
    sections.forEach(section => {
      if (this.observer) {
        this.observer.observe(section);
      }
    });
  }

  /**
   * Smooth scroll to section
   */
  scrollToSection(sectionId: string, event?: Event) {
    const element = document.getElementById(sectionId);

    if (element) {
      // Only prevent default navigation if section exists on current page
      if (event) {
        event.preventDefault();
      }

      const yOffset = -80; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });

      // Update active section immediately
      this.activeSection.set(sectionId);

      // Close mobile menu if open
      this.closeMenu();
    }
    // If element doesn't exist, let RouterLink handle the navigation
  }

  /**
   * Check if link is active based on section visibility
   */
  isLinkActive(link: { path: string; isExternal?: boolean; sectionId?: string }): boolean {
    if (link.isExternal) return false;

    // Check if current route matches
    const isRouteActive = this.router.url === link.path ||
      (link.path === '/' && this.router.url === '/');

    // Check if section is visible
    const isSectionActive = !!(link.sectionId && this.activeSection() === link.sectionId);

    return isRouteActive || isSectionActive;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleMenu() {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.isAnimatingOut.set(false);
      this.isMenuOpen.set(true);
    }
  }

  closeMenu() {
    if (!this.isMenuOpen() || this.isAnimatingOut()) {
      return;
    }

    this.isAnimatingOut.set(true);
    setTimeout(() => {
      this.isMenuOpen.set(false);
      this.isAnimatingOut.set(false);
    }, 300);
  }
}
