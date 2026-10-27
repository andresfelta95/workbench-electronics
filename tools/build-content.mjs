/**
 * Content pipeline.
 *
 * Reads the bilingual Markdown lesson tree in `content/{lang}/` and emits, into
 * src/app/content-generated/:
 *   - curriculum.ts        — typed index used for navigation and prerender params
 *   - lessons/*.ts         — one module per lesson, code-split by the bundler
 *   - loaders.ts           — route key -> dynamic import of the lesson module
 *
 * Lessons are emitted as TypeScript rather than fetched as JSON so that the same
 * code path works during prerender and in the browser, with no HTTP involved.
 *
 * Lessons are Markdown so that writing a lesson is writing prose. Interactive
 * instruments are referenced by a one-line directive:
 *
 *   ::widget{type="divider" vin="9" r1="10k" r2="10k"}
 *
 * The build fails if `type` is not a key of WIDGETS in
 * src/app/lesson/widget-registry.ts, if an attribute is not one the widget
 * reads, or if a numeric attribute is not a value `parseValue` accepts. What
 * each widget reads is derived from its source (see tools/widget-props.mjs).
 *
 * Callouts use a fenced directive:
 *
 *   :::note Optional title
 *   body markdown
 *   :::
 *
 * Front matter. `_module.md`: slug, title, summary (all required); it never
 * takes `references:`. Each lesson: slug, title, summary (required), minutes
 * (optional, default 5) and `references:` (optional), a list of ids into the
 * shared `content/bibliography.yaml`, each either a bare id or
 * `{ id, note }` where the note is in the lesson's language:
 *
 *   references:
 *     - horowitz-hill-2015
 *     - id: yageo-cfr
 *       note: "tolerance and power rating of carbon-film resistors"
 *
 * The build fails on an unknown or duplicated id, a malformed item, a
 * malformed bibliography entry (missing title, unknown key or section, a bad
 * `titleStyle:` or url, `section: es` without `lang: es` or the reverse, an
 * `es:` alternate that is missing or not `lang: es`, an `es:` on an entry that
 * is itself `lang: es`, `modules:` that is not a list of strings; a `null`
 * optional field counts as absent), or when the EN and ES
 * versions of a lesson cite different id sets. Only the cited entries are
 * resolved into each lesson module (ES lessons also get the `es:` alternate),
 * so no YAML is parsed at runtime. The bibliography's `modules` and `comment`
 * fields are bookkeeping and never reach the generated data.
 */
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';
import { REGISTRY_FILE, loadFormat, readWidgetSchema } from './widget-props.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const GEN_DIR = path.join(ROOT, 'src', 'app', 'content-generated');
const LESSON_DIR = path.join(GEN_DIR, 'lessons');

const LANGS = ['en', 'es'];
const ORIGIN = 'https://electronics.paisbru.com';
const CALLOUT_KINDS = new Set(['note', 'warning', 'key', 'safety']);

marked.setOptions({ gfm: true, breaks: false });

const WIDGET_RE = /^::widget\{(.*)\}\s*$/;
const WIDGET_IN_CALLOUT =
  '::widget directives are not allowed inside a :::callout; close the callout first';
const MALFORMED_WIDGET =
  'malformed ::widget directive; write it unindented on a line of its own, exactly as ::widget{type="…" name="value" …}';
const CALLOUT_OPEN_RE = /^:::(\w+)\s*(.*)$/;
const CALLOUT_CLOSE_RE = /^:::\s*$/;

function parseAttrs(raw, where) {
  const attrs = {};
  const re = /([A-Za-z_][\w-]*)="([^"]*)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (m[1] in attrs) throw new Error(`${where}: attribute "${m[1]}" is given twice`);
    attrs[m[1]] = m[2];
  }
  const rest = raw.replace(re, '').trim();
  if (rest) throw new Error(`${where}: cannot parse "${rest}"; write attributes as name="value"`);
  return attrs;
}

