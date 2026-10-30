# Brief: `thevenin` (lesson 00-07, Real sources: internal resistance and Thévenin)

ROADMAP §3 step 2 output for module 00's seventh and last lesson. The symbol
and primitive agent (step 3), the instrument agent (step 4), the content
agents (steps 5–7) and the docs agent build from this. Step 3 has real work
this time: the battery symbol that the A1 table deferred to this lesson
(`docs/briefs/meter-loading.md` D-4), a dashed enclosure symbol, and a small
curve-plot primitive (§4, D-2). Where this brief and ROADMAP §4 differ, this
brief wins for 00-07; record any change of decision here first.

Sources named below are bibliography ids. All of them already exist in
`content/bibliography.yaml` and `docs/BIBLIOGRAPHY.md` (sources agent,
2026-10-30): `energizer-ir-bulletin`, `energizer-alkaline-handbook`,
`energizer-lithium-coin-manual`, `energizer-nimh-handbook`,
`energizer-nh15-2500`, `duracell-mn1500`, `duracell-mn1604`,
`energizer-alkaline-ais-2025`, `energizer-nimh-ais`, `energizer-coin-ais`,
`wa-battery-burn-2021`, `kuphaldt-liec`, `mit-6002-2007`, `horowitz-hill-2015`
(general, no page), `fluke-80v-manual`, `fluke-11x-manual`,
`openstax-fisica-u2-es`, `hyperphysics-es`. `csb-gp1272` exists but is not
cited (D-10). Nothing in BIBLIOGRAPHY §8 may be used for a figure. In
particular, **no source states the 50 % efficiency at the maximum-power
point** (§8): it is derived in §5 and the prose derives it too.

All decisions are binding and listed in §10: D-1 to D-6 came with the brief
request, D-7 to D-30 were settled by the maintainer on 2026-10-30 (D-9
reverses this brief's proposal to leave it out and adds the CR2032 coin cell as a
simulation-only preset). The body cites them by number.

---

## 1. The one question and its consequence

**Why does a battery's voltage drop when you load it, and how much power can
it give?** (D-7)

A real source behaves like an ideal voltage in series with a resistance
inside it. Current through that hidden resistance takes a voltage from the
terminals and turns power into heat inside the source:

`V = Voc − I · Rint`

The power the load gets rises as the load resistance falls, peaks when the
load equals the internal resistance, and falls again towards a short circuit.
At the peak, half the power heats the source. A voltage divider seen from its
output is a source of exactly this kind, with 00-03's output impedance as its
internal resistance (Thévenin).

