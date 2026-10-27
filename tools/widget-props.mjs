/**
 * What each `::widget{type="…"}` can be given, read from the Angular source so
 * it cannot drift from the code (ROADMAP A7). Shared by build-content.mjs and
 * check-glyphs.mjs.
 *
 * - The registered types and their component files come from the object
 *   literal `WIDGETS` in src/app/lesson/widget-registry.ts: each key and the
 *   path in its `import('…')`.
 * - WidgetHost hands a widget its directive attributes as one string map, via
 *   `setInput('props', …)`. So a widget accepts directive attributes only if it
 *   declares `props = input(…)`, and the attributes it knows are the keys it
 *   reads from that map: `this.props()['key']`, or `this.props()[param]` inside
 *   a method whose call sites pass the key as a string literal
 *   (`this.ohms('r1', 1000)`). Any other way of reading `props()` is an error
 *   here, so a new pattern fails the build instead of silently passing every
 *   attribute.
 * - A key read through `parseValue(this.props()[…], …)` is numeric: its value
 *   must be one parseValue (src/app/core/format.ts) accepts, such as "10k".
 *   Any other key is text.
 *
 * Two consequences that can surprise:
 * - The number check needs the access to be parseValue's direct first
 *   argument. `parseValue(this.props()['x'] ?? '9', 9)` makes `x` a text prop,
 *   so a non-numeric value is no longer rejected; put the fallback in
 *   parseValue's second argument instead.
 * - Only the component's TypeScript is read. A key read only in the template
 *   (`props()['x']` in HTML) is not found, so a lesson that passes `x` fails
 *   the build with "has no prop". Read it in the class.
 *
 * The parse uses the TypeScript compiler API (already a devDependency).
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REGISTRY_FILE = 'src/app/lesson/widget-registry.ts';
const FORMAT_FILE = 'src/app/core/format.ts';

const rel = (file) => path.relative(ROOT, file).split(path.sep).join('/');

function parse(file) {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}

function where(sf, node) {
  const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
  return `${rel(sf.fileName)}:${line + 1}`;
}

function walk(node, visit) {
  visit(node);
  ts.forEachChild(node, (child) => walk(child, visit));
}

const propName = (name) =>
  name && (ts.isIdentifier(name) || ts.isStringLiteral(name)) ? name.text : undefined;

/** `{ type: absolute component file }` from widget-registry.ts. */
export function readRegistry() {
  const file = path.join(ROOT, REGISTRY_FILE);
  const sf = parse(file);
  let literal;
  walk(sf, (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(sf) === 'WIDGETS') {
      if (node.initializer && ts.isObjectLiteralExpression(node.initializer))
        literal = node.initializer;
    }
  });
  if (!literal) throw new Error(`${REGISTRY_FILE}: no \`WIDGETS = { … }\` object literal found`);

  const registry = {};
  for (const prop of literal.properties) {
    const type = ts.isPropertyAssignment(prop) ? propName(prop.name) : undefined;
    let spec;
    if (type) {
      walk(prop.initializer, (node) => {
        if (
          ts.isCallExpression(node) &&
          node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          spec = node.arguments[0].text;
        }
      });
    }
    if (!type || !spec) {
      throw new Error(`${where(sf, prop)}: expected \`'type': () => import('…')…\``);
    }
    const base = path.resolve(path.dirname(file), spec);
    const component = [`${base}.ts`, base].find((p) => existsSync(p));
    if (!component) throw new Error(`${where(sf, prop)}: ${spec} does not resolve to a .ts file`);
    registry[type] = component;
  }
  if (!Object.keys(registry).length) throw new Error(`${REGISTRY_FILE}: WIDGETS is empty`);
  return registry;
}

/** `this.props()` */
function isPropsCall(node) {
  return (
    ts.isCallExpression(node) &&
    node.arguments.length === 0 &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
    node.expression.name.text === 'props'
  );
}

/** True when `node` is the first argument of a `parseValue(…)` call. */
function isParsedNumber(node) {
  const parent = node.parent;
  return (
    ts.isCallExpression(parent) &&
    parent.arguments[0] === node &&
    ts.isIdentifier(parent.expression) &&
    parent.expression.text === 'parseValue'
  );
}

