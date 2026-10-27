# Workbench / Banco de Trabajo

Interactive electronics course at **https://electronics.paisbru.com** — bilingual
(EN/ES), fully static, and free with no paid tier.

Every concept ships with an instrument the reader operates and a consequence they
see or hear at the same instant. Circuits are drawn as SVG components, not
images, so values update live and the prose can highlight the part it is talking
about.

## Language policy

**Everything that is not site content is written in English**: code, comments,
commit messages, this README, config files, error messages, identifiers, and
directory names.

Spanish appears in exactly two places, and both are product rather than
documentation:

- `content/es/**` — the Spanish half of the lessons.
- The `es` block in `src/app/i18n/ui.ts` — the Spanish UI strings.
- (`src/app/pages/gate/language-gate.ts` also carries one Spanish line on
  purpose: the site root greets both languages before it forwards.)

Module and lesson identifiers stay language-neutral and English
(`00-fundamentals/01-ohms-law`); only the URL slug in the front matter is
translated. Do not translate a folder name — that is what lets the language
switcher map a page to its counterpart.

For how the whole thing fits together — dependency-by-dependency, the frontend
in detail, and what stands in for a backend — see [ARCHITECTURE.md](ARCHITECTURE.md).

## Stack

- **Angular 22**, standalone + signals, zoneless. Node 22 (`.nvmrc`), pnpm 9.15.0.
- **Prerendered to static HTML** (`outputMode: static`) — every route is a real
  file. Served by nginx; there is no backend.
- **Content is Markdown**, compiled to lazy-loaded TypeScript modules at build
  time. Writing a lesson is writing prose.

## Working on it

```bash
nvm use          # Node 22
pnpm install
pnpm start       # rebuilds content, then ng serve
pnpm build       # content + checks + prerender into dist/electronics/browser
pnpm content     # regenerate content only, after editing content/
```

`src/app/content-generated/` and `public/sitemap.xml` are build artefacts and are
git-ignored. `pnpm content` recreates them.

## Adding a lesson

1. Create the Markdown in **both** languages under the same module folder and the
   same file name — the ids are language-neutral so the language switcher can map
   one to the other:

   ```
   content/en/02-time-and-frequency/03-rc-transient.md
   content/es/02-time-and-frequency/03-rc-transient.md
   ```

2. Front matter (`slug`, `title` and `summary` required; `minutes` and
   `references` optional):

   ```yaml
   ---
   slug: rc-transient        # the URL segment, translated per language
   title: The RC transient
   summary: One sentence, used on the module page and as the meta description.
   minutes: 9
   references:               # ids from content/bibliography.yaml
     - horowitz-hill-2015
     - id: fluke-11x-manual
       note: "DC volts input impedance above 10 MΩ (Table 7)."
   ---
   ```

   Each `references` item is an id, or `{ id, note }` with a note in the
   lesson's language (use it to name the figure the source backs). EN and ES of
   a lesson must cite the same ids. The page renders them after the body as
   "Sources and further reading" ("Fuentes y lecturas recomendadas"); on ES
   pages an entry with a Spanish edition adds an "En español: …" line.

   Sources live in `content/bibliography.yaml`, a mapping keyed by id:

   ```yaml
   fluke-11x-manual:
     section: "datasheet"    # textbook | note | standard | datasheet | web | es
     authors: "Fluke Corporation"
     title: "110/113/114/115/117 True-rms Multimeter Users Manual"
     year: "March 2020"
     url: "https://media.fluke.com/5e1db354-3a6e-49cf-9edd-b10800c0e608_original%20file.pdf"
     modules: ["00-02", "00-03"]   # bookkeeping only, not rendered
     comment: "Hosted copy labelled Simplified Chinese; tables in English."
   ```

   Values are double-quoted strings (or lists of strings). `section` and
   `title` are required; the other fields are `authors`, `container`,
   `edition`, `publisher`, `year`, `identifier`, `url`, `lang` (`en` by
   default, or `es`; `section: "es"` and `lang: "es"` go together, each
   requires the other), `es` (the id of a
   Spanish edition, which must have `lang: "es"`) and `titleStyle` (`"italic"`
   or `"quoted"`, overriding the section default: italic for textbook,
   standard, datasheet and es; quoted for note and web). Two fields are never
   rendered: `modules` (which lessons use the source) and `comment` (editorial
   or verification remarks). A `null` `titleStyle` or `modules` counts as
   absent, and `modules` items must be non-empty strings. An entry with
   `lang: "es"` may not carry `es:`. Unknown keys fail the build. A new source
   also goes in `docs/BIBLIOGRAPHY.md`, under the same id, in the same change.

3. Write the prose. Two directives are available:

   ```markdown
   ::widget{type="divider" vin="9" r1="10k" r2="10k"}

   :::key Optional heading
   A callout. Tones: note, warning, key, safety.
   :::
   ```

4. `pnpm content`. The build fails loudly if the two languages disagree about
   which modules or lessons exist, so a half-translated lesson cannot ship. It
   also fails on an unknown or duplicate reference id, a malformed
   `references` item or bibliography entry, an `es:` link to a missing or
   non-Spanish entry, and EN and ES citing different ids.

