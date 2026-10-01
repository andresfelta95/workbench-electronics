# Architecture

How this codebase is put together, what every dependency is for, and what
happens between a Markdown file on disk and a lesson in someone's browser.

Companion to `README.md`, which covers day-to-day workflow. This document is the
reference.

---

## 1. The shape of the thing

**There is no runtime backend.** That is the single most important fact about
this project, and everything else follows from it.

The site is compiled to static HTML at build time — every route, in both
languages, written to its own `index.html`. At runtime nginx serves files off a
disk and nothing else happens on a server. No Node process, no database, no API,
no session store.

That is a deliberate trade. What it costs: no personalisation, no user accounts,
no server-side search. What it buys:

- **Speed.** A route is a file. First byte is a disk read.
- **Indexability.** Search engines get complete HTML with the lesson text and
  the instrument's initial state already rendered, not an empty shell.
- **Operational silence.** Nothing to crash at 3am, nothing to patch, nothing
  to back up. The container is 128 MB of nginx serving about 2 MB of output.
- **Cost.** It runs in the noise of an existing home server.

So when this document says "backend", it means the **build-time backend**: a
Node pipeline and a prerender pass that together do the work a server would
otherwise do on every request. Section 5 covers it in detail.

---

## 2. Dependency inventory

Nine runtime dependencies, eight build dependencies. Every one is load-bearing —
the scaffold's `express`, `@types/express` and `@angular/forms` were removed
once the project committed to static output, because nothing imported them.

### Runtime

| Package | Version | What it does here |
|---|---|---|
| `@angular/core` | 22.1.5 | The framework. Used in **zoneless** mode: no `zone.js`, change detection driven entirely by signals. |
| `@angular/common` | 22.1.5 | `DOCUMENT`, `isPlatformBrowser`, `Intl`-adjacent pipes. Small surface here. |
| `@angular/compiler` | 22.1.5 | Template compilation. Ahead-of-time at build; present at runtime for dev tooling. |
| `@angular/platform-browser` | 22.1.5 | Bootstrapping, `Title` and `Meta` services (used by `Seo`), hydration with event replay. |
| `@angular/router` | 22.1.5 | Routing, route params bound to component inputs, the guard and the resolver. |
| `@angular/ssr` | 22.1.7 | `RenderMode.Prerender`, `getPrerenderParams`, `provideServerRendering`. Build-time only in practice. |
| `@angular/platform-server` | 22.1.5 | The renderer `@angular/ssr` drives during prerendering. Never ships to the browser. |
| `rxjs` | 7.8.2 | Exactly one import: `filter` over `router.events` in `RouteState`. Everything else is signals. |
| `tslib` | 2.3.x | TypeScript helper runtime. |

### Build

| Package | Version | What it does here |
|---|---|---|
| `@angular/build` | 22.1.7 | The esbuild-based application builder. Bundling, code splitting, prerendering. |
| `@angular/cli` | 22.1.7 | `ng build`, `ng serve`, schematics. |
| `@angular/compiler-cli` | 22.1.5 | AOT template compiler. |
| `typescript` | 6.0.3 | Strict mode, with Angular's strict template checking on top. |
| `marked` | 16.4.2 | Markdown → HTML inside the content pipeline. Never ships to the browser. |
| `gray-matter` | 4.0.3 | YAML front matter parsing in the content pipeline. Node-only. |
| `@types/node` | 20.x | Types for the pipeline script. |
| `prettier` | 3.8.x | Formatting. |

**Nothing else.** No component library, no CSS framework, no state management
library, no chart library, no icon package, no analytics, no font package. The
design system is ~300 lines of global CSS custom properties and prose styles,
plus a ~390-line pixel-art skin scoped to the instruments
(`src/styles/_pixel.scss`, see `docs/DESIGN-PIXEL-ART.md`); the instruments draw
themselves with SVG and arithmetic. The only external network request the site
makes is to Google Fonts.

### Toolchain