/** Filled in by main(): what each registered widget accepts, and parseValue. */
let widgetSchema;
let parseValue;

/** Fails on an unregistered widget type, an unknown attribute or a bad number. */
function checkWidget(type, props, where) {
  const widget = widgetSchema[type];
  if (!widget) {
    throw new Error(
      `${where}: unknown widget type "${type}"; registered in ${REGISTRY_FILE}: ${Object.keys(widgetSchema).join(', ')}`,
    );
  }
  for (const [name, value] of Object.entries(props)) {
    const kind = widget.props?.get(name);
    if (!kind) {
      const known = widget.props ? [...widget.props.keys()].join(', ') : '(none)';
      throw new Error(
        `${where}: widget "${type}" has no prop "${name}" (${widget.file} reads: ${known})`,
      );
    }
    if (kind === 'number' && !Number.isFinite(parseValue(value, NaN))) {
      throw new Error(
        `${where}: widget "${type}" prop ${name}="${value}" is not a number parseValue accepts (e.g. 9, 4.7k, 100n)`,
      );
    }
  }
}

/** Split raw markdown into ordered blocks the Angular renderer can walk.
 *  `lineOffset` is the number of front-matter lines, for error positions. */
function toBlocks(markdown, ctx, lineOffset = 0) {
  const blocks = [];
  const lines = markdown.split(/\r?\n/);
  let buffer = [];
  let inFence = false;

  const flush = () => {
    const text = buffer.join('\n').trim();
    buffer = [];
    if (text) blocks.push({ kind: 'html', html: marked.parse(text) });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Never interpret directives inside a fenced code block.
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      buffer.push(line);
      continue;
    }
    if (inFence) {
      buffer.push(line);
      continue;
    }

    const widget = WIDGET_RE.exec(line);
    // Anything else that looks like a directive would render as plain text
    // and skip every check below, so it is an error rather than prose.
    if (!widget && line.trim().startsWith('::widget')) {
      throw new Error(`${ctx}:${i + 1 + lineOffset}: ${MALFORMED_WIDGET}`);
    }
    if (widget) {
      const where = `${ctx}:${i + 1 + lineOffset}`;
      const attrs = parseAttrs(widget[1], where);
      if (!attrs['type']) throw new Error(`${where}: ::widget without a type= attribute`);
      flush();
      const { type, ...props } = attrs;
      checkWidget(type, props, where);
      blocks.push({ kind: 'widget', type, props });
      continue;
    }

    const callout = CALLOUT_OPEN_RE.exec(line);
    if (callout && CALLOUT_KINDS.has(callout[1])) {
      const kind = callout[1];
      const title = callout[2].trim();
      const inner = [];
      let closed = false;
      let innerFence = false;
      for (i = i + 1; i < lines.length; i++) {
        if (/^\s*```/.test(lines[i])) innerFence = !innerFence;
        if (CALLOUT_CLOSE_RE.test(lines[i])) {
          closed = true;
          break;
        }
        // A callout body goes straight to marked, so a directive here would
        // ship as literal text without any of the widget checks.
        if (!innerFence && lines[i].trim().startsWith('::widget')) {
          throw new Error(`${ctx}:${i + 1 + lineOffset}: ${WIDGET_IN_CALLOUT}`);
        }
        inner.push(lines[i]);
      }
      if (!closed) throw new Error(`${ctx}: callout ":::${kind}" was never closed`);
      flush();
      blocks.push({
        kind: 'callout',
        tone: kind,
        title,
        html: marked.parse(inner.join('\n').trim()),
      });
      continue;
    }

    buffer.push(line);
  }
  flush();
  return blocks;
}

/* References ------------------------------------------------------------- */

const BIB_FILE = path.join(CONTENT_DIR, 'bibliography.yaml');
// BIBLIOGRAPHY.md §1–§6.
const BIB_SECTIONS = new Set(['textbook', 'note', 'standard', 'datasheet', 'web', 'es']);
const BIB_TEXT_FIELDS = [
  'authors',
  'title',
  'container',
  'edition',
  'publisher',
  'year',
  'identifier',
  'url',
];
// `modules` and `comment` are editorial bookkeeping: validated, never shipped.
const BIB_KEYS = new Set([
  'section',
  'lang',
  'es',
  'titleStyle',
  'modules',
  'comment',
  ...BIB_TEXT_FIELDS,
]);
// Sections whose titles default to italics; the rest default to quotes.
// `titleStyle:` overrides it, e.g. a book or course listed under note/web.
const ITALIC_SECTIONS = new Set(['textbook', 'standard', 'datasheet', 'es']);
const TITLE_STYLES = new Set(['italic', 'quoted']);
const REF_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Loads and validates `content/bibliography.yaml`. A missing file is an empty
 * bibliography, so any lesson that cites something then fails.
 * Returns a Map of id -> entry (without the bookkeeping `modules` and `comment` fields).
 */
async function loadBibliography() {
  const bib = new Map();
  if (!existsSync(BIB_FILE)) return bib;

  const file = 'content/bibliography.yaml';
  let raw;
  try {
    raw = matter.engines.yaml.parse(await readFile(BIB_FILE, 'utf8'));
  } catch (err) {
    throw new Error(`${file}: invalid YAML: ${err.message}`);
  }
  if (raw === null || raw === undefined) return bib;
  if (!isPlainObject(raw)) throw new Error(`${file}: must be a mapping of id -> entry`);

  for (const [id, data] of Object.entries(raw)) {
    const ctx = `${file}/${id}`;
    if (!REF_ID_RE.test(id)) throw new Error(`${ctx}: id must be kebab-case (a-z, 0-9, -)`);
    if (!isPlainObject(data)) throw new Error(`${ctx}: entry must be a mapping`);

    const unknown = Object.keys(data).filter((k) => !BIB_KEYS.has(k));
    if (unknown.length) {
      throw new Error(
        `${ctx}: unknown key(s) ${unknown.map((k) => `"${k}"`).join(', ')}; allowed: ${[...BIB_KEYS].join(', ')}`,
      );
    }
    if (!BIB_SECTIONS.has(data.section)) {
      throw new Error(
        `${ctx}: section must be one of ${[...BIB_SECTIONS].join(' | ')} (got ${JSON.stringify(data.section)})`,
      );
    }

    const entry = { id, section: data.section };
    for (const field of BIB_TEXT_FIELDS) {
      const value = data[field];
      if (value === undefined || value === null) continue;
      // YAML reads an unquoted 2015 as a number; accept it as text.
      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new Error(`${ctx}: "${field}" must be a string`);
      }
      const text = String(value).trim();
      if (text) entry[field] = text;
    }
    if (!entry.title) throw new Error(`${ctx}: missing required field "title"`);
    if (entry.url && !(/^https?:\/\/\S+$/.test(entry.url) && URL.canParse(entry.url))) {
      throw new Error(`${ctx}: url must be an absolute http(s) URL`);
    }

    // An explicit `null` (`titleStyle:` with no value) means "use the default".
    if (
      data.titleStyle !== undefined &&
      data.titleStyle !== null &&
      !TITLE_STYLES.has(data.titleStyle)
    ) {
      throw new Error(
        `${ctx}: titleStyle must be italic or quoted (got ${JSON.stringify(data.titleStyle)})`,
      );
    }
    entry.titleStyle =
      data.titleStyle ?? (ITALIC_SECTIONS.has(entry.section) ? 'italic' : 'quoted');

    const lang = data.lang ?? 'en';
    if (lang !== 'en' && lang !== 'es') {
      throw new Error(`${ctx}: lang must be en or es (got ${JSON.stringify(lang)})`);
    }
    // §6 holds exactly the Spanish-language works.
    if ((entry.section === 'es') !== (lang === 'es')) {
      throw new Error(
        `${ctx}: section: es and lang: es go together (got section: ${entry.section}, lang: ${lang})`,
      );
    }
    entry.lang = lang;

    if (data.es !== undefined && data.es !== null) {
      if (typeof data.es !== 'string' || !data.es) throw new Error(`${ctx}: "es" must be an id`);
      if (lang === 'es') {
        throw new Error(
          `${ctx}: es: is for the Spanish edition of an English work; this entry is already lang: es`,
        );
      }
      entry.es = data.es;
    }
    if (data.modules !== undefined && data.modules !== null) {
      if (!Array.isArray(data.modules)) throw new Error(`${ctx}: "modules" must be a list`);
      data.modules.forEach((m, index) => {
        if (typeof m !== 'string' || !m.trim()) {
          throw new Error(
            `${ctx}: modules[${index}] must be a module id string (got ${JSON.stringify(m)})`,
          );
        }
      });
    }
    if (data.comment !== undefined && data.comment !== null && typeof data.comment !== 'string') {
      throw new Error(`${ctx}: "comment" must be a string`);
    }

    bib.set(id, entry);
  }

  // Alternates are checked once every id is known.
  for (const entry of bib.values()) {
    if (!entry.es) continue;
    const ctx = `${file}/${entry.id}`;
    const alt = bib.get(entry.es);
    if (!alt) throw new Error(`${ctx}: es: "${entry.es}" is not an id in the bibliography`);
    if (alt.id === entry.id) throw new Error(`${ctx}: es: points at the entry itself`);
    if (alt.lang !== 'es') {
      throw new Error(`${ctx}: es: "${entry.es}" must be a Spanish-language entry (lang: es)`);
    }
  }

  return bib;
}

/** A bibliography entry as shipped to the browser (no bookkeeping fields). */
function publicEntry(entry) {
  const { es, ...rest } = entry;
  return rest;
}

/**
 * Validates a lesson's `references:` and resolves each id against the
 * bibliography. ES lessons also carry the `es:` alternate edition.
 */
function resolveReferences(value, bib, lang, ctx) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error(`${ctx}: references: must be a list`);

  const seen = new Set();
  return value.map((item, index) => {
    const where = `${ctx}: references[${index}]`;
    let id;
    let note;
    if (typeof item === 'string') {
      id = item;
    } else if (isPlainObject(item)) {
      const extra = Object.keys(item).filter((k) => k !== 'id' && k !== 'note');
      if (extra.length) {
        throw new Error(`${where}: unknown key(s) ${extra.join(', ')}; allowed: id, note`);
      }
      id = item.id;
      if (item.note !== undefined && item.note !== null) {
        if (typeof item.note !== 'string' || !item.note.trim()) {
          throw new Error(`${where}: note must be non-empty text`);
        }
        note = item.note.trim();
      }
    } else {
      throw new Error(`${where}: must be an id or { id, note }`);
    }
    if (typeof id !== 'string' || !id.trim()) throw new Error(`${where}: missing id`);
    id = id.trim();

    const entry = bib.get(id);
    if (!entry) {
      throw new Error(`${ctx}: unknown reference id "${id}" (not in content/bibliography.yaml)`);
    }
    if (seen.has(id)) throw new Error(`${ctx}: reference id "${id}" is listed twice`);
    seen.add(id);

    const ref = publicEntry(entry);
    if (note) ref.note = note;
    if (lang === 'es' && entry.es) ref.es = publicEntry(bib.get(entry.es));
    return ref;
  });
}

function requireField(data, field, ctx) {
  const value = data[field];
  if (value === undefined || value === null || value === '') {
    throw new Error(`${ctx}: missing required front-matter field "${field}"`);
  }
  return value;
}

async function readModule(lang, moduleId, bib) {
  const dir = path.join(CONTENT_DIR, lang, moduleId);
  const modulePath = path.join(dir, '_module.md');
  if (!existsSync(modulePath)) throw new Error(`${lang}/${moduleId}: no _module.md`);

  const parsed = matter(await readFile(modulePath, 'utf8'));
  const ctx = `${lang}/${moduleId}/_module.md`;
  if (parsed.data['references'] !== undefined) {
    throw new Error(`${ctx}: references: belongs in lessons, not in _module.md`);
  }
  const meta = {
    id: moduleId,
    number: moduleId.split('-')[0],
    slug: String(requireField(parsed.data, 'slug', ctx)),
    title: String(requireField(parsed.data, 'title', ctx)),
    summary: String(requireField(parsed.data, 'summary', ctx)),
    intro: parsed.content.trim() ? marked.parse(parsed.content.trim()) : '',
    lessons: [],
  };

  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') && f !== '_module.md').sort();

  for (const file of files) {
    const lessonId = file.replace(/\.md$/, '');
    const lessonCtx = `${lang}/${moduleId}/${file}`;
    const source = await readFile(path.join(dir, file), 'utf8');
    const lesson = matter(source);
    const frontMatterLines = source.split(/\r?\n/).length - lesson.content.split(/\r?\n/).length;
    const blocks = toBlocks(lesson.content, `content/${lessonCtx}`, frontMatterLines);
    const minutes = Number(lesson.data['minutes'] ?? 0);

    meta.lessons.push({
      id: lessonId,
      slug: String(requireField(lesson.data, 'slug', lessonCtx)),
      title: String(requireField(lesson.data, 'title', lessonCtx)),
      summary: String(requireField(lesson.data, 'summary', lessonCtx)),
      minutes: Number.isFinite(minutes) && minutes > 0 ? minutes : 5,
      widgets: blocks.filter((b) => b.kind === 'widget').map((b) => b.type),
      blocks,
      references: resolveReferences(lesson.data['references'], bib, lang, lessonCtx),
    });
  }

  return meta;
}

async function buildLang(lang, bib) {
  const langDir = path.join(CONTENT_DIR, lang);
  const moduleIds = (await readdir(langDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const modules = [];
  for (const id of moduleIds) modules.push(await readModule(lang, id, bib));

  // Emit one TS module per lesson; the index keeps metadata only.
  const loaders = [];
  /** `{moduleId}/{lessonId}` -> cited ids, for the EN/ES cross-check. */
  const citations = new Map();
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      citations.set(
        `${mod.id}/${lesson.id}`,
        lesson.references.map((r) => r.id),
      );
      const file = `${lang}.${mod.id}.${lesson.id}`;
      await writeFile(
        path.join(LESSON_DIR, `${file}.ts`),
        `// GENERATED from content/${lang}/${mod.id}/${lesson.id}.md — do not edit by hand.\n` +
          `import type { Lesson } from '../../core/content.types';\n\n` +
          `const lesson: Lesson = ${JSON.stringify(
            {
              lang,
              moduleId: mod.id,
              moduleSlug: mod.slug,
              moduleTitle: mod.title,
              id: lesson.id,
              slug: lesson.slug,
              title: lesson.title,
              summary: lesson.summary,
              minutes: lesson.minutes,
              widgets: lesson.widgets,
              blocks: lesson.blocks,
              references: lesson.references,
            },
            null,
            2,
          )};\n\nexport default lesson;\n`,
      );
      loaders.push(`  '${lang}/${mod.slug}/${lesson.slug}': () => import('./lessons/${file}'),`);
    }
  }

  return {
    loaders,
    citations,
    lang,
    modules: modules.map((mod) => ({
      id: mod.id,
      number: mod.number,
      slug: mod.slug,
      title: mod.title,
      summary: mod.summary,
      intro: mod.intro,
      lessons: mod.lessons.map(({ blocks, references, ...rest }) => rest),
    })),
  };
}

