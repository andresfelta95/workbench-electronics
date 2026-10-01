# Review: roadmap, pixel-art skin, module 00 content, sources

## 0. Verification pass (2026-10-01)

This is an independent check of the fixes made after the original review
(§1 onwards, kept below as history). Branch `pixel-art-and-roadmap`,
uncommitted working tree, compared with `main` (`334e4d0`). I re-checked every
claim the fixing agents made. I did not take any of their reports on trust.

**Ready to merge: yes.** Every Blocker, Major and Minor finding in this
branch's scope is resolved. The original review had 12 Major and 18 Minor
findings. This pass found 6 new Minor findings, and I fixed all six. What
remains is future roadmap work: the rest of the A7 gates, the A5 references
pipeline, and the module 03 intro text. There are also four Suggestions.
None of these blocks the merge.

### 0.1 Verdict per area

| Area | Original verdict | Now | Reason |
|---|---|---|---|
| Plan (`ROADMAP.md`) | Needs work | **Ready** | Kirchhoff (00-04), multimeter (00-05), AC signals (02-01) and oscilloscope (02-02) added. Inversions removed. §3.1 safety policy and Track H added. I recomputed both totals from the module tables: 7+5+7+6+5+5+6+4+6+7+5+6 = **69 lessons** and 7+4+7+6+5+5+6+4+6+7+5+4 = **66 instruments**, and every module count line matches its table. |
| Design (pixel skin) | Needs work (small) | **Ready** | The container-query layout fills 79–86 % of the screen at 900 and 1280 px and 80–81 % at 375 px (measured). The glyph fallback chain is live: VT323 and the 4 KiB JetBrains Mono Greek slice load, and `document.fonts.check('20px "JetBrains Mono"', 'Ω')` is true. |
| Accessibility | Needs work | **Ready** | axe: 0 violations on 33 routes × 4 theme states. Keyboard operation, focus, 44 px targets and 375 px layout verified on all three instruments in EN and ES. |
| Code | Ready | **Ready** | `pnpm build` passes. No CLAUDE.md rule violations. `package.json` and `pnpm-lock.yaml` are unchanged. |
| Content (module 00) | Needs work | **Ready** | M-01 and M-02 are fixed in both languages. I recomputed every number in lessons 01–03. EN/ES parity holds for every changed passage. |
| References | Needs work | **Needs work (by design)** | The bibliography mappings are consistent with the roadmap. The A5 pipeline (`references:` front matter, `bibliography.yaml`) is still future roadmap work. |

### 0.2 Build and axe

- **Build** (Node v22.23.2): `pnpm build` exits 0, "Prerendered 33 static
  routes". `main.js` 312.31 kB raw / 87.38 kB transfer; `styles.css`
  10.14 kB / 2.53 kB; no budget warnings. I re-ran it after my own edits and
  got the same output and the same `main` hash. My only code edit is a
  comment.
- **axe** (`tools/axe-check.mjs`, axe-core 4.13.0, Playwright Chromium):
  "33 routes × 4 theme states = 132 pages", 0 violating nodes in `light`,
  `system-dark`, `dark` and `light-forced`. Exit 0. I ran it on a private copy
  of `dist/electronics`, both before and after my edits.
- `tools/axe-check.mjs` loads Playwright and axe from `AXE_TOOLS_DIR`. It adds
  no dependency. Neither the build nor `tsconfig.app.json` touches it.

### 0.3 How this was checked

- **Diff review.** I read the full diff against `main`, plus every untracked
  file.
  - CLAUDE.md patterns: zero hits under `src/` for `ngClass`, `ngStyle`,
    `HostBinding`, `HostListener`, `standalone: true`,
    `ChangeDetectionStrategy`, `$any(`, `: any`, `as any`, `@Input(`,
    `@Output(`, `*ngIf` and `*ngFor`.
  - Instrument CSS reads no prose tokens. No blurred shadows, and
    `border-radius` appears only as `0`.
  - No `console.log` or `debugger` left in `src/`.
- **Contrast.** I recomputed ratios with the WCAG 2.x formula.
  - All 27 rows × 2 themes = 54 ratios in the DESIGN-PIXEL-ART contrast table
    match the hex values in `_pixel.scss` to two decimals, and all pass.
  - All 26 palette rows in the design doc match `_pixel.scss` exactly.
  - Prose tokens: light `--faint` `#656e6d` gives 4.62 on `--bg` and 5.06 on
    `--surface`. Dark `#798684` gives 4.95 and 4.60. Light `--copper`
    `#a5592a` on `--bg`: 4.55. Light `--warn` `#995a12` on `--warn-soft`: 4.55.
- **Playwright** (Chromium 1243 from `$AXE_TOOLS_DIR`; a
  throwaway script outside the repo, against a private copy of the build):
  - **Console and hydration, every route.** All 33 routes in light and dark:
    no console errors or warnings, no page errors, no duplicate `id`s, no
    `label[for]` pointing at a missing element, and no radio group shared
    between two fieldsets.
  - **Layout.** All 6 lesson routes at 375, 900 and 1280 px, in light and
    dark, with the divider's load switched on:
    - `scrollWidth == clientWidth`, and no `.pix` element extends past the
      viewport;
    - every key, switch, text box and slider is at least 44 px tall, and every
      button and key at least 44 px wide;
    - schematic labels render at 15.4–17.7 px at 375 px, 19.4–22.3 px at
      900 px and 18.5–21.3 px at 1280 px.
  - **Keyboard, `ohm-law`.**
    - Arrow keys move the radio selection. Focus ring: `solid 2px #8a3f12`.
    - Default 9 V / 470 Ω gives `172 mW`, tone `warn`, note "> 1/10 W".
    - Typing 24 + Enter gives `1.23 W`, tone `danger`.
    - Typing 1 + Enter gives `2.13 mW`, tone `signal`.
    - The slider's arrow keys move the voltage (24 V → 23.9 V).
    - Text boxes are named "Voltage, exact value"; sliders keep "Voltage".
  - **Keyboard, `resistor-network`.**
    - Enter on Add twice takes the network to 4 resistors; Add disables and
      focus lands on Remove.
    - Space on Remove twice takes it back to 2; Remove disables and focus
      lands on Add.
    - Three Enter presses with no wait in between still end with focus on
      Remove. The agent's note that this "needs a render between presses" did
      not reproduce.
    - The radio arrows switch to parallel.
  - **Keyboard, `divider`.** Typed R2 = 4.7k (ES: `4,7k`), pressed Space on
    the load switch, then typed load = 10k. The readouts show Output 2.18 V,
    Unloaded 2.88 V, Error −24.2 % (ES: 2,18 V, 2,88 V, −24,2 %), which
    matches the lesson. The text boxes are named "R1, exact value" (ES:
    "R1, valor exacto").
  - **Theme and media.**
    - A stored `dark` theme under OS light gives the dark case colours.
    - Under reduced motion the flow animation is `none`.
    - In forced colours the segment LEDs draw a 3 px solid border and the
      selected one is filled.
