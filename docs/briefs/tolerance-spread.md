# Brief: `tolerance-spread` (lesson 01-01, Real resistors: tolerance, E-series and tempco)

ROADMAP §3 step 2 output for module 01's first lesson, and the module's
signature instrument (★, ROADMAP §4). The symbol and primitive agent (step 3),
the instrument agent (step 4), the content agents (steps 5–7) and the docs
agent build from this. Step 3 has three pieces of work: the A1 module 01
symbols (inductor, air and cored; potentiometer and variable resistor), which
ROADMAP requires before module 01 even though 01-01 draws neither (D-4), and a
new histogram primitive, `app-histogram` (§4, D-4, D-13). Where this brief and
ROADMAP §4 differ, this brief wins for 01-01; record any change of decision
here first.

Sources named below are bibliography ids. All of them already exist in
`content/bibliography.yaml` and `docs/BIBLIOGRAPHY.md` (sources agent,
2026-11-04): `vishay-std-ohmic-values`, `vishay-decade-table`,
`iec-60063-2015` (that the standard defines the lists, nothing else),
`tt-tn004`, `yageo-cfr`, `stackpole-cf`, `yageo-mfr`, `vishay-mbx-sma`,
`yageo-rc-l`, `vishay-tnpw-e3`, `ti-snva112`, `knudtsen-2022`,
`johnson-2010` (anecdote only), `openstax-fisica-u2-es`, `hyperphysics-es`
(four-band colours and letter codes only, never the five-band code). Nothing in
BIBLIOGRAPHY §8 may be used for a figure. In particular, **no source shows how
5 % parts are spread inside their band** (§8, "binned distribution"): every
shape the instrument draws is a labelled assumption (D-2), and the prose says
so.

All decisions are binding and listed in §10: D-1 to D-6 came with the brief
request, D-7 to D-23 were proposed by this brief and settled by the maintainer
on 2026-11-04, every one as recommended. The body cites them by number.

---

## 1. The one question and its consequence

**If I build 00-03's divider from 5 % parts, how far off can its output be,
and how far off will it usually be?** (D-1, D-7)

A resistor's printed value is a target. Its tolerance says how far the real
part may be from it: a 10 kΩ, 5 % resistor is somewhere from 9.5 kΩ to
10.5 kΩ. A divider made of two such parts can be off by the worst case, when
both parts sit at opposite ends of their bands at once. That is rare. Most
builds land much closer, because the two errors are independent and partly
cancel.

**What the reader sees.** The instrument starts on 00-03's divider: 9 V,
R1 = R2 = 10 kΩ, nominal output 4.5 V, built 1000 times on the computer from
5 % parts whose values follow a bell curve (an assumption, labelled). Under the
drawing, a histogram shows where the 1000 outputs landed: one hump centred on
4.5 V, with two dashed lines marking the worst case, 4.275 V and 4.725 V
(±5 %). The readouts say the worst case is ±5 %, that 95 % of the builds land
between 4.388 V and 4.605 V (±2.5 %), and that the furthest of the 1000 is
4.668 V, 3.7 % off: none of them reached the worst case. Pressing `1%` shrinks
the same 1000 builds to a narrow spike: worst case ±1 %, 95 % within ±0.5 %.
Pressing `Flat` (every value in the band equally likely, the pessimistic
assumption) widens the hump: 95 % within ±3.9 %, and the furthest build,
4.719 V, comes close to the worst case. Typing R2 = 1k makes the output move
almost twice as much as the parts (worst case ±9.5 %); R1 = 1k, R2 = 10k makes
it move far less (±0.9 %).

**Why it is not a sentence.** "A divider of 5 % parts is within 5 %" is a
sentence, and it is half wrong: it can be off by almost twice the tolerance
for some ratios, and it is usually off by about half. Three things need the
picture: the worst case is a hard edge that almost no build reaches; the shape
inside the edge depends on an assumption nobody publishes, and the instrument
lets you swap it and see that the edge does not move; and the same tolerance
does more or less damage depending on the ratio.

**Misconception it corrects (D-7):** "A divider built from 5 % resistors will
be about 5 % off" (and its twin: "the worst case is what to expect").

### Not in this instrument (decided)

- **Temperature (D-5, D-14).** No temperature control. Tempco shifts every
  build by the same fraction when both resistors are the same type at the same
  temperature, so a divider's ratio barely moves; showing what does move needs
  the spread of tempco between parts, which no source gives. Tempco is prose
  with sourced figures (§6 W-6, §9 section 6).
- **A "binned" 5 % distribution with a gap in the middle (D-2, D-9).** Left
  out. The prose tells the folk claim as a story (`johnson-2010`) and gives
  the evidence against it (§9 section 5).
- **A load on the divider.** That is 00-03 and 00-07. The divider here is
  unloaded, so the output depends only on the two parts.
- **Supply tolerance.** Vin is exact. `ti-snva112`'s Vref tolerance appears
  only in the method check (§6 W-5).
- **Other tolerances (D-16).** Only 5 % and 1 %, the two in the one question.
  10 %, 2 % and 0.1 % are prose.
- **E96 snapping.** R1 and R2 snap to E24, as in `divider`. E24 values are sold
  in 1 % too (`vishay-decade-table`, `vishay-mbx-sma` note (1) p. 3), so every
  state is a buyable pair.
- **Colour bands drawn on the parts.** Prose only (§9 section 2).
- **Power, heat and current flow (D-21).** No wire animation and no power
  readout: nothing in this question depends on the current. The supply clamp
  is still 24 V (§8).

---

## 2. Props (directive attributes)

Read each as `this.props()['key']`. Numeric props go through `parseValue`
(first argument, fallback as second, never `?? '…'`) so `tools/widget-props.mjs`
types them as numbers, then clamp to the control's range (and E24 for R1, R2).

| Prop | Kind | Default | Clamp / parse | Meaning |
|---|---|---|---|---|
| `vin` | number | `9` | 1 – 24 V | Supply, as `divider`'s `vin` |
| `r1` | number | `10k` | 100 Ω – 1 MΩ, then E24 | Nominal R1 |
| `r2` | number | `10k` | 100 Ω – 1 MΩ, then E24 | Nominal R2 |
| `tolerance` | text | `5` | `5`, `1`; anything else → `5` (case-sensitive) | Which tolerance the instrument starts on |
| `shape` | text | `bell` | `bell`, `flat`; anything else → `bell` | Which assumed shape it starts on |

No `seed` or `builds` prop (D-11): the instrument always starts on batch 1 of
1000 builds, so every prose number is reproducible by loading the page, and a
lesson cannot quote a batch the reader cannot get back to.

Directive line for the lesson (one instance, D-17):

```markdown
::widget{type="tolerance-spread" vin="9" r1="10k" r2="10k"}
```

**Constants (in `tolerance-spread-math.ts`, not props).**

| Constant | Value | Source / reason |
|---|---|---|
| `TOLERANCES` | `{ '5': 0.05, '1': 0.01 }` | Gold band 5 % (J), brown 1 % (F) (`tt-tn004` p. 1) |
| `BUILDS` | 1000 | A production run a reader can picture; big enough for a stable 95 % range (§6 W-1 seeds 1–5) |
| `BINS` | 66 | 4 units each across the 264-unit plot (§4) |
| `SPAN` | 1.1 | The x axis runs ± 1.1 × the 5 % worst-case deviation |
| `SIGMA_FRACTION` | 1/3 | Bell: standard deviation = tolerance / 3 (D-2; `knudtsen-2022` Appendix B runs sigma = 1/3 of the tolerance) |
| `FIRST_BATCH` | 1 | The seed the instrument starts on |

---

## 3. Controls

Inside `panelControls`, in this DOM (and tab) order.

