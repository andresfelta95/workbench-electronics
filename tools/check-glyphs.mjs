/**
 * Glyph-coverage check for the pixel-art instruments (ROADMAP A7/A8,
 * docs/DESIGN-PIXEL-ART.md §Glyph coverage).
 *
 *   node tools/check-glyphs.mjs      (exit 1 on any violation)
 *
 * Every character that can be drawn in `--pix-font` must be drawn by a face
 * the design allows, using the served coverage in tools/glyph-coverage.json
 * (regenerate with tools/glyph-coverage-gen.mjs; no network is needed here):
 *
 *   - VT323 draws it, or
 *   - it is Greek (U+0370–U+03FF) and JetBrains Mono draws it, or
 *   - it is ∥ (U+2225) or an arrow (U+2190–U+21FF) and Iosevka Charon Mono
 *     draws it.
 *
 * Visible text also follows the section's guidance: `·` rather than `×`, and
 * `R1` rather than `R₁` (no Unicode subscripts). Spoken-only text (accessible
 * names) is not drawn, so it is exempt and keeps `×`.
 *
 * What is checked:
 *   1. src/app/i18n/ui.ts, every `widget.*` string in every language. A key is
 *      spoken-only when its name ends in `Spoken`/`Label` or its doc comment in
 *      `UiStrings` says "spoken".
 *   2. Every .ts file under src/app/widgets, src/app/ui and src/app/schematic:
 *      the component template's (inline or `templateUrl`) text, attribute
 *      values and string literals in bindings and `@let`s, and the string literals in the class and module code. Spoken
 *      bindings are `aria-*` attributes and the inputs in SPOKEN_INPUTS; a
 *      class member read only from spoken bindings is spoken too.
 *   3. Everything src/app/core/format.ts can emit (digits, separators, SI
 *      prefixes, %, —) in both locales, by running it over a range of values.
 *   4. Text-valued `::widget` attributes in content/** (numeric ones are parsed,
 *      never drawn), as classified by tools/widget-props.mjs.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import * as ng from '@angular/compiler';
import { fenceStep, loadFormat, readWidgetSchema } from './widget-props.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COVERAGE_FILE = 'tools/glyph-coverage.json';
const PIXEL_SCSS = 'src/styles/_pixel.scss';
const UI_FILE = 'src/app/i18n/ui.ts';
const CODE_DIRS = ['src/app/widgets', 'src/app/ui', 'src/app/schematic'];

/** Component inputs that only ever become an accessible name, never drawn text.
 *  Each is verified to exist below, so a rename fails here instead of silently
 *  turning the exemption off (or on) somewhere else. */
const SPOKEN_INPUTS = [
  { selector: 'app-panel', input: 'headingLabel' },
  { selector: 'sch-canvas', input: 'label' },
];

