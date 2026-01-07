import { Injectable, signal, WritableSignal, effect, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // Signál držiaci aktuálnu tému
  themeSignal: WritableSignal<'light' | 'dark'> = signal<'light' | 'dark'>('light');

  // Computed signal pre jednoduché zistenie, či je dark mode aktívny
  isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    // Automaticky pridá/odoberie 'dark' triedu z <html> elementu pri zmene signálu
    effect(() => {
      if (this.themeSignal() === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    // (Voliteľné) Načítanie uloženej témy z localStorage pri štarte
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.themeSignal.set(savedTheme);
    }
  }

  toggleTheme() {
    const newTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.themeSignal.set(newTheme);
    localStorage.setItem('theme', newTheme);
  }
}
