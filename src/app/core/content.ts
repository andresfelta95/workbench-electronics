import { Service } from '@angular/core';
import { CURRICULUM } from '../content-generated/curriculum';
import { LESSON_LOADERS } from '../content-generated/loaders';
import type { Curriculum, Lang, Lesson, LessonMeta, ModuleMeta } from './content.types';

/** A lesson plus enough context to render breadcrumbs and prev/next links. */
export interface LessonRef {
  module: ModuleMeta;
  lesson: LessonMeta;
}

@Service()
export class Content {
  curriculum(lang: Lang): Curriculum {
    return CURRICULUM[lang];
  }

  modules(lang: Lang): ModuleMeta[] {
    return CURRICULUM[lang].modules;
  }

  lessonCount(lang: Lang): number {
    return CURRICULUM[lang].modules.reduce((total, mod) => total + mod.lessons.length, 0);
  }

  moduleBySlug(lang: Lang, slug: string): ModuleMeta | undefined {
    return CURRICULUM[lang].modules.find((mod) => mod.slug === slug);
  }

  moduleById(lang: Lang, id: string): ModuleMeta | undefined {
    return CURRICULUM[lang].modules.find((mod) => mod.id === id);
  }

  lessonBySlug(lang: Lang, moduleSlug: string, lessonSlug: string): LessonRef | undefined {
    const module = this.moduleBySlug(lang, moduleSlug);
    const lesson = module?.lessons.find((l) => l.slug === lessonSlug);
    return module && lesson ? { module, lesson } : undefined;
  }

  /** The first published lesson anywhere in the path — the "start here" target. */
  firstLesson(lang: Lang): LessonRef | undefined {
    for (const module of CURRICULUM[lang].modules) {
      if (module.lessons.length > 0) return { module, lesson: module.lessons[0] };
    }
    return undefined;
  }

  /**
   * Walks the whole curriculum in order, so "next" crosses a module boundary
   * into the following module rather than dead-ending.
   */
  private flatten(lang: Lang): LessonRef[] {
    const out: LessonRef[] = [];
    for (const module of CURRICULUM[lang].modules) {
      for (const lesson of module.lessons) out.push({ module, lesson });
    }
    return out;
  }

  neighbours(
    lang: Lang,
    moduleSlug: string,
    lessonSlug: string,
  ): { previous?: LessonRef; next?: LessonRef } {
    const all = this.flatten(lang);
    const index = all.findIndex(
      (ref) => ref.module.slug === moduleSlug && ref.lesson.slug === lessonSlug,
    );
    if (index < 0) return {};
    return { previous: all[index - 1], next: all[index + 1] };
  }

  async loadLesson(lang: Lang, moduleSlug: string, lessonSlug: string): Promise<Lesson | null> {
    const loader = LESSON_LOADERS[`${lang}/${moduleSlug}/${lessonSlug}`];
    if (!loader) return null;
    const loaded = await loader();
    return loaded.default;
  }

  /**
   * The same place in the other language. Module and lesson identifiers are
   * language-neutral on purpose (`00-fundamentals`, `01-ohms-law`) so the
   * switcher never drops the reader back on the home page.
   */
  translatePath(
    from: Lang,
    to: Lang,
    moduleSlug?: string | null,
    lessonSlug?: string | null,
  ): string[] {
    if (!moduleSlug) return ['/', to];

    const sourceModule = this.moduleBySlug(from, moduleSlug);
    const targetModule = sourceModule ? this.moduleById(to, sourceModule.id) : undefined;
    if (!sourceModule || !targetModule) return ['/', to];

    if (!lessonSlug) return ['/', to, targetModule.slug];

    const sourceLesson = sourceModule.lessons.find((l) => l.slug === lessonSlug);
    const targetLesson = targetModule.lessons.find((l) => l.id === sourceLesson?.id);
    if (!targetLesson) return ['/', to, targetModule.slug];

    return ['/', to, targetModule.slug, targetLesson.slug];
  }
}
