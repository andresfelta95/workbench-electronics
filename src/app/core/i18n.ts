import { computed, DOCUMENT, effect, inject, Service, signal } from '@angular/core';
import { UI, type UiStrings } from '../i18n/ui';
import { type Lang } from './content.types';

@Service()
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<Lang>('en');

  readonly lang = this.current.asReadonly();
  readonly other = computed<Lang>(() => (this.current() === 'en' ? 'es' : 'en'));
  readonly t = computed<UiStrings>(() => UI[this.current()]);

  constructor() {
    // Keeps <html lang> honest for screen readers and for Google.
    effect(() => {
      this.document.documentElement.setAttribute('lang', this.current());
    });
  }

  set(lang: Lang): void {
    if (lang !== this.current()) this.current.set(lang);
  }
}