- **Prerender vs hydration ids.** The prerendered HTML numbers the controls
  `ctl-5…7` on the EN divider and `ctl-2…4` on series/parallel, because the
  counter runs across routes in one prerender process. After hydration the
  client numbers them from `ctl-0`. Label-to-slider pairs are intact on every
  lesson both before and after hydration, because `id` and `for` are both
  bindings. The comment in `control.ts` that claimed the ids were "stable
  across hydration" was wrong, and I corrected it (V-01).
- **Screenshots.** I retook all eight with the designer's own script (headless
  Edge, same viewport sizes):
  - three are byte-identical to the committed files;
  - four differ only where the current-flow animation was caught at a
    different frame;
  - `ohms-law-light.png` showed the old **dot** (signal) glyph on 172 mW,
    where the current build shows the warn **triangle**. It predated the m-10
    fix, so I replaced it (V-05).
  - I also viewed the committed PNGs directly.
- **Content maths.** Recomputed by hand:
  - M-01: (I/2)²·1 Ω = I²/4 per resistor, against I²·0.5 Ω = I²/2 for the
    single part, so **half**. Against one 1 Ω resistor carrying the full
    current, I², it is a quarter.
  - M-02: 10 k ∥ 10 k = 5 k, plus 10 k = 15 k exactly, using only parts from
    the drawer.
  - m-08: 10 k ∥ 3.3 k = 2.48 kΩ ≈ 2.5 kΩ, and 12 V × 3.3/13.3 = 2.98 V ≈
    3.0 V.
  - Lesson 01: 13.6 mA, 41 mW, 100 mA, 2.2 W.
  - Lesson 02: 1 V / 9 V split; 10 MΩ against 1 kΩ is 0.01 %, against 1 MΩ
    is 9.1 %.
  - Lesson 03: the loading error is 4.8 % for equal resistors and approaches
    9.1 %. The 5 kΩ output impedance means a 500 kΩ load drops the output
    about 1 %. The worked example gives 2.88 V, 3.20 kΩ, 2.18 V and −24 %.
  - Every number is correct in EN and ES.
- **Hygiene.**
  - `git diff --check` is clean, and `file` finds no CRLF.
  - `dist/`, `src/app/content-generated/` and `public/sitemap.xml` are still
    ignored.
  - No secrets: the only "token" hits are design tokens.
  - The largest new file is an 87 KB PNG; the eight screenshots total about
    590 KB.

### 0.4 Resolution of the original findings

Status key: **Resolved** · **Partially** · **Open-by-design** (future roadmap
work) · **Open**.

| ID | Status | Evidence |
|---|---|---|
| M-01 | Resolved | EN `02-series-and-parallel.md:82-89`, ES `:86-94`: "*half* the power of the single part it replaces (and a quarter of what one 1 Ω resistor would…)". Maths re-derived in §0.3. |
| M-02 | Resolved | EN `:76-80`, ES `:80-83`: two 10 kΩ in parallel plus 10 kΩ in series gives exactly 15 kΩ. |
| M-03 | Resolved | `ROADMAP.md:229` adds `00-04-kirchhoff` with the `kirchhoff` instrument. Plain-text pointers in EN `02:39-45`, ES `02:41-47`, EN `03:19`, ES `03:19-20`. |
| M-04 | Resolved | `ROADMAP.md:257` adds `02-01-ac-signals` (`waveform-rms`), and 02-05 carries the complex-numbers sidebar. |
| M-05 | Resolved | `ROADMAP.md:230` adds `00-05-multimeter` and `:258` adds `02-02-oscilloscope`. Module 07 keeps `07-04-probing`. The 07 and 02 `_module.md` summaries are reworded in EN and ES, and the lesson 02 multimeter pointer is at EN `:101`, ES `:106`. |
| M-06 | Resolved | `ROADMAP.md:30`: `inductor-derating` is now static, the saturating ramp moves to 05-02, ESR stays qualitative in 01-02, and θ is taught in 00-06. |
| M-07 | Resolved | `ROADMAP.md` §2 Track H: owner, `hardware/reference-board/`, milestones H0–H5, freeze after 07, tested board before 11. |
| M-08 | Resolved | `ROADMAP.md:163` §3.1: ceilings, a never-suggested list, and a table of mandatory `:::safety` callouts per lesson. |
| M-09 | Resolved | `ROADMAP.md:96-98`: A2, A3 and A4 "done when" require text equivalents, and A3 adds a service-level output cap and a playing indicator. |
| M-10 | Resolved | `panel.ts:115` `@container panel (min-width: 680px)`. Measured fill: 86 % at 900 px, 79–80 % at 1280 px, 80–81 % at 375 px (target ≥ 70 %). |
| M-11 | Resolved | `_pixel.scss:121`: `--pix-font` is VT323, then JetBrains Mono, then Iosevka Charon Mono, then `--mono`. DESIGN-PIXEL-ART §Glyph coverage corrects the old claim. Fonts load in the browser (§0.3). The A7 glyph-coverage check is Open-by-design (`ROADMAP.md:102`, A8 status). |
| M-12 | Resolved | `styles.scss:19,58,82` retune `--faint`. `lesson-body.ts:16` uses `<div role="note">`. axe: 0 on 132 pages. Making axe a **build gate** is roadmap A7, Open-by-design. Today it is a script, `tools/axe-check.mjs`. |
| m-01 | Resolved | `ROADMAP.md:396`: 69 lessons / 66 instruments. Recomputed in §0.1. |
| m-02 | Resolved | `ROADMAP.md:38`: one-question briefs for `zener-clamp` (`:282`), `boost`, `inrush`, `electret-bias`, `relay-driver` and `ground-loop`; `cap-charge` becomes `cap-holdup`; `stackup` is cut. |
| m-03 | Resolved | `ROADMAP.md:39`, `:287`: each topic has one home, and flyback (09-02) now precedes the H-bridge (09-03). |
| m-04 | Resolved | `ROADMAP.md:78`: finishing 00 runs in parallel with A1–A4. |
| m-05 | Resolved | `ROADMAP.md:106`: a table of symbols by first use. |
| m-06 | Resolved | `ROADMAP.md:389` (IPC-2152 curve fit or IPC-2221), `:391` (Wadell, with validity range). |
| m-07 | Resolved | `ROADMAP.md:352`: computed LC-filtered audio, carrier drawn at a scaled-down frequency. |
| m-08 | Resolved | EN `03-voltage-divider.md:75-79`, ES `:79-84`; follow-through at `ROADMAP.md:326`. |
| m-09 | Resolved | ES `03-voltage-divider.md:55-56`: "se queda por debajo de un 10 %". |
| m-10 | Resolved | `ohm-law.ts:193`: `warn` between 0.1 and 0.25 W, `danger` above. Verified live at 172 mW, 1.23 W and 2.13 mW. |
| m-11 | Resolved | EN `03:37`, ES `03:39`: `load="none"` removed. No other `load=` in `content/`. The unknown-prop build check is A7, Open-by-design. |
| m-12 | Resolved | `resistor-network.ts:252-258` moves focus to the sibling button. Verified by keyboard, including rapid presses. |
| m-13 | Resolved | `ohm-law.ts:132`, `resistor-network.ts:159`: per-instance radio names. No merged radio groups on any route. |
| m-14 | Resolved | `divider.ts:129`, `ohm-law.ts:162`: nameplates use `·`, and the accessible name keeps `×`. |
| m-15 | Resolved | `_pixel.scss:146`: 16 units at ≤ 520 px. Labels measured at 15.4–17.7 px at 375 px. |
| m-16 | Resolved | `schematic.ts:82`: dim fades strokes to 0.55 only, and labels switch to muted ink (6.50 / 6.80). Both new pairs are in the design table and verified. |
| m-17 | Resolved (fixed during verification) | ARCHITECTURE.md §2, §3, §4.3 and §4.8 updated to the current build (V-02). |
| m-18 | Resolved (finished during verification) | DESIGN-PIXEL-ART §Verification was rewritten by the design agent, but its last bullet still said `--faint` fails. I updated it (V-03). |
| s-01 | Resolved | `_pixel.scss:289-301,375-381`: the LED is drawn with border and background, with `forced-color-adjust: none`. Verified in forced colours. |
| s-02 | Resolved | `schematic.ts:110`: the highlight stroke is 4 units. |
| s-03 | Resolved | `control.ts:197-199`, `ui.ts` `exactValue`. Verified names: "R1, exact value" and "R1, valor exacto". |
| s-04 | Resolved | `control.ts:36`: `commitText(entryEl.value)`, and the slider uses `rangeEl.valueAsNumber`. No `$any` left. |
| s-05 | Resolved | `ROADMAP.md:298`: pull-up paragraph in 04-04. |
| s-06 | Open-by-design | Recorded at `ROADMAP.md:275`. The module 03 intro text is written with module 03. |
| s-07 | Partially | The axe script exists (`tools/axe-check.mjs`). The widget-prop, glyph and contrast-table scripts are A7 (`ROADMAP.md:101`). |
| s-08 | Open-by-design | The A5 `es:` alternate edition is planned (`ROADMAP.md:99`). The pipeline is not built yet. |