Modules themselves are defined by `_module.md` in each module folder, with
`slug`, `title` and `summary`. A module with no lessons renders as "being
written" rather than disappearing — the full path is public from day one.

## Adding an instrument

1. Build a standalone component that takes a single input:
   `readonly props = input<Record<string, string>>({})`. Seed state from it with
   `linkedSignal(() => parseValue(this.props()['r1'], 10000))`. `WidgetHost`
   passes every directive attribute in that one `props` map. Read each one as
   `this.props()['key']` and wrap numbers in `parseValue`: the build derives
   the props a widget accepts (and which are numeric) from exactly those
   reads, and fails on anything else.
2. Register it in `src/app/lesson/widget-registry.ts` as a dynamic import.
3. Reference it from any lesson with `::widget{type="your-type"}`, unindented
   on a line of its own; a malformed `::widget` line fails the build.

Reuse `app-panel`, `app-control` and `app-readout` from `src/app/ui/`, and the
symbols in `src/app/schematic/`. Every instrument must be operable from the
keyboard: `app-control` pairs its slider with a real text box for that reason.
Before you start, work through the "Adopting the skin in a new widget" checklist
in [docs/DESIGN-PIXEL-ART.md](docs/DESIGN-PIXEL-ART.md).

## Quality gates

`pnpm build` is itself a gate. It stops at the first failure:

1. `tools/build-content.mjs` compiles the lessons and fails on EN/ES
   mismatches, bad references, and any `::widget` with an unregistered `type`,
   an unknown prop, a non-numeric value for a numeric prop, or a duplicate or
   unparsable attribute (see "Adding an instrument"). A malformed `::widget`
   line outside a code fence fails too (`<file>:<line>: malformed ::widget
   directive`): write it unindented on a line of its own, exactly as
   `::widget{type="…" name="value" …}`. So does any `::widget` inside a callout.
2. `tools/check-glyphs.mjs` fails on any character in visible instrument text
   outside the pixel font rule: VT323, plus JetBrains Mono for Greek and
   Iosevka Charon Mono for ∥ and arrows. `×` and subscripts always fail in
   visible text; spoken-only text is exempt. It reads the committed
   `tools/glyph-coverage.json` (see
   [Glyph coverage](docs/DESIGN-PIXEL-ART.md#glyph-coverage)).
3. `ng build` compiles and prerenders every route.

CI (`.github/workflows/build.yml`, on every pull request and on pushes to
`main`) runs three jobs:

| Job | Runs | Fails on |
|---|---|---|
| `build` | `pnpm build`, then keeps `dist/electronics` for the `axe` job | any of the three steps above |
| `checks` | `pnpm check:contrast`, `pnpm test:ci` | a stale or failing contrast table; a failing unit test |
| `axe` | `tools/axe-check.mjs` on the `build` job's output, every route in four theme states | any axe violation |

The same checks locally:

```bash
pnpm build             # content + widget props + glyphs + prerender
pnpm test:ci           # unit tests (Vitest, jsdom), once; pnpm test watches
pnpm check:glyphs      # the glyph check on its own
pnpm check:contrast    # contrast table is current and every pair passes
```

**axe.** The repo does not depend on Playwright, so install it once in a
folder outside the repo (CI pins the same versions) and point `AXE_TOOLS_DIR`
at it:

```bash
export AXE_TOOLS_DIR=/path/to/a11y-tools    # any folder outside the repo
(mkdir -p "$AXE_TOOLS_DIR" && cd "$AXE_TOOLS_DIR" && npm init -y &&
  npm i playwright@1.63.0 @axe-core/playwright@4.13.0 &&
  npx playwright install chromium)

pnpm build
node tools/axe-check.mjs [distDir] [--route=/en/...] [--verbose]
```

The script's header has the details, including the four theme states.

**Regenerating the generated files.**

- *Contrast table.* The table in
  [docs/DESIGN-PIXEL-ART.md §Contrast](docs/DESIGN-PIXEL-ART.md#contrast) is
  computed from the palette in `src/styles/_pixel.scss`. After changing a
  `--pix-*` colour, run `node tools/contrast-table.mjs` and commit the doc. A
  new colour also needs its pairs added to the `PAIRS` list at the top of that
  script.
- *Glyph coverage.* After changing `--pix-font` or the Google Fonts request in
  `src/index.html`, run `node tools/glyph-coverage-gen.mjs` (no arguments;
  needs network) and commit the updated `tools/glyph-coverage.json`.

## Deploy

```bash
docker compose -f ~/docker/compose/electronics.yml up -d --build
```

Behind cloudflared (`electronics.paisbru.com` → `http://electronics:80`), on
`server-net`, with no host port. Changing the cloudflared config requires
`up -d --force-recreate`, never `docker restart`.

## License

Two licenses, because the code and the teaching material are different things.

- **Code — MIT** (`LICENSE`). The Angular application, the content build
  pipeline, the schematic component library, the instruments, the styles and
  the config. Do what you like with it.
- **Course content — CC BY-SA 4.0** (`content/LICENSE`). The lesson prose in
  `content/` and the UI copy in `src/app/i18n/`. Share and adapt it, including
  commercially, with credit and under the same terms.

The ShareAlike half is deliberate: translations into further languages are the
derivative this project most wants to see, and they should stay as free as the
original. The site itself carries no paid tier and never will.