**What the reader sees.** The instrument starts on a fresh AA alkaline cell
(1.6 V, 0.25 Ω) with a 10 Ω load connected. Terminal voltage reads 1.561 V, and
its note says 39 mV is lost inside. Switching the load off shows 1.6 V: the
open-circuit reading. The plot under the drawing shows load power against
load resistance, with a filled marker at the 10 Ω load (244 mW, 9.5 % of the
cell's 2.56 W maximum) and a hollow marker at the peak, 0.25 Ω. Dragging the
load down walks the marker up the curve to the peak (2.56 W, efficiency
50 %), then down the other side, where the heat inside the cell is larger
than the power in the load: the Heat inside readout turns to the warn tone and
the internal resistance turns the hot colour. Switching to the 1.2 V NiMH
cell (30 mΩ) raises the peak to 12 W, above the 9 V battery's 10 W. Switching
to the CR2032 coin cell (3.2 V, 10 Ω) on the same 10 Ω load halves its
voltage to 1.6 V: the load sits on the coin cell's peak, which is only
256 mW, and its short-circuit current is only 320 mA. Switching
to Divider shows 00-03's 9 V, 10 kΩ / 10 kΩ divider with a 10 kΩ load:
3 V, the same number as 00-03, now on the same curve, peaking at a 5 kΩ load.

**Why it is not a sentence.** "Batteries have internal resistance" is a
sentence. Three things are not: the voltage you read depends on what you
connect; the power a source can deliver depends on its voltage *and* its
resistance (a 1.2 V cell can out-deliver a 9 V battery into a small load, and
the 9 V battery wins into a large one; a 3.2 V coin cell, twice an AA's
voltage, can give a tenth of its power); and the load that takes the most power
is the one that wastes half of it. Moving the load across six decades and
switching sources shows all three on one curve. The same curve then takes in
00-03's loaded divider and 00-05's meter loading as one idea: a source with a
resistance behind it.

**Misconception it corrects (D-7):** "A battery always gives its printed
voltage, so a higher-voltage battery can always deliver more power."

### Not in this instrument (decided)

- **Measuring the short-circuit current (D-4, D-6).** The load control stops
  at 10 mΩ, never 0. The short-circuit current `Isc = Voc / Rint` is a
  computed figure in a readout note, labelled "computed". No state of the
  instrument is a short circuit.
- **Li-ion and lead-acid presets (D-1, D-10).** The bench presets are the
  three §3.1 battery types with sourced figures. No Li-ion figure exists in
  the bibliography and none may be invented. The CR2032 coin cell is a fourth
  battery preset **for simulation only** (D-9): the prose never suggests
  measuring, loading or handling one at the bench, and it carries its own
  `:::safety` callout (§8).
- **A meter-readings mode (D-18).** The readouts are the readings: what an
  ideal voltmeter on the terminals and the known load give. "Load off" is the
  open-circuit reading. The lesson takes the two readings off them and works
  out Rint; the prose
  shows why the 00-05 voltmeter's 10 MΩ changes nothing here (§5, §6 W-2).
  No meter is drawn.
- **Discharge, temperature, time.** Rint is a constant in the model (§5,
  assumptions). How it rises as a cell runs down or gets cold, and how the
  1 kHz test reads lower than the pulse test, are prose with cited figures
  (§9 section 3).
- **Smoke, venting, fire or a hot-battery animation.** A source past its
  maximum-power point shows numbers, a warn tone and the internal resistance
  in the hot colour (§4). The hazards are three `:::safety` callouts (§8).
- **Norton equivalent, superposition, AC sources.** Not in module 00.
  `mit-6002-2007` L3 is cited for the reader who wants more; the prose does
  not name Norton.

---

## 2. Props (directive attributes)

Read each as `this.props()['key']`. Numeric props go through `parseValue`
(first argument, fallback as second, never `?? '…'`) so `tools/widget-props.mjs`
types them as numbers. Every numeric value is clamped to its control's range
after parsing, as `meter-loading` and `power-dissipation` do, so a preset can
never exceed the course's 24 V ceiling.

| Prop | Kind | Default | Clamp / parse | Used when | Meaning |
|---|---|---|---|---|---|
| `source` | text | `aa` | `aa`, `9v`, `nimh`, `cr2032`, `custom`, `divider`; anything else → `aa` (case-sensitive, as `parseMode`) | always | Which source the instrument starts on. The reader can switch (§3). |
| `voc` | number | `5` | 1 – 24 V | `source="custom"` only | Seeds the open-circuit voltage of the custom source. Ignored for the presets (they carry their own). |
| `rint` | number | `1` | 10 mΩ – 100 Ω, 3 significant figures, **not** E24 | `source="custom"` only | Seeds the custom source's internal resistance. |
| `vin` | number | `9` | 1 – 24 V | divider | Supply feeding the divider, as `divider`'s `vin`. |
| `r1` | number | `10k` | 100 Ω – 1 MΩ, then E24 | divider | As `divider`'s R1. |
| `r2` | number | `10k` | 100 Ω – 1 MΩ, then E24 | divider | As `divider`'s R2. |
| `rload` | number | `10` (battery sources), `10k` (divider) | battery: 10 mΩ – 10 kΩ; divider: 100 Ω – 1 MΩ; 3 significant figures, **not** E24 (D-13) | the starting source's family | Seeds the load of the family the instrument starts in. The other family's load starts at its own default. |
| `loaded` | text | `true` | `false` → off; anything else → on | always | Whether the load starts connected (D-14). |

The custom defaults (5 V, 1 Ω) model no device; the prose must not present them
as one (the lesson's directives never use them).

The divider ranges and defaults are `divider`'s own (`divider.ts`: 1–24 V,
100 Ω – 1 MΩ E24, defaults 9 V, 10 kΩ, 10 kΩ, load 10 kΩ), so divider mode at
its defaults reproduces 00-03's 4.5 V → 3 V.

**The presets (constants in `thevenin-math.ts`, not props; D-1, D-8).** One
value per preset: fresh, room temperature, DC (pulse or load-step) method,
because that is what the reader's two-reading measurement with a resistor
(D-4) is: a DC load step. The UI shows no brand; the prose names the makers
once as the sources.

| Key | Segment label | Voc used | Rint used | Symbol | Source and why this value |
|---|---|---|---|---|---|
| `aa` | `AA` | **1.6 V** | **0.25 Ω** | `schBattery kind="cell"` | Rint: `energizer-lithium-coin-manual` p. 4, "the starting IR of AA alkaline batteries is near 0.25 ohms" (stated, one figure, "starting" = fresh); it sits inside the fresh, DC-pulse range of `energizer-ir-bulletin` p. 1 (150–300 mΩ, 5 mA drain plus a 505 mA 100 ms pulse; same range in `energizer-alkaline-handbook` p. 8). Voc: the top of the 1.6–0.9 V per cell range devices are designed for (`energizer-alkaline-handbook` p. 3) and the open-circuit voltage in the bulletin's loaded-voltage example (`energizer-ir-bulletin` p. 2: 1.6 V − 1.0 A × 0.1 Ω = 1.5 V). Course choice anchored to those two; no source states "a fresh AA reads 1.6 V". |
| `9v` | `9 V` | **9.6 V** | **2.3 Ω** | `schBattery kind="battery"` | Rint: `duracell-mn1604` p. 2, DC resistance about 2.3 Ω near the start (read from the curve, ±0.2 Ω, typical; high-rate test 30 mA 1 h / 250 mA 1 s). It is the only DC figure for a 9 V battery in the bibliography (Energizer's 522 sheet gives none, BIBLIOGRAPHY §8). The stated 1,700 mΩ is at 1 kHz, which reads lower than a DC test (`energizer-ir-bulletin` p. 1); prose only. Voc: middle of "9.5–9.7 V" under light loads, fresh (`duracell-mn1604` pp. 1–2, derived). |
| `nimh` | `NiMH` | **1.2 V** | **30 mΩ** | `schBattery kind="cell"` | Rint: `energizer-nh15-2500` p. 1, 30 mΩ charged (stated, ±20 %; 40 mΩ half discharged), a DC figure: the same sheet gives the AC impedance separately (12 mΩ at 1000 Hz). Corroborated by `energizer-nimh-handbook` p. 6 ("typically less than 50 milliohms", fresh, fully charged). Voc: the nominal 1.2 V (`energizer-nh15-2500` p. 1), which is also the plateau the cell settles on in use (`energizer-nimh-handbook` p. 6). The 1.4 V a cell shows straight off the charger falls quickly to that plateau (same page), and the model's straight line cannot show that fall, so the plateau is the honest single value. |
| `cr2032` | `CR2032` (same in both languages) | **3.2 V** | **10 Ω** | `schBattery kind="cell"` | **Simulation only (D-9).** Rint: `energizer-lithium-coin-manual` p. 4, "the starting IR of a 2032 battery is near 10 ohms" (stated, fresh), corroborated by the same page's dual-pulse example on a fresh 2032, (3.279 V − 2.429 V) ÷ (0.097 A − 0.000003 A) = 9 Ω (the exact quotient is 8.76 Ω; the manual rounds to 9). Voc: 3.2 V, the maintainer's value (D-9): above the 3 V nominal (p. 1) and below the 3.279 V the manual's fresh cell showed with only a 1 MΩ drain (p. 4). Over life, with a 75 Ω pulse, about 10 Ω fresh, 15 Ω at 100 mAh, 36 Ω at 200 mAh and 65 Ω at the end near 210 mAh (p. 4, read from the curve, ±3 Ω, typical); cold raises it temporarily (p. 3). Prose only. A single Li/MnO2 cell (p. 1), so the single-cell symbol. |
| `custom` | `Custom` / `Libre` | control | control | `schSource` | Free values: Voc 1 – 24 V (ROADMAP §3.1), Rint 10 mΩ – 100 Ω. |
| `divider` | `Divider` / `Divisor` | Vth (computed) | Rth (computed) | `schSource` for Vin | 00-03's divider (D-3). |

**How the prose describes the spread (D-8).** The instrument's single value is
one fresh cell at room temperature, measured with a DC step. The prose says
that real figures move with:
- **the method:** a quick AC test at 1000 Hz reads lower than a DC pulse
  (`energizer-ir-bulletin` p. 1): AA 120 mΩ at 1 kHz (`duracell-mn1500` p. 1)
  against 0.09–0.30 Ω DC over its life (p. 2, read from the curve); 9 V
  1.7 Ω at 1 kHz against about 2.3 Ω DC (`duracell-mn1604`); NiMH 12 mΩ at
  1 kHz against 30 mΩ (`energizer-nh15-2500`). If the prose mentions the AC
  test it defines alternating current in one line (module 02 pointer) or
  leaves the frequency out;
- **the state of charge:** an AA from about 0.13 Ω fresh to about 0.2 Ω at
  mid-life and about 0.65 Ω at the end (`energizer-alkaline-handbook` fig. 10
  p. 9, read from the curve); a 9 V from about 2.3 to 3.1 to 4.1 Ω
  (`duracell-mn1604` p. 2, read from the curve); NiMH 30 → 40 mΩ at half
  (`energizer-nh15-2500`); a CR2032 from about 10 Ω to 65 Ω
  (`energizer-lithium-coin-manual` p. 4, read from the curve), so a worn coin
  cell's voltage collapses under the same load (§6 W-8);
- **the cold:** a fresh AA about 0.13 Ω at 20 °C and about 0.4 Ω at −20 °C
  (`energizer-ir-bulletin` fig. 2 p. 2, read from the curve);
- **the maker:** fresh AA figures run from about 0.09 Ω (Duracell's curve) to
  0.25 Ω (Energizer's "near 0.25 ohms"), and Energizer's own fig. 2 and
  fig. 10 read lower than its 150–300 mΩ statement (the bibliography comment:
  the curve and the text need not use the same test).

Write "about" for every value read from a curve, and "typical".

**Other constants.**

| Constant | Value | Source |
|---|---|---|
| `METER_RIN` (prose arithmetic and spec only; nothing is drawn) | 10 MΩ | `fluke-80v-manual` Table 18; `fluke-11x-manual` Table 7 (as 00-05) |
| `HEAT_WARN` | heat inside > load power (efficiency < 50 %) | Derived, not a convention: below 50 % more power heats the source than reaches the load (§5) |

Directive lines for the lesson (two instances, D-12):

```markdown
::widget{type="thevenin" source="aa" rload="10"}
::widget{type="thevenin" source="divider" vin="9" r1="10k" r2="10k" rload="10k"}
```

---

## 3. Controls

Inside `panelControls`, in this DOM (and tab) order. Only the active family's
source controls render (`@if`), as `meter-loading` does per mode.

| # | Control | Kind | Label EN / ES | Unit | Range | Travel | E24 | Family |
|---|---|---|---|---|---|---|---|---|
| 1 | Source | `pix-segment`, six radio keys in two fixed rows (below) | legend **Source** / **Fuente**; row 1 `AA`, `9 V`, `NiMH`, `CR2032` (same in both languages); row 2 **Custom** / **Libre**, **Divider** / **Divisor** | — | — | — | — | both |
| 2 | Open-circuit voltage | `app-control` | **Open-circuit voltage** / **Tensión en vacío** | V | 1 – 24 | linear | no | battery |
| 3 | Internal resistance | `app-control` | **Internal resistance** / **Resistencia interna** | Ω | 10 mΩ – 100 Ω | log | **no** (a cell's resistance is not a bought part) | battery |
| 2' | Vin | `app-control` | `Vin` (same in both) | V | 1 – 24 | linear | no | divider |
| 3' | R1 | `app-control` | `R1` | Ω | 100 Ω – 1 MΩ | log | yes | divider |
| 4' | R2 | `app-control` | `R2` | Ω | 100 Ω – 1 MΩ | log | yes | divider |
| 5 | Load switch | `pix-switch` (checkbox), under a `pix-rule` | **Load: {value}** / **Carga: {value}**, or **Load: None** / **Carga: Ninguna** (reuse `widget.load`, `widget.noLoad`, as `divider`) | — | — | — | — | both |
| 6 | Load | `app-control` | **Load** / **Carga** (reuse `widget.load`) | Ω | battery 10 mΩ – 10 kΩ; divider 100 Ω – 1 MΩ | log | **no** (D-13) | both |

- **One segment for everything (D-11).** The four presets, Custom and Divider
  are keys of one segment, so there is no separate mode switch whose legend
  would repeat "battery". `AA` means the alkaline AA, `NiMH` the
  rechargeable AA and `CR2032` the lithium coin cell; the prose says so once,
  and the spoken source names (§4) say it in full.
- **Segment layout at 375 px: two fixed rows (D-9, D-11).** Estimate from the
  kit's metrics at `--px` = 2 px (375 px viewport): a key is 12 px padding
  each side + a 6 px LED + a 6 px gap + its text at 20 px VT323 with 0.04 em
  tracking (about 8.8 px a character); keys sit 8 px apart. Widths: `AA`
  ≈ 54 px, `9 V` ≈ 62, `NiMH` ≈ 71, `CR2032` ≈ 89, `Custom` ≈ 89 / `Libre`
  ≈ 80, `Divider` / `Divisor` ≈ 98. All six need about 500 px; the controls
  column is about 315 px at 375 px (and about 300 px in the two-column layout
  at 900 and 1280 px), so six keys never fit one row at any width. Left to
  `flex-wrap`, the break would fall after `CR2032` or before it depending on
  a few pixels of gutter, so it is fixed instead: the four batteries on row 1
  (≈ 300 px, identical in EN and ES because the labels are the same), then a
  forced break, then Custom and Divider on row 2 (≈ 195 px EN, ≈ 186 px ES).
  Implementation: one `fieldset.pix-segment`, the six labels in this order,
  and an `aria-hidden` empty element with `flex-basis: 100%` (widget CSS,
  tokens only) between `CR2032` and Custom; radios stay one group, so arrow
  keys still move through all six. The rows read as "a battery" and "or
  something else". If row 1 itself wraps (viewports under about 340 px),
  that is accepted: the break does not depend on the selection, so the
  segment's height never changes when a key is pressed. The instrument agent
  measures at 320, 375, 900 and 1280 px, EN and ES, and records the result.
- **Presets load values; the controls are always shown (D-11).** In the battery
  family the Open-circuit voltage and Internal resistance controls are always
  rendered and show the active source's values. Pressing `AA`, `9 V`, `NiMH`
  or `CR2032` writes that preset's Voc and Rint into them. Editing either control
  (slider or text box) selects Custom and keeps the edited values. Pressing
  Custom keeps whatever values are showing. So no control appears or
  disappears between presets and Custom, and the reader always sees the
  numbers the preset uses.
- **Why the Vin label is `Vin`, not "Supply".** ES `widget.supply` is
  «Fuente», the same word as the Source legend. `Vin` matches the plate, the
  drawing and 00-03's prose (V_in).
- **Why the load is not E24 (D-13).** The headline state, a load equal to the
  internal resistance, must be typable exactly: 0.25 Ω, 2.3 Ω and 5 kΩ are not
  E24 values, and the nearest E24 value to 0.25 Ω (0.24 Ω) lands on the far
  side of the peak (efficiency 49 %, warn). A load here is also not only a
  bought resistor (a lamp, a motor, a meter). The bench worked examples still
  use E24 values (10 Ω, 220 Ω). R1 and R2 stay E24, as in `divider`.
- **Why the battery load runs 10 mΩ – 10 kΩ.** Six decades, from a third of
  the smallest preset resistance (NiMH 30 mΩ) to a load that takes a fraction
  of a milliamp from 9.6 V. The CR2032's 10 Ω sits in the middle of it, so
  the range does not change for the coin cell (its peak is at 50 % of the
  plot's width, and 10 kΩ is a thousand times its Rint). It never reaches 0,
  so no state is a short (D-4). The plot's x axis is exactly this range (§4), so the slider position
  and the marker position agree.
- **Load switch (D-14).** Off = open circuit: nothing across the terminals, the
  load's wires and RL are not drawn (as `divider` does), readouts per §4. The
  Load control stays rendered and adjustable while off (unlike `divider`), so
  toggling never moves anything below the switch. The switch is shared by
  both families.
- **Step.** `app-control` has 1000 slider positions and no step input. Over
  six decades one step is 1.4 %; the text box gives exact values (3
  significant figures). Every worked example in §6 is reproduced by typing.
- **Keyboard.** The segment is native radios (Tab reaches the group, arrows
  move and select), radio `name` from a module counter as in
  `power-dissipation` (the lesson has two instances). The switch is a native
  checkbox (Space). Each `app-control` gives a text box (Enter or blur
  commits, clamped, E24-snapped for R1/R2 only) and a range input (arrows,
  Page Up/Down, Home/End). The plot is not interactive: the Load control is
  its cursor.
- **State across a source switch.** The battery family shares one Voc/Rint
  pair (written by the preset keys) and one battery load; the divider keeps
  its own `vin`, `r1`, `r2` and divider load. Switching back to Divider
  restores what the reader had; switching from Custom to a preset overwrites
  the custom values (no separate memory).
- **Layout stability.** The segment is first, so it never moves. Battery
  family: two source controls; divider: three. The load switch and Load
  control therefore move down by one control when switching to Divider, as
  `meter-loading`'s controls do between modes (accepted there). Within a
  family nothing appears or disappears. The nameplate passes the other
  family's formula as `headingAlt`; the drawing and the plot keep one size in
  both families (§4); every readout always carries a note (§4).

---

## 4. Nameplate, readouts, tones, schematic, plot, symbols

### Nameplate (`app-panel` heading)

| Family | Visible (VT323) | Spoken EN (`headingLabel`, canvas `label` prefix) | Spoken ES |
|---|---|---|---|
| battery | `V = Voc − I · Rint` | Terminal voltage = open-circuit voltage − current × internal resistance | Tensión en los terminales = tensión en vacío − corriente × resistencia interna |
| divider | `V = Vth − I · Rth` | Output voltage = Thévenin voltage − current × Thévenin resistance | Tensión de salida = tensión de Thévenin − corriente × resistencia de Thévenin |

Accent run (inverse video): `I · Rint` (`I · Rth`), the voltage lost inside,
which is the one-question's first half. `−` is U+2212 (VT323). The two forms
are one character apart, so `headingAlt` costs nothing. The battery plate is
the cited relation: loaded voltage = open-circuit voltage − total effective
resistance × current (`energizer-ir-bulletin` p. 2; `openstax-fisica-u2-es`
§10.1). Considered and rejected (D-21): a power plate
(`P = Voc² · RL / (Rint + RL)²`), too long for the strip at 375 px and not
the first idea.

### Readouts (`panelReadouts`, 4, a 2 × 2 grid on wide panels)

| # | Label EN / ES | Value | Note, load on | Note, load off | Tone |
|---|---|---|---|---|---|
| 1 | battery: **Terminal voltage** / **Tensión en los terminales** (rule below); divider: **Output** / **Salida** (reuse `widget.output`) | battery: `formatSI(V, 'V', lang, 4)`; divider: `formatSI(V, 'V', lang)` (3 figures, D-17) | **{drop} lost inside** / **caen {drop} dentro** (`formatSI(Voc − V, 'V')`) | **open circuit** / **en vacío** | `accent` |
| 2 | **Load current** / **Corriente de carga** (reuse `widget.drawnCurrent`) | `formatSI(I, 'A')` | **short circuit: {isc} (computed)** / **en cortocircuito: {isc} (calculada)** | same | `plain` |
| 3 | **Load power** / **Potencia en la carga** | `formatSI(P, 'W')` | **{fraction} of its {pmax} maximum** / **el {fraction} de su máximo de {pmax}** (`formatPercent(P / Pmax)`, 1 decimal) | same (`0%` / `0 %`) | `plain` |
| 4 | battery: **Heat inside** / **Calor interno**; divider: **Heat in R1 and R2** / **Calor en R1 y R2** | `formatSI(Pint, 'W')` | **efficiency {eff}** / **eficiencia {eff}** (`formatPercent`, 1 decimal) | **no load** / **sin carga** | by `heatTone`, below |

**Where Isc and Pmax appear.** Isc is readout 2's note, always visible, with
the word "computed" (D-4). Pmax is readout 3's note and the plot's peak label.
The maximum-power load (`RL = Rint`) is the hollow marker on the plot and the
plot's spoken label.

**Why 4 significant figures for the battery's terminal voltage (D-17).** The
drop under a sensible bench load is small: 39 mV out of 1.6 V for an AA on
10 Ω. Three figures would show 1.56 V, and the two-reading arithmetic would
give `(1.6 − 1.56) / 0.156 = 0.256 Ω` instead of the 0.25 Ω in the model.
Four figures give 1.561 V and `0.039 / 0.156 = 0.25 Ω` (§6 W-2). The prose
says a meter needs four digits for this measurement. Divider mode keeps
`formatSI`'s 3 figures so its numbers match 00-03 exactly (3 V, 4.48 V,
2.18 V). The drawing's accent label uses the same precision as readout 1.

**ES label for readout 1 (as `meter-loading` D-5).** Use «Tensión en los
terminales» if, at 375 px (and at 900 and 1280 px), it fits the readout in at
most two lines, breaking between words, with the row no taller than its
neighbour's. Otherwise use «Tensión en terminales». The instrument agent
decides by testing and records the result; the glossary lists the label that
ships.

**`heatTone` (D-24):** load on and `Pint > P` (efficiency < 50 %) → `warn`;
otherwise `plain`. Exactly 50 % (the maximum-power point) is `plain`. The
line is a fact of the circuit, not a convention: below 50 % the source heats
more than it delivers. It applies to both families; the divider sits below
50 % at almost every setting (16.7 % at 00-03's defaults), which is 00-03's
"dividers waste power" again. No `danger` tone and no current threshold: no
source in the bibliography gives a current or temperature at which an AA, 9 V,
NiMH or coin cell is damaged (the AIS sheets say only that a *prolonged* short
heats the cell and can open its vent), so the instrument must not invent one.
No tone is ever `signal`: the instrument does not call any load "good".
The coin cell needs no tone of its own: on the default 10 Ω load it sits
exactly on its peak (efficiency 50 %, `plain`), and one step lower turns it
`warn`. Its point is made by the numbers (a 1.6 V drop, a 320 mA
short-circuit current, a 256 mW maximum), not by a colour.

**Load off.** Readout 1 shows Voc (Vth), note "open circuit"; readouts 2 to 4
show `0 A`, `0 W` (`0%` of the maximum), `0 W` with the notes above. In divider
mode readout 4 is not zero with the load off: R1 and R2 still carry current,
`Vin² / (R1 + R2)` (4.05 mW at the defaults, 00-03's "Wasted in the divider"
figure); its note is still "no load".

**Divider readout 4 is the real divider (D-19).** The Thévenin equivalent
predicts everything the load sees (readouts 1–3 and the curve) and nothing
about the heat inside: at 00-03's defaults the equivalent's `I² · Rth` would
be 450 µW, while R1 and R2 really turn 4.5 mW into heat. Readout 4 therefore
shows `P_R1 + P_R2` computed from the real divider, and its efficiency is
`P / (Vin · I_R1)`. The prose makes this a point (§9 section 6).

### Schematic (`sch-canvas w=32 h=16` in both families)

One canvas size for both families (32, not 31: the divider's box needs the
extra unit for R2's value at 1 MΩ, and both families keep one size). The
implementer may move any part by a unit to avoid label collisions at 375 px;
keep the canvas size and the topology.

**Battery family.** The dashed box is the battery; what is inside it is the
model.
- `schBox` (new, §4 Symbols) at (1, 2), `w=15`, `h=13`, `name` the segment
  label (`AA`, `9 V`, `NiMH`, `CR2032`, `Custom` / `Libre`).
- The ideal part: `schBattery` (new) at (4, 8), pins (40, 80) and (40, 120),
  `kind` `cell` (AA, NiMH, CR2032: one cell each) or `battery` (9 V), `name` `Voc`, `value`
  `formatSI(Voc, 'V')`. Custom draws `schSource` instead (the course's generic
  supply symbol, the one 00-04 calls an ideal source); its pins are 45 units
  apart, so its two wires adapt by half a unit.
- Wire `M40 80 V40 H70`; `schResistor` horizontal at (7, 4), `name` `Rint`,
  `value` `formatSI(Rint, 'Ω')`, `[highlight]` when `heatTone` is `warn` (the
  hot colour: "power turns into heat inside", the 00-06 promise); wire
  `M120 40 H160`; wire `M40 120 V140 H160`.
- `schTerminal` at (16, 4) and (16, 14) on the box edge, no names.
- Load on: wire `M160 40 H250 V70`; `schResistor` vertical at (25, 7), `name`
  `RL`, `value` the load; wire `M250 110 V140 H160`.
- Accent `schLabel` with readout 1's value at about (20.5, 9.4), anchor
  middle, in both states (with the load off it reads Voc between the open
  terminals).
- Flow on every loop wire: `sourceFlow(I)` (§5); none with the load off.

**Divider family (D-3).** The divider inside the dashed box, with its
equivalent's two numbers beside it.
- `schBox` at (1, 1), `w=19`, `h=14`, no name.
- `divider.ts`'s drawing: `schSource` (4, 3) with `value` Vin, R1 (14, 3) and
  R2 (14, 7) vertical, ground (14, 13), junctions (14, 7) and (14, 13), wires
  `M40 30 H140`, `M40 75 V130 H140`, `M140 110 V130`; wire `M140 70 H200`
  and `M140 130 H200` to `schTerminal` at (20, 7) and (20, 13).
- Load on: wire `M200 70 H260`; RL vertical at (26, 7); wire
  `M260 110 V130 H200`.
- Two accent `schLabel`s right of the box, above RL, anchor start, at about
  (21, 3) and (21, 4.6): `Vth = 4.5 V` and `Rth = 5 kΩ` (values formatted,
  3 figures). The readout-1 accent label at about (23, 9.6).
- Flow: supply loop by the supply current, load branch by the load current,
  as `divider`.

Showing the divider and its equivalent side by side, or a "Circuit /
Equivalent" view toggle, was considered (D-20): side by side does not fit
375 px; a toggle adds a control to one family only. The battery family's
drawing *is* the equivalent form (an ideal source and one resistor in a box),
so the prose points from one instance to the other.

**Canvas `label` (spoken; `ui.ts` keys ending `Spoken`).** EN drafts; ES in
the same structure. `×` only here.
- Battery, load on: "{plate}. Inside the dashed box, the {sourceName} is drawn
  as an ideal {voc} source in series with its internal resistance, {rint}. A
  {rload} load across its terminals has {v} across it and {i} through it. The
  load takes {p}, and {heat} turns to heat inside the battery." When `warn`,
  add: "That is more than the load gets."
- Battery, load off: "{plate}. Inside the dashed box, the {sourceName} is drawn
  as an ideal {voc} source in series with its internal resistance, {rint}.
  Nothing is connected to its terminals, so no current flows and they read
  {v}, the open-circuit voltage."
- Divider, load on: "{plate}. Inside the dashed box, a {vin} supply feeds R1,
  {r1}, and R2, {r2}. Seen from its two terminals it acts like a {vth} source
  behind {rth}. A {rload} load has {v} across it and {i} through it and takes
  {p}; R1 and R2 turn {heat} into heat."
- Divider, load off: "… Nothing is connected, and the terminals read {v}."
- `{sourceName}`: EN "AA alkaline cell", "9 V alkaline battery", "AA NiMH
  rechargeable cell", "CR2032 lithium coin cell", "custom source"; ES «pila
  alcalina AA», «pila alcalina de 9 V», «pila recargable NiMH AA», «pila de
  botón de litio CR2032», «fuente libre».

### The P–R plot (D-2)

Under the schematic, inside the same `panelFigure` screen, an `app-curve`
(new primitive, below): load power against load resistance.

- **x axis:** log, exactly the Load control's range: battery 10 mΩ – 10 kΩ
  (ticks every decade, labels every two: `10 mΩ`, `1 Ω`, `100 Ω`, `10 kΩ`);
  divider 100 Ω – 1 MΩ (labels every decade: `100 Ω`, `1 kΩ`, `10 kΩ`,
  `100 kΩ`, `1 MΩ`). Labels through `formatSI`. Title `RL` at the right end.
  The slider position and the marker's x position are the same fraction of
  the width (D-16).
- **y axis:** linear from 0 to `1.15 · Pmax` (room for the peak label). Labels:
  `0` at the origin only; the peak's value is the peak label. Title `P` at the
  top of the axis. Because y is scaled to Pmax, every source's curve has the
  same shape and height, which is the point (the shape is universal; the
  scale is the source's). The scale is stated by the peak label and readout
  3's note.
- **Curve:** `curvePoints(Voc, Rint, xMin, xMax, 121)` (§5), drawn as one
  stroked path in screen ink.
- **Markers:** the maximum-power point, a hollow 8 × 8 square in ink at
  (Rint, Pmax) with the label **max {pmax}** / **máx. {pmax}** above it; the
  present load, a filled 6 × 6 square in the hot colour at (RL, P) with a
  dashed vertical guide down to the x axis. Shape (hollow vs filled) is the
  non-colour cue. With the load off, the present-load marker and guide are not
  drawn; the curve and the peak stay.
- **Battery peaks** sit at 8 % (NiMH), 23 % (AA), 39 % (9 V) and 50 %
  (CR2032, 10 Ω) of the width;
  the divider default (5 kΩ) at 42 %. A custom Rint at 10 mΩ puts the peak on
  the left edge (half the curve off-plot): accepted, the readouts still give
  every number.
- **Size:** viewBox `310 × 120` units (31 × 12 grid units), the schematic's
  width, so text renders at the schematic's size. Text uses `--pix-sch-text`
  (14 units, 16 at ≤ 520 px). At 375 px the battery x labels are about 87
  units apart and `100 mΩ`-style labels are about 38 units wide: no overlap.
- **Colours:** axes and guide `--pix-screen-muted` (6.50 / 6.80 on the screen,
  above 3:1 for lines); curve and hollow marker `--pix-screen-ink`; filled
  marker `--pix-hot` (5.38 / 10.68). No new colour, so no new contrast pair.
  `crispEdges`, whole-unit coordinates, stroke 2, no circles.
- **Text equivalent (WCAG 1.1.1, ROADMAP A2).** The plot's `<svg>` is
  `role="img"` with an `aria-label` that updates with the values (spoken key):
  EN "Plot of load power against load resistance, {xmin} to {xmax} on a
  logarithmic scale. The power peaks at {pmax} when the load equals {rint}.
  The load now, {rload}, takes {p}, {fraction} of that peak." With the load
  off, the last sentence becomes "No load is connected." ES the same. The
  headline numbers are also visible in readouts 3 (P, fraction, Pmax) and in
  the Load control (RL). No `aria-live`: a live region would announce every
  slider step; the slider already announces its value (`aria-valuetext`).
- **Keyboard:** operated entirely through the Load control. No pointer
  interaction on the plot in this change.
- **375 px, both themes, reduced motion:** the plot has no animation; it
  follows the theme through the tokens; forced colours turn it to
  `CanvasText`, and the hollow/filled shapes still tell the markers apart.

### New symbols and primitive (step 3)

All symbols extend `SchSymbol` (so `x`, `y`, `dim`, `highlight` work), use
`SYMBOL_STYLES`, `class="stroke"` / `fill` / `label` / `value`,
`currentColor`, whole-unit coordinates and even stroke widths (2; 4 when hot),
and are added to `SCHEMATIC`. Specs in `schematic.spec.ts` (A1's "gallery or
spec").

**`svg:g[schBattery]` (D-5, D-20).** The IEC cell symbol: a long thin plate
(+) and a short thick plate (−). Vertical only in this change (D-20: no lesson
needs a horizontal battery yet; add it in the step 3 of the first lesson that
does). 4 grid units long, like the vertical resistor and meter, so both pins
are on the grid (unlike `schSource`, whose bottom pin is at 45).
- Inputs: `kind: 'cell' | 'battery'` (default `'cell'`), `name` (default
  `''`), `value` (default `''`), `plus` (default `true`: draw `+` beside the
  top pin; the long plate and the top pin are always the + side).
- `cell`: path `M0 0 V16 M-12 16 H12 M0 26 V40` (top lead, long plate 24 wide,
  bottom lead) plus the short plate as `<rect class="fill" x="-6" y="22"
  width="12" height="4">` (12 wide, 4 thick: the thick short plate of the IEC
  symbol, and visibly different from `schSource`'s two thin pairs).
- `battery` (several cells in one case, e.g. the 9 V): two plate pairs joined
  by a dashed link, the IEC way of drawing a battery of cells. Path
  `M0 0 V6 M-12 6 H12 M-12 26 H12 M0 34 V40`; short plates `rect.fill` at
  (−6, 10, 12, 4) and (−6, 30, 12, 4); the link as two `rect.fill` dots
  (−1, 16, 2, 2) and (−1, 20, 2, 2). Long plates at y 6 and 26, each above its
  short plate.
- `+`: `<text class="label" x="-18" y="8" text-anchor="end">+</text>` (as
  `schSource`). `name` at (16, 17), `value` at (16, 29) as `schResistor`
  vertical and `schMeter`.
- Highlight thickens the stroked parts to 4; the filled plates keep their
  size (they are already 4 thick). Dim follows `SYMBOL_STYLES`.

**`svg:g[schBox]` (D-20).** A dashed enclosure: "what is inside this outline is
one thing seen from its terminals". Needed by both families; drawing it as a
raw `<rect>` in the widget would be an inline drawing.
- Inputs: `w`, `h` (grid units, required), `name` (default `''`).
- `<path class="stroke box" d="M0 0 H{w·10} V{h·10} H0 Z"
  stroke-dasharray="6 4">` with `stroke-linecap: butt` for `.box` (the square
  caps of `SYMBOL_STYLES` would lengthen each dash by 2 units and close the
  gaps). The dash array is an attribute, so the spec can read it.
- `name` as `<text class="label" x="4" y="-4">` above the top-left corner.
- Draw it first in the canvas so the parts sit on top.

**Symbols for the other sources (D-5).** Custom and the divider's Vin use the
existing `schSource` (the generic supply drawn since 00-01, which 00-04 calls
an ideal source). Rint and Rth are ordinary `schResistor`s inside the box. No
other new symbol.

**`app-curve`, `src/app/ui/curve.ts` (D-2, D-15).** A minimal static XY plot,
built once in step 3 and reused, not drawn inline in the widget (ROADMAP §3
step 3). Scope: one series, log or linear x, linear y, markers, tick labels; no
cursor, no time axis, no second channel. A2's `app-trace` (scope and Bode
traces, keyboard cursors) is a separate, larger primitive; when it lands it may
absorb `app-curve` or wrap it, and module 01's `mlcc-derating` and
`inductor-derating` ("shares the curve plot", ROADMAP §4) can use `app-curve`
before A2 exists.
- Inputs: `w`, `h` (units); `xMin`, `xMax`, `xLog`; `yMax` (y from 0);
  `points: readonly (readonly [number, number])[]`; `xTicks`, `yTicks:
  readonly { at: number; label: string; major?: boolean }[]`; `xTitle`,
  `yTitle`; `markers: readonly { x: number; y: number; shape: 'filled' |
  'hollow'; label?: string; guide?: boolean }[]`; `label` (the spoken
  accessible name).
- Renders one `<svg role="img" [attr.aria-label]="label()">` with the pixel
  styles (stroke 2, square caps, `crispEdges`, coordinates rounded to whole
  units), the classes above, and nothing interactive.
- **Glyph check:** add `{ selector: 'app-curve', input: 'label' }` to
  `SPOKEN_INPUTS` in `tools/check-glyphs.mjs` (the step 3 agent owns that
  line). Tick labels and titles are visible and checked.
- Spec `src/app/ui/curve.spec.ts` (cases in §5).

---

## 5. Formulas, edge cases, pure functions

### Formulas (battery family)

- Current: `I = Voc / (Rint + RL)`
- Terminal voltage: `V = Voc − I · Rint = Voc · RL / (Rint + RL)` (00-03's
  "loaded output = unloaded output × R_load / (Z_out + R_load)" with
  Z_out = Rint)
- Load power: `P = I² · RL = Voc² · RL / (Rint + RL)²`
- Heat inside: `Pint = I² · Rint`
- Efficiency: `η = P / (P + Pint) = RL / (RL + Rint)` (the same current flows
  through both resistances, so power splits in the ratio of the resistances)
- Short-circuit current, **computed, never measured**: `Isc = Voc / Rint`
  (also the Thévenin relation `Rth = Voc / Isc`, `hyperphysics-es` "Teorema de
  Thevenin")
- Maximum power: at `RL = Rint`, `Pmax = Voc² / (4 · Rint)`
- Two-reading measurement (D-4): open-circuit reading `Voc`, loaded reading
  `V` with a known load `RL`; `I = V / RL`; `Rint = (Voc − V) / I =
  RL · (Voc − V) / V`

**Why the peak is at `RL = Rint`, without calculus (prose may use it).** For
any factor k, `P(k · Rint) = Voc² · k / (Rint · (1 + k)²) = P(Rint / k)`. So
on a log axis the curve is a mirror image of itself about `RL = Rint`: a load
ten times larger and a load ten times smaller get the same power (for the AA,
2.5 Ω and 25 mΩ both get 846 mW). A curve that rises and falls with a mirror
line has its peak on the mirror line. (`kuphaldt-liec` vol. I ch. 10
"Maximum Power Transfer Theorem" states the result.)

**Why the efficiency is 50 % at the peak (derived; no source states it,
BIBLIOGRAPHY §8).** At `RL = Rint` the same current flows through two equal
resistances, so by `P = I² · R` (00-01) they take equal power: half heats the
source, half reaches the load. `kuphaldt-liec` (same section) says maximum
power transfer "does not coincide with maximum efficiency"; cite it for that
sentence only.

**Why the 10 MΩ voltmeter does not matter here (D-4; prose).** 00-05's rule
with Zout = Rint: error `−Rint / (Rint + 10 MΩ)`. For the AA, `0.25 Ω / 10 MΩ`
is 2.5 × 10⁻⁸ (0.0000025 %); the meter draws `1.6 V / 10 MΩ = 160 nA`, which
loses `160 nA × 0.25 Ω = 40 nV` inside the cell. (In divider mode the same
meter gives 00-05's −0.05 % on the 5 kΩ default, below 3 displayed figures;
on the CR2032's 10 Ω it is 1 × 10⁻⁶, 320 nA × 10 Ω = 3.2 µV, still far below
the fourth figure.) This is why the readouts can be the readings (D-18).

### Formulas (divider family, D-3)

- Thévenin voltage: `Vth = Vin · R2 / (R1 + R2)` (00-03's unloaded output)
- Thévenin resistance: `Rth = R1 ∥ R2 = R1 · R2 / (R1 + R2)` (00-03's output
  impedance)
- Load side: the battery formulas with `Voc → Vth`, `Rint → Rth`. Identity:
  `Vth · RL / (Rth + RL) = Vin · (R2 ∥ RL) / (R1 + (R2 ∥ RL))`, 00-03's loaded
  formula.
- Heat in R1 and R2 (real): `(Vin − V)² / R1 + V² / R2`; supply power
  `Vin · (Vin − V) / R1`; efficiency `P / (Vin · (Vin − V) / R1)`. With the
  load off: heat `Vin² / (R1 + R2)`, efficiency 0 (shown as "no load").
- Isc of the divider: `Vth / Rth = Vin / R1` (harmless at these values; still
  labelled computed).

**Model assumptions the code comment and prose state (D-25).**
1. Rint is constant: it does not change with current, time, charge or
   temperature. Real cells: it rises as they run down and as they cool
   (§2 spread), and the bulletin calls the loaded-voltage estimate "a general
   guideline", not a precise value (`energizer-ir-bulletin` p. 2).
2. Voc is constant. A cell's voltage also falls as it discharges (an alkaline
   from 1.6 V towards 0.9 V, `energizer-alkaline-handbook` p. 3), and a NiMH
   cell falls from about 1.4 V to its 1.2 V plateau (`energizer-nimh-handbook`
   p. 6).
3. The figures at amps (the left half of the curve, the peaks of 2.56 W,
   10 W and 12 W) are the straight-line model's prediction far outside how
   makers test or rate these cells. The prose says "the model predicts" for
   them and never suggests trying them. The same holds for the coin cell's
   160 mA on 10 Ω: its manual pulses it for 50 ms on 25 Ω or uses a 75 Ω
   pulse (`energizer-lithium-coin-manual` p. 4), not a steady 10 Ω load.

### Edge cases (the functions handle them; the controls cannot reach most)

| Case | Result |
|---|---|
| load off (`loaded` false) or `rload = Infinity` | `I = P = Pint = 0`, `V = Voc`, efficiency 0, `heatTone` plain |
| `rint = 0` | ideal source: `V = Voc`, `Isc = Infinity`, `Pmax = Infinity`, fraction 0, formatted `— A`, `— W` (never `∞`) |
| `rload = 0` with `rint > 0` | `I = Isc`, `V = 0`, `P = 0`, efficiency 0, `heatTone` warn |
| `rint + rload = 0` | everything 0 (guard the division) |
| `voc = 0` | everything 0 |
| `r1 + r2 = 0`, `r2 = 0`, `r1 = 0` (divider) | guard as `solveDivider` does; `Rth = 0` → `Isc`, `Pmax` Infinity |
| any NaN input | never NaN out (`Number.isNaN` checks in the spec) |

### `src/app/widgets/thevenin/thevenin-math.ts`

```ts
import { parallel } from '../../core/format';

export type SourceKey = 'aa' | '9v' | 'nimh' | 'cr2032' | 'custom' | 'divider';
export type CellKey = 'aa' | '9v' | 'nimh' | 'cr2032';

export interface Cell {
  /** Open-circuit voltage used, V (fresh). */
  readonly voc: number;
  /** Internal resistance used, Ω (fresh, room temperature, DC method). */
  readonly rint: number;
  /** Which battery symbol draws it. */
  readonly symbol: 'cell' | 'battery';
}
/** AA: energizer-lithium-coin-manual p. 4 (near 0.25 Ω), inside
 *  energizer-ir-bulletin p. 1 (150–300 mΩ fresh, DC pulse); Voc 1.6 V
 *  (energizer-alkaline-handbook p. 3, energizer-ir-bulletin p. 2).
 *  9 V: duracell-mn1604 p. 2 (about 2.3 Ω DC near the start, read from the
 *  curve; 9.5–9.7 V fresh, middle used).
 *  NiMH: energizer-nh15-2500 p. 1 (30 mΩ charged, ±20 %; nominal 1.2 V).
 *  CR2032 (simulation only): energizer-lithium-coin-manual p. 4 (near 10 Ω
 *  fresh); Voc 3.2 V, the maintainer's value (brief D-9). */
export const CELLS: Readonly<Record<CellKey, Cell>> = {
  aa: { voc: 1.6, rint: 0.25, symbol: 'cell' },
  '9v': { voc: 9.6, rint: 2.3, symbol: 'battery' },
  nimh: { voc: 1.2, rint: 0.03, symbol: 'cell' },
  cr2032: { voc: 3.2, rint: 10, symbol: 'cell' },
};

/** A 10 MΩ voltmeter (fluke-80v-manual Table 18), for meterReading only. */
export const METER_RIN = 10e6;

export interface SourceInput {
  readonly voc: number;
  readonly rint: number;
  readonly rload: number;
  readonly loaded: boolean;
}
export interface SourceResult {
  readonly terminal: number;     // V across the terminals (Voc when unloaded)
  readonly drop: number;         // V lost inside, Voc − terminal (Vth − V in divider mode)
  readonly current: number;      // A through the load; 0 unloaded
  readonly loadPower: number;    // W in RL
  readonly internalPower: number; // W heating the source (divider: real R1 + R2)
  readonly efficiency: number;   // loadPower / (power the source gives); 0 when no load; never NaN
  readonly isc: number;          // A, Voc / Rint (Vth / Rth), computed
  readonly pmax: number;         // W, Voc² / (4 · Rint)
  readonly fractionOfMax: number; // loadPower / pmax; 0 when pmax is 0 or not finite
  readonly heatWarn: boolean;    // loaded && internalPower > loadPower
}
export function solveSource(input: SourceInput): SourceResult;

export interface DividerSourceInput {
  readonly vin: number;
  readonly r1: number;
  readonly r2: number;
  readonly rload: number;
  readonly loaded: boolean;
}
export interface DividerSourceResult extends SourceResult {
  readonly vth: number;
  readonly rth: number;
  readonly supplyPower: number;  // Vin · I_R1
}
/** Vth = Vin · R2 / (R1 + R2), Rth = R1 ∥ R2 (00-03). */
export function theveninOf(vin: number, r1: number, r2: number): { vth: number; rth: number };
/** Load side from the equivalent; internalPower and efficiency from the real divider. */
export function solveDividerSource(input: DividerSourceInput): DividerSourceResult;

/** Voc² · RL / (Rint + RL)², guarded. */
export function loadPower(voc: number, rint: number, rload: number): number;
/** n points, log-spaced from xMin to xMax inclusive, [RL, loadPower]. */
export function curvePoints(
  voc: number, rint: number, xMin: number, xMax: number, n?: number,
): [number, number][];
/** RL · (Voc − V) / V: the two-reading method with a known load (D-4). */
export function rintFromReadings(voc: number, vLoaded: number, rload: number): number;
/** What a voltmeter of `rin` reads across an open source: Voc · Rin / (Rin + Rint). */
export function meterReading(voc: number, rint: number, rin?: number): number;

/** warn when heatWarn, otherwise plain. Never signal or danger (§4). */
export function heatTone(result: SourceResult): 'plain' | 'warn';
/** Wire speed 0..1, log over 1 µA – 10 A, min 0.08 for any positive current;
 *  0 for zero, negative or non-finite. */
export function sourceFlow(amps: number): number;

/** Normalise the text props. */
export function parseSource(raw: string | undefined): SourceKey; // unknown → 'aa'
export function parseLoaded(raw: string | undefined): boolean;   // 'false' → false, else true
```

Keep `heatTone` and `sourceFlow` local to this file, as every other widget
keeps its own tone and flow helpers (`meter-loading` brief D-6). The spec may
not import `divider-math.ts` (widgets do not import each other); it writes
00-03's formula inline for the identity case.

### Spec cases (`thevenin-math.spec.ts`, assert through the formatters)

Battery-family voltages at 4 figures (`formatSI(x, 'V', lang, 4)`), everything
else at the default 3.

1. Default (AA, 10 Ω, loaded): terminal `1.561 V` / ES `1,561 V`; drop
   `39 mV`; current `156 mA`; load power `244 mW`; pmax `2.56 W` / `2,56 W`;
   fraction `9.5%` / `9,5 %`; internal `6.09 mW` / `6,09 mW`; efficiency
   `97.6%` / `97,6 %`; isc `6.4 A` / `6,4 A`; heatTone `plain`.
2. AA unloaded: terminal `1.6 V`; current `0 A`; load power `0 W`; internal
   `0 W`; efficiency 0; isc `6.4 A`; heatTone `plain`.
3. AA at 0.25 Ω: terminal `800 mV`; current `3.2 A`; load `2.56 W`; fraction
   `100%`; internal `2.56 W`; efficiency `50%` / `50 %`; heatTone `plain`
   (boundary).
4. AA at 0.1 Ω: load `2.09 W`; fraction `81.6%`; internal `5.22 W`; efficiency
   `28.6%` / `28,6 %`; heatTone `warn`. AA at 0.24 Ω: efficiency `49%`, warn.
5. 9 V at 220 Ω: terminal `9.501 V` / `9,501 V`; drop `99.3 mV`; current
   `43.2 mA` / `43,2 mA`; load `410 mW`; efficiency `99%`.
   `rintFromReadings(9.6, 9.501, 220)` toBeCloseTo 2.292 (3 digits).
6. 9 V at 2.3 Ω: terminal `4.8 V`; current `2.09 A`; load `10 W`; efficiency
   `50%`; isc `4.17 A` / `4,17 A`.
7. 9 V at 1 Ω: terminal `2.909 V`; current `2.91 A`; load `8.46 W`; internal
   `19.5 W`; efficiency `30.3%`; heatTone `warn`.
8. NiMH: isc `40 A`; pmax `12 W`; at 10 Ω terminal `1.196 V`, current
   `120 mA`, load `143 mW`, fraction `1.2%` / `1,2 %`, internal `429 µW`.
9. Misconception order: pmax(nimh) 12 > pmax(9v) 10.017… > pmax(aa) 2.56 >
   pmax(cr2032) 0.256; and at 10 Ω load power(9v) `6.09 W` > load power(nimh)
   `143 mW`.
9a. CR2032 (3.2 V, 10 Ω): unloaded terminal `3.2 V` / `3,2 V`, isc `320 mA`,
   pmax `256 mW`. At 10 Ω: terminal `1.6 V` / `1,6 V`, drop `1.6 V`, current
   `160 mA`, load `256 mW`, fraction `100%` / `100 %`, internal `256 mW`,
   efficiency `50%`, heatTone `plain`. At 100 Ω: terminal `2.909 V` /
   `2,909 V`, drop `291 mV`, current `29.1 mA` / `29,1 mA`, load `84.6 mW` /
   `84,6 mW`, fraction `33.1%` / `33,1 %`, internal `8.46 mW`, efficiency
   `90.9%` / `90,9 %`. At 25 Ω: terminal `2.286 V`, current `91.4 mA`. With
   rint 65 Ω at 100 Ω: terminal `1.939 V` / `1,939 V`, isc `49.2 mA`.
   `rintFromReadings`-style check of the manual's example:
   `(3.279 − 2.429) / (0.097 − 0.000003)` formatted `8.76 Ω` / `8,76 Ω`.
10. Symmetry: for (voc, rint) in the four presets and k in {2, 10, 100},
    `loadPower(voc, rint, k · rint)` toBeCloseTo `loadPower(voc, rint,
    rint / k)` (12 digits). AA at 2.5 Ω and 25 mΩ: both `846 mW`.
11. Peak: `max(curvePoints(…, 2001))` is at the point nearest `rint` and
    within 0.01 % of `pmax`; `pmax === voc² / (4 · rint)`.
12. Identities over a grid: `terminal ≈ voc · rload / (rint + rload)`;
    `loadPower + internalPower ≈ voc · current`; `efficiency ≈ rload /
    (rload + rint)` (12 digits).
13. Two readings: `rintFromReadings(1.6, 1.561, 10)` toBeCloseTo 0.2498 (4);
    from the displayed figures `(1.6 − 1.561) / 0.156` toBeCloseTo 0.25.
14. Divider defaults (9 V, 10 k, 10 k, 10 kΩ, loaded): vth `4.5 V`, rth
    `5 kΩ`; terminal (3 figures) `3 V`; current `300 µA`; load `900 µW`; pmax
    `1.01 mW` / `1,01 mW`; fraction `88.9%` / `88,9 %`; internal (R1 + R2)
    `4.5 mW` / `4,5 mW`; efficiency `16.7%` / `16,7 %`; isc `900 µA`;
    heatTone `warn`. The equivalent's `current² · rth` is `450 µW`, not the
    internal power (assert they differ).
15. Divider unloaded: terminal `4.5 V`; internal `4.05 mW` / `4,05 mW` (00-03's
    "Wasted in the divider"); load `0 W`; efficiency 0.
16. Divider at 5 kΩ: terminal `2.25 V`; current `450 µA`; load `1.01 mW`;
    fraction `100%`; internal `5.06 mW`; efficiency `16.7%`.
17. 00-03 identity: for a grid of vin, r1, r2, rload, terminal ≈
    `vin · (r2 ∥ rload) / (r1 + (r2 ∥ rload))` (12 digits). Spot checks
    (3 figures): 100 Ω / 100 Ω at 10 kΩ → `4.48 V`, load `2 mW`, fraction
    `2%`, internal `405 mW`, efficiency `0.5%` / `0,5 %`; 10 k / 4.7 k at
    10 kΩ → `2.18 V` (00-03's prediction example).
18. 00-05 loop: 9 V preset at 1.8 Ω → current `2.34 A` / `2,34 A`; at 0.03 Ω →
    `4.12 A` / `4,12 A`.
19. `meterReading(1.6, 0.25)` → formatted `1.6 V`; relative error toBeCloseTo
    −2.5e-8; `meterReading(4.5, 5000)` → error −0.0499… % (`-0.05%` at 2
    decimals, 00-05's V-1).
20. `heatTone` boundaries: efficiency exactly 0.5 → plain; rload = 0.999 · rint
    → warn; unloaded → plain.
21. Guards: rint 0 (isc Infinity formatted `— A`, pmax Infinity, fraction 0);
    rload 0 (terminal 0, current = isc, load 0, warn); voc 0 (all 0); rint +
    rload 0; divider r1 + r2 0; never NaN in any field.
22. `curvePoints(1.6, 0.25, 0.01, 1e4, 121)`: length 121, first x 0.01, last x
    1e4, ratio between neighbours constant (log spacing), all y finite and ≥ 0.
23. `parseSource`: `undefined`, `''`, `'AA'` (case-sensitive) → `'aa'`; `'9v'`,
    `'nimh'`, `'cr2032'`, `'custom'`, `'divider'` pass (`'CR2032'` →
    `'aa'`). `parseLoaded`: `undefined`, `''`,
    `'true'`, `'on'` → true; `'false'` → false.
24. `sourceFlow`: 10 A → 1; 1 mA → 3/7 (toBeCloseTo); 1 µA → 0.08; 0, −1, NaN
    → 0.
25. `CELLS`: aa {1.6, 0.25, cell}, 9v {9.6, 2.3, battery}, nimh {1.2, 0.03,
    cell}, cr2032 {3.2, 10, cell}.

### Spec cases (step 3)

`schematic.spec.ts`, **schBattery**:
1. Exported in `SCHEMATIC`.
2. For `kind` `cell` and `battery`: group class `sch`, then `sch sch--dim`, then
   `sch sch--hot`.
3. Pins: the path's first vertex is (0, 0) and its last subpath ends at
   (0, 40); every vertex whole-unit; the drawing is mirror-symmetric about
   x = 0 (paths and rects).
4. Polarity: the topmost plate is a long stroked plate (x −12 … 12) and the
   short plate below it is a `rect.fill` 12 wide, 4 tall. `cell`: one pair.
   `battery`: two pairs, long above short in each, and at least two
   `rect.fill` link dots on x = 0 between them.
5. `+`: present by default, class `label`, x < 0, y < the first plate's y;
   absent with `plus = false`.
6. `name` at (16, 17), `value` at (16, 29) with class `value`.
7. No `<circle>`; one `path.stroke`.

**schBox**:
1. Exported in `SCHEMATIC`.
2. One closed `path.stroke` through (0, 0), (10w, 0), (10w, 10h), (0, 10h) for
   two sizes; `stroke-dasharray` attribute `6 4`.
3. `name` text at (4, −4) when set; no text when empty.
4. `dim` and `highlight` classes as above.

`src/app/ui/curve.spec.ts`, **app-curve**:
1. Renders one `svg[role="img"]` whose `aria-label` is the `label` input, and
   updates when it changes.
2. With `xLog`, `xMin` maps to the plot's left edge and `xMax` to its right
   edge; a value at the geometric mean maps to the middle (±1 unit).
3. `y = 0` maps to the x axis; `yMax` to the plot's top.
4. The curve path has one vertex per point, all whole units, and no `NaN` in
   `d` (also with an empty `points` array: no path or an empty one).
5. Markers: `filled` → a `rect.fill` with the hot class; `hollow` → a stroked
   `rect`; `guide` draws a dashed vertical line to the axis; `label` text
   renders.
6. Tick labels render the given strings at the mapped positions.

---

## 6. Worked examples (all numbers computed with `core/format.ts`)

Computed by importing `src/app/core/format.ts` under Node 22
(`--experimental-strip-types`), so the displays are what the instrument shows,
EN | ES. ES percentages carry a no-break space before `%`; write it the same
way in prose. Battery-family voltages at 4 figures, as readout 1 shows them.

### W-1, a real battery sags (the start state; 00-04's promise)

AA preset, 10 Ω load connected (the start state). Then switch the load off.

- `I = 1.6 V / (0.25 Ω + 10 Ω) = 156 mA`
- `V = 1.6 V − 156 mA × 0.25 Ω = 1.561 V`; 39 mV lost inside
- `P = 156 mA² × 10 Ω = 244 mW`; heat inside `156 mA² × 0.25 Ω = 6.09 mW`

| Readout | EN, load on | ES, load on | EN, load off | ES, load off |
|---|---|---|---|---|
| Terminal voltage | 1.561 V (39 mV lost inside) | 1,561 V (caen 39 mV dentro) | 1.6 V (open circuit) | 1,6 V (en vacío) |
| Load current | 156 mA (short circuit: 6.4 A (computed)) | 156 mA (en cortocircuito: 6,4 A (calculada)) | 0 A (same note) | 0 A (misma nota) |
| Load power | 244 mW (9.5% of its 2.56 W maximum) | 244 mW (el 9,5 % de su máximo de 2,56 W) | 0 W (0% of its 2.56 W maximum) | 0 W (el 0 % de su máximo de 2,56 W) |
| Heat inside | 6.09 mW (efficiency 97.6%) | 6,09 mW (eficiencia 97,6 %) | 0 W (no load) | 0 W (sin carga) |

Prose points: 00-04's "a real battery sags a little" is 39 mV here; with a
100 Ω load it is 3.99 mV (1.596 V), with 1 kΩ 400 µV (1.6 V at 4 figures).
00-06's promise: 6.09 mW turns to heat *inside the cell*, `P = I² · R` with
R = Rint. The bench version: `energizer-alkaline-handbook` p. 13 tests a fresh
cell on about 10 Ω for 1–2 s; if the prose quotes its "about 1.5 V", it says
the model gives 1.561 V and real cells differ a little.

### W-2, measuring Rint with the 00-05 meter (D-4)

Two voltage readings and a known resistor; no ammeter (D-18).

**AA, 10 Ω (1 W part).** Reading 1, nothing connected: `1.6 V`. Reading 2,
the 10 Ω across the cell, probes on the cell's own terminals, read within a
couple of seconds: `1.561 V`.

- `I = 1.561 V / 10 Ω = 156 mA` (Ohm's law on the known load)
- `Rint = (1.6 V − 1.561 V) / 156 mA = 0.039 V / 0.156 A = 0.25 Ω`
- With three digits the meter would show 1.56 V and give 0.256 Ω: this
  measurement needs a meter with four digits.
- The meter itself: 10 MΩ against 0.25 Ω, 2.5 × 10⁻⁸; it draws 160 nA and
  loses 40 nV inside the cell. 00-05's ratio rule, by a factor of forty
  million.

**9 V, 220 Ω (1 W part).** Press the `9 V` key and type `220` in Load.

- `V = 9.6 V × 220 / 222.3 = 9.501 V`; `I = 9.501 V / 220 Ω = 43.2 mA`
- `Rint = (9.6 V − 9.501 V) / 43.2 mA = 0.099 V / 0.0432 A = 2.29 Ω`, about
  the 2.3 Ω the preset uses: the last digit of the reading limits it.

| Readout | EN | ES |
|---|---|---|
| Terminal voltage | 9.501 V (99.3 mV lost inside) | 9,501 V (caen 99,3 mV dentro) |
| Load current | 43.2 mA (short circuit: 4.17 A (computed)) | 43,2 mA (en cortocircuito: 4,17 A (calculada)) |
| Load power | 410 mW (4.1% of its 10 W maximum) | 410 mW (el 4,1 % de su máximo de 10 W) |
| Heat inside | 4.29 mW (efficiency 99%) | 4,29 mW (eficiencia 99 %) |

Bench parts (00-06's headroom rule): 244 mW on the AA's 10 Ω and 410 mW on the
9 V's 220 Ω, so 1 W resistors (24 % and 41 % of the rating). The NiMH on
10 Ω: 143 mW. A 5 % resistor gives up to a 5 % error in Rint (pointer to
01-01, tolerance). Then Isc is **computed**: `1.6 V / 0.25 Ω = 6.4 A`;
`9.6 V / 2.3 Ω = 4.17 A`.

### W-3, the most power, and half of it wasted

AA preset; type `0.25` in Load (simulation only: a 0.25 Ω load on an AA is a
near short).

- `I = 1.6 V / 0.5 Ω = 3.2 A`; `V = 800 mV`
- `P = 3.2² × 0.25 = 2.56 W` in the load, and `2.56 W` inside the cell

| Readout | EN | ES |
|---|---|---|
| Terminal voltage | 800 mV (800 mV lost inside) | 800 mV (caen 800 mV dentro) |
| Load current | 3.2 A (short circuit: 6.4 A (computed)) | 3,2 A (en cortocircuito: 6,4 A (calculada)) |
| Load power | 2.56 W (100% of its 2.56 W maximum) | 2,56 W (el 100 % de su máximo de 2,56 W) |
| Heat inside | 2.56 W (efficiency 50%) | 2,56 W (eficiencia 50 %) |

Prose points: half the open-circuit voltage, half the short-circuit current,
half the power heating the cell (derived in §5). The filled marker sits on the
hollow one. One step either side (type `2.5` and `0.025`): both `846 mW`, the
mirror. Kuphaldt: maximum power is not maximum efficiency. Batteries and
supplies are used far to the right of the peak (W-1: 97.6 %); the peak matters
where the source's resistance is fixed and the signal is weak (pointer only:
08-04's headphone output). Say "the model predicts" for 2.56 W: no maker rates
an AA for 3.2 A.

### W-4, the misconception: more volts is not more power

Same instance, four keys, one at a time. The coin cell's row comes after
callout 3 (§8), which the prose places before the coin cell's first mention.

| Source | Voc | Rint | Pmax (`Voc² / 4Rint`) | Isc | At 10 Ω: V, P |
|---|---|---|---|---|---|
| `AA` | 1.6 V | 250 mΩ | 2.56 W / 2,56 W | 6.4 A / 6,4 A | 1.561 V, 244 mW |
| `9 V` | 9.6 V | 2.3 Ω | 10 W | 4.17 A / 4,17 A | 7.805 V / 7,805 V, 6.09 W / 6,09 W |
| `NiMH` | 1.2 V | 30 mΩ | 12 W | 40 A | 1.196 V / 1,196 V, 143 mW |
| `CR2032` | 3.2 V | 10 Ω | 256 mW | 320 mA | 1.6 V / 1,6 V, 256 mW |

The coin cell has twice the AA's voltage and a tenth of its maximum power:
its resistance is forty times larger (W-8).

At 10 Ω the 9 V battery gives 6.09 W (60.8 % of its maximum; heat inside
1.4 W, efficiency 81.3 %) against the NiMH's 143 mW (1.2 %). At their own
maximum-power loads the 1.2 V NiMH cell can give more (12 W) than the 9 V
battery (10 W). The power a source can give depends on `Voc² / Rint`, and what
it does give depends on the load. Model predictions, not ratings (§5
assumption 3); the 12 W needs 20 A. Keep any real example generic ("a
device that draws a small current" vs "one that draws amps, such as a
motor"): no source in the bibliography says which products use which cell,
so name none.

### W-5, past the peak: what a short would do

9 V preset, type `1` in Load (simulation only).

- `I = 9.6 V / 3.3 Ω = 2.91 A`; `V = 2.909 V`
- load `8.46 W`, inside `19.5 W`, efficiency `30.3 %` → Heat inside in the
  warn tone, Rint in the hot colour

| Readout | EN | ES |
|---|---|---|
| Terminal voltage | 2.909 V (6.69 V lost inside) | 2,909 V (caen 6,69 V dentro) |
| Load current | 2.91 A (short circuit: 4.17 A (computed)) | 2,91 A (en cortocircuito: 4,17 A (calculada)) |
| Load power | 8.46 W (84.5% of its 10 W maximum) | 8,46 W (el 84,5 % de su máximo de 10 W) |
| Heat inside | 19.5 W (efficiency 30.3%) | 19,5 W (eficiencia 30,3 %) |

**Closing 00-05's loop (prose).** 00-05 said a 9 V battery across the mA
jack's 1.8 Ω would push "up to 5 A", and across the A jack's 0.03 Ω "300 A",
and that the battery's own resistance makes it lower. With Rint = 2.3 Ω (type
`1.8`, then `0.03`, in Load): `9.6 / 4.1 = 2.34 A` and `9.6 / 2.33 = 4.12 A`
(leads ignored). Still amps: more than five times the 440 mA fuse. Never try
it; the instrument computes it.

**The fresh-cell spread (prose).** With the AA's 0.13 Ω from
`energizer-alkaline-handbook` fig. 10 (type `0.13` in Internal resistance,
which selects Custom), Isc is `12.3 A` and Pmax `4.92 W`. A real short can be
larger than the preset suggests.

### W-6, a divider is a source too (Thévenin, D-3)

Second instance: Divider, 9 V, R1 = R2 = 10 kΩ, load 10 kΩ.

- `Vth = 9 V × 10 / 20 = 4.5 V`; `Rth = 10 kΩ ∥ 10 kΩ = 5 kΩ`
- `V = 4.5 V × 10 / 15 = 3 V`, 00-03's number; `I = 300 µA`; `P = 900 µW`

| Readout | EN | ES |
|---|---|---|
| Output | 3 V (1.5 V lost inside) | 3 V (caen 1,5 V dentro) |
| Load current | 300 µA (short circuit: 900 µA (computed)) | 300 µA (en cortocircuito: 900 µA (calculada)) |
| Load power | 900 µW (88.9% of its 1.01 mW maximum) | 900 µW (el 88,9 % de su máximo de 1,01 mW) |
| Heat in R1 and R2 | 4.5 mW (efficiency 16.7%) | 4,5 mW (eficiencia 16,7 %) |

Then type `5k` in Load: `2.25 V`, `450 µA`, `1.01 mW`, `100%`, heat in R1 and
R2 `5.06 mW`, efficiency `16.7%`. Load off: `4.5 V` (00-03's "Unloaded"), heat
`4.05 mW` (00-03's "Wasted in the divider").

Prose points: Vth is 00-03's unloaded output and Rth is 00-03's output
impedance; 00-05's voltmeter was a 10 MΩ load on this same source. A 4.5 V
source behind 5 kΩ gives the same 3 V, 300 µA and 900 µW into 10 kΩ (work it
by hand, or compare with the battery instance's drawing). **But** the
equivalent's own heat would be `300 µA² × 5 kΩ = 450 µW`, and the real divider
turns 4.5 mW into heat: the equivalent describes what the load sees, not what
happens inside.

### W-7, a stiff divider is far from its peak (00-03 link; prose)

Divider 9 V, 100 Ω / 100 Ω, load 10 kΩ: `Rth = 50 Ω`; output `4.48 V`
(00-03's figure); load `2 mW`, `2%` of its `101 mW` maximum; heat in R1 and R2
`405 mW`; efficiency `0.5%` / `0,5 %`. 00-03's ten-times rule is "keep the
load far to the right of the peak".

### W-8, the coin cell: a high internal resistance (D-9; simulation only)

First instance, press `CR2032` (load still 10 Ω, connected). The prose
presents this as something to try in the instrument only, after callout 3.

- Load off: `3.2 V`. Isc (computed) `3.2 V / 10 Ω = 320 mA`; Pmax
  `3.2² / 40 = 256 mW`
- On 10 Ω: `I = 3.2 V / 20 Ω = 160 mA`, `V = 1.6 V`: half the voltage is lost
  inside, and this "modest" load is the coin cell's maximum-power point

| Readout | EN, 10 Ω | ES, 10 Ω | EN, 100 Ω | ES, 100 Ω |
|---|---|---|---|---|
| Terminal voltage | 1.6 V (1.6 V lost inside) | 1,6 V (caen 1,6 V dentro) | 2.909 V (291 mV lost inside) | 2,909 V (caen 291 mV dentro) |
| Load current | 160 mA (short circuit: 320 mA (computed)) | 160 mA (en cortocircuito: 320 mA (calculada)) | 29.1 mA (short circuit: 320 mA (computed)) | 29,1 mA (en cortocircuito: 320 mA (calculada)) |
| Load power | 256 mW (100% of its 256 mW maximum) | 256 mW (el 100 % de su máximo de 256 mW) | 84.6 mW (33.1% of its 256 mW maximum) | 84,6 mW (el 33,1 % de su máximo de 256 mW) |
| Heat inside | 256 mW (efficiency 50%) | 256 mW (eficiencia 50 %) | 8.46 mW (efficiency 90.9%) | 8,46 mW (eficiencia 90,9 %) |

Prose points:
- **The striking contrast.** On the same 10 Ω that took 39 mV from the AA
  (W-1), the coin cell loses 1.6 V, half its voltage. On 100 Ω the AA loses
  3.99 mV (1.596 V); the coin cell loses 291 mV (2.909 V). Its short-circuit
  current, 320 mA, is a twentieth of the AA's 6.4 A, and its maximum, 256 mW,
  a tenth of the AA's 2.56 W, although its voltage is twice as high: the
  misconception again, the other way round.
- **The manual's own measurement** (`energizer-lithium-coin-manual` p. 4): a
  fresh 2032 read 3.279 V on a 1 MΩ background drain and 2.429 V during a
  50 ms pulse on 25 Ω, about 97 mA: `(3.279 − 2.429) / 0.097 = 9 Ω` (8.76 Ω
  before rounding). The instrument on 25 Ω shows `2.286 V` and `91.4 mA`
  (Voc 3.2 V, Rint 10 Ω): the same picture. The maker measures it in short
  pulses, not with a steady load (§5 assumption 3).
- **It gets worse with use.** Rint rises from about 10 Ω to about 65 Ω near the
  end of life (p. 4, read from the curve). Typed into Custom (Voc 3.2 V, Rint
  65 Ω, load 100 Ω): `1.939 V` / `1,939 V`, short-circuit current
  `49.2 mA` / `49,2 mA` (holding Voc at 3.2 V to isolate the resistance; a
  worn cell's open-circuit voltage is also lower, which the prose says).
- **Why it still works in the things it powers.** No product claim (no source
  says which devices use a CR2032); say generally that a coin cell suits
  circuits that draw very little current, where `I · Rint` stays small.
- **No bench step.** The prose suggests no measurement, load or handling of a
  coin cell (D-9, §8).

---

## 7. Glyph check (every visible string)

Rule (DESIGN-PIXEL-ART §Glyph coverage, `tools/check-glyphs.mjs`): a character
passes if VT323 draws it; Greek also passes via JetBrains Mono; ∥ and arrows
via Iosevka. `×` and U+2080–209C always fail in visible text. Checked against
`tools/glyph-coverage.json` (VT323: U+0020–007E, U+00A0–017E, U+2212, U+2013–
2014; JetBrains Mono Greek U+0384–03CF).

| String(s) | Characters outside ASCII | Result |
|---|---|---|
| `V = Voc − I · Rint`, `V = Vth − I · Rth` | `−` U+2212 (VT323), `·` U+00B7 (VT323) | pass. No subscripts (`Voc`, not `V_oc` / `Vₒc`). |
| Source / Fuente; `AA`, `9 V`, `NiMH`, `CR2032`; Custom / Libre; Divider / Divisor | none | pass |
| Open-circuit voltage / Tensión en vacío; Internal resistance / Resistencia interna; `Vin`, `R1`, `R2`; Load / Carga; Load: None / Carga: Ninguna | `ó`, `í` (VT323) | pass |
| Terminal voltage / Tensión en los terminales (or en terminales); Output / Salida; Load current / Corriente de carga; Load power / Potencia en la carga; Heat inside / Calor interno; Heat in R1 and R2 / Calor en R1 y R2 | `ó` | pass |
| {drop} lost inside / caen {drop} dentro; open circuit / en vacío; short circuit: {isc} (computed) / en cortocircuito: {isc} (calculada); {fraction} of its {pmax} maximum / el {fraction} de su máximo de {pmax}; efficiency {eff} / eficiencia {eff}; no load / sin carga | `í`, `á` (VT323) | pass |
| Schematic: `Voc`, `Rint`, `RL`, `R1`, `R2`, `+`, box names `AA`, `9 V`, `NiMH`, `CR2032`, `Custom` / `Libre`; `Vth = 4.5 V`, `Rth = 5 kΩ` | `Ω` (JetBrains Mono) | pass |
| Plot: `RL`, `P`, `0`, tick labels (formatter), `max {pmax}` / `máx. {pmax}` | `á`, `Ω` | pass |
| Formatter output: `V`, `mV`, `µV`, `nV`, `A`, `mA`, `µA`, `nA`, `kA` (custom extremes, e.g. `2.4 kA`), `W`, `mW`, `µW`, `kW`, `Ω`, `mΩ`, `kΩ`, `MΩ`, `%`, NBSP before `%` in ES, `,` decimals, `—` | `µ`, NBSP, `—` (VT323), `Ω` (JBM) | pass |
| Spoken only (`headingLabel`, canvas `label`, `app-curve` `label`, `ui.ts` keys ending `Spoken`) | `×` allowed | exempt |

**Must not appear in visible text:** `×` (use `·`), `∞` (an ideal source is
never labelled; Rint stops at 10 mΩ), `≈` (write "about"), `∥` (the prose may
write `R₁ ∥ R₂` as 00-03 does; the panel shows only the numbers `Vth`, `Rth`;
if a panel string ever needs it, write `R1||R2` as `divider` does), `η` (the
word "efficiency" is clearer; η would pass via JetBrains Mono but is not
needed), `Thévenin` is not on the panel (the `é` would pass; the plate says
`Vth`, `Rth` and the spoken form says Thévenin), subscripts.

**New `ui.ts` keys** (`UiStrings.widget`, EN and ES): `source`, `custom`,
`dividerKey`, `openCircuitVoltage`, `internalResistance`, `terminalVoltage`,
`loadPower`, `heatInside`, `heatInDivider`, `openCircuit`, `lostInside`
(`{drop}`), `shortCircuitComputed` (`{isc}`), `ofMaximum` (`{fraction}`,
`{pmax}`), `efficiencyNote` (`{efficiency}`), `noLoadNote`, `curvePeak`
(`{pmax}`), and spoken: `sourceSpoken`, `dividerSourceSpoken`,
`sourceCircuitSpoken`, `sourceOpenSpoken`, `sourceHeatSpoken`,
`dividerCircuitSpoken`, `dividerOpenSpoken`, `curveSpoken`,
`curveOpenSpoken`, `sourceNameAaSpoken`, `sourceName9vSpoken`,
`sourceNameNimhSpoken`, `sourceNameCr2032Spoken`, `sourceNameCustomSpoken`.
The `CR2032` key and box name are the same in both languages and can stay a
literal in the widget, as `1/4 W` does in `power-dissipation`. The segment's
row break is an empty element with no text. Reuse `load`, `noLoad`,
`output`, `drawnCurrent`, `exactValue`. Every `…Spoken` key is exempt by name.

---

## 8. Safety (ROADMAP §3.1)

**The instrument must:**
- clamp Voc and Vin to 1–24 V, the internal resistance to ≥ 10 mΩ and the load
  to ≥ 10 mΩ (battery) / ≥ 100 Ω (divider): no state is a short circuit;
- show the short-circuit current only as a note marked "computed" (D-4);
- offer the §3.1 battery types as presets (alkaline AA, 9 V alkaline, NiMH
  AA) plus the CR2032 coin cell as a simulation-only preset (D-9); no Li-ion
  or lead-acid preset (D-1, D-10);
- show a source past its maximum-power point with numbers, the warn tone and
  the hot colour only: no smoke, venting, flame or bursting animation;
- show no `danger` tone and no "safe" (`signal`) tone (§4: no sourced
  threshold for either).

**The prose must not:**
- suggest shorting a battery or measuring its short-circuit current, with a
  wire, the meter's current jacks or a low-value resistor; Isc is computed
  (§3.1, 00-05);
- suggest a bench load below 10 Ω on an AA or NiMH cell or below 220 Ω on a
  9 V battery (W-2's parts), or reproducing any instrument state left of the
  peak (W-3, W-5): those are simulation and the prose says so;
- suggest handling bare Li-ion cells, building packs or chargers, or give any
  Li-ion internal-resistance or current figure (none is sourced);
- use a car battery or any lead-acid battery at the bench (D-10); suggest
  recharging an alkaline cell (00-04's callout);
- suggest any bench step with a coin cell: measuring it, loading it, taking
  one out of a device, or keeping loose ones on the bench (D-9). The coin cell
  appears in the instrument only, and the prose says "in the instrument";
- mention coin cells before callout 3;
- suggest warming or cooling a battery to see Rint change (the cold figures
  are quoted, not an experiment).

**The prose must:**
- say the presets are one typical fresh cell at room temperature, measured
  with a DC step, and that real values move with method, discharge,
  temperature and maker (§2), with "about" and "typical" for curve readings;
- say "the model predicts" for every figure at amps (§5 assumption 3);
- give the bench method's precautions if it invites the reader to measure:
  1 W resistor (10 Ω for an AA or NiMH, 220 Ω for a 9 V), connect it for a few
  seconds (`energizer-alkaline-handbook` p. 13 tests for 1–2 s), probes on the
  battery's terminals, the resistor stands where nothing touches it (00-06),
  disconnect before reading the open-circuit voltage again;
- when Li-ion is mentioned, say to use a protected cell with a ready-made
  charger, or a USB power bank (§3.1, as 00-04's callout).

**The three required `:::safety` callouts (D-6, D-9, D-22)**, one per hazard,
each before the step that creates it, same callouts in the same order in EN
and ES. Titles are suggestions. In lesson order: callout 1 (section 3),
callout 3 (section 4), callout 2 (section 5); the numbers below keep the
hazards' identities, not their order on the page.

| # | Title (EN / ES) | Placed | Says |
|---|---|---|---|
| 1 | Never short a battery / Nunca pongas una pila en cortocircuito | Section 3, **before the bench measurement** (the first time the reader is invited to connect anything to a battery) | Hazard: a wire, a coin, keys or a meter on its current jack across a battery's terminals is a short circuit, and only the battery's internal resistance limits the current: about 6 A for a fresh AA by the model, more for a fresher one (12 A with 0.13 Ω), about 40 A for a NiMH AA (computed). Consequence: the cell and the wire heat; a prolonged short can open the cell's safety vent (`energizer-alkaline-ais-2025` p. 3, `energizer-nimh-ais` p. 3); a short can make it leak, and leaks can injure (`energizer-alkaline-handbook` p. 14); NiMH cells "can generate high currents if shorted … sufficient to cause burns or ignition of flammable materials" (`energizer-nimh-handbook` p. 14). Instead: never connect anything straight across a battery to see what it gives; work the short-circuit current out as `Voc / Rint`; use the load resistors above; keep loose cells away from coins and keys (`energizer-alkaline-handbook` p. 14), and a 9 V battery's two terminals sit side by side. |
| 2 | Shorted lithium-ion cells start fires / Una celda de litio-ion en cortocircuito puede incendiarse | Section 5 ("Past the peak"), **before W-5**, where the lesson discusses what a short would do; directly after the paragraph that introduces the left half of the curve | Hazard: lithium-ion (Li-ion) cells, the kind in phones, vapes and power banks, can ignite or explode if keys or coins touch their terminals (`wa-battery-burn-2021`: a loose vape cell shorted by coins in a pocket caught fire and caused burns that needed skin grafts). Consequence: fire and serious burns. Instead: this course never uses bare Li-ion cells; use a USB power bank, or a protected cell with a ready-made charger board (00-04); never carry loose cells in a pocket or bag with metal objects. No current or resistance figure for Li-ion (none is sourced). |
| 3 | Keep coin cells away from children / Mantén las pilas de botón lejos de los niños | Section 4, **directly before W-4's coin-cell row**, the first place the prose names a coin cell (and so before W-8); the instrument's `CR2032` key is visible earlier, but pressing a key is not a hazard and the prose does not point at it before this callout | Hazard: a coin cell such as the CR2032 is small enough to swallow. Consequence: "Swallowing may lead to serious injury or death in as little as 2 hours due to chemical burns and potential perforation of the esophagus" (`energizer-coin-ais` p. 3; the coin manual also calls swallowing a serious hazard, `energizer-lithium-coin-manual` p. 6). Instead: keep coin cells, new and used, out of children's reach; store them in their packaging; put a used one away safely at once rather than leaving it loose, and dispose of it under local rules; if a child may have swallowed one, get medical help immediately. This lesson uses the coin cell **only in the instrument**: do not measure, load or open one at the bench. The sources agent checks the AIS's own first-aid and disposal wording; until then, these two sentences carry no quoted figure. |

Callouts 1 and 2 are the two §3.1 requires for 00-07; callout 3 is required
by D-9 because the lesson names coin cells. **Docs agent:** amend ROADMAP
§3.1: the 00-07 row of the safety table gets "keep coin cells away from
children (swallowing)", and the Batteries line notes that the CR2032 in 00-07
is a simulation preset, not a bench battery (the bench list stays alkaline,
NiMH, 9 V and USB power banks).

---

## 9. Lesson outline: 00-07, Real sources: internal resistance and Thévenin

- **Id:** `00-fundamentals/07-real-sources`. Slugs: EN `real-sources`, ES
  `fuentes-reales` (suggested). Title EN "Real Sources: Internal Resistance and
  Thévenin" / ES "Fuentes reales: resistencia interna y Thévenin". Summary EN
  (draft): "Why a battery's voltage drops under load, how to measure the
  resistance inside it with your meter, how much power it can give, and why a
  voltage divider behaves the same way."
- **Minutes:** 14 (D-23). The coin cell (callout 3 and W-8) adds about half a
  minute to section 4; section 6 gives it back by cutting W-7 to one sentence,
  so the total stays 14.
- **Misconception corrected:** a battery always gives its printed voltage, so
  a higher-voltage battery can always deliver more power.
- **Takeaway (one sentence):** every real source acts like an ideal voltage
  behind a resistance, so its voltage drops by `I · Rint` under load, it gives
  the most power when the load equals that resistance (and then wastes half),
  and a divider seen from its output is a source of the same kind.
- **References (same ids EN/ES):** `energizer-ir-bulletin` (definition, DC
  pulse method, 150–300 mΩ fresh, loaded V = OCV − I·R, 1 kHz reads lower, cold
  fig. 2), `energizer-lithium-coin-manual` (AA "near 0.25 ohms" and CR2032
  "near 10 ohms", the 9 Ω dual-pulse example and the IR-over-life curve, p. 4;
  nominal 3 V, p. 1; swallowing, p. 6), `energizer-coin-ais` (swallowing,
  callout 3, p. 3),
  `energizer-alkaline-handbook` (1.6–0.9 V, fig. 10 life curve, 10 Ω / 1–2 s
  test, p. 14 short-circuit quotes), `duracell-mn1500` (AA 120 mΩ at 1 kHz,
  DC curve), `duracell-mn1604` (9 V: 9.5–9.7 V, 1.7 Ω at 1 kHz, DC 2.3 →
  4.1 Ω), `energizer-nh15-2500` (NiMH 1.2 V, 30/40 mΩ, 12 mΩ at 1 kHz),
  `energizer-nimh-handbook` (< 50 mΩ, 1.4 → 1.2 V, p. 14 short quote),
  `energizer-alkaline-ais-2025` and `energizer-nimh-ais` (prolonged short,
  vent), `wa-battery-burn-2021` (Li-ion), `fluke-80v-manual` (10 MΩ, 1.8 Ω and
  0.03 Ω from 00-05), `kuphaldt-liec` vol. I ch. 10 (Thévenin; maximum power
  transfer, not maximum efficiency), `mit-6002-2007` (L3, further reading),
  `horowitz-hill-2015` (general, no page), `openstax-fisica-u2-es` §10.1 and
  `hyperphysics-es` ("Teorema de Thevenin", "Fuentes de Voltaje y de
  Corriente"), the Spanish-language explanations, cited in both languages
  (00-06's D-18 rule).

| # | Section (working heading) | ~min | Content | Widget / callout |
|---|---|---|---|---|
| 1 | Opening situation | 1 | Your meter reads 1.6 V across a fresh AA. Clip a 10 Ω resistor across it and the reading falls to 1.561 V. Where did 39 mV go? (Answer in §2.) 00-04 said a real battery sags a little; this is how much. | — |
| 2 | A resistance inside the battery | 2.5 | Define **open-circuit voltage**, **terminal voltage**, **internal resistance** (glossary's planned row). The model: an ideal source (00-04) in series with Rint, in a dashed box; the battery symbol (long plate +, define **polarity** if the planned row is taken up). `V = Voc − I · Rint` (Energizer's 1.6 V − 1 A × 0.1 Ω example). Worked W-1 with the load on and off. 00-06's promise: 6.09 mW heats the cell. `:::key`: a battery's voltage drops by I · Rint, and that much power heats the battery. Real example: a 9 V battery's reading drops when you connect its load (W-4's 7.805 V at 10 Ω). | `::widget{type="thevenin" source="aa" rload="10"}` |
| 3 | Measuring it with your meter | 3 | **Safety 1** first. The two readings (00-05's meter, D-4): open circuit, then with a known 1 W resistor; I from Ohm's law; `Rint = (Voc − V) / I`. W-2 for the AA and the 9 V. Why the 10 MΩ meter does not matter here (00-05's ratio rule, 2.5 × 10⁻⁸). Why four digits. Then compute, never measure, `Isc = Voc / Rint`. Why datasheets disagree: method, charge, cold, maker (§2 spread). | **Safety 1** before the bench step; widget above (type values) |
| 4 | How much power can it give? | 3 | Drag the load and watch the plot (define **logarithmic scale**: each step along the axis multiplies the resistance by ten). The peak at `RL = Rint` (the mirror argument), `Pmax = Voc² / (4 · Rint)`, and 50 % efficiency (derived: equal resistances, equal current, equal power). W-3. Define **efficiency** and **maximum power transfer**; Kuphaldt: maximum power is not maximum efficiency. W-4: the misconception, AA vs 9 V vs NiMH; then **Safety 3**, then the coin cell's row and W-8 (in the instrument only: 3.2 V, yet 1.6 V on 10 Ω, 320 mA, 256 mW; define **coin cell** in one line). | widget above; **Safety 3** before the coin cell's first mention |
| 5 | Past the peak | 1.5 | The left half: more current, less power, more heat inside than in the load (warn tone, hot Rint). W-5 (9 V at 1 Ω), and closing 00-05's loop (2.34 A and 4.12 A, still amps). The fresh-cell spread (12.3 A). Simulation only. | **Safety 2** before W-5 |
| 6 | Any two terminals: Thévenin | 2.5 | Define the **Thévenin equivalent**, **Thévenin voltage** and **Thévenin resistance**: seen from two terminals, a network of sources and resistors acts like one source behind one resistor (Kuphaldt; HyperPhysics: Vth is the open-circuit voltage, Rth = Vth / Isc). The divider: Vth = 00-03's unloaded output, Rth = R1 ∥ R2 = 00-03's output impedance (one name per idea: the prose says they are the same thing). W-6, and W-7 in one sentence. The equivalent tells you what the load sees, not the heat inside. 00-05's meter loading was this same source with the meter as the load. `:::key`: the Thévenin equivalent. | `::widget{type="thevenin" source="divider" vin="9" r1="10k" r2="10k" rload="10k"}` |
| 7 | Next | 0.5 | Module 00 ends here. Module 01 starts with real resistors: their values are not exactly the printed ones either (tolerance), which is one reason W-2's Rint is only "about". | `:::note` |

**The three earlier promises, and where they are kept:**
- 00-04 (line 63): "A real battery sags a little, as a later lesson shows." →
  §1 and §2 (W-1: 39 mV at 10 Ω, 3.99 mV at 100 Ω).
- 00-05 (lines 138–145): "The real current is lower, because the battery's own
  resistance (lesson 07) and the leads limit it." → §5 (2.34 A on the mA jack,
  4.12 A on the A jack, leads ignored). 00-05 (line 219): "Lesson 07 takes
  readings with and without a load on a battery, with this same meter." → §3
  (W-2).
- 00-06 (lines 278–280): "the resistance inside a battery, which turns power
  into heat inside the battery itself. It reads a battery with and without a
  load, with lesson 05's meter." → §2 (Heat inside readout, 6.09 mW) and §3.

**Links back:** 00-01 (cell, supply, `P = I² · R`, dissipate), 00-03 (output
impedance, loaded output formula, the ten-times rule, Unloaded and Wasted
figures, stiff), 00-04 (ideal source, terminals, delivering power, the alkaline
and Li-ion callout), 00-05 (10 MΩ input resistance, the ratio rule, the misuse
arithmetic, short circuit), 00-06 (heat from `I² · R`, the headroom rule, 1 W
parts).

**Links ahead (ROADMAP §4):** 01-01 (tolerance of the measuring resistor),
01-02 (ESR: a capacitor's internal resistance, qualitative), 02-05 (impedance:
Rth generalised to AC), 05-02 / 05-03 (efficiency of converters), 05-05
(inrush: a current spike set by ESR and wiring resistance, the same "only the
source's resistance limits it" idea), 06-06 and 10-04 (an ADC needs a source
impedance below about 10 kΩ: the Thévenin resistance of what drives it),
08-04 (output impedance against a 32 Ω headphone load), 09-01 (stall current:
a motor's short-circuit current).

**Glossary terms the lesson defines** (EN/ES; update the planned rows):
internal resistance / resistencia interna (planned row → defined in 00-07);
open-circuit voltage (Voc) / tensión en vacío (Voc) (ES matches 00-03's «En
vacío»); terminal voltage / tensión en los terminales; short-circuit current
(Isc) / corriente de cortocircuito (Isc), "computed, never measured";
efficiency / eficiencia; maximum power transfer / máxima transferencia de
potencia; logarithmic scale / escala logarítmica; Thévenin equivalent,
Thévenin voltage (Vth), Thévenin resistance (Rth) / equivalente, tensión
(Vth) y resistencia (Rth) de Thévenin (planned row → defined; say Rth is
00-03's output impedance); polarity / polaridad (planned row; define with the
battery symbol if used); coin cell / pila de botón (a small, flat, round
cell, such as the 3 V CR2032 lithium cell); update "output impedance" ("full in 00-07" → done)
and leave "source impedance" as not used (one name per idea). If the prose
mentions the 1 kHz test: alternating current / corriente alterna (one line,
full in module 02).

---

## 10. Decisions

All binding for the 00-07 change. D-1 to D-6 came with the brief request;
D-7 to D-30 were settled by the maintainer on 2026-10-30 from this brief's
proposals: D-9 reverses the proposal (the CR2032 is in, simulation only),
D-15, D-18 and D-23 were confirmed explicitly, the rest as recommended. No
item is open.

### Given with the brief request

| # | Decision | Where it applies |
|---|---|---|
| D-1 | **Source:** real-cell presets with datasheet-sourced internal resistance plus a custom source (Voc ≤ 24 V, Rint control). Presets AA alkaline, 9 V alkaline, AA NiMH; lead-acid out of the presets; one value per preset (fresh, room temperature, DC method), with the prose describing the range. | §2 presets table and spread; D-8, D-9, D-10 |
| D-2 | **Load sweep view:** a small SVG P–R curve with markers at the present load and the maximum-power point; text equivalent (WCAG 1.1.1), keyboard through the load control, 375 px, both themes, `formatSI` axis labels. | §4 plot and `app-curve`; D-15, D-16 |
| D-3 | **Thévenin mode:** 00-03's divider reduced to `Vth = Vin · R2 / (R1 + R2)` and `Rth = R1 ∥ R2`, driving the same sweep, consistent with `divider`. | §3, §4 drawing, §5; D-11, D-12, D-19, D-20 |
| D-4 | **Measuring Rint:** two readings with the 00-05 meter, `Rint = (Voc − V) / I`; Isc computed and shown as computed, never measured. | §4 readout 2 note, §5, §6 W-2; D-18 |
| D-5 | **Battery symbol built in this change** (step 3), with its geometry, polarity, inputs and spec; symbols for the custom and Thévenin sources; how Rint is drawn. | §4 Symbols; D-20 |
| D-6 | **Safety:** never short a battery to measure its short-circuit current; Li-ion shorts start fires. | §8; D-22 |

### Settled on 2026-10-30

| # | Decision | Where it applies |
|---|---|---|
| D-7 | **One question:** "Why does a battery's voltage drop when you load it, and how much power can it give?" **Misconception:** "A battery always gives its printed voltage, so a higher-voltage battery can always deliver more power." | §1, §9 |
| D-8 | **Preset values:** AA 1.6 V / 0.25 Ω; 9 V 9.6 V / 2.3 Ω; NiMH 1.2 V / 30 mΩ (sources and reasons in §2). The prose gives the spread (method, charge, cold, maker). | §2, §5 |
| D-9 | **CR2032 is a fourth battery preset, simulation only** (reverses the proposal to leave it out): 3.2 V / 10 Ω (`energizer-lithium-coin-manual` p. 4; IR over life in prose), key `CR2032`, prop value `cr2032`, single-cell `schBattery`. The prose suggests no bench step with a coin cell and carries a third `:::safety` callout on swallowing (`energizer-coin-ais` p. 3), placed before the coin cell's first mention. The docs agent amends ROADMAP §3.1 (00-07 row; CR2032 noted as a simulation preset, not a bench battery). | §1, §2, §3 (segment rows), §4, §5, §6 W-4 and W-8, §7, §8 callout 3, §9 |
| D-10 | **Lead-acid out of the presets and the prose:** `csb-gp1272`'s stated 23 mΩ and 276 A do not satisfy `Isc = Voc / Rint` and have no test conditions. | §1, §8 |
| D-11 | **One Source segment, six keys in two fixed rows:** `AA`, `9 V`, `NiMH`, `CR2032` / Custom, Divider, with a forced break before Custom (all six need about 500 px against about 300–315 px of controls column). Preset keys write their values into always-visible Voc and Rint controls; editing either selects Custom. | §3 |
| D-12 | **Two instances:** battery (`source="aa"`) in section 2, divider (`source="divider"`) in section 6; each can switch to any source. | §2, §9 |
| D-13 | **Load not E24**, log, battery 10 mΩ – 10 kΩ (unchanged for the coin cell: its 10 Ω is mid-range), divider 100 Ω – 1 MΩ, 3 significant figures. R1 and R2 stay E24. | §2, §3 |
| D-14 | **A Load switch**, default on, `loaded` prop; the Load control stays rendered while off. Off = the open-circuit reading. | §2, §3, §4 |
| D-15 | **Build `app-curve` (`src/app/ui/curve.ts`) in step 3**, a minimal static XY plot with its own spec (`curve.spec.ts`); its `label` joins `SPOKEN_INPUTS` in `tools/check-glyphs.mjs`; ROADMAP A2 records that `app-trace` may absorb it. | §4, §5 step 3 specs |
| D-16 | **Plot axes and markers:** x log over exactly the Load control's range; y linear 0 → 1.15 · Pmax; hollow marker at the peak (`max {pmax}`), filled hot marker at the load with a guide; no pointer interaction; `role="img"` with an updating spoken label, no `aria-live`. | §4 |
| D-17 | **Readouts:** Terminal voltage (Output in divider mode), Load current, Load power, Heat inside (Heat in R1 and R2), with Isc, Pmax and efficiency as notes; battery terminal voltage to 4 significant figures, divider output to 3. | §4, §6 |
| D-18 | **The readouts are the readings.** No meter is drawn; Load off gives the open-circuit reading; the lesson works out Rint from the readouts, with I from the known load (V / RL); the 10 MΩ meter's effect is explained in prose as negligible. | §1, §4, §5, §6 W-2 |
| D-19 | **Divider readout 4 shows the real heat in R1 and R2** and the real efficiency; the prose says the equivalent predicts the load, not the inside. | §4, §5, §6 W-6 |
| D-20 | **Symbols:** `schBattery` (`kind` `cell` / `battery`, vertical only, + at the top, thick short plate, 4 units); AA, NiMH and CR2032 as `cell`, 9 V as `battery`; `schBox` (dashed enclosure); Custom and Vin use `schSource`; Rint is a `schResistor` in the box; divider mode draws the divider in the box with `Vth` / `Rth` labels. | §4 |
| D-21 | **Nameplate** `V = Voc − I · Rint` / `V = Vth − I · Rth`, accent on `I · Rint`, U+2212 minus. | §4 |
| D-22 | **Callouts 1 and 2:** "Never short a battery" before the bench measurement (section 3); "Shorted lithium-ion cells start fires" before W-5 (section 5). Callout 3 per D-9 (section 4). | §8, §9 |
| D-23 | **One lesson, 14 minutes, two instances:** id `00-fundamentals/07-real-sources`, slugs `real-sources` / `fuentes-reales`, seven sections. The coin cell's half minute in section 4 is offset by shortening W-7 in section 6. | §9 |
| D-24 | **Heat tone:** warn when the heat inside exceeds the load power (efficiency < 50 %), plain otherwise, both families; Rint drawn hot in that state (battery family). No `danger`, no `signal`, no current threshold. | §4 |
| D-25 | **Ranges and model:** Voc 1–24 V linear; Rint 10 mΩ – 100 Ω log, not E24; custom defaults 5 V / 1 Ω (model no device); Rint and Voc constant, with the three stated assumptions. | §2, §3, §5 |
| D-26 | **Canvas `w=32 h=16`** in both families. | §4 |
| D-27 | **`docs/briefs/README.md` unchanged** (it does not list briefs). Docs agent, after the build: ROADMAP status (module 00 7 of 7; A1 battery ✅ and `schBox`; A2 note on `app-curve`; §3.1 per D-9), ARCHITECTURE §4.4/§4.5 (`app-curve`, `schBattery`, `schBox`), DESIGN-PIXEL-ART non-colour cues (hollow vs filled plot markers). | — |
| D-28 | **Glossary:** the terms in §9; ES «tensión en vacío» for open-circuit voltage, «tensión en los terminales» for terminal voltage, «pila de botón» for coin cell. | §9 |
| D-29 | **The 9 V battery's cell count stays out of the prose** unless a source that states it is added. | §4, §9 |
| D-30 | **The 1 kHz test is mentioned in one sentence** with a one-line definition of alternating current. | §2, §9 |