/**
 * `{ props: Map<key, 'number' | 'text'> }` for one component file, or
 * `{ props: null }` when it declares no `props` input.
 */
export function readWidgetProps(file) {
  const sf = parse(file);
  let declared = false;
  const keys = new Map();
  /** method name -> [{ index, kind, at }] for `this.props()[param]` inside it */
  const forwarded = new Map();
  const add = (key, kind) => {
    // A key read both ways is text-or-number; keep the weaker kind.
    keys.set(key, keys.get(key) === 'text' ? 'text' : kind);
  };

  walk(sf, (node) => {
    if (
      ts.isPropertyDeclaration(node) &&
      propName(node.name) === 'props' &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      /^(input|input\.required)$/.test(node.initializer.expression.getText(sf))
    ) {
      declared = true;
    }
    if (!isPropsCall(node)) return;

    const access = node.parent;
    if (!ts.isElementAccessExpression(access) || access.expression !== node) {
      throw new Error(
        `${where(sf, node)}: cannot tell which directive attributes this reads; ` +
          `read them as this.props()['key'] (see tools/widget-props.mjs)`,
      );
    }
    const kind = isParsedNumber(access) ? 'number' : 'text';
    const arg = access.argumentExpression;
    if (ts.isStringLiteralLike(arg)) {
      add(arg.text, kind);
      return;
    }
    // this.props()[key] where key is a parameter of the enclosing method.
    let fn = access.parent;
    while (fn && !ts.isMethodDeclaration(fn) && !ts.isFunctionLike(fn)) fn = fn.parent;
    const index =
      fn && ts.isIdentifier(arg)
        ? fn.parameters.findIndex((p) => p.name.getText(sf) === arg.text)
        : -1;
    if (!fn || !ts.isMethodDeclaration(fn) || index < 0) {
      throw new Error(
        `${where(sf, access)}: props key must be a string literal or a parameter of the enclosing method`,
      );
    }
    const name = propName(fn.name);
    forwarded.set(name, [...(forwarded.get(name) ?? []), { index, kind, at: where(sf, access) }]);
  });

  for (const [method, uses] of forwarded) {
    let calls = 0;
    walk(sf, (node) => {
      if (
        !ts.isCallExpression(node) ||
        !ts.isPropertyAccessExpression(node.expression) ||
        node.expression.expression.kind !== ts.SyntaxKind.ThisKeyword ||
        node.expression.name.text !== method
      ) {
        return;
      }
      for (const { index, kind } of uses) {
        const arg = node.arguments[index];
        if (!arg || !ts.isStringLiteralLike(arg)) {
          throw new Error(
            `${where(sf, node)}: this.${method}(…) must pass the props key as a string literal`,
          );
        }
        add(arg.text, kind);
      }
      calls++;
    });
    if (!calls) throw new Error(`${uses[0].at}: this.${method}(…) reads props but is never called`);
  }

  if (!declared) {
    if (keys.size)
      throw new Error(`${rel(file)}: reads this.props() but declares no props = input(…)`);
    return { props: null };
  }
  if (!keys.size) {
    throw new Error(
      `${rel(file)}: declares props = input(…) but no this.props()['key'] read was found; ` +
        `tools/widget-props.mjs cannot tell which attributes it accepts`,
    );
  }
  return { props: keys };
}

/** Every registered widget: `{ type: { file, props } }`. */
export function readWidgetSchema() {
  const schema = {};
  for (const [type, file] of Object.entries(readRegistry())) {
    schema[type] = { file: rel(file), ...readWidgetProps(file) };
  }
  return schema;
}

/**
 * The real src/app/core/format.ts, transpiled on the fly, so a numeric
 * attribute is checked by the same parseValue the widget runs and the glyph
 * check samples the same formatter the instruments use. It has only type
 * imports, so it runs standalone; a runtime import would fail loudly here.
 */
export async function loadFormat() {
  const out = ts.transpileModule(readFileSync(path.join(ROOT, FORMAT_FILE), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = await import(`data:text/javascript;base64,${Buffer.from(out).toString('base64')}`);
  for (const fn of ['parseValue', 'formatSI', 'formatNumber', 'formatPercent']) {
    if (typeof mod[fn] !== 'function') throw new Error(`${FORMAT_FILE}: no exported ${fn}`);
  }
  return mod;
}