const rel = (file) => path.relative(ROOT, file).split(path.sep).join('/');
const cp = (ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

/* Coverage and policy ---------------------------------------------------- */

function loadCoverage() {
  const data = JSON.parse(readFileSync(path.join(ROOT, COVERAGE_FILE), 'utf8'));
  // The stack must be the one the skin declares, in the same order.
  const scss = readFileSync(path.join(ROOT, PIXEL_SCSS), 'utf8');
  const decl = /--pix-font:\s*([^;]+);/.exec(scss)?.[1];
  if (!decl) throw new Error(`${PIXEL_SCSS}: no --pix-font declaration`);
  const stack = [...decl.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const families = Object.keys(data.families ?? {});
  if (
    stack.join('|') !== 'VT323|JetBrains Mono|Iosevka Charon Mono' ||
    families.join('|') !== stack.join('|')
  ) {
    throw new Error(
      `--pix-font is ${stack.join(', ')} but ${COVERAGE_FILE} has ${families.join(', ')} and this check ` +
        `encodes the DESIGN-PIXEL-ART.md roles of VT323, JetBrains Mono and Iosevka Charon Mono; ` +
        `update the design, tools/glyph-coverage-gen.mjs and this check together`,
    );
  }
  const sets = {};
  for (const [name, fam] of Object.entries(data.families)) {
    const set = new Set();
    for (const part of fam.coverage.split(',')) {
      const [a, b = a] = part.split('-').map((h) => parseInt(h, 16));
      for (let c = a; c <= b; c++) set.add(c);
    }
    sets[name] = set;
  }
  return sets;
}

/** Filled in by main(), so a bad coverage file or font stack is a clean error. */
let VT, JB, IO;

const isGreek = (c) => c >= 0x370 && c <= 0x3ff;
const isIosevkaAllowed = (c) => c === 0x2225 || (c >= 0x2190 && c <= 0x21ff);
const isSubscript = (c) => c >= 0x2080 && c <= 0x209c;

/** Why `ch` may not appear in drawn instrument text, or null if it may. */
function verdict(ch) {
  const c = ch.codePointAt(0);
  if (ch === '\n' || ch === '\r' || ch === '\t') return null;
  if (c === 0xd7)
    return 'visible text uses "·" (U+00B7) for multiplication, not "×"; keep "×" for spoken text only';
  if (isSubscript(c)) return 'visible text writes R1, V0 with plain digits, not Unicode subscripts';
  if (VT.has(c)) return null;
  if (isGreek(c) && JB.has(c)) return null;
  if (isIosevkaAllowed(c) && IO.has(c)) return null;
  const has = [
    VT.has(c) && 'VT323',
    JB.has(c) && 'JetBrains Mono',
    IO.has(c) && 'Iosevka Charon Mono',
  ].filter(Boolean);
  return (
    `not covered by the --pix-font stack as DESIGN-PIXEL-ART.md §Glyph coverage allows it ` +
    `(VT323; JetBrains Mono for Greek only; Iosevka Charon Mono for ∥ and arrows only)` +
    (has.length ? `; served by ${has.join(', ')}` : '; served by none of them')
  );
}

const violations = [];
let checked = 0;

/** Checks drawn text. `line` is the 1-based line of the text's first char. */
function check(text, file, line, what) {
  checked++;
  let l = line;
  for (const ch of text) {
    if (ch === '\n') l++;
    const why = verdict(ch);
    if (why) violations.push(`${file}:${l}: "${ch}" ${cp(ch)} in ${what}: ${why}`);
  }
}

/* TypeScript helpers ----------------------------------------------------- */

function parseTs(file) {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}
const lineOf = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;
const nameOf = (n) => (n && (ts.isIdentifier(n) || ts.isStringLiteralLike(n)) ? n.text : undefined);

function walk(node, visit) {
  if (visit(node) === false) return;
  ts.forEachChild(node, (child) => walk(child, visit));
}

/** Text pieces of a string-ish literal: [text, pos]. */
function literalPieces(node, sf) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return [[node.text, node.getStart(sf)]];
  }
  if (ts.isTemplateExpression(node)) {
    return [
      [node.head.text, node.head.getStart(sf)],
      ...node.templateSpans.map((s) => [s.literal.text, s.literal.getStart(sf)]),
    ];
  }
  return [];
}

/* 1. ui.ts --------------------------------------------------------------- */

function checkUi() {
  const sf = parseTs(path.join(ROOT, UI_FILE));
  const spoken = new Set();
  let iface = false;
  walk(sf, (node) => {
    if (!ts.isInterfaceDeclaration(node) || node.name.text !== 'UiStrings') return;
    const widget = node.members.find((m) => nameOf(m.name) === 'widget');
    if (!widget?.type || !ts.isTypeLiteralNode(widget.type)) return;
    iface = true;
    for (const m of widget.type.members) {
      const key = nameOf(m.name);
      const doc = ts
        .getJSDocCommentsAndTags(m)
        .map((d) => d.getText(sf))
        .join(' ');
      if (/(Spoken|Label)$/.test(key) || /spoken/i.test(doc)) spoken.add(key);
    }
  });
  if (!iface) throw new Error(`${UI_FILE}: no \`widget: { … }\` in interface UiStrings`);

  let langs = 0;
  walk(sf, (node) => {
    if (
      !ts.isVariableDeclaration(node) ||
      node.type?.getText(sf) !== 'UiStrings' ||
      !node.initializer ||
      !ts.isObjectLiteralExpression(node.initializer)
    ) {
      return;
    }
    const lang = node.name.getText(sf);
    const widget = node.initializer.properties.find((p) => nameOf(p.name) === 'widget');
    if (
      !widget ||
      !ts.isPropertyAssignment(widget) ||
      !ts.isObjectLiteralExpression(widget.initializer)
    ) {
      throw new Error(`${UI_FILE}: ${lang}.widget is not an object literal`);
    }
    langs++;
    for (const p of widget.initializer.properties) {
      const key = nameOf(p.name);
      if (spoken.has(key) || !ts.isPropertyAssignment(p)) continue;
      walk(p.initializer, (n) => {
        for (const [text, pos] of literalPieces(n, sf)) {
          check(text, UI_FILE, lineOf(sf, pos), `${lang}.widget.${key}`);
        }
      });
    }
  });
  if (langs < 2)
    throw new Error(`${UI_FILE}: expected a UiStrings object per language, found ${langs}`);
}

