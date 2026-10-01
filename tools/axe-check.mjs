#!/usr/bin/env node
/*
 * axe over every prerendered route, in every theme state.
 *
 * The repo deliberately does not depend on Playwright. Install it once,
 * anywhere outside the repo, and point AXE_TOOLS_DIR at that folder:
 *
 *   mkdir -p ~/.a11y-tools && cd ~/.a11y-tools && npm init -y
 *   npm i playwright @axe-core/playwright && npx playwright install chromium
 *
 *   pnpm build
 *   AXE_TOOLS_DIR=~/.a11y-tools node tools/axe-check.mjs [distDir] [--route=/en/...] [--verbose]
 *
 * distDir defaults to dist/electronics/browser. Routes come from
 * distDir/../prerendered-routes.json (falling back to
 * dist/electronics/prerendered-routes.json). If other builds run at the same
 * time, copy the whole dist/electronics folder somewhere private and pass
 * <copy>/browser, so the pages cannot change under the run.
 *
 * Theme states (ARCHITECTURE.md §4.6):
 *   light        OS light, no stored choice
 *   system-dark  OS dark, no stored choice   (the guarded media-query block)
 *   dark         OS light, stored choice "dark" (the [data-theme] block)
 *   light-forced OS dark, stored choice "light" (the :not([data-theme]) guard)
 *
 * Runs every enabled axe rule (WCAG A/AA plus best practices), plus the
 * deprecated landmark-complementary-is-top-level. Exits 1 on any violation.
 */
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const toolsDir = process.env.AXE_TOOLS_DIR;
if (!toolsDir) {
  console.error(
    'Set AXE_TOOLS_DIR to a folder with playwright and @axe-core/playwright installed.',
  );
  process.exit(2);
}
const req = createRequire(join(resolve(toolsDir), 'package.json'));
const { chromium } = req('playwright');
const { AxeBuilder } = req('@axe-core/playwright');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const onlyRoute = args.find((a) => a.startsWith('--route='))?.slice('--route='.length);
const distDir = resolve(args.find((a) => !a.startsWith('--')) ?? 'dist/electronics/browser');

const routesFile = [
  join(distDir, '..', 'prerendered-routes.json'),
  'dist/electronics/prerendered-routes.json',
].find((f) => existsSync(f));
if (!routesFile) {
  console.error('prerendered-routes.json not found.');
  process.exit(2);
}
let routes = Object.keys(JSON.parse(readFileSync(routesFile, 'utf8')).routes);
if (onlyRoute !== undefined) {
  routes = routes.filter((r) => r === onlyRoute);
  if (routes.length === 0) {
    console.error(`--route=${onlyRoute} matches no prerendered route in ${routesFile}.`);
    process.exit(2);
  }
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
};

const server = createServer((request, response) => {
  let path;
  try {
    path = decodeURIComponent(new URL(request.url, 'http://x').pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }
  let file = join(distDir, path);
  // Reject anything that resolves outside distDir, including siblings that
  // merely share its prefix (dist/electronics/browser-x).
  const rel = relative(distDir, file);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    response.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) file = join(distDir, 'index.csr.html');
  response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;

const states = [
  { name: 'light', colorScheme: 'light', stored: null },
  { name: 'system-dark', colorScheme: 'dark', stored: null },
  { name: 'dark', colorScheme: 'light', stored: 'dark' },
  { name: 'light-forced', colorScheme: 'dark', stored: 'light' },
];

// Rules newer axe releases disable by default but older ones (4.10) still run.
// Keep them on so the result does not depend on which axe is installed.
const strictRules = { 'landmark-complementary-is-top-level': { enabled: true } };

const browser = await chromium.launch();
let total = 0;
const rows = [];

for (const state of states) {
  const context = await browser.newContext({
    colorScheme: state.colorScheme,
    viewport: { width: 1280, height: 900 },
  });
  if (state.stored) {
    await context.addInitScript((t) => {
      try {
        localStorage.setItem('wb-theme', t);
      } catch {}
    }, state.stored);
  }
  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const theme = await page.evaluate(
      () => document.documentElement.getAttribute('data-theme') ?? 'none',
    );
    const { violations } = await new AxeBuilder({ page }).options({ rules: strictRules }).analyze();
    const nodes = violations.reduce((n, v) => n + v.nodes.length, 0);
    total += nodes;
    rows.push({ state: state.name, route, rules: violations.length, nodes });
    if (violations.length) {
      console.log(`\n✗ ${state.name} (data-theme=${theme}) ${route}`);
      for (const v of violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
        for (const n of v.nodes.slice(0, verbose ? Infinity : 3)) {
          console.log(`    ${n.target.join(' ')}`);
          if (verbose) console.log(`      ${n.failureSummary?.replace(/\n/g, '\n      ')}`);
        }
      }
    }
    await page.close();
  }
  await context.close();
}

await browser.close();
server.close();

const byState = Object.fromEntries(states.map((s) => [s.name, 0]));
for (const r of rows) byState[r.state] += r.nodes;
console.log(`\n${routes.length} routes × ${states.length} theme states = ${rows.length} pages`);
for (const [s, n] of Object.entries(byState)) console.log(`  ${s.padEnd(13)} ${n} violating nodes`);
console.log(total === 0 ? '\naxe: 0 violations' : `\naxe: ${total} violating nodes`);
process.exit(total === 0 ? 0 : 1);
