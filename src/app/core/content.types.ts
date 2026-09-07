export type Lang = 'en' | 'es';

export const LANGS: readonly Lang[] = ['en', 'es'] as const;

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'es';
}

/** A block of rendered prose. */
export interface HtmlBlock {
  kind: 'html';
  html: string;
}

/** An interactive instrument, resolved through the widget registry. */
export interface WidgetBlock {
  kind: 'widget';
  type: string;
  props: Record<string, string>;
}

/** An aside: note, warning, key idea, or an electrical-safety warning. */
export interface CalloutBlock {
  kind: 'callout';
  tone: 'note' | 'warning' | 'key' | 'safety';
  title: string;
  html: string;
}

export type LessonBlock = HtmlBlock | WidgetBlock | CalloutBlock;

/** Lesson metadata as it appears in the in-bundle curriculum index. */
export interface LessonMeta {
  id: string;
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  widgets: string[];
}

/** A full lesson, fetched on demand from public/content/. */
export interface Lesson extends LessonMeta {
  lang: Lang;
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
  blocks: LessonBlock[];
}

export interface ModuleMeta {
  id: string;
  number: string;
  slug: string;
  title: string;
  summary: string;
  intro: string;
  lessons: LessonMeta[];
}

export interface Curriculum {
  lang: Lang;
  modules: ModuleMeta[];
}