/* 2. Components ---------------------------------------------------------- */

function listTs(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listTs(p));
    else if (e.name.endsWith('.ts') && !e.name.endsWith('.spec.ts')) out.push(p);
  }
  return out;
}

/** The object literal of each @Component/@Directive decorator in a file. */
function decorators(sf) {
  const found = [];
  walk(sf, (node) => {
    if (
      ts.isDecorator(node) &&
      ts.isCallExpression(node.expression) &&
      /^(Component|Directive)$/.test(node.expression.expression.getText(sf)) &&
      node.expression.arguments[0] &&
      ts.isObjectLiteralExpression(node.expression.arguments[0])
    ) {
      found.push({
        decorator: node,
        meta: node.expression.arguments[0],
        component: node.expression.expression.getText(sf) === 'Component',
      });
    }
  });
  return found;
}

const metaProp = (meta, key) =>
  meta.properties.find((p) => ts.isPropertyAssignment(p) && nameOf(p.name) === key)?.initializer;

/** Matches a template element against a simple selector: tag, [attr] or tag[attr]. */
function matches(selector, el) {
  const m = /^([\w:-]*)(?:\[([\w-]+)\])?$/.exec(selector);
  if (!m) return false;
  const tag = el.name.replace(/^:svg:/, 'svg:');
  if (m[1] && m[1] !== tag) return false;
  if (m[2] && !el.attributes.some((a) => a.name === m[2])) return false;
  return Boolean(m[1] || m[2]);
}

function verifySpokenInputs(files) {
  for (const { selector, input } of SPOKEN_INPUTS) {
    let ok = false;
    for (const file of files) {
      const sf = parseTs(file);
      for (const { decorator, meta } of decorators(sf)) {
        const sel = metaProp(meta, 'selector');
        if (!sel || !ts.isStringLiteralLike(sel) || sel.text !== selector) continue;
        const cls = decorator.parent;
        ok ||= cls.members.some(
          (m) =>
            ts.isPropertyDeclaration(m) &&
            nameOf(m.name) === input &&
            m.initializer &&
            /^(input|input\.required)\b/.test(m.initializer.getText(sf)),
        );
      }
    }
    if (!ok) {
      throw new Error(
        `SPOKEN_INPUTS in tools/check-glyphs.mjs names ${selector}.${input}, but no such input exists in ${CODE_DIRS.join(', ')}`,
      );
    }
  }
}

/**
 * Walks a template. Calls `onText(text, offset, what)` for drawn text, and
 * fills `spokenReads` / `visibleReads` with the component members each kind
 * of binding reads.
 */
function scanTemplate(template, file, onText, spokenReads, visibleReads) {
  const parsed = ng.parseTemplate(template, file, { preserveWhitespaces: false });
  if (parsed.errors?.length) {
    throw new Error(
      `${rel(file)}: template does not parse: ${parsed.errors[0].msg ?? parsed.errors[0]}`,
    );
  }

  class Expr extends ng.RecursiveAstVisitor {
    constructor(spoken, what) {
      super();
      this.spoken = spoken;
      this.what = what;
    }
    visitLiteralPrimitive(ast) {
      if (typeof ast.value === 'string' && !this.spoken)
        onText(ast.value, ast.sourceSpan.start, this.what);
    }
    visitTemplateLiteralElement(ast) {
      if (!this.spoken) onText(ast.text, ast.sourceSpan.start, this.what);
    }
    visitPropertyRead(ast, ctx) {
      // `foo()` / `this.foo()`: a member of the component (ThisReceiver extends ImplicitReceiver).
      if (ast.receiver instanceof ng.ImplicitReceiver) {
        (this.spoken ? spokenReads : visibleReads).add(ast.name);
      }
      return super.visitPropertyRead(ast, ctx);
    }
  }
  const expr = (value, spoken, what) => {
    const ast = value?.ast ?? value;
    if (ast && typeof ast.visit === 'function') ast.visit(new Expr(spoken, what));
  };

  const isSpoken = (el, name) =>
    /^aria-/.test(name) ||
    (el && SPOKEN_INPUTS.some((s) => s.input === name && matches(s.selector, el)));

  class Tmpl extends ng.TmplAstRecursiveVisitor {
    visitElement(el) {
      this.el = el;
      super.visitElement(el);
    }
    visitTemplate(t) {
      this.el = t;
      super.visitTemplate(t);
    }
    visitText(t) {
      onText(t.value, t.sourceSpan.start.offset, 'template text');
    }
    visitBoundText(t) {
      for (const s of t.value.ast.strings ?? [])
        onText(s, t.sourceSpan.start.offset, 'template text');
      expr(t.value, false, 'template interpolation');
    }
    visitTextAttribute(a) {
      if (!isSpoken(this.el, a.name))
        onText(a.value, a.sourceSpan.start.offset, `attribute ${a.name}`);
    }
    visitBoundAttribute(a) {
      expr(a.value, isSpoken(this.el, a.name), `binding [${a.keySpan?.toString() ?? a.name}]`);
    }
    visitBoundEvent(e) {
      expr(e.handler, true, 'event');
    }
    visitLetDeclaration(d) {
      // `@let x = '…'`: whatever it holds may be drawn, so it is checked as visible.
      expr(d.value, false, `@let ${d.name}`);
    }
    visitIfBlockBranch(b) {
      expr(b.expression, false, '@if');
      super.visitIfBlockBranch(b);
    }
    visitForLoopBlock(b) {
      expr(b.expression, false, '@for');
      super.visitForLoopBlock(b);
    }
    visitSwitchBlock(b) {
      expr(b.expression, false, '@switch');
      super.visitSwitchBlock(b);
    }
  }
  ng.tmplAstVisitAll(new Tmpl(), parsed.nodes);
}

