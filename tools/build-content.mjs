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
 * Callouts use a fenced directive:
 *
 *   :::note Optional title
 *   body markdown
 *   :::
 */
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const GEN_DIR = path.join(ROOT, 'src', 'app', 'content-generated');
const LESSON_DIR = path.join(GEN_DIR, 'lessons');

const LANGS = ['en', 'es'];
const ORIGIN = 'https://electronics.paisbru.com';
const CALLOUT_KINDS = new Set(['note', 'warning', 'key', 'safety']);

marked.setOptions({ gfm: true, breaks: false });

const WIDGET_RE = /^::widget\{(.*)\}\s*$/;
const CALLOUT_OPEN_RE = /^:::(\w+)\s*(.*)$/;
const CALLOUT_CLOSE_RE = /^:::\s*$/;

function parseAttrs(raw) {
  const attrs = {};
  const re = /([A-Za-z_][\w-]*)="([^"]*)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) attrs[m[1]] = m[2];
  return attrs;
}

/** Split raw markdown into ordered blocks the Angular renderer can walk. */
function toBlocks(markdown, ctx) {
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
    if (widget) {
      const attrs = parseAttrs(widget[1]);
      if (!attrs['type']) throw new Error(`${ctx}: ::widget without a type= attribute`);
      flush();
      const { type, ...props } = attrs;
      blocks.push({ kind: 'widget', type, props });
      continue;
    }

    const callout = CALLOUT_OPEN_RE.exec(line);
    if (callout && CALLOUT_KINDS.has(callout[1])) {
      const kind = callout[1];
      const title = callout[2].trim();
      const inner = [];
      let closed = false;
      for (i = i + 1; i < lines.length; i++) {
        if (CALLOUT_CLOSE_RE.test(lines[i])) {
          closed = true;
          break;
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

function requireField(data, field, ctx) {
  const value = data[field];
  if (value === undefined || value === null || value === '') {
    throw new Error(`${ctx}: missing required front-matter field "${field}"`);
  }
  return value;
}

async function readModule(lang, moduleId) {
  const dir = path.join(CONTENT_DIR, lang, moduleId);
  const modulePath = path.join(dir, '_module.md');
  if (!existsSync(modulePath)) throw new Error(`${lang}/${moduleId}: no _module.md`);

  const parsed = matter(await readFile(modulePath, 'utf8'));
  const ctx = `${lang}/${moduleId}/_module.md`;
  const meta = {
    id: moduleId,
    number: moduleId.split('-')[0],
    slug: String(requireField(parsed.data, 'slug', ctx)),
    title: String(requireField(parsed.data, 'title', ctx)),
    summary: String(requireField(parsed.data, 'summary', ctx)),
    intro: parsed.content.trim() ? marked.parse(parsed.content.trim()) : '',
    lessons: [],
  };

  const files = (await readdir(dir))
    .filter((f) => f.endsWith('.md') && f !== '_module.md')
    .sort();

  for (const file of files) {
    const lessonId = file.replace(/\.md$/, '');
    const lessonCtx = `${lang}/${moduleId}/${file}`;
    const lesson = matter(await readFile(path.join(dir, file), 'utf8'));
    const blocks = toBlocks(lesson.content, lessonCtx);
    const minutes = Number(lesson.data['minutes'] ?? 0);

    meta.lessons.push({
      id: lessonId,
      slug: String(requireField(lesson.data, 'slug', lessonCtx)),
      title: String(requireField(lesson.data, 'title', lessonCtx)),
      summary: String(requireField(lesson.data, 'summary', lessonCtx)),
      minutes: Number.isFinite(minutes) && minutes > 0 ? minutes : 5,
      widgets: blocks.filter((b) => b.kind === 'widget').map((b) => b.type),
      blocks,
    });
  }

  return meta;
}

async function buildLang(lang) {
  const langDir = path.join(CONTENT_DIR, lang);
  const moduleIds = (await readdir(langDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const modules = [];
  for (const id of moduleIds) modules.push(await readModule(lang, id));

  // Emit one TS module per lesson; the index keeps metadata only.
  const loaders = [];
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
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
            },
            null,
            2,
          )};\n\nexport default lesson;\n`,
      );
      loaders.push(
        `  '${lang}/${mod.slug}/${lesson.slug}': () => import('./lessons/${file}'),`,
      );
    }
  }

  return {
    loaders,
    lang,
    modules: modules.map((mod) => ({
      id: mod.id,
      number: mod.number,
      slug: mod.slug,
      title: mod.title,
      summary: mod.summary,
      intro: mod.intro,
      lessons: mod.lessons.map(({ blocks, ...rest }) => rest),
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
  await rm(GEN_DIR, { recursive: true, force: true });
  await mkdir(LESSON_DIR, { recursive: true });

  const curricula = {};
  const loaders = [];
  for (const lang of LANGS) {
    const built = await buildLang(lang);
    loaders.push(...built.loaders);
    delete built.loaders;
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
