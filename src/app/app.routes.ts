import type { Route, Routes } from '@angular/router';
import { LANGS, type Lang } from './core/content.types';
import { setLang } from './core/lang-guard';
import { lessonResolver } from './core/lesson-resolver';

function localised(lang: Lang): Route {
  return {
    path: lang,
    data: { lang },
    canActivate: [setLang],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
      },
      {
        path: ':moduleSlug',
        loadComponent: () => import('./pages/module/module-page').then((m) => m.ModulePage),
      },
      {
        path: ':moduleSlug/:lessonSlug',
        resolve: { lesson: lessonResolver },
        loadComponent: () => import('./pages/lesson/lesson-page').then((m) => m.LessonPage),
      },
    ],
  };
}

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/gate/language-gate').then((m) => m.LanguageGate),
  },
  ...LANGS.map(localised),
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