function checkComponents() {
  const files = CODE_DIRS.flatMap((d) => listTs(path.join(ROOT, d)));
  verifySpokenInputs(files);

  for (const file of files) {
    const sf = parseTs(file);
    const name = rel(file);
    const spokenReads = new Set();
    const visibleReads = new Set();
    const skip = new Set(); // decorator metadata nodes handled (or ignored) here

    for (const { meta, component, decorator } of decorators(sf)) {
      skip.add(meta);
      const tpl = metaProp(meta, 'template');
      const url = metaProp(meta, 'templateUrl');
      if (!tpl && url) {
        // External template: same visitor, positions in the .html file.
        const htmlFile = ts.isStringLiteralLike(url) && path.resolve(path.dirname(file), url.text);
        if (!htmlFile || !existsSync(htmlFile)) {
          throw new Error(
            `${name}:${lineOf(sf, url.getStart(sf))}: templateUrl must be a string literal naming an existing file`,
          );
        }
        const html = readFileSync(htmlFile, 'utf8');
        const htmlName = rel(htmlFile);
        scanTemplate(
          html,
          htmlFile,
          (text, offset, what) =>
            check(text, htmlName, html.slice(0, offset).split('\n').length, what),
          spokenReads,
          visibleReads,
        );
        continue;
      }
      if (!tpl) {
        if (component) {
          throw new Error(
            `${name}:${lineOf(sf, decorator.getStart(sf))}: @Component has neither an inline template nor a templateUrl`,
          );
        }
        continue;
      }
      if (!ts.isNoSubstitutionTemplateLiteral(tpl) && !ts.isStringLiteral(tpl)) {
        throw new Error(`${name}:${lineOf(sf, tpl.getStart(sf))}: template must be a literal`);
      }
      const base = tpl.getStart(sf) + 1; // after the opening quote
      // With escapes in the source, offsets would shift: report the template's first line instead.
      const raw = sf.text.slice(base, tpl.getEnd() - 1);
      scanTemplate(
        tpl.text,
        file,
        (text, offset, what) => {
          const pos = raw === tpl.text ? base + offset : base;
          check(text, name, lineOf(sf, pos), what);
        },
        spokenReads,
        visibleReads,
      );
    }

    // Code literals, attributed to the member (or module-level declaration) they sit in.
    const spokenOnly = (member) => member && spokenReads.has(member) && !visibleReads.has(member);
    // `member` is the enclosing class member (for the spoken exemption);
    // `label` also names module-level declarations, for the message.
    const visit = (node, member, label) => {
      if (skip.has(node) || ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
      if (ts.isTypeNode(node) || ts.isRegularExpressionLiteral(node)) return;
      // this.props()['key'] and other element-access keys are code, not text.
      if (ts.isElementAccessExpression(node)) {
        visit(node.expression, member, label);
        return;
      }
      if (ts.isClassElement(node) && node.name) label = member = nameOf(node.name);
      else if (
        !member &&
        (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) &&
        node.name
      ) {
        label = node.name.getText(sf);
      }
      const pieces = literalPieces(node, sf);
      if (pieces.length) {
        if (!spokenOnly(member)) {
          for (const [text, pos] of pieces) check(text, name, lineOf(sf, pos), label ?? 'code');
        }
        if (ts.isTemplateExpression(node))
          node.templateSpans.forEach((s) => visit(s.expression, member, label));
        return;
      }
      ts.forEachChild(node, (child) => visit(child, member, label));
    };
    visit(sf, undefined, undefined);
  }
}

/* 3. Formatter output ---------------------------------------------------- */

async function checkFormatter() {
  const { formatSI, formatNumber, formatPercent } = await loadFormat();
  const values = [0, NaN, Infinity, -Infinity];
  for (let exp = -14; exp <= 11; exp++) {
    for (const m of [1, 1.234, 4.7, 9.995, 12.3456, 99.95, 123.456, 999.5, 1234.5678]) {
      values.push(m * 10 ** exp, -m * 10 ** exp);
    }
  }
  for (const lang of ['en', 'es']) {
    const seen = new Map();
    const note = (text, fn) => {
      for (const ch of text) if (!seen.has(ch)) seen.set(ch, `${fn} → "${text}"`);
    };
    for (const v of values) {
      note(formatSI(v, '', lang), 'formatSI');
      for (const d of [0, 1, 2, 4]) {
        note(formatNumber(v, lang, d), 'formatNumber');
        note(formatPercent(v, lang, d), 'formatPercent');
      }
    }
    for (const [ch, example] of seen)
      check(ch, 'src/app/core/format.ts', 1, `formatter output (${lang}, e.g. ${example})`);
  }
}

/* 4. Text-valued widget attributes in content ---------------------------- */

function checkContent() {
  const schema = readWidgetSchema();
  const dir = path.join(ROOT, 'content');
  const files = [];
  const list = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) list(p);
      else if (e.name.endsWith('.md')) files.push(p);
    }
  };
  if (existsSync(dir)) list(dir);
  for (const file of files) {
    let fence = null;
    let callout = false;
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .forEach((line, i) => {
        const wasFenced = fence;
        fence = fenceStep(line, fence);
        if (wasFenced || fence) return;
        // Callout open/close as in build-content.mjs (CALLOUT_KINDS there).
        if (!callout && /^:::(note|warning|key|safety)\b/.test(line)) {
          callout = true;
          return;
        }
        if (callout && /^:::\s*$/.test(line)) {
          callout = false;
          return;
        }
        if (callout) {
          if (line.trim().startsWith('::widget')) {
            violations.push(
              `${rel(file)}:${i + 1}: ::widget directives are not allowed inside a :::callout; close the callout first`,
            );
          }
          return;
        }
        const m = /^::widget\{(.*)\}\s*$/.exec(line);
        if (!m) {
          // Same rule as build-content.mjs: a near-miss would render as text unchecked.
          if (line.trim().startsWith('::widget')) {
            violations.push(
              `${rel(file)}:${i + 1}: malformed ::widget directive; write it unindented on a line of its own, exactly as ::widget{type="…" name="value" …}`,
            );
          }
          return;
        }
        const attrs = Object.fromEntries(
          [...m[1].matchAll(/([A-Za-z_][\w-]*)="([^"]*)"/g)].map((a) => [a[1], a[2]]),
        );
        const props = schema[attrs.type]?.props;
        for (const [key, value] of Object.entries(attrs)) {
          if (key !== 'type' && props?.get(key) === 'text') {
            check(value, rel(file), i + 1, `::widget ${attrs.type} ${key}=`);
          }
        }
      });
  }
}

/* Main ------------------------------------------------------------------- */

async function main() {
  const cover = loadCoverage();
  VT = cover['VT323'];
  JB = cover['JetBrains Mono'];
  IO = cover['Iosevka Charon Mono'];
  checkUi();
  checkComponents();
  await checkFormatter();
  checkContent();
  if (violations.length) {
    console.error(
      `\nglyph check failed: ${violations.length} problem(s) (see docs/DESIGN-PIXEL-ART.md §Glyph coverage)\n`,
    );
    for (const v of violations) console.error(`  ${v}`);
    console.error('');
    process.exit(1);
  }
  console.log(
    `glyphs: ${checked} instrument strings checked against ${COVERAGE_FILE}, all covered`,
  );
}

main().catch((err) => {
  console.error(`\nglyph check failed: ${err.message}\n`);
  process.exit(1);
});