- **Node 22** — pinned in `.nvmrc` and `engines`. Angular 22 requires
  `>=22.22.3`; the host server's default is Node 20, so the project pins its own.
- **pnpm 9.15.0** — pinned in `packageManager`. Unpinned, corepack pulls pnpm 11,
  which demands Node 22 and breaks builds on any image that has less.

---

## 3. Directory map

```
electronics/
├── content/                    ← lesson source, the thing you actually edit
│   ├── en/00-fundamentals/
│   │   ├── _module.md          ← module title, slug, summary
│   │   ├── 01-ohms-law.md
│   │   ├── 02-series-and-parallel.md
│   │   └── 03-voltage-divider.md
│   ├── es/00-fundamentals/     ← same ids, translated slugs and prose
│   └── LICENSE                 ← CC BY-SA 4.0, content only
│
├── tools/
│   ├── build-content.mjs       ← the content compiler (311 lines)
│   └── axe-check.mjs           ← axe over every prerendered route (needs AXE_TOOLS_DIR)
│
├── docs/                       ← roadmap, review, bibliography, pixel-art design notes
│
├── src/
│   ├── index.html              ← shell: fonts, theme pre-paint script
│   ├── main.ts                 ← browser bootstrap
│   ├── main.server.ts          ← prerender bootstrap
│   ├── styles.scss             ← design tokens + prose typography (global)
│   ├── styles/_pixel.scss      ← instrument skin, scoped to .pix
│   │
│   └── app/
│       ├── app.ts/.html/.scss  ← shell: masthead, language switch, theme, footer
│       ├── app.routes.ts       ← route table, one branch per language
│       ├── app.routes.server.ts← prerender parameters, derived from content
│       ├── app.config.ts       ← providers
│       ├── app.config.server.ts
│       │
│       ├── core/               ← services and pure logic (538 lines)
│       ├── i18n/ui.ts          ← every UI string, both languages (289 lines)
│       ├── lesson/             ← the Markdown → components renderer (215 lines)
│       ├── pages/              ← the five routed views (1046 lines)
│       ├── schematic/          ← SVG symbol library (327 lines)
│       ├── ui/                 ← panel, control, readout primitives (548 lines)
│       ├── widgets/            ← the instruments (663 lines)
│       └── content-generated/  ← BUILD OUTPUT, git-ignored
│
├── Dockerfile                  ← two stages: node builder, nginx runtime
├── nginx.conf                  ← routing, caching, headers
├── LICENSE                     ← MIT, code only
└── ARCHITECTURE.md             ← this file
```

Roughly 5,000 lines of source, plus ~5,600 words of lesson prose so far.

---

## 4. Frontend in detail

### 4.1 Change detection: zoneless signals

The application runs without `zone.js`. Nothing monkey-patches `setTimeout` or
`addEventListener` to guess when state changed; instead every piece of state is
a signal, and Angular re-renders exactly the views that read a signal that
changed.

This is why the instruments are cheap. Dragging a slider in the divider updates
one `signal`, which invalidates four `computed` values, which update six text
nodes and two SVG attributes. Nothing else in the page is even considered.

The pattern used throughout:

```ts
// Seeded from the lesson's directive, then owned by the reader.
protected readonly r1 = linkedSignal(() => parseValue(this.props()['r1'], 10000));

// Derived, never stored.
private readonly r2Effective = computed(() =>
  this.loaded() ? parallel(this.r2(), this.rLoad()) : this.r2(),
);
protected readonly vout = computed(() => {
  const r2 = this.r2Effective();
  return (this.vin() * r2) / (this.r1() + r2);
});
```

`linkedSignal` is doing real work there. The widget's initial values come from
the lesson author's `::widget{r1="10k"}` directive, but the reader must be able
to override them. A plain `signal` cannot be initialised from an input (inputs
do not exist at field-initialiser time); a `computed` cannot be written to.
`linkedSignal` is both: it derives from `props()`, and it accepts writes that
persist until the source changes — and `props` never changes after creation.

### 4.2 Routing and the bilingual URL scheme

