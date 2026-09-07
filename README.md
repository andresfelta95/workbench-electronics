# Workbench / Banco de Trabajo

Interactive electronics course at **https://electronics.paisbru.com** — bilingual
(EN/ES), fully static, and free with no paid tier.

Every concept ships with an instrument the reader operates and a consequence they
see or hear at the same instant. Circuits are drawn as SVG components, not
images, so values update live and the prose can highlight the part it is talking
about.

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
pnpm build       # content + prerender into dist/electronics/browser
pnpm content     # regenerate content only, after editing content/
```

`src/app/content-generated/` and `public/sitemap.xml` are build artefacts and are
git-ignored. `pnpm content` recreates them.

## Adding a lesson

1. Create the Markdown in **both** languages under the same module folder and the
   same file name — the ids are language-neutral so the language switcher can map
   one to the other:

   ```
   content/en/02-time-and-frequency/01-rc-transient.md
   content/es/02-time-and-frequency/01-rc-transient.md
   ```

2. Front matter (all fields required except `minutes`):

   ```yaml
   ---
   slug: rc-transient        # the URL segment, translated per language
   title: The RC transient
   summary: One sentence, used on the module page and as the meta description.
   minutes: 9
   ---
   ```

3. Write the prose. Two directives are available:

   ```markdown
   ::widget{type="divider" vin="9" r1="10k" r2="10k"}

   :::key Optional heading
   A callout. Tones: note, warning, key, safety.
   :::
   ```

4. `pnpm content`. The build fails loudly if the two languages disagree about
   which modules or lessons exist, so a half-translated lesson cannot ship.

Modules themselves are defined by `_module.md` in each module folder, with
`slug`, `title` and `summary`. A module with no lessons renders as "being
written" rather than disappearing — the full path is public from day one.

## Adding an instrument

1. Build a standalone component that takes a single input:
   `readonly props = input<Record<string, string>>({})`. Seed state from it with
   `linkedSignal(() => parseValue(this.props()['r1'], 10000))`.
2. Register it in `src/app/lesson/widget-registry.ts` as a dynamic import.
3. Reference it from any lesson with `::widget{type="your-type"}`.

Reuse `app-panel`, `app-control` and `app-readout` from `src/app/ui/`, and the
symbols in `src/app/schematic/`. Every instrument must be operable from the
keyboard: `app-control` pairs its slider with a real text box for that reason.

## Deploy

```bash
docker compose -f ~/docker/compose/electronics.yml up -d --build
```

Behind cloudflared (`electronics.paisbru.com` → `http://electronics:80`), on
`server-net`, with no host port. Changing the cloudflared config requires
`up -d --force-recreate`, never `docker restart`.