| # | Control | Kind | Label EN / ES | Notes |
|---|---|---|---|---|
| 1 | Tolerance | `pix-segment`, 2 radio keys | legend **Tolerance** / **Tolerancia**; keys `5%`, `1%` (EN) / `5 %`, `1 %` (ES, no-break space; from `formatPercent`) | Both resistors take the same tolerance |
| 2 | Assumed shape | `pix-segment`, 2 radio keys | legend **Assumed shape** / **Forma supuesta**; keys **Bell** / **Campana**, **Flat** / **Plana** | The legend carries "assumed": the instrument never presents a shape as fact (D-2) |
| 3 | New batch | `<button type="button" class="pix-key">` | **New batch** / **Otro lote** | Seed + 1; batch number shown in readout 4's note |
| — | `pix-rule` | | | separates the question's controls from the circuit's |
| 4 | Vin | `app-control` | `Vin` (same in both; `supply`'s ES «Fuente» is avoided as in `thevenin`) | 1 – 24 V, linear |
| 5 | R1 | `app-control` | `R1` | 100 Ω – 1 MΩ, log, E24 |
| 6 | R2 | `app-control` | `R2` | 100 Ω – 1 MΩ, log, E24 |

- **Same builds across a tolerance switch (D-10).** Each build draws two
  deviates in −1 … +1 (fractions of the tolerance) from the batch's seed; the
  part is `nominal · (1 + tolerance · deviate)`. Pressing `1%` rescales the
  same 1000 builds, so the hump visibly shrinks into a spike instead of being
  redrawn. Changing Vin, R1 or R2 also keeps the deviates. Only New batch and
  the shape key draw new deviates.
- **New batch** increments the seed (2, 3, …, no upper limit in practice;
  wraps at 2³²). It does not reset on other changes. It has no undo: the prose
  only quotes batch 1, which a page reload restores.
- **Announcing a new batch.** A visually hidden `aria-live="polite"` element
  updates **only** when New batch is pressed: EN "Batch {k}: 95% of builds
  within {rel95}, furthest {farRel} off." ES the same. Sliders and keys do not
  write to it (they announce themselves).
- **Keyboard.** Radios (Tab to the group, arrows select), a native button
  (Enter, Space), `app-control` text boxes and ranges as everywhere. Radio
  `name`s from a module counter, as `power-dissipation`. The histogram is not
  interactive.
- **Layout stability.** Nothing appears or disappears. Both segments fit one
  row at 320 px (each about 130 px: two short keys). The readout notes have
  fixed shapes (§4), so values changing never reflows the bay by more than a
  digit.

---

## 4. Nameplate, readouts, tones, schematic, histogram, symbols

### Nameplate (`app-panel` heading)

Visible: `Vout = Vin · R2 / (R1 + R2)`, accent run on `R2 / (R1 + R2)` (the
ratio the tolerances move). The same string as `divider`'s unloaded plate, so
the reader recognises 00-03's circuit. No `headingAlt` (the plate never
changes). Spoken (`headingLabel`): EN "Vout = Vin × R2 / (R1 + R2), each
resistor within its tolerance"; ES «Vout = Vin × R2 / (R1 + R2), cada resistor
dentro de su tolerancia».

### Readouts (`panelReadouts`, 4, a 2 × 2 grid on wide panels)

Voltages at 4 significant figures (`formatSI(v, 'V', lang, 4)`; `thevenin`
D-17's reason: three figures would show the 1 % worst case as 4.46 V – 4.55 V
and lose the difference the lesson is about). Percentages through
`formatPercent(x, lang, 1)`; `±` and `+` are prepended by the widget.

| # | Label EN / ES | Value | Note EN / ES | Tone |
|---|---|---|---|---|
| 1 | **Nominal** / **Nominal** | `formatSI(nominal)` | **exact parts** / **con piezas exactas** | `plain` |
| 2 | **Worst case** / **Peor caso** | `±` + larger of the two relative deviations | **{low} to {high}** / **de {low} a {high}** | `plain` |
| 3 | **95% of builds** / **95 % de los montajes** | `±` + larger of the two relative deviations of the 95 % range | **{lo95} to {hi95}** / **de {lo95} a {hi95}** | `accent` (the answer to "usually") |
| 4 | **Furthest of 1000** / **El más alejado de 1000** | signed relative deviation of the furthest build (`+3.7%`, `-3.9%`) | **{v}, batch {k}** / **{v}, lote {k}** | `plain` |

