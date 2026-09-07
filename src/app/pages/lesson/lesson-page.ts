import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Content } from '../../core/content';
import { I18n } from '../../core/i18n';
import { Seo } from '../../core/seo';
import type { Lang, Lesson } from '../../core/content.types';
import { LessonBody } from '../../lesson/lesson-body';

@Component({
  selector: 'app-lesson',
  imports: [RouterLink, LessonBody],
  templateUrl: './lesson-page.html',
  styleUrl: './lesson-page.scss',
})
export class LessonPage {
  readonly lang = input.required<Lang>();
  readonly moduleSlug = input.required<string>();
  readonly lessonSlug = input.required<string>();
  readonly lesson = input.required<Lesson | null>();

  private readonly content = inject(Content);
  private readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);

  protected readonly t = this.i18n.t;

  protected readonly module = computed(() =>
    this.content.moduleBySlug(this.lang(), this.moduleSlug()),
  );

  protected readonly position = computed(() => {
    const module = this.module();
    const index = module?.lessons.findIndex((l) => l.slug === this.lessonSlug()) ?? -1;
    return module && index >= 0 ? `${module.number}.${index + 1}` : '';
  });

  protected readonly neighbours = computed(() =>
    this.content.neighbours(this.lang(), this.moduleSlug(), this.lessonSlug()),
  );

  constructor() {
    effect(() => {
      const lesson = this.lesson();
      if (!lesson) return;
      this.seo.apply({
        lang: this.lang(),
        title: lesson.title,
        description: lesson.summary,
        moduleSlug: lesson.moduleSlug,
        lessonSlug: lesson.slug,
      });
    });
  }
}
