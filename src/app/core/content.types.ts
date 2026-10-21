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

/** Bibliography section, as in docs/BIBLIOGRAPHY.md §1–§6. */
export type ReferenceSection = 'textbook' | 'note' | 'standard' | 'datasheet' | 'web' | 'es';

/** One entry of content/bibliography.yaml, resolved at build time. */
export interface BibEntry {
  id: string;
  section: ReferenceSection;
  /** Already formatted, e.g. "Horowitz, P.; Hill, W." */
  authors?: string;
  title: string;
  /**
   * Resolved at build time: the entry's `titleStyle:` if set, otherwise
   * italic for textbook/standard/datasheet/es and quoted for note/web.
   */
  titleStyle: 'italic' | 'quoted';
  /** Journal, series or report number. */
  container?: string;
  edition?: string;
  publisher?: string;
  year?: string;
  /** ISBN, DOI or document number, with its label. */
  identifier?: string;
  url?: string;
  /** Language the work is written in. */
  lang: Lang;
}

/** A source a lesson cites, with the lesson's own note about why. */
export interface LessonReference extends BibEntry {
  /** In the lesson's language. */
  note?: string;
  /** Spanish-language alternate edition; only present on ES lessons. */
  es?: BibEntry;
}

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
  /** "Sources and further reading", in front-matter order; may be empty. */
  references: LessonReference[];
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