**Totals (38 original findings):** 35 Resolved, 1 Partially, 2
Open-by-design, 0 Open. All 12 Major and all 18 Minor findings are resolved.

### 0.5 New findings from this pass

| ID | Severity | Area | Location | Finding | Recommendation / status |
|---|---|---|---|---|---|
| V-01 | Minor | Code | `src/app/ui/control.ts:7-8` | The comment said a counter "keeps label/for pairs stable across hydration" because "server and client instantiate controls in the same order". That is false. The prerender counter is shared across routes (static HTML `ctl-5`, client `ctl-0`). Pairs stay correct only because hydration rewrites both bindings. | **Fixed during verification:** the comment now describes the real behaviour. |
| V-02 | Minor | Code / docs | `ARCHITECTURE.md` §2, §3, §4.3, §4.8 | Stale after this branch: the callout row said `<aside>`; the bundle table said 297 kB / 3.8 kB; the directory map lacked `src/styles/_pixel.scss`, `tools/axe-check.mjs` and `docs/`; line counts for `ui/`, `schematic/`, `widgets/` and `i18n` were out of date. This extends m-17. | **Fixed during verification:** all figures match the current build and `wc -l`. |
| V-03 | Minor | Docs | `docs/DESIGN-PIXEL-ART.md:488-491` | The last "known gaps" bullet still said `--faint` is 2.74:1 / 4.20:1 and fails AA. The token change made that untrue. | **Fixed during verification:** it now gives the new ratios (4.62 / 4.95) and the axe result. |
| V-04 | Minor | Plan / docs | `docs/ROADMAP.md:5`, `:49-50`, `:102` | Three stale statements: the status line said the skin "merges after the M-10 layout fix", which has landed; the follow-ups list said its items were "not done here", but all of them are done; and A8 read as undecided, although DESIGN-PIXEL-ART §Glyph coverage records the font decision. | **Fixed during verification:** the status line, the follow-ups note and an A8 "Status" sentence now match reality. A8's remaining item, the A7 glyph check, stays open by design. |
| V-05 | Minor | Design / docs | `docs/design/ohms-law-light.png` | The screenshot showed the 172 mW Power readout with the signal **dot**. The build shows the warn **triangle** (m-10), so the design doc's screenshot contradicted the code. | **Fixed during verification:** I retook it with the designer's script. It differs from the old file only in that glyph's bounding box. |
| V-06 | Minor | Repo hygiene | `docs/*.md`, `docs/design/*.png`, `.claude/agents/*.md` | These untracked files had mode 755 and `core.fileMode=true`, so they would have been committed as executables. Every tracked file in the repo is 100644. | **Fixed during verification:** `chmod 644`. `tools/axe-check.mjs` keeps its executable bit, since it has a shebang. |
| V-07 | Suggestion | Code | `control.ts:11`, `ohm-law.ts:132`, `resistor-network.ts:159` | Module counters are not reset per prerendered page, so static and hydrated ids differ. This is harmless today: there are no hydration errors, ids are unique and pairs match. It would matter if CSS, tests or deep links ever relied on these ids. | Leave as is. If ids ever need to be stable, derive them per render. |
| V-08 | Suggestion | Accessibility | DESIGN-PIXEL-ART §Verification ("Not re-verified") | Firefox and WebKit were not re-checked after the container query and the new font stack. Only Chromium is installed in the WSL tools folder, and this pass did not cover them either. | Run one Firefox/WebKit render pass at 375 and 900 px before deploy, or add both engines to the A7 axe run. |
| V-09 | Suggestion | Accessibility | `styles.scss` prose tokens | Three pairs fall below 4.5:1: light `--faint` on `--surface-2` (4.32), dark `--faint` on `--surface-2` (4.13), and light `--copper` on `--copper-soft` (4.19). None is rendered today: text on `--surface-2` is `--ink`, and the key callout label uses `--copper-ink` at 5.32. Light `--copper` on `--bg` sits at 4.55, with almost no margin. | Extend the `styles.scss` comment to name the safe backgrounds, and include the prose tokens in the A7 contrast-table script. |
| V-10 | Suggestion | Docs | `README.md` | The README does not mention `tools/axe-check.mjs`, but ROADMAP A7 says the gates are "documented in README". | Add a "Checks" paragraph when A7 lands. The script's header documents usage until then. |

**New findings:** 0 Blocker, 0 Major, 6 Minor (all fixed during verification),
4 Suggestions.

### 0.6 Fixes made during verification

1. `src/app/ui/control.ts`: corrected the hydration comment (V-01).
2. `ARCHITECTURE.md`: updated the design-system size, the directory map
   (`tools/axe-check.mjs`, `docs/`, `src/styles/_pixel.scss`), line counts,
   the total, the callout element (`<div role="note">`), the
   per-instrument chunk size and the bundle table (V-02, m-17).