There is no `:lang` parameter. The route table generates one static branch per
language from `LANGS`:

```
/                                  → LanguageGate      (prerendered, then forwards)
/en                                → HomePage
/en/:moduleSlug                    → ModulePage
/en/:moduleSlug/:lessonSlug        → LessonPage
/es …                              (same shape)
**                                 → NotFound
```

Three mechanisms make this work:

**`withComponentInputBinding()`** binds route params *and* route data straight
to component inputs, so `LessonPage` declares `lessonSlug = input.required<string>()`
and never touches `ActivatedRoute`.

**`paramsInheritanceStrategy: 'always'`** lets the child routes see the `lang`
their parent declared in route `data`.

**The `setLang` guard** runs before the component is constructed. This matters
more than it looks: `I18n` has to hold the right language *before the first
render*, or the prerendered Spanish page would be serialised with English
strings baked into it. A guard is the earliest hook that can guarantee it.

**Language-neutral ids.** Module and lesson directories are English and never
translated (`00-fundamentals/01-ohms-law`); only the `slug:` in the front matter
differs per language. `Content.translatePath()` maps a location to its
counterpart by walking ids, which is why the language switcher lands on the same
lesson instead of dumping the reader on the home page.

### 4.3 The lesson rendering path

A lesson JSON is an ordered array of typed blocks. `LessonBody` switches on the
tag:

| Block | Rendered as |
|---|---|
| `html` | `<div class="prose" [innerHTML]>` — Angular sanitises it |
| `callout` | A styled `<div role="note">` with a tone: note, warning, key, safety (not `<aside>`, which axe rejects inside `<main>`) |
| `widget` | `WidgetHost`, which resolves and instantiates the component |

`WidgetHost` is the interesting one:

```ts
void this.pendingTasks.run(async () => {
  const component = await loader();
  this.created = this.container.createComponent(component);
  this.created.setInput('props', props);
});
```

`PendingTasks.run()` is not optional. Without it, prerendering serialises the
page before the dynamic import resolves and the instrument is simply **missing
from the static HTML** — it only appears after hydration, which means search
engines and no-JS readers never see it. Registering the load as a pending task
makes the prerenderer wait.

The widget registry is a plain map of `type → () => import(...)`, so a lesson
downloads only the instruments it references. Each instrument is its own lazy
chunk of 5–6.5 kB.

### 4.4 The instruments

Every widget honours one contract: `props = input<Record<string, string>>({})`.
That is the whole API surface between the content and the code, which is what
keeps the Markdown authorable.

Three shared primitives under `ui/` mean a new instrument is mostly arithmetic:

- **`Panel`** — the frame. Content-projects into four slots: `panelFigure`,
  `panelControls`, `panelReadouts`, and an optional `panelAction`.
- **`Control`** — a labelled slider **paired with a text box**. The text box is
  not decoration: it is how a keyboard user operates the instrument, and how a
  reader reproduces the lesson's worked example exactly. It handles logarithmic
  travel (right for resistance across five decades, wrong for a supply voltage)
  and optional snapping to the E24 series so only buyable values appear.
- **`Readout`** — one measured value with a label, optional note, and a semantic
  tone that colours it when a number crosses into trouble.

`core/format.ts` holds the shared arithmetic: engineering notation with SI
prefixes (`formatSI`), locale-correct decimal separators (`4.5 V` / `4,5 V`),
log↔linear slider mapping, E24 snapping, and `parallel()`.

### 4.5 The schematic library

Circuits are components, not images. Symbols are **attribute selectors on
`svg:g`** so the markup stays valid SVG:

```html
<sch-canvas [w]="31" [h]="16">
  <svg:g schWire d="M40 30 H140" [flow]="current()" />
  <svg:g schResistor [x]="14" [y]="3" [vertical]="true"
         name="R1" [value]="text(r1())" [highlight]="step() === 2" />
  <svg:g schGround [x]="14" [y]="13" />
</sch-canvas>
```

Everything sits on a 10-unit grid. Symbols share an abstract base class giving
them `x`, `y`, `dim` and `highlight`.