- **Why ± the larger side.** A divider's worst case is not symmetric when
  R1 ≠ R2 (10k / 1k: −8.7 %, +9.5 %). The value shows the larger side, as
  `ti-snva112` tabulates only the worst side ("only the worst case is
  tabulated", §3 p. 2); the note always gives both ends exactly.
- **The 95 % range** is empirical: sort the 1000 outputs; the range is from
  the 26th to the 975th value (indices 25 and 974), which holds exactly 950
  builds. The prose says "95 of every 100 builds".
- **No warn, danger or signal tone.** Nothing here is a fault: an output at
  the worst case is still a correctly built circuit.
- The label "Furthest of 1000" carries `BUILDS` through a `{n}` placeholder so
  a later change of `BUILDS` cannot leave a stale label.

### Schematic (`sch-canvas w=31 h=16`)

`divider.ts`'s unloaded drawing, unchanged in geometry: `schSource` (4, 3)
with `value` Vin; R1 (14, 3) and R2 (14, 7) vertical; ground (14, 13);
junctions (14, 7) and (14, 13); wires `M40 30 H140`, `M40 75 V130 H140`,
`M140 110 V130`, `M140 70 H280`; `schTerminal` (28, 7) `name="Vout"` right.
Resistor values carry the tolerance: `10 kΩ ±5%` / `10 kΩ ±5 %`. Accent
`schLabel` with the nominal output at (21, 5.6), anchor middle. No flow
(D-21), no highlight.

Canvas `label` (spoken): EN "{plate}. A {vin} supply feeds R1, {r1}, and R2,
{r2}, both {tol} parts. With exact parts the output would be {nominal}." ES
the same structure.

### The histogram (`app-histogram`, D-4, D-13)

Under the schematic in the same `panelFigure` screen.

- **Data:** `histogram(outputs, xMin, xMax, BINS)`: 66 equal bins, counts of
  the 1000 outputs. A value on an inner edge goes to the upper bin; values
  outside the range (none can occur, §5) are clamped into the end bins.
- **x axis:** linear, `xMin … xMax` = nominal ± `SPAN` × the 5 % worst-case
  deviation (the larger side), **whatever tolerance is selected**: the axis
  stays put, so `1%` is visibly narrower (D-8). Ticks: nominal and the two 5 %
  worst-case ends, all labelled with `formatSI(…, 'V', lang, 4)`; minor ticks
  at ±1 % of nominal when they fall inside the range. Title `Vout` at the right
  end.
- **y axis:** none drawn; bars rise from the x axis. `yMax` = 1.15 × the
  tallest bin of the shown histogram, so both tolerances fill the height
  (D-8). The counts are in the spoken label, not on an axis.
- **Bars:** filled `rect`s, ink, 4 units wide, adjacent, whole units.
- **Band:** the **selected** tolerance's worst-case `low` and `high` as two
  dashed vertical rules, full plot height, muted ink, and one label
  **worst case** / **peor caso** centred above the band at the top margin.
- **Size:** viewBox `310 × 110` (31 × 11 grid units), the schematic's width.
  Plot area x 16 … 280 (264 units), y 14 … 86.
- **Text equivalent (WCAG 1.1.1).** `role="img"`, `aria-label` from the
  widget, updating with the values (spoken key `histogramSpoken`): EN
  "Histogram of {n} simulated dividers built from {tol} parts, assuming a
  {shape} spread. Nominal output {nominal}. 95 of every 100 land between
  {lo95} and {hi95}; the furthest is {far}, {farRel} off. The worst case runs
  from {low} to {high}." `{shape}`: EN "bell-shaped" / "flat"; ES «en forma de
  campana» / «plana». The same numbers are in readouts 2–4. No `aria-live` on
  the plot (the New batch announcement is separate, §3).
- **375 px, themes, motion:** no animation; tokens only; forced colours turn
  bars, rules and text `CanvasText`. Non-colour cue: bars are solid, the band
  rules dashed.

### Step 4 deviations (recorded after verification m-3)

- *Nominal label.* The accent `schLabel` with the nominal output sits at
  (30, 5.6) with `anchor="end"`, right-aligned over the Vout pad, not at
  (21, 5.6) anchored middle as in `divider`. Here the resistor values carry
  the tolerance (`100 kΩ ±5 %` reaches x ≈ 215 at phone text size) and
  collided with a centred label at 375 px; the 4-figure value (`818,2 mV`)
  keeps clear of them right-aligned (`tolerance-spread.ts` template comment).
- *Readout grid.* `div[panelReadouts]` uses
  `grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr))`:
  2 × 2 on wide panels, one column on phones, so a range note such as
  "4.275 V to 4.725 V" never breaks before its unit.
- *Minimum bar height.* In `app-histogram` every non-empty bin is at least
  1 unit tall, `Math.max(1, round(min(1, count / yMax) · H))`, so a lone
  build (the furthest one at 1 %, where `yMax` is about 310) does not round
  to nothing. Zero-count bins still draw no rect. (Also in
  DESIGN-PIXEL-ART's non-colour cues.)

### New primitive and symbols (step 3)

#### `app-histogram`, `src/app/ui/histogram.ts` (D-4, D-13)

**Decision: a new primitive, not an extension of `app-curve`.** Reasons:
1. `app-curve` is "one series as a polyline, markers, log or linear x"
   (ARCHITECTURE §4.4), and ROADMAP A2 says `app-trace` may absorb it. Bars,
   bins and a band are a different data model; folding them in would make the
   A2 absorption carry histogram code it does not need.
2. `mlcc-derating` and `inductor-derating` are already planned on
   `app-curve`. Leaving it untouched keeps its spec and `thevenin` unchanged
   in this change.
3. The shared part is small (a frame, a linear map, tick placement). The new
   file imports `CurveTick` from `curve.ts` so tick inputs look the same, and
   copies the pixel styles; it does not import private code from `curve.ts`.
Cost accepted: about 150 lines that resemble `curve.ts`. If A2 ever unifies
plots, both move together.

- Inputs: `w`, `h` (grid units, required); `xMin`, `xMax` (data units,
  linear, required); `counts: readonly number[]` (equal-width bins spanning
  `xMin … xMax` in order); `yMax` (count at the plot top; ≤ 0 or not finite →
  bars at 0 height); `xTicks: readonly CurveTick[]`; `xTitle`; `band?: { lo:
  number; hi: number; label: string }`; `label` (spoken; empty → decorative,
  `aria-hidden`).
- Geometry: margins left 16, right 30, top 14, bottom 24 (fixed). Bin `i`
  spans `round(left + i·W/n)` to `round(left + (i+1)·W/n)`; height
  `round(count / yMax · H)`; zero-count bins draw nothing. Band rules at
  `round(map(lo))`, `round(map(hi))`, `stroke-dasharray="4 4"`, butt caps; a
  band end outside the range is clamped to the edge.
- Styles as `curve.ts`: `crispEdges`, stroke 2, square caps (butt for dashes),
  `--pix-screen-ink` bars and titles, `--pix-screen-muted` axis, ticks, band
  and tick labels, `--pix-sch-text` text, forced-colours `CanvasText`.
- **Glyph check:** add `{ selector: 'app-histogram', input: 'label' }` to
  `SPOKEN_INPUTS` in `tools/check-glyphs.mjs` (the step 3 agent owns that
  line). Tick labels, title and band label are visible and checked.

#### `svg:g[schInductor]` (A1 module 01, D-4, D-15)

The IEC inductor: a row of humps (a coil), drawn as stepped arches, no
circles. `cored` adds two straight lines alongside, the IEC mark for a
magnetic core. Same footprint as `schResistor`: horizontal 5 grid units, pins
(0, 0) and (50, 0); vertical 4 units, pins (0, 0) and (0, 40).
- Inputs: `kind: 'air' | 'cored'` (default `'air'`), `vertical` (default
  `false`), `name` (default `'L'`), `value` (default `''`).
- Horizontal coil, one `path.stroke`: `M0 0 H9`, then for each hump start
  `x0` in 9, 17, 25, 33: `V-4 H{x0+2} V-6 H{x0+6} V-4 H{x0+8} V0`, then
  `H50`. Four humps 8 units wide and 6 tall; each hump returns to the axis at
  its end, so the cusps read as short vertical stubs, the pixel form of humps
  that touch.
- Vertical coil: `M0 0 V4`, then for `y0` in 4, 12, 20, 28: `H4 V{y0+2} H6
  V{y0+6} H4 V{y0+8} H0`, then `V40`. Humps to the right.
- `cored`: a second `path.stroke class="core"`: horizontal `M9 -10 H41 M9 -14
  H41`; vertical `M10 4 V36 M14 4 V36`.
- Text: horizontal `name` at (25, −12) air / (25, −20) cored, `value` at
  (25, 16), anchor middle (nothing hangs below the axis); vertical `name` at
  (12, 17) air / (20, 17) cored, `value` at (same x, 29).
- `highlight` thickens both paths to 4 (`.sch--hot .stroke`); `dim` per
  `SYMBOL_STYLES`; everything `currentColor`.

**Step 3 deviations (recorded by the symbols agent).**
- *Highlight.* Under highlight, a stroke-4 coil closes its 2-unit details and
  reads as a toothed bar, and the core's two lines, 4 apart, merge into one
  (checked in renders at 4× and phone scale, light and dark). Taller or wider
  humps were tried: none stays open at 4 inside the 50 × 0 / 0 × 40 footprint,
  because adjacent humps share a cusp and would need about 6 units of axis
  between them. So the drawing is three stroked paths: `path.stroke.lead`
  (`M0 0 H9 M41 0 H50`; vertical `M0 0 V4 M0 36 V40`, butt caps),
  `path.stroke.coil` (the hump path above, from (9, 0) to (41, 0), or (0, 4)
  to (0, 36)) and `path.stroke.core`. A highlight thickens only the leads to
  4, which is the non-colour cue, and a scoped rule keeps the coil and core at
  2. Hump geometry, pins and text positions are unchanged.
- *Dim.* The paths sit in one `g.art` that dims as a layer at the same 0.55
  (`ART_STYLES`), so the lead and coil overlaps leave no darker seam. `schPot`
  uses the same layer, because the wiper's square cap overlaps the
  arrowhead's last column.

#### `svg:g[schPot]` (A1 module 01, D-4, D-15)

Potentiometer (three terminals: the wiper is the third pin, as 00-03's
glossary row describes) and variable resistor (two terminals, an oblique arrow
through the body). Vertical only in this change (as `schBattery`, D-20 of
`thevenin`): a horizontal pot's wiper pin would sit at x = 25, off the grid;
add a horizontal form in the step 3 of the first lesson that needs one.
- Inputs: `kind: 'pot' | 'variable'` (default `'pot'`), `name` (default
  `'R'`), `value` (default `''`).
- Body: the vertical resistor's path, `M0 0 v10 M-9 10 h18 v20 h-18 z M0 30
  v10`, pins (0, 0) and (0, 40).
- `pot`: wiper wire `M16 20 H30` in the same `path.stroke`, and the arrowhead
  as three `rect.fill` columns pointing left with the tip on the body's edge:
  (10, 19, 2, 2), (12, 17, 2, 6), (14, 15, 2, 10). Third pin at (30, 20), on
  the grid. Text on the left: `name` at (−14, 17), `value` at (−14, 29),
  `text-anchor="end"`.
- `variable`: the oblique arrow `M-12 32 L12 8` (45°, whole-unit ends) in the
  stroked path and a pixel chevron `path.fill` `M6 6 H14 V14 H12 V8 H6 Z` at its
  head. The one diagonal in the library: the IEC symbol is oblique, and
  `crispEdges` steps it like a pixel line. If it renders poorly at 375 px the
  step 3 agent may replace it with a 2-unit staircase and records it here.
  Text right: `name` at (16, 17), `value` at (16, 29).
- `highlight` / `dim` as above; filled parts keep their size.

Both symbols are added to `SCHEMATIC` and ARCHITECTURE §4.5. No lesson draws
them until 01-04 (inductor) and later (pot); the specs are the A1 "gallery or
spec".

---

## 5. Formulas, edge cases, pure functions

### Formulas

- Nominal: `Vout = Vin · R2 / (R1 + R2)` (00-03)
- One build: `R1' = R1 · (1 + t · d1)`, `R2' = R2 · (1 + t · d2)`, with
  `d1, d2` in −1 … +1, and `Vout' = Vin · R2' / (R1' + R2')`
- **Worst case** (all extremes at once, `ti-snva112` §3 Equations 2–3 in this
  circuit's form): `low = Vin · R2(1 − t) / (R1(1 + t) + R2(1 − t))`,
  `high = Vin · R2(1 + t) / (R1(1 − t) + R2(1 + t))`
- **Sensitivity** (first order, `ti-snva112` §4): `ΔVout/Vout ≈ k · (ΔR2/R2 −
  ΔR1/R1)` with `k = R1 / (R1 + R2)`, from 0 to 1. So the worst case is about
  `2 · k · t`: equal resistors give `t` exactly (`(1 + t)/2 · Vin`), R1 ≫ R2
  gives nearly `2t`, R1 ≪ R2 nearly 0. Opposite signs: a correlated drift of
  both parts cancels (`ti-snva112` §5), which is §6 W-6's tempco point.
- **Statistical, first order** (for the spec cross-check and the prose's
  "about"): `σ_out / Vout ≈ k · √2 · σ_part`. Bell: `σ_part = t / 3` → equal
  resistors `0.236 · t` (1.18 % at 5 %); flat: `σ_part = t / √3` → `0.408 · t`
  (2.04 %). (`ti-snva112` §7 warns RSS is exact only for sums; at these
  tolerances the first-order figure is within the sampling noise, §6 W-1.)

### The random model (D-2, D-3, D-10)

All of it is a labelled assumption; the code comment and the prose say so.
1. **PRNG: mulberry32**, 32-bit state, seeded with the batch number:
   ```ts
   a = (a + 0x6d2b79f5) >>> 0;
   let t = Math.imul(a ^ (a >>> 15), a | 1);
   t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
   return ((t ^ (t >>> 14)) >>> 0) / 4294967296;   // [0, 1)
   ```
2. **Order:** for build `i` = 0 … 999, R1's deviate, then R2's.
3. **Flat:** `d = 2u − 1`.
4. **Bell:** `z = (u1 + … + u12) − 6` (twelve consecutive uniforms; mean 0,
   variance 1); if `|z| > 3`, discard all twelve and draw twelve more; `d =
   z / 3`. So σ = tolerance / 3 (D-2) and **no part falls outside its band**:
   the assumption is that the maker tests every part and rejects those outside
   (`vishay-mbx-sma` p. 7: "an extensive testing procedure performed on 100 %
   of the individual resistors").
5. **Why this generator.** It uses only integer operations, `+`, `−`, `·`, `/`,
   which IEEE 754 rounds the same way in every engine. ECMA-262 lets
   `Math.log`, `Math.cos` and `Math.exp` be implementation-approximated, so a
   Box–Muller generator could differ in the last bit between the Node
   prerender and a browser and, rarely, move a build across a bin edge or a
   displayed digit. Sum-of-twelve is a close bell (measured over 200 000
   draws: 99.8 % kept inside ±3, standard deviation 0.993, kurtosis 2.79
   against 3 for a true bell); the prose calls it a bell curve, not a
   Gaussian, unless it says "about".
6. Deviates depend on (seed, shape) only; outputs on deviates and (Vin, R1,
   R2, tolerance). Two `computed()`s, so a slider move does 2000 multiplies.

### Model assumptions the code comment and prose state

1. Each part's value is independent of the other's (`ti-snva112` §5: R1, R2
   and Vref are independent random variables). Parts from one reel may be
   correlated; for a divider that cancels rather than adds (same section).
2. The shape inside the band is unknown: makers do not publish it
   (`ti-snva112` §6: "the vendor may be reluctant to release this data"). Bell
   follows `ti-snva112`'s assumption and its one measured histogram of 1 %
   0805 parts (fig. 6: one peak, every bar within about ±0.8 %); flat is the
   pessimistic case. Neither is a measurement of 5 % parts.
3. Vin is exact; no load; no temperature or ageing (prose).

### Edge cases (the functions handle them; the controls cannot reach most)

| Case | Result |
|---|---|
| `vin = 0` | every output 0; relative figures 0 (never NaN) |
| `r1 + r2 = 0`, `r2 = 0` | output 0 (guard as `solveDivider`) |
| `r1 = 0` | output = Vin, worst case 0 % |
| `builds = 0` | empty arrays; stats 0; histogram all zero |
| `xMax ≤ xMin` (nominal 0) | histogram all zero; `axisRange` returns `xMin = xMax = 0`, the widget passes `yMax = 0` |
| seed 0, negative or non-integer | `>>> 0` makes it a valid 32-bit state |
| any NaN input | never NaN out |

### `src/app/widgets/tolerance-spread/tolerance-spread-math.ts`

```ts
export type ToleranceKey = '5' | '1';
export type ShapeKey = 'bell' | 'flat';

/** Gold 5 % (J), brown 1 % (F): tt-tn004 p. 1. */
export const TOLERANCES: Readonly<Record<ToleranceKey, number>> = { '5': 0.05, '1': 0.01 };
export const BUILDS = 1000;
export const BINS = 66;
export const SPAN = 1.1;
export const FIRST_BATCH = 1;

/** mulberry32: uniform in [0, 1), bit-identical in every engine. */
export function mulberry32(seed: number): () => number;
/** 2 · builds deviates in −1 … +1 (R1, R2 per build); bell = sum-of-12,
 *  rejected outside ±3, divided by 3; flat = 2u − 1. */
export function deviates(seed: number, builds: number, shape: ShapeKey): Float64Array;

export function dividerOut(vin: number, r1: number, r2: number): number;
export interface WorstCase {
  readonly low: number;
  readonly high: number;
  readonly rel: number; // max(nominal − low, high − nominal) / nominal; 0 if nominal is 0
}
export function worstCase(vin: number, r1: number, r2: number, tol: number): WorstCase;
export function buildOutputs(
  dev: Float64Array, vin: number, r1: number, r2: number, tol: number,
): Float64Array;

export interface SpreadStats {
  readonly nominal: number;
  readonly lo95: number;     // sorted[round(0.025 · n)]
  readonly hi95: number;     // sorted[n − 1 − round(0.025 · n)]
  readonly rel95: number;    // max side, relative
  readonly furthest: number; // the output with the largest |v − nominal| (first one on a tie)
  readonly furthestRel: number; // signed
  readonly mean: number;
  readonly sd: number;       // sample standard deviation (n − 1)
}
export function spreadStats(outputs: Float64Array, nominal: number): SpreadStats;

/** nominal ± SPAN · (5 % worst-case deviation, larger side). */
export function axisRange(vin: number, r1: number, r2: number): { xMin: number; xMax: number };
export function histogram(values: Float64Array, xMin: number, xMax: number, bins: number): number[];

/** First-order σ_out / Vout: R1/(R1 + R2) · √2 · σ_part. */
export function analyticSpread(r1: number, r2: number, tol: number, shape: ShapeKey): number;

export function parseTolerance(raw: string | undefined): ToleranceKey; // unknown → '5'
export function parseShape(raw: string | undefined): ShapeKey;         // unknown → 'bell'
```

### Spec cases (`tolerance-spread-math.spec.ts`, assert through the formatters)

Voltages at 4 figures, percentages at 1 decimal, EN | ES.

1. `mulberry32(1)`: first three values toBeCloseTo 0.6270739405881613,
   0.002735721180215478, 0.5274470399599522 (15 digits).
2. `deviates(1, 1000, 'bell')`: length 2000; first four toBeCloseTo
   0.3620168048267563, −0.7967388605078062, 0.3283022728282958,
   −0.656508892464141; all within −1 … 1. `'flat'`: first four 0.2541478811763227,
   −0.994528557639569, 0.05489407991990447, 0.9621019349433482.
3. Determinism: two calls with the same arguments give identical arrays
   (`toEqual`); seed 2 differs from seed 1.
4. Default (9 V, 10k, 10k, 5 %, bell, batch 1): nominal `4.5 V` / `4,5 V`;
   worst `4.275 V`, `4.725 V` / `4,275 V`, `4,725 V`, rel `5%` / `5 %`; lo95
   `4.388 V`, hi95 `4.605 V`, rel95 `2.5%` / `2,5 %`; furthest `4.668 V`,
   furthestRel `3.7%` / `3,7 %`; first three outputs `4.368 V`, `4.388 V`,
   `4.451 V`; sd toBeCloseTo 0.05413 (4 digits).
5. Same batch at 1 %: worst `4.455 V`, `4.545 V`, `1%`; lo95 `4.477 V`, hi95
   `4.521 V`, `0.5%` / `0,5 %`; furthest `4.534 V`, `0.7%`; first three
   `4.474 V`, `4.478 V`, `4.49 V`.
6. Flat, 5 %: lo95 `4.327 V`, hi95 `4.671 V`, `3.9%`; furthest `4.719 V`,
   `4.9%`. Flat, 1 %: `4.466 V`, `4.534 V`, `0.8%`; furthest `4.544 V`, `1%`.
7. Worst case bounds every build: for both shapes, both tolerances and seeds
   1–5, every output lies in `[low, high]`.
8. Histogram, default: `axisRange` → `4.253 V`, `4.748 V`; 66 bins; sum 1000;
   max bin 64; bins 0–9 and 56–65 all 0. Exact array (from §6 W-1) `toEqual`.
   At 1 %: max bin 271, sum 1000. Flat 5 %: max 38; flat 1 %: max 158.
9. Batches 2–5 at 5 % bell: rel95 `2.4%`, `2.3%`, `2.4%`, `2.4%`; furthest
   `4.688 V` (`4.2%`), `4.325 V` (`-3.9%` / `-3,9 %`), `4.345 V` (`-3.4%`),
   `4.305 V` (`-4.3%`).
10. Ratio: 10k / 1k at 5 %: nominal `818.2 mV` / `818,2 mV`; worst `746.7 mV`,
    `895.7 mV`, rel `9.5%` (the high side); batch 1 lo95 `782 mV`, hi95
    `853.4 mV`, `4.4%`. 1k / 10k at 5 %: nominal `8.182 V`; worst `8.104 V`,
    `8.253 V`, `0.9%`; lo95 `8.144 V`, hi95 `8.216 V`, `0.5%`.
11. Equal-resistor identity: for t in {0.01, 0.05, 0.1} and any vin,
    `worstCase(vin, r, r, t)` gives `low = vin · (1 − t)/2`, `high = vin ·
    (1 + t)/2` (12 digits).
12. Analytic cross-check: `analyticSpread(10k, 10k, 0.05, 'bell')`
    toBeCloseTo 0.011785 (5); `'flat'` 0.020412 (5). The default batch's
    `sd / nominal` is within 10 % of the bell figure; the flat batch's within
    10 % of the flat figure.
13. Method check against `ti-snva112` (write its Equation 2 inline, Vref
    1.275 V, `Vout = Vref · (R1 + R2) / R1`, ideal ratio for 5.0 V): worst side
    with Vref ±1 %: 1 % resistors toBeCloseTo 2.520 % (3), 5 % resistors
    8.921 % (3). Six-sigma RSS with σ = t/6 and sensitivity `1 − Vref/Vout`:
    `1.45%` and `5.36%` at 2 decimals, equal to Table 4 (§6 W-5).
14. Guards: vin 0; r1 + r2 0; builds 0; nominal 0 histogram; no NaN in any
    field.
15. `parseTolerance`: `undefined`, `''`, `'5%'`, `'0.05'` → `'5'`; `'1'` →
    `'1'`. `parseShape`: `undefined`, `'Bell'`, `'uniform'` → `'bell'`;
    `'flat'` → `'flat'`.

### Spec cases (step 3)

`src/app/ui/histogram.spec.ts`, **app-histogram**:
1. One `svg[role="img"]` whose `aria-label` is `label` and updates; empty
   `label` → `aria-hidden="true"`, no role `img`.
2. With 66 counts at w = 31: 66 or fewer `rect`s (zero bins draw none); each
   bar 4 units wide; the first bin's left edge at x = 16, the last bin's right
   edge at 280; all coordinates whole units.
3. Height: a count equal to `yMax` reaches the plot top (y 14); 0 draws no
   rect; `yMax` 0 or NaN draws no bars and no NaN in any attribute.
4. Band: two dashed rules (`stroke-dasharray` `4 4`) at the mapped `lo`, `hi`
   (±1 unit) spanning the plot height; its label text centred between them; a
   band end outside the range is clamped.
5. Tick labels render the given strings at the mapped positions; `xTitle`
   renders after the axis.
6. Empty `counts`: axis only, no rects, no error.

`schematic.spec.ts`, **schInductor**:
1. Exported in `SCHEMATIC`.
2. For `kind` `air` and `cored`, both orientations: group class `sch`, then
   `sch sch--dim`, then `sch sch--hot`.
3. Pins: horizontal path starts at (0, 0) and ends at (50, 0); vertical at
   (0, 0) and (0, 40); every vertex whole-unit.
4. Four humps: the coil path's extreme off-axis coordinate is −6 (horizontal)
   or +6 (vertical), reached exactly four times as a horizontal (or vertical)
   run of 4 units.
5. `cored`: a second stroked path with two straight runs of 32 units parallel
   to the axis; `air`: none.
6. `name` and `value` positions as §4 for each kind and orientation.
7. No `<circle>`.

**schPot**:
1. Exported in `SCHEMATIC`; classes for dim and highlight as above.
2. Body identical to the vertical `schResistor` path.
3. `pot`: the path contains `M16 20 H30`; three `rect.fill` arrowhead columns,
   the leftmost at x = 10; name and value at x = −14 with `text-anchor` end.
4. `variable`: no wiper; the path contains a segment from (−12, 32) to
   (12, 8); a `path.fill` chevron; text at x = 16.
5. Every coordinate whole-unit; no `<circle>`.

---

## 6. Worked examples (all numbers computed by script with `core/format.ts`)

Computed by a Node 22 script (`--experimental-strip-types`) that imports
`src/app/core/format.ts` and implements §5's generator exactly: mulberry32
seeded with the batch number, deviates R1 then R2 per build, bell =
sum-of-twelve rejected outside ±3, `BUILDS` = 1000, `BINS` = 66. **Batch 1
unless stated.** EN | ES; ES percentages carry a no-break space before `%`.

### W-1, the start state: 5 % parts, bell (the one question)

9 V, R1 = R2 = 10 kΩ, `5%`, `Bell`, batch 1.

- Nominal `9 V · 10 kΩ / 20 kΩ = 4.5 V`
- Worst case: R1 at 10.5 kΩ, R2 at 9.5 kΩ: `9 · 9.5 / 20 = 4.275 V`; the
  other way `9 · 10.5 / 20 = 4.725 V`. Equal resistors: off by exactly the
  tolerance, ±5 %.

| Readout | EN | ES |
|---|---|---|
| Nominal | 4.5 V (exact parts) | 4,5 V (con piezas exactas) |
| Worst case | ±5% (4.275 V to 4.725 V) | ±5 % (de 4,275 V a 4,725 V) |
| 95% of builds | ±2.5% (4.388 V to 4.605 V) | ±2,5 % (de 4,388 V a 4,605 V) |
| Furthest of 1000 | +3.7% (4.668 V, batch 1) | +3,7 % (4,668 V, lote 1) |

Histogram axis 4.253 V to 4.748 V; bins (66, low to high):
`0,0,0,0,0,0,0,0,0,0,1,1,3,2,3,2,3,10,7,10,17,18,17,25,22,32,30,43,63,55,37,52,64,53,50,49,46,46,46,49,25,23,22,17,13,10,9,11,8,2,1,0,2,0,0,1,0,0,0,0,0,0,0,0,0,0`
(max 64). Lowest build 4.333 V; first three builds 4.368 V, 4.388 V,
4.451 V; sample standard deviation 54.13 mV (1.20 %), against the first-order
1.18 %.

**New batch** (prose: "press New batch a few times"), 5 %, bell:

| Batch | 95% of builds | Furthest of 1000 |
|---|---|---|
| 1 | ±2.5% (4.388 V to 4.605 V) | +3.7% (4.668 V) |
| 2 | ±2.4% (4.4 V to 4.606 V) | +4.2% (4.688 V) |
| 3 | ±2.3% (4.396 V to 4.604 V) | -3.9% (4.325 V) |
| 4 | ±2.4% (4.393 V to 4.593 V) | -3.4% (4.345 V) |
| 5 | ±2.4% (4.398 V to 4.608 V) | -4.3% (4.305 V) |

Prose points: the 95 % range barely moves between batches; the furthest
build moves more, and in five batches (5000 builds) none reaches ±5 %.
`knudtsen-2022`: "worst-case limits are statistically improbable". The
opening situation can use build 1 of batch 1, 4.368 V (−2.9 %): inside the
band, nothing wrong with the circuit. (If the prose says a meter reads it,
00-05's 10 MΩ on a 5 kΩ output costs −0.05 %, below the fourth digit's
meaning here; say "about 4.37 V".)

### W-2, the same builds from 1 % parts

Press `1%` (same batch, same deviates, each error a fifth as large).

| Readout | EN | ES |
|---|---|---|
| Nominal | 4.5 V (exact parts) | 4,5 V (con piezas exactas) |
| Worst case | ±1% (4.455 V to 4.545 V) | ±1 % (de 4,455 V a 4,545 V) |
| 95% of builds | ±0.5% (4.477 V to 4.521 V) | ±0,5 % (de 4,477 V a 4,521 V) |
| Furthest of 1000 | +0.7% (4.534 V, batch 1) | +0,7 % (4,534 V, lote 1) |

Bins: `…,0,5,21,67,153,271,244,166,60,12,1,0,…` (bins 28–37; max 271; all
others 0). First three builds 4.474 V, 4.478 V, 4.49 V.

Prose points: the five-times-tighter part gives a five-times-narrower spread.
Every 1 % build here is closer to 4.5 V than the 95 % range of the 5 % builds.
What 1 % costs is the prose's call ("metal film or thin film", W-6); no price
figure (none is sourced).

### W-3, the shape is an assumption: Flat

Press `Flat` (new deviates: flat batch 1).

| Readout | EN 5% | ES 5 % | EN 1% | ES 1 % |
|---|---|---|---|---|
| Worst case | ±5% (4.275 V to 4.725 V) | ±5 % (de 4,275 V a 4,725 V) | ±1% (4.455 V to 4.545 V) | ±1 % (de 4,455 V a 4,545 V) |
| 95% of builds | ±3.9% (4.327 V to 4.671 V) | ±3,9 % (de 4,327 V a 4,671 V) | ±0.8% (4.466 V to 4.534 V) | ±0,8 % (de 4,466 V a 4,534 V) |
| Furthest of 1000 | +4.9% (4.719 V, batch 1) | +4,9 % (4,719 V, lote 1) | +1% (4.544 V, batch 1) | +1 % (4,544 V, lote 1) |

Max bin 38 (5 %), 158 (1 %). Standard deviation 92.17 mV (2.05 %), against
the first-order 2.04 %. First-order 95 % half-width for two flat parts (a
triangle): `(1 − √0.05) · t` = 3.88 %, matching ±3.9 %.

Prose points: the worst-case lines did not move; only the shape inside them
did. If every value in the band were equally likely, about 1 build in 25
would land beyond ±4 % (38 of this batch; the prose says "a few dozen in a
thousand" or quotes no count, since the readouts do not show it). The bell
is what `ti-snva112` assumes and what its one measured histogram of 1 %
parts looks like (fig. 6); flat is the cautious case. A design that must work
should be checked against the worst case either way (`knudtsen-2022`: "both
worst-case and statistical analysis provide valuable insights").

### W-4, the ratio decides how much the tolerance hurts

Back to `Bell`, `5%`. Type `1k` in R2 (R1 10k), then swap (R1 1k, R2 10k).

| Readout | EN 10k / 1k | ES 10k / 1k | EN 1k / 10k | ES 1k / 10k |
|---|---|---|---|---|
| Nominal | 818.2 mV | 818,2 mV | 8.182 V | 8,182 V |
| Worst case | ±9.5% (746.7 mV to 895.7 mV) | ±9,5 % (de 746,7 mV a 895,7 mV) | ±0.9% (8.104 V to 8.253 V) | ±0,9 % (de 8,104 V a 8,253 V) |
| 95% of builds | ±4.4% (782 mV to 853.4 mV) | ±4,4 % (de 782 mV a 853,4 mV) | ±0.5% (8.144 V to 8.216 V) | ±0,5 % (de 8,144 V a 8,216 V) |
| Furthest of 1000 | +7% (875.5 mV, batch 1) | +7 % (875,5 mV, lote 1) | -0.7% (8.125 V, batch 1) | -0,7 % (8,125 V, lote 1) |

Worst-case sides: 10k / 1k −8.7 % / +9.5 %; 1k / 10k −0.9 % / +0.9 %
(−0.95 %, +0.87 % unrounded). At 1 %: 10k / 1k worst ±1.8 %
(803.4 mV to 833.2 mV), 95 % ±0.9 %; 1k / 10k worst ±0.2 % (8.167 V to
8.197 V).

Prose points: when R2 is the small one, the output is a small slice of Vin
and both parts' errors land almost fully on it: nearly twice the tolerance.
When R2 is the big one, the output is most of Vin and the parts can only nudge
it. `ti-snva112` §4 calls this sensitivity, from 0 to 1. An example the
reader has met: 00-03's divider for reading a 12 V battery with a
microcontroller, R1 = 10 kΩ and R2 = 2.7 kΩ, has a small R2, the sensitive
kind. Typed in (Vin `12`, R1 `10k`, R2 `2.7k`, 5 %): nominal 2.551 V /
2,551 V; worst case ±8.1% / ±8,1 % (2.356 V to 2.758 V / de 2,356 V a
2,758 V; −7.65 % and +8.11 % unrounded). The prose can say the battery reading
could be about 8 % off from the resistors alone, and 1 % parts bring that
under 2 %.

### W-5, method check against `ti-snva112` (brief only; the prose may cite the conclusion)

`ti-snva112` treats an adjustable regulator, `Vout = Vref · (R1 + R2) / R1`
with Vref = 1.275 V, which is this divider turned round. Its worst case is
Equations 2–3, all extremes at once: the same rule as §5. With the ideal
ratio for 5.0 V and Vref ±1 %, the script gives the worst side:

| Resistors | This brief's formula | `ti-snva112` Table 1 |
|---|---|---|
| 1 % | 2.52 % | 2.54 % |
| 5 % | 8.92 % | 9.02 % |
| 1 % at 15 V | 2.87 % | 2.87 % |
| 5 % at 15 V | 10.73 % | 10.76 % |

At 12 and 15 V the figures agree to within 0.04 points; at 5 V within 0.1;
at 1.8 and 2.5 V with 5 % parts TI's figures are up to 0.26 points higher.
TI's text says real resistor pairs rarely hit the ratio exactly, "so an
additional, but static, voltage error may have to be tolerated" (§3); the
remaining gap is consistent with TI having used real resistor values, but the
note does not say which, so treat that as an inference. **Table 4
(statistical, tolerances taken as six sigma)** is reproduced exactly: `1.45%`
with 1 % and `5.36%` with 5 % resistors at 5.0 V and Vref ±1 % (RSS of Vref
σ = 1/6 % and two resistors of σ = t/6 with sensitivity 1 − 1.275/5 = 0.745).

What the prose may say: worst case is `ti-snva112`'s "excessively
conservative" limit; a statistical estimate of the same circuit is far
smaller (2.54 % against 1.45 %, and 9.02 % against 5.36 % in its 5 V example).
The instrument's 95 % figure is not TI's six-sigma figure (it uses σ = t/3
and counts builds); the prose must not put the two side by side as the same
quantity.

### W-6, temperature and age (prose only; D-5, D-14)

**Temperature coefficient (tempco)**: how much the value changes per degree,
in ppm/K (parts per million per kelvin; 100 ppm/K is 0.01 % per degree). A
10 kΩ part warming from 25 °C to 75 °C (+50 K, inside a warm case):

| Part | Tempco (source) | At +50 K | 10 kΩ becomes |
|---|---|---|---|
| Carbon film | 0 to −500 ppm/°C for 10–99 kΩ (`stackpole-cf` p. 1); −500 to +350 ppm/°C under 100 kΩ (`yageo-cfr` Table 2 p. 4) | down to −2.5 % | down to 9.75 kΩ |
| Thick-film chip (RC0603) | ±100 ppm/°C (`yageo-rc-l` Table 2 p. 5) | ±0.5 % | 10.05 kΩ |
| Metal film | ±50 ppm/K (`vishay-mbx-sma` p. 1; `yageo-mfr` code E) | ±0.25 % | about 10.03 kΩ |
| Thin-film chip | ±10 ppm/K best grade (`vishay-tnpw-e3` p. 1) | ±0.05 % | about 10.01 kΩ |

(4-figure displays: 9.75 kΩ, 10.05 kΩ, 10.03 kΩ, 10.01 kΩ. The prose writes
"about" for the last two: 10.025 kΩ and 10.005 kΩ.) Bulk materials for the ES
citation: carbon −0.0005 per °C, i.e. −500 ppm/K (`openstax-fisica-u2-es`
Tabla 9.1; material values, not part specifications).

**In a divider (the point the instrument would not show well):** both parts
the same type at the same temperature drift by the same fraction, and the
ratio does not move: 4.5 V stays 4.5 V. Only the difference matters. Carbon
film's range allows one part at 0 and the other at −500 ppm/K: R2 down 2.5 %
gives `9 · 9.75 / 19.75 = 4.443 V` (−1.27 %); R1 down instead gives 4.557 V
(+1.27 %). Metal film at opposite ends (±50): 4.511 V (+0.25 %). Figures are
the datasheet limits, not typical drifts; no source gives how tempco spreads
between parts, which is why it is not in the instrument.

**Ageing (load life):** after 1000 h at rated power and 70 °C, the test limit
is ±3.0 % + 0.05 Ω for Yageo carbon film and ±1.5 % + 0.05 Ω for its metal
film (`yageo-cfr`, `yageo-mfr` p. 4); Stackpole carbon film typically < ±1 %
(`stackpole-cf` p. 3); thick-film chip ±(3 % + 50 mΩ) for J (5 %) parts and
±(1 % + 50 mΩ) for F (1 %) (`yageo-rc-l` Table 5); thin film ≤ 0.05 %
(`vishay-tnpw-e3` p. 2). A 10 kΩ carbon film may end up to 10.3 kΩ: drift
of the same size as its tolerance.

### W-7, E-series numbers (prose only)

- Neighbouring values differ by `10^(1/24)` = 10.07 % in E24, 21.15 % in E12,
  2.43 % in E96 (computed from the lists' definition, `vishay-decade-table`
  "approximately by the 24th … root of 10").
- So the tolerance bands of neighbours nearly cover the decade, but not
  quite: 10 kΩ ±5 % is 9.5–10.5 kΩ and 11 kΩ ±5 % is 10.45–11.55 kΩ
  (overlap); 10 kΩ ±10 % is 9–11 kΩ and 12 kΩ ±10 % is 10.8–13.2 kΩ. Gaps
  between neighbouring bands (computed; corrected after verification m-1):
  E24 at ±5 % has seven, 13→15 (13.65 to 14.25, 4.40 %), 16→18 (1.79 %),
  24→27 (1.79 %), 18→20 (0.53 %), 27→30 (0.53 %), 82→91 (0.41 %), 56→62
  (0.17 %); E12 at ±10 % has two, 12→15 (13.2 to 13.5, 2.27 %) and 22→27
  (0.41 %). The furthest any value can be from the nearest listed one is
  7.4 % for E24 (the geometric middle of 13 and 15, about 13.96) and 11.8 %
  for E12 (between 12 and 15). The prose says the bands nearly cover the
  decade but leave small gaps, with 13→15 at 5 % as the example; it does not
  say every value is within tolerance of a listed one.
- The pairing: E12 with ±10 %, E24 with ±5 % and ±2 %, E96 with ±1 %,
  E192 with ±0.5 % and tighter (`vishay-decade-table`); `vishay-std-ohmic-values`
  heads E48 with ±2 %. Present it as the usual convention (BIBLIOGRAPHY §8:
  IEC 60063 Table 3 was not seen).
- Not every E24 value is in E96 (120, 160, 180, 220 are not; E96 has 118 /
  121, 158 / 162, 178 / 182, 221: `vishay-std-ohmic-values`), but 1 % parts are
  also sold in E24 values (`vishay-mbx-sma` note (1) p. 3; `yageo-rc-l` p. 3).

---

## 7. Glyph check (every visible string)

Rule (DESIGN-PIXEL-ART §Glyph coverage, `tools/check-glyphs.mjs`): a character
passes if VT323 draws it (`tools/glyph-coverage.json`: U+0020–007E,
U+00A0–017E, U+2212, U+2013–2014, …); Greek also via JetBrains Mono
(U+0384–03CF); ∥, arrows, subscripts via Iosevka. `×` and U+2080–209C fail in
visible text.

| String(s) | Characters outside ASCII | Result |
|---|---|---|
| `Vout = Vin · R2 / (R1 + R2)` | `·` U+00B7 | pass (VT323) |
| Tolerance / Tolerancia; `5%`, `1%` / `5 %`, `1 %` | NBSP U+00A0 (ES) | pass |
| Assumed shape / Forma supuesta; Bell / Campana; Flat / Plana; New batch / Otro lote | none | pass |
| `Vin`, `R1`, `R2`, `Vout`; resistor values `10 kΩ ±5%` / `10 kΩ ±5 %` | `Ω` U+03A9 (JetBrains Mono), `±` U+00B1 (VT323), NBSP | pass |
| Nominal / Nominal; exact parts / con piezas exactas; Worst case / Peor caso; {low} to {high} / de {low} a {high} | none | pass |
| 95% of builds / 95 % de los montajes; Furthest of 1000 / El más alejado de 1000; {v}, batch {k} / {v}, lote {k} | `á` U+00E1 (VT323), NBSP | pass |
| Readout values `±5%`, `±2,5 %`, `+3.7%`, `-3.9%` / `-3,9 %` | `±`, NBSP; the minus is U+002D from `Intl` in both locales (checked: `-3.7%` / `-3,7 %`) | pass |
| Histogram: tick labels (formatter, `V` / `mV`, 4 figures), `Vout`, worst case / peor caso | `µ` if the range ever reaches µV (it cannot: Vin ≥ 1 V) | pass |
| Formatter output: `V`, `mV`, `%`, `,` decimals, NBSP, `—` | `—` U+2014 | pass |
| Spoken only (`headingLabel`, canvas `label`, `app-histogram` `label`, the New batch live text, `ui.ts` keys ending `Spoken`) | `×` allowed | exempt |

**Must not appear in visible text:** `σ` (it would pass via JetBrains Mono,
but the readers have not met standard deviation; the panel says "95% of
builds"), `‰`, `ppm/K` and `ppm/°C` (tempco is not on the panel, D-14; if a
later change shows it, `ppm/K` is ASCII and `°` U+00B0 passes VT323), `≈`
(write "about"), `∞`, `×` (use `·`), `–` as a range dash in readouts (the
notes use the words "to" / «a»; U+2013 would pass, but words read better in a
screen reader and in both languages), `Ω` written as `ohm`.

**New `ui.ts` keys** (`UiStrings.widget`, EN and ES): `tolerance`,
`assumedShape`, `shapeBell`, `shapeFlat`, `newBatch`, `nominal`, `exactParts`,
`worstCase`, `rangeTo` (`{low}`, `{high}`), `ninetyFiveOfBuilds`,
`furthestOf` (`{n}`), `furthestNote` (`{v}`, `{k}`), `worstCaseBand`; spoken:
`toleranceSpreadSpoken` (plate), `toleranceCircuitSpoken`,
`histogramSpoken`, `shapeBellSpoken`, `shapeFlatSpoken`, `newBatchSpoken`.
The tolerance keys' text comes from `formatPercent`, not from `ui.ts`. Every
`…Spoken` key is exempt by name.

---

## 8. Safety (ROADMAP §3.1)

01-01 is not in the §3.1 table, and the instrument itself creates no hazard:
it simulates resistors, and its supply is clamped to 1–24 V. **Hazards the
lesson touches:** meter use (measuring a resistor's value with the meter's
ohms range, 00-05) and a 9 V battery feeding 00-03's divider (9 V across
20 kΩ: 450 µA, 2.03 mW in each 1/4 W resistor, harmless). §3.1's general rule
says a `:::safety` callout is mandatory in any lesson that touches "batteries,
meter use"; the table's silence on 01-01 does not override that. **Decided
(D-18):** one short callout before the bench step.

**The instrument must:**
- clamp Vin to 1–24 V and R1, R2 to 100 Ω – 1 MΩ, as `divider`;
- show no power or temperature, and no tone that calls a state safe or
  dangerous.

**The prose must not:**
- suggest heating a resistor (soldering iron, lighter, hair dryer, a hot
  car) to see tempco; the tempco figures are quoted, not an experiment
  (a resistor hot enough to show a 1 % shift on carbon film is 20 K or more
  above room temperature, and 00-06's burn thresholds start at 43–48 °C for
  long contact);
- suggest building the instrument's extreme states at the bench (24 V on
  100 Ω + 100 Ω is 1.44 W in each resistor, far past a 1/4 W rating, 00-06);
  the bench divider is 9 V with 10 kΩ parts;
- suggest measuring a resistor in place with the circuit powered (00-05: power
  off, lift one end).

**The prose must** say the shapes are assumptions (D-2), that the 1 % and 5 %
figures are the makers' tolerances, and "about" / "typical" for every curve or
endurance figure.

**Callout (D-18)**, before the bench step in section 2:

| Title (EN / ES) | Says |
|---|---|
| Measuring resistors safely / Medir resistores con seguridad | Hazard: measuring resistance in a powered circuit, or with the probes in the current jacks, puts the meter across a source (00-05). Consequence: a wrong reading at best; on the current jacks, a short across the 9 V battery that blows the meter's fuse and heats the battery and leads. Instead: disconnect the battery and lift one end of the resistor before you measure it, keep the probes in the V/Ω jacks, and never connect anything straight across the battery's two terminals, which sit side by side on a 9 V battery (00-07). |

The same callout in the same place in EN and ES. No new source: it restates
00-05's and 00-07's cited points (`fluke-80v-manual`, `energizer-alkaline-handbook`);
the content agent cites them in `references:` if it quotes any figure.

---

## 9. Lesson outline: 01-01, Real resistors: tolerance, E-series and tempco

- **Id:** `01-passives/01-real-resistors`. Slugs: EN `real-resistors`, ES
  `resistores-reales` (suggested). Title EN "Real Resistors: Tolerance,
  Standard Values and Temperature" / ES "Resistores reales: tolerancia,
  valores normalizados y temperatura" (the glossary says "list", not
  "series", D-20; the title avoids both). Summary EN (draft): "Why a resistor
  is never exactly its printed value, how the standard values were chosen,
  how far off a divider made of real parts can be, and how far off it usually
  is."
- **Minutes:** 14.
- **Depends on:** 00-03 (divider, its formula, the 9 V / 10 kΩ example),
  00-06 (carbon film, heat), 00-05 (ohms range), 00-02 (E12 list). Pointers
  only to 00-07 (Rint measured "only about" because of tolerance).
- **Misconception corrected:** a divider built from 5 % resistors will be about
  5 % off.
- **Takeaway (one sentence):** a resistor's tolerance is a hard edge on its
  value, a circuit built from several can reach the sum of their worst cases
  but almost never does, and how much the tolerance moves the output depends
  on the circuit.
- **References (same ids EN/ES):** `tt-tn004` (colour and letter code),
  `vishay-std-ohmic-values` (the lists), `vishay-decade-table` (pairing,
  root of 10, stocking), `iec-60063-2015` (the standard exists), `yageo-cfr`
  and `stackpole-cf` (carbon film: 2 % and 5 % only, tempco, endurance),
  `yageo-mfr` and `vishay-mbx-sma` (metal film: 1 %, tempco, laser trimming,
  100 % tested), `yageo-rc-l` (thick-film chip, tolerance not marked on chips
  via `tt-tn004` p. 2, laser trimmed), `vishay-tnpw-e3` (thin film),
  `ti-snva112` (worst case, sensitivity, fig. 6, Tables 1 and 4),
  `knudtsen-2022` (Monte Carlo vs worst case), `johnson-2010` (the folk claim,
  as a story), `openstax-fisica-u2-es` §9.3 (`R = R0(1 + αΔT)`, α for carbon;
  the fourth band) and `hyperphysics-es` ("Resistencias de Carbón", four-band
  tolerance colours and letter codes only), cited in both languages; plus
  `fluke-80v-manual` if callout D-18 quotes it.

| # | Section (working heading) | ~min | Content | Widget / callout |
|---|---|---|---|---|
| 1 | Opening situation | 1 | You build 00-03's divider (9 V, two 10 kΩ from your kit). It should give 4.5 V; your meter shows about 4.37 V. Is the circuit wrong? (W-1's build 1.) 00-05 promised: a resistor "will rarely read the printed value exactly; module 01 explains how far off it may be". | — |
| 2 | Tolerance and how it is marked | 2.5 | **Safety callout (D-18)** before the bench step. Define **nominal value** and **tolerance** (planned row): 10 kΩ 5 % is 9.5–10.5 kΩ. The colour code's last band: gold 5 %, brown 1 %, silver 10 % (`tt-tn004`); letters J, F, K on printed codes; chip resistors are not marked (`tt-tn004` p. 2). Bench: measure a few of your 10 kΩ with the ohms range (power off, one end lifted). Real example: a kit's 4-band carbon-film resistors are gold-band 5 % parts; carbon film comes only in 2 % and 5 % (`yageo-cfr`, `stackpole-cf`), metal film in 1 % (`yageo-mfr`). | **Safety** (D-18) |
| 3 | Why the values are 10, 11, 12, 13… | 2 | Complete the glossary's **E-series / standard values** row: the E12, E24 and E96 lists; each value about the same ratio above the last (10 %, 21 %, 2.4 %, W-7); the tolerance bands of neighbours touch, so every value is within tolerance of a listed one; the usual pairing (convention, not the IEC rule); makers stock these values (`vishay-decade-table`). Say "list". Real example: the instrument's R1 and R2 jump between E24 values. | — |
| 4 | The worst case | 2 | Define **worst case**. W-1's arithmetic by hand: 4.275 V and 4.725 V. Then sensitivity (no word needed; "how much each part moves the output"): W-4, 10k / 1k nearly ±10 %, 1k / 10k under ±1 %. `ti-snva112`: worst case is "excessively conservative". | `::widget{type="tolerance-spread" vin="9" r1="10k" r2="10k"}` (placed here; first used for W-4 by typing) |
| 5 | What usually happens | 3.5 | Define **Monte Carlo simulation** in one line (build it many times on the computer with random part values, `knudtsen-2022`) and **histogram**. Define the two **assumed shapes**: bell curve (most parts near the target, fewer further out; σ = tolerance/3 is said in words) and flat (any value in the band equally likely). Makers do not publish the shape (`ti-snva112` §6); TI's one measured histogram of 1 % parts is a single peak (fig. 6); makers laser-trim each part to its value and test every one (`vishay-mbx-sma` p. 7, `yageo-rc-l` p. 4). W-1 (±2.5 %, furthest 3.7 %), New batch (W-1 table), W-2 (1 %), W-3 (flat: the edge does not move). The folk claim (one paragraph): "1 % parts are picked out of 5 % production, leaving a gap in the middle"; Johnson's 1983 story about 10 % carbon-composition parts, an anecdote; no measurement of modern film parts shows a gap, and carbon film has no 1 % grade to pick out. `:::key`: design for the worst case; expect much better. | widget above |
| 6 | Temperature and age | 2 | Define **temperature coefficient** (tempco, ppm/K, with the 100 ppm/K = 0.01 % per degree conversion) and **load life** in one line each. W-6 table: carbon film down to −2.5 % at +50 K, metal film ±0.25 %, thin film ±0.05 %. In a divider, matched drift cancels (4.5 V stays 4.5 V); only the difference moves it (4.443 V). Ageing: a carbon film part can drift by its own tolerance in 1000 h at its rating. Real example: why precision dividers use metal or thin film from one family. No experiment (§8). | — |
| 7 | Next | 0.5 | Capacitors (01-02) have tolerances and drifts too, some far larger (01-03's ceramic capacitor that loses most of its value). | `:::note` |

**Earlier promises kept:**
- 00-05 (line 209): "It will rarely read the printed value exactly; module 01
  explains how far off it may be." → §2 (tolerance) and §4.
- 00-07 (line 165 and its closing note): "its real value can be off by its
  tolerance, such as 5 % (module 01)"; "one reason the Rint you measure is
  only 'about'". → §2 may add one sentence: a 5 % load resistor gives up to
  5 % error in 00-07's Rint.
- 00-02 (E12 list, glossary "full in 01-01") → §3.

**Links ahead (ROADMAP §4):** 01-02 and 01-03 (capacitor tolerance and DC
bias), 01-05 (reading a passive's datasheet: tolerance, tempco and load-life
rows), 04 (op-amp gain set by a resistor ratio: the same sensitivity), 05-01
(regulator output set by a divider: `ti-snva112`'s own circuit), 10 (sensor
dividers with a thermistor, whose tempco is the point).

**Glossary terms the lesson defines** (EN / ES; update the planned rows):
tolerance / tolerancia (planned → defined in 01-01); nominal value / valor
nominal; colour code / código de colores; tolerance letter / letra de
tolerancia (J, F, K); E-series, standard values (E12, E24, E96) / listas de
valores normalizados (lista E12, E24, E96) (full in 01-01; keep "list");
worst case / peor caso; Monte Carlo simulation / simulación de Monte Carlo;
histogram / histograma; bell curve / curva de campana (one line: also called
the normal or Gaussian distribution); flat (uniform) spread / reparto plano
(uniforme); temperature coefficient (tempco), ppm/K / coeficiente de
temperatura, ppm/K; load life / vida bajo carga (drift after long use at
rating); metal-film resistor / resistor de película metálica; thick film /
película gruesa; thin film / película delgada; chip resistor / resistor de
chip (surface-mount; tolerance not printed); laser trimming / ajuste por
láser. Existing: carbon-film resistor (00-06), datasheet (00-03).

---

## 10. Decisions

### Given with the brief request (binding)

| # | Decision | Where it applies |
|---|---|---|
| D-1 | **One question:** "If I build 00-03's divider from 5 % parts, how far off can its output be, and how far off will it usually be?" Many simulated dividers, a histogram of Vout, 5 % against 1 % (switch or overlay), worst-case bounds marked, readouts for nominal, worst-case range and the statistical spread. | §1, §3, §4 |
| D-2 | **Distribution:** no source establishes a binned "gap in the middle" 5 % distribution. Model bell (σ = tolerance / 3) and flat across the band, both labelled assumptions. Binned: out, or only as a labelled "what if" (settled: out, D-9). | §1, §3, §5, §6 W-3 |
| D-3 | **Seeded, deterministic PRNG:** same props, same histogram on the server and in the browser; prose numbers reproducible; specs stable; a new-seed control if useful (settled: New batch, D-11). | §3, §5 |
| D-4 | **Step 3 builds the A1 module 01 symbols** (inductor air and cored; potentiometer / variable resistor) with full specs, and any `ui/` primitive the histogram needs, never drawn inline, with a text equivalent. Decided here: a new `app-histogram`, not an extension of `app-curve` (reasons in §4; confirm as D-13). | §4, §5 step 3 specs |
| D-5 | **Tempco and E-series in the lesson;** a temperature control only if it serves the one question. Recommendation: cut from the instrument, prose only (D-14). | §1, §6 W-6, §9 |
| D-6 | **About 15 minutes, EN and ES;** no mandatory callout from the §3.1 table; say whether any hazard is touched (yes: meter use and a 9 V battery, D-18). Depends only on module 00. | §8, §9 |

### Settled on 2026-11-04 (all as recommended)

| # | Decision | Settled |
|---|---|---|
| D-7 | **Misconception wording:** "A divider built from 5 % resistors will be about 5 % off." | Accept. |
| D-8 | **Switch, not overlay:** a `5%` / `1%` segment over the same builds; the x axis fixed at the 5 % worst-case span (± 1.1 ×) so 1 % looks narrow; y rescaled to the tallest bin. An overlay needs two fills told apart without colour and squashes the 5 % hump to a fifth of the height. | Accept switch. |
| D-9 | **Binned "what if" left out entirely.** A picture outlives its label; it has no sourced shape (gap width, depth); it barely changes the answer (σ of a ±1 % gap in a 5 % band is 3.21 %, against 2.89 % flat: 11 % wider, still inside the same worst case). The prose tells the claim and the evidence. | Leave out. |
| D-10 | **Generator:** mulberry32, sum-of-twelve bell truncated at ±3σ (parts outside the band rejected, `vishay-mbx-sma` 100 % testing), deviates shared across tolerance and circuit changes; no `Math.log` / `Math.cos`. | Accept. |
| D-11 | **1000 builds, 66 bins, starting at batch 1; New batch increments the seed; the batch number in readout 4's note; no `seed` prop.** | Accept. (Alternative: 10 000 builds gives a smoother hump but a furthest build nearer the edge, weakening "almost never".) |
| D-12 | **Readouts:** Nominal; Worst case (± larger side, range in note); 95% of builds (accent); Furthest of 1000 (signed, batch in note). Volts to 4 figures. No σ on the panel; no warn / danger / signal tone. | Accept. |
| D-13 | **`app-histogram` as a new primitive** (`ui/histogram.ts`, spec, `SPOKEN_INPUTS` entry), importing only `CurveTick` from `curve.ts`. | Accept; extending `app-curve` would couple it to bars before A2 decides its future. |
| D-14 | **Tempco cut from the instrument** (D-5): matched parts cancel in a divider, and the between-part tempco spread is unsourced. Prose W-6 with datasheet limits. | Cut. |
| D-15 | **Symbols:** `schInductor` (`kind` air / cored, both orientations, resistor footprint, stepped humps); `schPot` (`kind` pot / variable, vertical only, wiper pin at (30, 20); one permitted diagonal for the variable arrow). | Accept; a horizontal pot waits for its first user. |
| D-16 | **Only 5 % and 1 % keys.** 10 %, 2 % and 0.1 % in prose. | Accept; add `0.1%` later only if a lesson needs it. |
| D-17 | **One instance** in section 4, default props; W-4 by typing. | Accept. |
| D-18 | **One `:::safety` callout**, "Measuring resistors safely", before section 2's bench step, because §3.1's general rule covers meter use and batteries even though its table omits 01-01. Docs agent adds 01-01 to the §3.1 table. | Accept. (Alternative: no bench step and no callout; weaker lesson, since 00-05 promised this measurement.) |
| D-19 | **Lesson:** id `01-passives/01-real-resistors`, slugs `real-resistors` / `resistores-reales`, 14 minutes, seven sections as §9. | Accept. |
| D-20 | **Vocabulary:** "E24 list" (glossary rule: "list", not "series"), title without either word; panel says "shape", the prose names bell curve and flat, mentions "normal / Gaussian" once; "Monte Carlo" named once with a one-line definition. ES «lista E24», «montaje», «lote», «Forma supuesta», «Campana», «Plana». | Accept. |
| D-21 | **No current-flow animation and no highlight** in the drawing: nothing in the question depends on current. | Accept. |
| D-22 | **Docs agent after the build:** ROADMAP (A1 01 row ✅ with both symbols; 01-01 shipped note; §3.1 table row per D-18; A2 note that `app-histogram` exists beside `app-curve`), ARCHITECTURE §4.4 (`app-histogram`) and §4.5 (`schInductor`, `schPot`), DESIGN-PIXEL-ART non-colour cues (solid bars, dashed worst-case band). `docs/briefs/README.md` unchanged. | Accept. |
| D-23 | **The 95 % range is empirical** (26th to 975th of 1000 sorted outputs), not ±2σ: it matches the label literally and holds for the flat shape too. | Accept. |
