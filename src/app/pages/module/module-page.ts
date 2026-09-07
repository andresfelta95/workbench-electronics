import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Content } from '../../core/content';
import { I18n } from '../../core/i18n';
import { Seo } from '../../core/seo';
import type { Lang } from '../../core/content.types';

@Component({
  selector: 'app-module',
  imports: [RouterLink],
  templateUrl: './module-page.html',
  styleUrl: './module-page.scss',
})
export class ModulePage {
  readonly lang = input.required<Lang>();
  readonly moduleSlug = input.required<string>();

  private readonly content = inject(Content);
  private readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);

  protected readonly t = this.i18n.t;
  protected readonly module = computed(() =>
    this.content.moduleBySlug(this.lang(), this.moduleSlug()),
  );

  constructor() {
    effect(() => {
      const module = this.module();
      if (!module) return;
      this.seo.apply({
        lang: this.lang(),
        title: `${this.t().module.label} ${module.number} · ${module.title}`,
        description: module.summary,
        moduleSlug: module.slug,
      });
    });
  }
}
