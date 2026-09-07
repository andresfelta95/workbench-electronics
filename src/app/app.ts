import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Content } from './core/content';
import { I18n } from './core/i18n';
import { RouteState } from './core/route-state';
import { Theme } from './core/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly i18n = inject(I18n);
  protected readonly theme = inject(Theme);
  private readonly routeState = inject(RouteState);
  private readonly content = inject(Content);

  protected readonly t = this.i18n.t;
  protected readonly lang = this.i18n.lang;
  protected readonly other = this.i18n.other;

  /** The same page in the other language, when one exists. */
  protected readonly switchTarget = computed(() => {
    const here = this.routeState.location();
    return this.content.translatePath(here.lang, this.other(), here.moduleSlug, here.lessonSlug);
  });

  protected readonly year = new Date().getFullYear();
}
