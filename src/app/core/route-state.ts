import { inject, Service, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { I18n } from './i18n';
import { isLang, type Lang } from './content.types';

export interface RouteLocation {
  lang: Lang;
  moduleSlug: string | null;
  lessonSlug: string | null;
}

/**
 * Where the reader currently is, in language-neutral terms. The header's
 * language switcher needs this to send them to the same lesson rather than
 * dropping them on the home page.
 */
@Service()
export class RouteState {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);

  readonly location = signal<RouteLocation>({ lang: 'en', moduleSlug: null, lessonSlug: null });

  constructor() {
    this.read();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.read());
  }

  private read(): void {
    let route = this.router.routerState.root;
    while (route.firstChild) route = route.firstChild;

    const { params, data } = route.snapshot;
    const lang = isLang(data['lang']) ? data['lang'] : 'en';

    this.i18n.set(lang);
    this.location.set({
      lang,
      moduleSlug: params['moduleSlug'] ?? null,
      lessonSlug: params['lessonSlug'] ?? null,
    });
  }
}