> **Trap worth knowing.** That abstract base class **must** carry an
> `@Directive()` decorator. Without it Angular silently ignores every inherited
> input and the build fails with a misleading *"Can't bind to 'x' since it isn't
> a known property of `:svg:g`"*. This cost a build cycle to find.

What components buy over images: the prose can highlight the part it is
discussing while the rest dims; current animates along wires via a moving
`stroke-dasharray` at a speed proportional to the actual current; values update
live; and everything inherits `currentColor`, so one drawing works in both
themes with nothing exported twice.

### 4.6 Theming

Three states, not two. An explicit choice stamps `data-theme` on the root; the
default "system" setting stamps nothing and leaves only `prefers-color-scheme`.
`styles.scss` defines the full light palette on bare `:root`, redefines the
tokens under `@media (prefers-color-scheme: dark)` guarded by
`:root:not([data-theme="light"])`, and redefines them again under
`:root[data-theme="dark"]`. Components only ever read tokens.

A tiny inline script in `index.html` applies the stored choice **before first
paint**, so a dark-theme reader never sees a white flash. Every `localStorage`
access is wrapped in `try/catch` — private browsing throws.

### 4.7 SEO

Handled by `core/seo.ts` on every navigation: title, description, Open Graph
tags, `canonical`, and — the one that matters here — `hreflang` alternates for
both languages plus `x-default`. The same lesson exists at two URLs; without the
alternates the two languages compete with each other in search results.

Because all of this runs during prerendering, the tags are in the static HTML,
not injected after hydration.

### 4.8 Bundle

| | Raw | Gzipped |
|---|---|---|
| `main.js` | 312 kB | **87 kB** |
| `styles.css` | 10.1 kB | 2.5 kB |
| Per-lesson chunk | 5.5–7 kB | ~2 kB |
| Per-instrument chunk | 5–6.5 kB | ~2 kB |

Gzipped figures are the build's "estimated transfer size" (2026-10-01).

The initial bundle is Angular itself. Lessons and instruments are code-split and
fetched on demand.

---

## 5. Backend in detail

Three things stand in for a server. Two run at build time; one runs in
production and does nothing but serve files.

### 5.1 The content compiler — `tools/build-content.mjs`

A 311-line Node script, the only genuinely custom "backend" in the project. It
runs before every build.

**Input:** `content/{lang}/{moduleId}/{lessonId}.md`

**What it does:**

1. Reads front matter with `gray-matter`, validating that required fields exist
   and failing loudly with the file path when one is missing.
2. Scans each lesson **line by line** — not with a global regex — so it can
   track fence state and never interpret a directive inside a fenced code block.
3. Splits the prose into ordered blocks, converting `::widget{...}` directives
   and `:::note … :::` callouts into typed structures and running everything
   else through `marked`.
4. **Cross-checks the languages.** If `en` and `es` disagree about which modules
   or lessons exist, the build fails. A half-translated lesson cannot ship, and
   the language switcher can never point at a page that does not exist.
5. Emits three things into `src/app/content-generated/`:
   - `lessons/{lang}.{moduleId}.{lessonId}.ts` — one TypeScript module per
     lesson, exporting a typed `Lesson`.
   - `loaders.ts` — a `route key → dynamic import` map.
   - `curriculum.ts` — the metadata index (no lesson bodies).
6. Writes `public/sitemap.xml`.

**Why TypeScript modules and not JSON served over HTTP.** The obvious design is
JSON in `public/` fetched with `HttpClient`. It was rejected because HTTP during
prerendering has no origin to resolve a relative URL against, which forces an
interceptor, a base-URL provider, and two code paths that can drift. Emitting TS
means the bundler code-splits each lesson into its own chunk and the *same* code
path works identically in Node during prerender and in the browser. There is no
fetch to fail, and lessons work offline once cached.

### 5.2 The prerender pass

`app.routes.server.ts` declares every route as `RenderMode.Prerender` and feeds
the parameterised ones from the generated curriculum:

```ts
{
  path: `${lang}/:moduleSlug/:lessonSlug`,
  renderMode: RenderMode.Prerender,
  getPrerenderParams: async () =>
    CURRICULUM[lang].modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        moduleSlug: module.slug,
        lessonSlug: lesson.slug,
      })),
    ),
}
```

Adding a lesson to `content/` is therefore all it takes to get a new static
page — the route list is derived, never hand-maintained. The current build
produces **33 prerendered routes**.

`lessonResolver` matters here. Loading the lesson in a resolver rather than
inside the component makes the router *wait* for the content chunk, which is what
guarantees the prerendered HTML contains the whole lesson instead of an empty
shell. Together with `PendingTasks` in `WidgetHost`, it is what puts both the
prose and the instruments into the static output.

`angular.json` sets `"outputMode": "static"`, so the build emits only a browser
directory. The scaffold's `src/server.ts` Express entry point was deleted.

### 5.3 Serving — nginx

`nginx.conf`, about 50 lines. Three decisions in it are non-obvious, and each
one was a bug first:

**No bare `$uri/` in `try_files`.** With it, nginx issues a 301 trailing-slash
redirect for every route, turning each canonical URL into an extra hop.

```nginx
try_files $uri $uri/index.html =404;
```

**HTML must send `Cache-Control: no-cache`, and it cannot be matched on a
`.html` suffix.** The requested URI is `/en`, not `/en/index.html`, so a
`location ~* \.html$` block never fires. Without the header, a returning visitor
uses cached HTML that references content-hashed bundles which no longer exist
after a deploy, and gets a blank page. Assets, being hash-named, get
`immutable` for a year.

**`add_header` does not merge with the parent block.** Any location that sets
one header discards *all* of the server-level ones. Every location therefore
restates the full set, with a comment saying why.

Plus `error_page 404 /index.html`, which returns a real 404 status with the app
shell as the body, so the router renders the site's own "open circuit" page
rather than nginx's default.

### 5.4 Packaging and delivery

**Dockerfile**, two stages:

1. `node:22-alpine` — installs pnpm 9.15.0 explicitly (not via corepack, which
   would pull a version needing a newer Node), `pnpm install --frozen-lockfile`,
   `pnpm build`.
2. `nginx:alpine` — copies in `nginx.conf` and the prerendered output. The final
   image carries no Node, no `node_modules`, no source.

**Deployment** follows the server's existing pattern: compose file in
`~/docker/compose/electronics.yml`, joined to the external `server-net` network,
**no host port published**, 128 MB memory cap. Cloudflare Tunnel reaches it at
`http://electronics:80` and terminates TLS at the edge.

```
Browser → Cloudflare edge (TLS, Always Use HTTPS)
        → cloudflared (outbound tunnel, no inbound ports open)
        → electronics:80 (nginx)
        → static files
```

The home server never exposes an inbound port. There is no origin certificate to
manage and no firewall rule to get wrong.

---

## 6. Adding to it

Two extension points, both deliberately narrow.

**A lesson** is two Markdown files — one per language, same directory, same
filename — with `slug`, `title`, `summary` and `minutes` in the front matter.
Run `pnpm content`. Routing, navigation, prev/next, sitemap and prerendering all
follow from that. See `README.md`.

**An instrument** is a standalone component taking `props`, registered in
`lesson/widget-registry.ts` as a dynamic import. Reuse `Panel`, `Control` and
`Readout`, draw with the `schematic/` symbols, and format numbers through
`core/format.ts`. Before building one, follow the "Adopting the skin in a new
widget" checklist in `docs/DESIGN-PIXEL-ART.md`.

Two rules that are not negotiable, because they are the point of the project:

- **Every control must be operable from a keyboard.** `Control` pairs its slider
  with a real text input for exactly this reason. An instrument that only
  responds to dragging excludes readers and is unusable on a phone.
- **Every instrument must answer one question:** what specific idea does the
  reader take away from moving this, that they would not take from a sentence?
  If there is no clear answer, the instrument does not belong.
