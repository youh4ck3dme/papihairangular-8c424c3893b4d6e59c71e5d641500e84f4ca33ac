import { Injectable, PLATFORM_ID, computed, effect, inject, signal, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

/**
 * Téma webu. Počiatočný stav preberá z <html class="dark">, ktorú nastaví inline skript
 * v index.html ešte pred štartom Angularu (uložená voľba, inak systémové nastavenie) –
 * takže nevznikne bliknutie ani prepísanie systémovej tmavej témy.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly themeSignal = signal<Theme>(
    this.isBrowser && this.document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
      const meta = this.document.querySelector('meta[name="theme-color"]');
      meta?.setAttribute('content', this.isDark() ? '#0a0a0a' : '#ffffff');
    });
  }

  toggleTheme(): void {
    const next: Theme = this.isDark() ? 'light' : 'dark';
    this.themeSignal.set(next);
    if (this.isBrowser) {
      try { localStorage.setItem('theme', next); } catch { /* private mode */ }
    }
  }
}
