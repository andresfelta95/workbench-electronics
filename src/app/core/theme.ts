import { DOCUMENT, effect, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'wb-theme';

@Service()
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly choice = signal<ThemeChoice>('system');

  /** What the viewer is actually looking at right now. */
  readonly resolved = signal<'light' | 'dark'>('light');

  constructor() {
    if (this.isBrowser) {
      const stored = this.read();
      if (stored) this.choice.set(stored);
      this.syncResolved();
      this.document.defaultView
        ?.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => this.syncResolved());
    }

    effect(() => {
      const choice = this.choice();
      if (!this.isBrowser) return;
      const root = this.document.documentElement;
      if (choice === 'system') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', choice);
      }
      try {
        if (choice === 'system') localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, choice);
      } catch {
        // Private browsing, or site data blocked. The page still works.
      }
      this.syncResolved();
    });
  }

  /** Cycles to the opposite of what is currently on screen. */
  toggle(): void {
    this.choice.set(this.resolved() === 'dark' ? 'light' : 'dark');
  }

  private syncResolved(): void {
    if (!this.isBrowser) return;
    const choice = this.choice();
    if (choice !== 'system') {
      this.resolved.set(choice);
      return;
    }
    const prefersDark =
      this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
    this.resolved.set(prefersDark ? 'dark' : 'light');
  }

  private read(): ThemeChoice | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'dark' || value === 'light' ? value : null;
    } catch {
      return null;
    }
  }
}