3. `docs/DESIGN-PIXEL-ART.md`: rewrote the stale `--faint` bullet (V-03, m-18).
4. `docs/ROADMAP.md`: updated the status line, the follow-ups note and the A8
   status (V-04).
5. `docs/design/ohms-law-light.png`: retook the screenshot (V-05).
6. `chmod 644` on new docs, screenshots and agent files (V-06).

I made no design or content decisions. After these edits, `pnpm build` and the
axe run were repeated, with the results in §0.2.

---

*The original review follows, unchanged, as history.*

Reviewer pass on 2026-10-01, branch `pixel-art-and-roadmap`, uncommitted working
tree. Scope: `docs/ROADMAP.md`, the pixel-art changes (`git diff` plus
`src/styles/_pixel.scss`), `content/{en,es}/00-fundamentals/*.md`, and the
course bibliography (`docs/BIBLIOGRAPHY.md`, written alongside this file).

Nothing under review was edited. Only this file and `docs/BIBLIOGRAPHY.md` were
written.

---

## 1. Executive summary

| Area | Verdict | One-line reason |
|---|---|---|
| Plan (`ROADMAP.md`) | **Needs work** | Sound skeleton and workflow. But Kirchhoff's laws and AC fundamentals are missing, the multimeter and scope lessons come after modules that rely on them, three lessons depend on later ones, and the totals are wrong (67 lessons, not 62). |
| Design (pixel-art skin) | **Needs work** (small) | Well built, token-driven, theme-correct, and the build passes. Two issues: the schematic sits in a screen three times its size on desktop, and the chosen font lacks glyphs that modules 02–05 will need. Fix the layout before merging. Resolve the glyphs before module 02. |
| Accessibility | **Needs work** | The skin itself is clean: axe finds no violations inside `.pix` on all 6 lessons × 3 theme states, and keyboard, focus, reduced motion, more-contrast, forced colours and 375 px were verified. The site is not clean: every route fails axe on older prose styles, which CLAUDE.md forbids. |
| Code | **Ready** | Follows the CLAUDE.md Angular rules. `pnpm build` passes with 33 routes. Only minor items. |
| Content (module 00) | **Needs work** | Lesson 02 has two factual errors, in both languages. Every other number checked is correct, and EN/ES parity is close. |
| References | **Needs work** | `docs/BIBLIOGRAPHY.md` now has 51 verified sources covering modules 00–11. The A5 pipeline (`references:` front matter, `bibliography.yaml`) does not exist yet, and no lesson cites anything. |

**Findings:** 0 Blocker, 12 Major, 18 Minor, 8 Suggestion (38 total).

**Top five actions**

1. Fix the two factual errors in `02-series-and-parallel` (EN and ES): the
   "quarter of the power" claim (M-01) and the 10 k/33 k drawer example (M-02).
2. Fix the schematic screen layout in `panel.ts` before merging the skin (M-10).
3. Revise the roadmap:
   - add lessons on Kirchhoff's laws and on AC/RMS/dB (M-03, M-04);
   - move the multimeter lesson into 00 and the scope lesson ahead of 02 (M-05);
   - remove the three dependency inversions (M-06);
   - correct the totals (m-01);
   - add a safety policy (M-08).
4. Clear the existing axe failures on prose: the `--faint` tokens, the
   figcaption `code`, and `aside` used for callouts. Then land the A7 axe gate,
   so the CLAUDE.md "must pass all AXE checks" rule is enforced (M-12).
5. Before module 02:
   - decide how to handle τ, β, θ, arrows, subscripts and ∥, which neither
     VT323 nor IBM Plex Mono contains (M-11);
   - add non-visual and non-audio equivalents to the A2, A3 and A4 primitives
     (M-09).

**Build:** `pnpm build` passes under Node v22.23.2: "Prerendered 33 static
routes", `styles.css` 9.86 kB raw / 2.47 kB transfer, `main.js` 304.37 kB,
no budget warnings.

---

## 2. Method

- Read CLAUDE.md, README.md, ARCHITECTURE.md, the roadmap, the design doc,
  every changed source file, and all six lesson files.
- Viewed all eight screenshots in `docs/design/`.
- Recomputed **38 contrast pairs** from the hex values in `_pixel.scss` with
  the WCAG 2.x relative-luminance formula. Every one matches the design
  doc's table to two decimals (0 mismatches), including the tightest, 4.65
  for light accent text on the LCD. Also computed further pairs the doc does
  not list (see §5.3).
- Downloaded VT323 and IBM Plex Mono from Google Fonts and read them with
  fontTools: `cmap` coverage, x-height, digit advance.
- Served `dist/electronics/browser` and drove it with Playwright:
  - **Microsoft Edge (Chromium)**: axe-core 4.10.3 with tags wcag2a/aa,
    wcag21a/aa, wcag22aa and best-practice. Run on 10 routes in light,
    system-dark and explicit-dark (`wb-theme=dark`).
  - **Edge, interaction checks**: a Tab walk, keyboard operation of every
    control type, 375 px overflow and tap-target checks, and emulated
    `prefers-reduced-motion`, `prefers-contrast: more` and
    `forced-colors: active`.
  - **Firefox and WebKit** (Playwright builds): render checks in light, dark
    and at 375 px.
- Checked numbers and worked examples by hand, and reproduced the divider's
  worked example in the live instrument.

What this does not cover: real Safari on macOS or iOS (Playwright WebKit on
Windows is close to Safari but not the same), a real screen reader, and
real touch devices.

---

## 3. Findings (sorted by severity)

### Major

