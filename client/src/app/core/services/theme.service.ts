import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'bokhandel.theme';

/**
 * Växlar mellan ljust och mörkt tema.
 * Bootstrap 5.3 läser attributet data-bs-theme på <html> och byter färger automatiskt.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    // Körs varje gång temat ändras.
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-bs-theme', theme);
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* ignoreras */
      }
    });
  }

  toggle(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  private initialTheme(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignoreras */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