/** Static hosting means nothing else is going to produce this for us. */
async function writeSitemap(curricula) {
  const urls = [`${ORIGIN}/`];
  for (const lang of LANGS) {
    urls.push(`${ORIGIN}/${lang}`);
    for (const mod of curricula[lang].modules) {
      urls.push(`${ORIGIN}/${lang}/${mod.slug}`);
      for (const lesson of mod.lessons) {
        urls.push(`${ORIGIN}/${lang}/${mod.slug}/${lesson.slug}`);
      }
    }
  }
  const body = urls
    .map((url) => `  <url><loc>${url}</loc><changefreq>weekly</changefreq></url>`)
    .join('\n');
  await mkdir(path.join(ROOT, 'public'), { recursive: true });
  await writeFile(
    path.join(ROOT, 'public', 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  );
}

async function main() {
  widgetSchema = readWidgetSchema();
  ({ parseValue } = await loadFormat());

  await rm(GEN_DIR, { recursive: true, force: true });
  await mkdir(LESSON_DIR, { recursive: true });

  const bib = await loadBibliography();
  const curricula = {};
  const citations = {};
  const loaders = [];
  for (const lang of LANGS) {
    const built = await buildLang(lang, bib);
    loaders.push(...built.loaders);
    citations[lang] = built.citations;
    delete built.loaders;
    delete built.citations;
    curricula[lang] = built;
  }

  // Both languages must describe the same skeleton, or the language switcher
  // has nowhere to send the reader.
  const [a, b] = LANGS;
  const idsA = curricula[a].modules.map((m) => m.id).join(',');
  const idsB = curricula[b].modules.map((m) => m.id).join(',');
  if (idsA !== idsB) {
    throw new Error(`module ids differ between "${a}" and "${b}":\n  ${idsA}\n  ${idsB}`);
  }
  for (const mod of curricula[a].modules) {
    const other = curricula[b].modules.find((m) => m.id === mod.id);
    const lessonsA = mod.lessons.map((l) => l.id).join(',');
    const lessonsB = other.lessons.map((l) => l.id).join(',');
    if (lessonsA !== lessonsB) {
      throw new Error(
        `lesson ids differ in module ${mod.id}:\n  ${a}: ${lessonsA}\n  ${b}: ${lessonsB}`,
      );
    }
  }

  // A translation cites the same sources as its original (order may differ).
  for (const [key, citedA] of citations[a]) {
    const setA = [...citedA].sort().join(', ');
    const setB = [...(citations[b].get(key) ?? [])].sort().join(', ');
    if (setA !== setB) {
      throw new Error(
        `${key}: references differ between "${a}" and "${b}":\n  ${a}: ${setA || '(none)'}\n  ${b}: ${setB || '(none)'}`,
      );
    }
  }

  await writeFile(
    path.join(GEN_DIR, 'curriculum.ts'),
    `// GENERATED by tools/build-content.mjs — do not edit by hand.\n` +
      `// Run \`pnpm content\` after changing anything under content/.\n\n` +
      `import type { Curriculum, Lang } from '../core/content.types';\n\n` +
      `export const CURRICULUM: Record<Lang, Curriculum> = ${JSON.stringify(curricula, null, 2)};\n`,
  );

  await writeFile(
    path.join(GEN_DIR, 'loaders.ts'),
    `// GENERATED by tools/build-content.mjs — do not edit by hand.\n\n` +
      `import type { Lesson } from '../core/content.types';\n\n` +
      `/** Keyed by \`{lang}/{moduleSlug}/{lessonSlug}\`. */\n` +
      `export const LESSON_LOADERS: Record<string, () => Promise<{ default: Lesson }>> = {\n` +
      `${loaders.join('\n')}\n};\n`,
  );

  await writeSitemap(curricula);

  const lessonCount = curricula[a].modules.reduce((n, m) => n + m.lessons.length, 0);
  console.log(
    `content: ${curricula[a].modules.length} modules, ${lessonCount} lessons x ${LANGS.length} languages`,
  );
}

main().catch((err) => {
  console.error(`\ncontent build failed: ${err.message}\n`);
  process.exit(1);
});
