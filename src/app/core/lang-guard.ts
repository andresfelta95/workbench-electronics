import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { I18n } from './i18n';
import { isLang } from './content.types';

/**
 * Runs before the route's component exists, so the very first render — including
 * the prerendered HTML — already carries the right language.
 */
export const setLang: CanActivateFn = (route) => {
  const declared = route.data['lang'];
  inject(I18n).set(isLang(declared) ? declared : 'en');
  return true;
};
