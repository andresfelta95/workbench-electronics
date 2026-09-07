import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Content } from '../../core/content';
import { I18n } from '../../core/i18n';
import { Seo } from '../../core/seo';
import type { Lang } from '../../core/content.types';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  readonly lang = input.required<Lang>();

  private readonly content = inject(Content);
  private readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);

  protected readonly t = this.i18n.t;
  protected readonly modules = computed(() => this.content.modules(this.lang()));
  protected readonly start = computed(() => this.content.firstLesson(this.lang()));
  protected readonly totalLessons = computed(() => this.content.lessonCount(this.lang()));

  protected readonly startPath = computed(() => {
    const first = this.start();
    return first ? ['/', this.lang(), first.module.slug, first.lesson.slug] : ['/', this.lang()];
  });

  constructor() {
    effect(() => {
      const strings = this.t();
      this.seo.apply({
        lang: this.lang(),
        title: strings.tagline,
        description: strings.home.lede,
      });
    });
  }
}