| ID | Area | Location | Finding | Recommendation |
|---|---|---|---|---|
| M-01 | Technical accuracy | `content/en/00-fundamentals/02-series-and-parallel.md:187-191`; `content/es/…/02-series-and-parallel.md:194-199` | The text says each of two paralleled 1 Ω resistors "dissipates a quarter of the power a single 0.5 Ω part would". That is wrong. With total current I, the single 0.5 Ω part dissipates 0.5·I², and each 1 Ω part dissipates (I/2)²·1 = 0.25·I². That is **half** the single part's power. "A quarter" is only true when compared with one 1 Ω resistor carrying the full current. | Reword in both languages: "each dissipates half the power a single 0.5 Ω part would, and a quarter of what one 1 Ω resistor would carrying the whole current". |
| M-02 | Technical accuracy | EN `02-series-and-parallel.md:182-185`; ES `:189-192` | "Need 15 kΩ and have a drawer of 10 kΩ and 33 kΩ? A 10 kΩ in series with a 4.7 kΩ…" The answer uses a part that is not in the drawer. | Use parts from the drawer: 10 kΩ in series with two 10 kΩ in parallel gives exactly 15 kΩ. That also exercises both rules from the lesson. Alternatively, change the drawer to 10 kΩ and 4.7 kΩ. |
| M-03 | Plan | `ROADMAP.md` §4, module 00 | Kirchhoff's current and voltage laws do not appear anywhere in 67 lessons. Thévenin (00-05), bridges (10-02), the H-bridge and every node analysis depend on them. The series/parallel lesson uses them without naming them. | Add `00-03-kirchhoff` ("Kirchhoff's laws: nothing is lost at a node or around a loop") before the divider, and renumber the unpublished lessons. Ids are final only once published, so 04 and 05 are free to move. |
| M-04 | Plan | §4, modules 02, 05, 08 | No lesson introduces sine waves, amplitude/peak/RMS, phase, the complex-impedance notation behind "phasor" (02-03), or decibels (needed before the Bode plot in 02-04). 05-04 (rectifier ripple) and module 08 assume RMS and dB. | Add `02-03-ac-signals` ("Sine waves, RMS, phase and the decibel") before reactance. If phasors stay in 02-03, budget a short complex-numbers sidebar. |
| M-05 | Pedagogy | §4, 07-04 and 07-05 | The multimeter lesson comes in module 07, yet 00-02 already discusses meter loading and readers need a meter from the first lesson. The oscilloscope lesson also comes in 07, after five modules that are "mostly watch the waveform change" (Phase A2). | Move "Using a multimeter (and burden voltage)" into module 00 or 01. Move "Using an oscilloscope" to the start of module 02, where `app-trace` first appears. Module 07 keeps the buses. |
| M-06 | Pedagogy | 01-02, 01-04, 03-06 vs 02-02, 02-03, 05-01 | Three dependency inversions: (a) 01-04's `inductor-saturation` "current ramp" needs V = L·di/dt, which 02-02 teaches; (b) 01-02 promises ESR, which needs impedance (02-03); (c) 03-06 `gate-drive-loss` ends in temperature, but θJA first appears in 05-01, and §5 even notes that the "thermal model [is] shared with 03-06". | Introduce thermal resistance in 00-04 (power and heat), where it belongs, so 03-06 and 05-01 both build on it. Move inductor saturation to 02-02, or to 05-02 where it bites. In 01-02, keep ESR qualitative and forward-reference 02-03. |
| M-07 | Plan / scope | §4 module 11; §5 "Needs a real KiCad board in `hardware/`" | Module 11 is told over "one real board you can download and order" (`11-pcb/_module.md`), but no phase owns designing, fabricating and bringing up that board. Realistically that takes months and depends on parts chosen in 08–10. | Add a Phase A or Phase B item: "Reference board". Start it in parallel with module 01, freeze the schematic after module 07, and have a fabricated and tested board before 11 is written. |
| M-08 | Plan / safety | §3 step 8; §4 05-04, 07-04, 09-04 | No safety policy. 05-04's "rectifier + capacitor" implies a mains transformer. 07-04 teaches meters without measurement categories. Relays (09-04) commonly switch mains. The `safety` callout tone exists, but the roadmap never says when it is mandatory. | Add to §3: "Any lesson touching mains, stored energy above ~50 V, Li-ion cells, or meter use on mains must carry a `safety` callout reviewed in step 8." Keep 05-04 on a low-voltage AC transformer secondary. Cite IEC 61010 categories, via the Fluke note in the bibliography, in the meter lesson. |
| M-09 | Accessibility (plan) | §2 A2, A3, A4 | The new primitives carry information that is purely visual (traces, logic lanes) or purely auditory (the filter you can hear). Their "done when" columns require keyboard cursors but no text equivalent (WCAG 1.1.1) and no maximum audio level. | Add to "done when": A2/A4 expose key values through `app-readout` or a visually hidden summary that updates on cursor move. A3 has a hard output-level cap, a visible indicator while playing, and every audible effect is also shown on screen. |
| M-10 | Design | `src/app/ui/panel.ts:79-99` (`.panel__main`, `.panel__figure`) | Measured at 900 px in Edge: on the divider (loaded) and series/parallel pages, the screen is 391×552 and 391×514 px, but the drawing is 371×192 and 371×179. The drawing fills **33 %** of the screen area. Ohm's law fills 56 %. The cause: at ≥700 px the figure is a grid cell stretched to the height of the controls column, and the SVG is width-limited, so it cannot grow. This is the issue spotted in `voltage-divider-loaded-dark.png`. | Either (a) `align-self: start` on `.panel__figure`, optionally with `position: sticky; top: …`, so the screen hugs the drawing and stays in view while the reader adjusts controls below it; or (b) switch to two columns only above a wider panel width (for example `@container` ≥ 1000 px), stacking figure over controls below that. Re-measure: the drawing should fill at least about 70 % of the screen. |
| M-11 | Design | `docs/DESIGN-PIXEL-ART.md` §Font ("It has every glyph the course uses"); `_pixel.scss:116` | Checked with fontTools. VT323 **lacks** τ (U+03C4), β (U+03B2), θ (U+03B8), → and ← (U+2192/2190), subscripts ₁ and ₂ (U+2081/2082), and ∥ (U+2225). The fallback, IBM Plex Mono, also lacks τ, β, θ, Ω and ∥, so they would fall through to a system font. That breaks the "nothing drops to a fallback face" promise. Upcoming instruments need these: `rc-transient` (τ), `bjt-switch` (β), `ldo-thermal` (θJA), `thermistor-divider` (β). The claim is true for module 00 only. | Decide before module 02. Options: (a) adopt ASCII conventions inside instruments ("tau", "beta", "R1"), (b) add a pixel fallback face that covers Greek, or (c) draw these few symbols as SVG like the tone glyphs. Add a glyph-coverage check for instrument strings to A7. Correct the doc. |
| M-12 | Accessibility (pre-existing) | `styles.scss` `--faint` (light `#8a9492`, dark `#6e7a78`); `lesson-body.ts:89-110`; `lesson-body.ts:16` | axe fails on **every route** in all three theme states. Contrast failures: `.brand__tagline`, `.lesson__meta` and the figcaption are 2.74:1 in light and **4.20:1 in dark** (the design doc noted only the light value). The figcaption `code` is 4.40:1 in light. `.pager__label` is 3.9:1 in dark. Callouts use `<aside>` inside `<main>`, which fails `landmark-complementary-is-top-level`. CLAUDE.md requires axe to pass, and ROADMAP §6 requires it on every route. None of this was introduced by the skin. | Darken light `--faint` to at least 4.5:1 on `#eff1ef` (around `#687270`) and lighten dark `--faint` to at least 4.5:1 on `#0f1313` and `#161b1b`. Use `--copper-ink` for the caption `code`. Render callouts as `<div role="note">` or `<section aria-label>` instead of `<aside>`. Make the A7 axe pass a build gate. |

### Minor

