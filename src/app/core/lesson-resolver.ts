import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { Content } from './content';
import { isLang, type Lesson } from './content.types';

/**
 * Resolving the lesson (rather than loading it inside the component) makes the
 * router wait for the content chunk, which is what guarantees the prerendered
 * HTML contains the whole lesson instead of an empty shell.
 */
export const lessonResolver: ResolveFn<Lesson | null> = (route) => {
  const content = inject(Content);
  const lang = isLang(route.data['lang']) ? route.data['lang'] : 'en';
  return content.loadLesson(lang, route.params['moduleSlug'], route.params['lessonSlug']);
};
