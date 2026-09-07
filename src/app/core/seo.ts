import { DOCUMENT, inject, Service } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Content } from './content';
import { LANGS, type Lang } from './content.types';
import { UI } from '../i18n/ui';

export const SITE_ORIGIN = 'https://electronics.paisbru.com';

@Service()
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly content = inject(Content);

  /**
   * Sets the title, description, canonical and the hreflang pair. The alternates
   * matter more than usual here: the same lesson exists at two URLs, and without
   * them the two languages compete with each other in search results.
   */
  apply(options: {
    lang: Lang;
    title: string;
    description: string;
    moduleSlug?: string | null;
    lessonSlug?: string | null;
  }): void {
    const suffix = UI[options.lang].htmlTitleSuffix;
    this.title.setTitle(options.title ? `${options.title} — ${suffix}` : suffix);
    this.meta.updateTag({ name: 'description', content: options.description });
    this.meta.updateTag({ property: 'og:title', content: options.title || suffix });
    this.meta.updateTag({ property: 'og:description', content: options.description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:site_name', content: suffix });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });

    const self = this.href(options.lang, options.moduleSlug, options.lessonSlug);
    this.setLink('canonical', self);
    this.meta.updateTag({ property: 'og:url', content: self });

    for (const lang of LANGS) {
      const path = this.content
        .translatePath(options.lang, lang, options.moduleSlug, options.lessonSlug)
        .filter((part) => part !== '/')
        .join('/');
      this.setAlternate(lang, `${SITE_ORIGIN}/${path}`);
    }
    this.setAlternate('x-default', `${SITE_ORIGIN}/en`);
  }

  private href(lang: Lang, moduleSlug?: string | null, lessonSlug?: string | null): string {
    const parts = [lang, moduleSlug, lessonSlug].filter(Boolean);
    return `${SITE_ORIGIN}/${parts.join('/')}`;
  }

  private setLink(rel: string, href: string): void {
    let element = this.document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!element) {
      element = this.document.createElement('link');
      element.setAttribute('rel', rel);
      this.document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  }

  private setAlternate(hreflang: string, href: string): void {
    const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
    let element = this.document.head.querySelector<HTMLLinkElement>(selector);
    if (!element) {
      element = this.document.createElement('link');
      element.setAttribute('rel', 'alternate');
      element.setAttribute('hreflang', hreflang);
      this.document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  }
}
