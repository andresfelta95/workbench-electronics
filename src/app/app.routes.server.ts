import { RenderMode, type ServerRoute } from '@angular/ssr';
import { CURRICULUM } from './content-generated/curriculum';
import { LANGS } from './core/content.types';

/**
 * The whole site is prerendered to static HTML at build time; parameterised
 * routes get their parameter sets straight from the generated curriculum, so
 * adding a lesson to content/ is all it takes to get a new static page.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  ...LANGS.flatMap((lang): ServerRoute[] => [
    { path: lang, renderMode: RenderMode.Prerender },
    {
      path: `${lang}/:moduleSlug`,
      renderMode: RenderMode.Prerender,
      getPrerenderParams: async () =>
        CURRICULUM[lang].modules.map((module) => ({ moduleSlug: module.slug })),
    },
    {
      path: `${lang}/:moduleSlug/:lessonSlug`,
      renderMode: RenderMode.Prerender,
      getPrerenderParams: async () =>
        CURRICULUM[lang].modules.flatMap((module) =>
          module.lessons.map((lesson) => ({
            moduleSlug: module.slug,
            lessonSlug: lesson.slug,
          })),
        ),
    },
  ]),
  { path: '**', renderMode: RenderMode.Prerender },
];