| ID | Area | Location | Finding | Recommendation |
|---|---|---|---|---|
| m-01 | Plan | §4 "Total: 62 lessons… about 55 instruments"; §2 A7 "Sixty lessons" | The tables add up to **67 lessons** (5+5+5+6+5+5+6+5+6+7+5+7) and **64 instruments** (3 built and 61 new; §5's own column sums to 61). The plan understates the work by about 8 % on lessons and about 16 % on instruments. M-03 and M-04 add two more lessons. | Fix the totals and re-derive the size estimates. |
| m-02 | Plan | §4: `zener-clamp`, `boost`, `inrush`, `burden-voltage`, `electret-bias`, `relay-driver`, `ground-loop`, `cap-charge`, `stackup` | These instruments have no stated consequence, so the ARCHITECTURE §6 "one question" rule cannot be applied yet. `cap-charge` (a Q = CV readout) and `stackup` ("2 vs 4 layers") read like facts that fit in a sentence, which the rule would cut. | Write the step-2 brief for each before its module starts. Expect to cut or merge `cap-charge` into `rc-transient` and `stackup` into `return-path`. |
| m-03 | Plan | 03-03 vs 05-05; 05-04 vs 11-05; 02-02 vs 09-03; 09-02 vs 09-03 | Overlaps: reverse-polarity protection appears twice; decoupling appears twice; the inductive kick and flyback diode appear in both 02-02 and 09-03. Order: the H-bridge (09-02) needs freewheeling diodes, but flyback comes in 09-03. | Give each topic one home and cross-link the others: reverse polarity in 05-05 only, bulk capacitance in 05-04 and decoupling in 11-05, the inductive kick in 02-02 with 09-03 applying it. Swap 09-02 and 09-03. |
| m-04 | Plan | §1 critical path | "Phase A → 00 finish" blocks 00-04 and 00-05 on all of Phase A, although §5 says they "reuse existing symbols". | Let 00-04 and 00-05 proceed in parallel with A1–A4. They need only A5, A6 and A7. |
| m-05 | Plan | §2 A1 | The symbol list misses parts that later lessons draw: transformer (05-04), potentiometer/variable resistor, thermistor (10-01), strain gauge (10-02), bridge rectifier, logic gates and Schmitt symbol (06), Schottky and TVS variants (03-03), audio jack (08-04). | Extend A1, or accept that workflow step 3 adds these. In that case, list them per module so they are not drawn inline. |
| m-06 | Plan / references | 11-03 `trace-width`; 11-06 `microstrip` | IPC-2152's charts are copyrighted and sold. An instrument that reproduces them needs a licensed source or a published curve fit. For Z₀, the roadmap names no formula source. | Name the source in the step-2 brief: a published IPC-2152 curve fit with attribution, or the older IPC-2221 formula flagged as conservative. Use Wadell's handbook (in the bibliography) for the microstrip equations and state their validity range. |
| m-07 | Plan | 08-05 `class-d` "audible" | A real class-D carrier (hundreds of kHz) cannot be played through Web Audio at 44.1/48 kHz. Played literally, it would alias, which is the subject of 06-06. | State in the brief that the audio is the LC-filtered result, computed rather than played from the carrier. Show the carrier visually at a scaled-down frequency. |
| m-08 | Technical accuracy | EN `03-voltage-divider.md:74-76`; ES `:78-80` | "The ADC input is high impedance — typically megohms". For the SAR ADCs in common microcontrollers this is misleading. The sample-and-hold capacitor needs a low source impedance: the ATmega328P datasheet says the ADC "is optimized for analog signals with an output impedance of approximately 10 kΩ or less". The example's 2.5 kΩ output impedance is fine, so the conclusion stands, but the reason given is wrong. | Reword: "the ADC draws almost no DC current, but its sampling capacitor wants a source below about 10 kΩ; this divider's 2.5 kΩ output impedance is comfortably inside that." Cite the datasheet. Pick this up again in 06-06 and 10-04. |
| m-09 | Content parity | ES `03-voltage-divider.md:53-55` vs EN `:50-51` | EN says the loading error "stays under about 10 %". ES says "se queda en torno al 10 %" ("around 10 %"). The EN statement is the correct bound: 4.8 % for equal resistors, up to 9.1 %. | ES: "se queda por debajo de un 10 %". |
| m-10 | Content / code | `widgets/ohm-law/ohm-law.ts:294`, `:363-368` | Between 0.1 W and 0.25 W the Power readout shows the note "> 1/10 W" with the `signal` tone (dot = nominal). The default 9 V / 470 Ω state (172 mW) shows exactly this mixed message (`ohms-law-light.png`). | Use `warn` for 0.1–0.25 W and `danger` above 0.25 W. |
| m-11 | Content / code | EN `03-voltage-divider.md:36`, ES `:38`; `divider.ts:132-133` | The directive passes `load="none"`, but the widget reads only `rload` and always starts unloaded. The prop is ignored. That is harmless here, but it misleads authors copying the example. | Remove `load="none"` from both lessons, or support it. Extend the A7 build check to flag unknown widget props as well as unknown widget types. |
| m-12 | Accessibility (pre-existing) | `widgets/resistor-network/resistor-network.ts:86-96` | Verified in Edge: pressing Add with the keyboard until the 4-resistor limit disables the button, and focus drops to `<body>`. Remove does the same at the 2-resistor limit. | When a button disables itself, move focus to its sibling, or use `aria-disabled` and keep it focusable. |
| m-13 | Code (pre-existing) | `ohm-law.ts:232` `name="ohm-unknown"`; `resistor-network.ts:61` `name="network-mode"` | Radio group names are hard-coded. Two instances on one page would merge into one group. | Derive the name from a per-instance id, as `Control` does with `nextId`. |
| m-14 | Design | `divider.ts:127`, `ohm-law.ts:341` | VT323's `×` is much smaller than the letters around it, so the nameplate formulas read "Vin x R2" (visible in every screenshot). The designer noted this. | Use `·` in the nameplate, or draw the multiply sign as a small SVG like the tone glyphs. |
| m-15 | Design | `_pixel.scss:121` `--pix-sch-text: 14px` | Measured at 375 px: schematic labels render at 13.5–15.5 px. VT323's x-height is exactly 0.40 em, against 0.516 for Plex Mono, so 14 px VT323 looks like about 11 px of a normal font. Values are repeated in the readouts, but the "prose highlights a part" device relies on reading the drawing. | Increase the schematic label size below 700 px, for example `--pix-sch-text: 16px` inside a media query, and check that labels do not collide. |
| m-16 | Design | `schematic.ts:205-207` (`.sch--dim { opacity: .28 }`) | Dimmed labels and values compute to 1.5–2.1:1 on the screen in both themes. No widget uses `dim` today, but the roadmap's "prose highlights a part while the rest dims" pattern will. | Before first use, either keep dimmed text at ≥4.5:1 (dim strokes only) or hide labels on dimmed parts. Add the pair to the contrast table. |
| m-17 | Code / docs | `ARCHITECTURE.md` §2 ("~380 lines of CSS"), §4.8 (`styles.css` 3.8 kB, `main.js` 297 kB) | Out of date after this change: the build now reports 9.86 kB / 2.47 kB and 304.37 kB. | Update §4.8 and §2 when the skin merges. |
| m-18 | Design / docs | `DESIGN-PIXEL-ART.md` §"Verification and known gaps" | Partly superseded by this review: axe is now run (clean inside `.pix`), keyboard operation is verified, Firefox and WebKit rendering are verified. The dark `--faint` failure (4.20:1) is missing from the doc. | Update the section and point to §5 of this file. |

### Suggestions

| ID | Area | Location | Finding | Recommendation |
|---|---|---|---|---|
| s-01 | Design | `_pixel.scss:266-276`, `:338-352` | Under `forced-colors: active` the segment-key LED (drawn with `box-shadow`) disappears. The selected key keeps a `Highlight` outline, so state is still visible (verified screenshot), but the designed hollow/filled cue is lost. | Draw the LED with `border` and `background`, which survive forced colours. |
| s-02 | Code | `schematic.ts:221-223` | A highlight stroke of 3 units on integer coordinates with `crispEdges` can render as 2 or 4 device pixels depending on scale. | Use 4 units, or offset highlighted paths by 0.5. |
| s-03 | Accessibility | `control.ts:180-202` | The text box and the slider both have the accessible name "R1", so a screen reader announces two controls with the same name. | Keep "R1" on the slider. Give the box `aria-label="R1, exact value"`, or `aria-describedby` the bounds. |
| s-04 | Code (pre-existing) | `control.ts:188`, `:203` | `$any($event.target)` sits against CLAUDE.md's "avoid any". | Use a typed handler, for example `(change)="commitText(entryEl.value)"` with a template ref. |
| s-05 | Pedagogy | 04-04 vs 06-02 | Comparators often have open-drain outputs that need a pull-up, but pull-ups are taught in 06-02. | Add a one-paragraph pull-up explanation in 04-04 with a forward link. |
| s-06 | Pedagogy | §4 module 03 | Transistors appear only as switches. Small-signal amplification is left to op-amps, which is a defensible choice but an unstated one. | Say so in the module 03 or 04 intro, so readers coming from Sedra & Smith are not surprised. |
| s-07 | Plan | §2 A7 | Several findings here (m-11, M-11, M-12) could be caught by a script. | Add to A7: unknown widget props, glyph coverage of instrument strings, axe on every route, and a contrast-table regeneration script fed from `_pixel.scss`. |
| s-08 | References | §2 A5 | EN and ES lessons may cite different editions. Spanish editions exist for Boylestad, Floyd, Malvino, Sedra & Smith and Franco (see BIBLIOGRAPHY). | Let `bibliography.yaml` entries carry an `es:` alternate edition, and render the ES edition on ES pages. |

---

## 4. Per-module readiness matrix

✅ = ready, ⚠️ = needs work before writing, ❌ = blocked.

| Module | Outline ok? | Instruments ok? | Dependencies ok? | References available? | Notes |
|---|---|---|---|---|---|
| 00 Fundamentals | ⚠️ | ✅ | ✅ | ✅ | Add Kirchhoff (M-03), move the multimeter here (M-05), thermal resistance into 00-04 (M-06). Fix lesson 02 errors (M-01, M-02). |
| 01 Passives | ✅ | ⚠️ | ⚠️ | ✅ | `cap-charge` fails the one-question rule (m-02). Inductor saturation and ESR come ahead of 02 (M-06). Sources: Maxim/ADI 5527, IEC 60063, Würth. |
| 02 Time and frequency | ⚠️ | ✅ | ⚠️ | ✅ | Add an AC/RMS/dB lesson (M-04) and scope basics first (M-05). Needs A2, A3 and the τ glyph decision (M-11). |
| 03 Semiconductors | ✅ | ⚠️ | ⚠️ | ✅ | `zener-clamp` brief missing. 03-06 thermal dependency (M-06). β glyph (M-11). Source: TI SLUA618. |
| 04 Analog ICs | ✅ | ✅ | ✅ | ✅ | Needs the op-amp symbol (A1) and the Bode plot (A2). Pull-up note (s-05). Sources: Franco, Jung, Carter & Mancini, NE555. |
| 05 Power | ✅ | ⚠️ | ⚠️ | ✅ | `boost` and `inrush` briefs missing. Safety policy (M-08). Overlaps (m-03). θJA glyph (M-11). Sources: Erickson & Maksimović, SLVA477/372, SPRA953. |
| 06 Digital | ✅ | ✅ | ✅ | ✅ | Needs A4. Sources: AN10441, SLVA689, Ganssle, MT-002, ATmega328P datasheet. |
| 07 Buses and instruments | ⚠️ | ⚠️ | ✅ | ✅ | The two instrument lessons should move (M-05). `burden-voltage` brief missing. Sources: UM10204, Analog Dialogue SPI, Tektronix XYZs, Fluke safety. |
| 08 Sound | ✅ | ⚠️ | ✅ | ✅ | `electret-bias` and `ground-loop` briefs missing. Class-D realism (m-07). Audio level cap (M-09). Sources: Self, SLOA119, Jensen AN-004. |
| 09 Motors | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Swap 09-02 and 09-03 (m-03). `relay-driver` brief missing. Safety for mains relays (M-08). Only one dedicated source verified (Hughes & Drury), plus SLUA618 and the general texts. Optocoupler and stepper notes are unverified. |
| 10 Sensors | ✅ | ✅ | ✅ | ✅ | β glyph (M-11). Sources: Kitchin & Counts, TI SLAY054, Steinhart & Hart. A strain-gauge note is unverified. |
| 11 PCB | ✅ | ⚠️ | ❌ | ✅ | Blocked on the reference board (M-07). `stackup` is weak (m-02). IPC-2152 licensing (m-06). Sources: Bogatin, Ott, IPC-2152/2221B, Wadell, Gerber spec, KiCad docs. |

---

## 5. Design review: pixel-art skin

### 5.1 What was verified, and how

| Requirement | Result | Evidence |
|---|---|---|
| `pnpm build` | ✅ Passes, 33 routes, no budget warnings | Build log: `styles.css` 9.86 kB / 2.47 kB, `main.js` 304.37 kB |
| CLAUDE.md Angular rules | ✅ | No `standalone: true`, no explicit `OnPush`, no `@HostBinding`/`@HostListener` (`host: { class: 'pix' }` is used), no `ngClass`/`ngStyle`, `input()`/`model()`/`computed()`/`linkedSignal()` throughout, native control flow |
| Lesson prose untouched | ✅ | The diff touches no file under `content/`, `lesson-body.ts`, `app.*` or `pages/`. The skin is scoped to `.pix`. |
| Contrast table | ✅ 38/38 pairs reproduced exactly | Recomputed from `_pixel.scss` hex values. Tightest text pair: 4.65 (`#8a3f12` on `#c4d1a8`). Tightest non-text pair: 3.61 (fader fill vs slot). |
| axe inside `.pix` | ✅ 0 violations | 6 lesson routes × light / system-dark / explicit-dark. All reported violations are outside the instruments (M-12). |
| Keyboard | ✅ | Tab order per control is text box, then slider, then the next control. A 2 px square focus ring (`rgb(255,176,92)` in dark) is on every stop. Arrow keys move sliders (Vout 4.5 V → 3.46 V). Typing "4.7k" + Enter commits. Space toggles the load. Arrow keys move between radio keys. The ring is drawn on the `<label>` via `:has(input:focus-visible)`. |
| Worked example reproducible | ✅ | 9 V, R1 10 kΩ, R2 4.7 kΩ, load 10 kΩ gives Output 2.18 V, Unloaded 2.88 V, Error −24.2 %, as the lesson states |
| 375 px | ✅ | `scrollWidth == clientWidth` on all 6 lessons in both themes, and with the divider's load control open. No `.pix` element extends past the viewport. Every control is at least 44 px tall. |
| Reduced motion | ✅ | `.flow` `animation-name: none`. Grille and dither removed. |
| `prefers-contrast: more` | ✅ | `--pix-muted` resolves to `--pix-ink`, and `--pix-lcd-muted` to `--pix-lcd-ink`, in dark too (the specificity trick in `_pixel.scss:327-329` works) |
| `forced-colors: active` | ✅ (see s-01) | Real borders return. Native range. The selected key gets a `Highlight` outline. Readout glyphs survive. |
| Three theme states | ✅ | The light, system-dark and explicit-dark token sets match the prose pattern (`_pixel.scss:111-144`). axe and screenshots agree. |
| Firefox / WebKit | ✅ render | Fonts load (`document.fonts.check('20px VT323')`), the fader is styled (`appearance: none`, 44 px), no overflow at 375 px. Screenshots match Chromium. |
| `font-size-adjust: 0.4` | ✅ correct | VT323's measured `sxHeight` is 400/1000, so the rule is a no-op for VT323 and only rescales the fallback, as intended |

### 5.2 Token system

The token system is consistent:
- one unit, `--px`, set to 2 or 3 px at a breakpoint;
- palettes built in mixins;
- composites declared once on `.pix`, so they re-resolve per theme and
  breakpoint;
- widgets read only `--pix-*`, `--px` and `--pix-font`. Each widget now
  carries under 20 lines of local CSS.

The schematic falls back to prose tokens outside a panel
(`var(--pix-screen-ink, var(--ink))`), which keeps the library reusable.

One gap: `--pix-page` is declared "reference only" and never read. Either
delete it or use it in the contrast script (s-07).

### 5.3 Further pairs checked (not in the design doc)

| Pair | Ratio | Status |
|---|---|---|
| Light accent text on LCD inner shade (`#8a3f12`/`#b0bf93`) | 3.83 | Not a live pair: readout padding (4–5 u) is wider than the 3 u shade. Keep it that way, and do not left-align text in `.control__entry`. |
| Light muted on LCD shade | 4.63 | As above |
| Dimmed schematic text (opacity 0.28), both themes | 1.53–2.12 | Unused today. See m-16. |
| Light LCD slot vs case (`#c4d1a8`/`#e3dfcf`) | 1.21 | Fine: the slot has a `--pix-edge` outline at 11.90 |
| Prose caption, dark `--faint` | 4.20 | Fails. See M-12. |

### 5.4 The empty screen (orchestrator's question)

Confirmed and measured (M-10). The cause is structural, not a sizing
constant. In the two-column grid the figure cell takes the height of the
controls column, which grows with each control (four controls plus a switch
on the divider). The SVG is limited by the width of a 391 px column, so
making it taller would not enlarge it.

Of the two fixes, `align-self: start` plus `position: sticky` is the smaller
change. It also helps pedagogically: the drawing stays in view while the
reader drags the lower controls.

### 5.5 Font

VT323 is a good choice for module 00. It is monospaced (digits are 0.4 em),
has Ω and µ, and covers the Spanish accents. The design doc's comparison
table is accurate as far as it goes, but the coverage claim is too broad
(M-11).

---

## 6. Checklist template for workflow step 8

Copy this block into the module's section below and tick it during review.
A box may be left unticked only with a linked finding.

```markdown
### Module NN: <title>. Review checklist

Reviewer: ____  Date: ____  Commit: ____

**Plan and pedagogy**
- [ ] Every lesson depends only on earlier lessons (list any forward references and confirm each is a pointer, not a prerequisite)
- [ ] Every promise in `_module.md` summary is covered by a lesson
- [ ] No lesson over ~15 min; each has a single stated takeaway
- [ ] Every instrument passes ARCHITECTURE §6: write its one question here → ____

**Technical accuracy**
- [ ] Every number and worked example recomputed by hand (show the arithmetic in the review note)
- [ ] Prose numbers match the instrument at displayed precision (typed in, both languages)
- [ ] Units, SI prefixes and sign conventions consistent; locale decimals in ES (`4,5 V`)
- [ ] Safety callout present wherever mains, >50 V, stored energy, batteries or meters-on-mains appear

**Content parity**
- [ ] EN and ES make the same claims with the same strength ("under" vs "around", hedges like "typically")
- [ ] Same widgets, same directive props, same callouts in both languages
- [ ] `pnpm content` cross-check passes

**References**
- [ ] ≥ 2 `references:` per lesson, all ids resolve in `bibliography.yaml`
- [ ] Every rule of thumb, standard figure and datasheet number traceable to a cited source
- [ ] ES lessons cite the Spanish edition where one exists

**Accessibility (instrument)**
- [ ] axe: 0 violations on the lesson route in all four theme states (light, system-dark, explicit dark, explicit light on a dark OS; `tools/axe-check.mjs`)
- [ ] Keyboard-only: every control reachable and operable; visible focus on every stop; focus never lost to `<body>` (e.g. when a button disables)
- [ ] 375 px: no horizontal scroll; tap targets ≥ 44 px; schematic labels legible
- [ ] Tone changes have a non-colour cue; new colours added to both mixins with ratios in DESIGN-PIXEL-ART.md
- [ ] Reduced motion, `prefers-contrast: more` and `forced-colors` checked
- [ ] Traces/audio (A2–A4): text equivalent present; audio muted by default, level-capped, mirrored visually
- [ ] Every instrument string renders within the instrument font stack (VT323 → JetBrains Mono → Iosevka Charon Mono; Ω always comes from JetBrains Mono) and never reaches IBM Plex Mono or a system font (glyph check)

**Design and code**
- [ ] Uses `app-panel` / `app-control` / `app-readout` / `sch-*` / kit classes; no inline symbols; widget CSS reads only `--pix-*` and `--px`
- [ ] Drawing fills its screen (no large empty glass); labels do not collide
- [ ] Arithmetic in a pure function with a spec; `ng test` green
- [ ] CLAUDE.md Angular rules (no `standalone: true`, `OnPush`, `@HostBinding`, `ngClass`, `any`)
- [ ] `pnpm build` passes; route count as expected; sitemap and hreflang include the new lessons; prev/next chain intact

**Findings:** link each unticked box to an entry in the findings table.
```

---

## 7. Module checklists

*(Empty. Each module adds its ticked copy of §6 here when it reaches step 8.)*
