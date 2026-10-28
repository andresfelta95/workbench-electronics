# Brief: `meter-loading` (lesson 00-05, Using a multimeter)

ROADMAP §3 step 2 output for module 00's fifth lesson. The symbol agent
(step 3), the instrument agent (step 4) and the content agents (steps 5–7)
build from this. Where this brief and ROADMAP §4 differ, this brief wins for
00-05; record any change of decision here first.

Sources named below are bibliography ids. `fluke-11x-manual` and
`fluke-abc-safety` already exist in `content/bibliography.yaml`;
`fluke-80v-manual` and `fluke-17x-cal` are being added by the sources agent
and must exist (YAML and `docs/BIBLIOGRAPHY.md`) before the lesson cites them.

---

## 1. The one question and its consequence

**How much does the meter change what it measures?**

A meter is part of the circuit while it measures. A voltmeter is a large
resistor in parallel with what it measures. An ammeter is a small resistor in
series with it. The reading is the circuit *with* the meter in it, so it is
only right when the meter's resistance is far from the circuit's: much larger
for a voltmeter, much smaller for an ammeter.

**What the reader sees.** Two numbers side by side, the reading and the true
value (the same circuit with no meter), and an Error readout that changes tone
as they drift apart. In voltmeter mode, raising R1 and R2 from 10 kΩ to 10 MΩ
takes the reading from 4.5 V to 3 V while the true value stays at 4.5 V. In
ammeter mode, a low-resistance load on the mA range reads 7.56 % low and
shows the voltage the meter itself takes (burden voltage); switching to the
A range brings the error under 1 %.

**Why it is not a sentence.** "A meter loads the circuit" is a sentence, but it
does not tell the reader *when* it matters. Dragging R1/R2 or the load across
five decades and watching the error go from 0.05 % to 33 % turns it into the
ratio rule (§5), the same ten-times / hundred-times rule as 00-03's key callout,
applied to the meter.

**Misconception it corrects:** "A meter shows what the circuit was doing before
I connected it."

### Not in this instrument (decided)

- **The misuse state (current mode across a source, blown fuse): prose only.**
  Reasons:
  1. *One question.* "What if I connect the ammeter across the battery?" has a
     binary answer that fits in a sentence (it is a short circuit, and the fuse
     blows or the meter is damaged). ARCHITECTURE §6 cuts instruments whose
     takeaway is a sentence; a mode that only exists to show it would dilute
     the loading question.
  2. *No honest number.* The current is set by the source's internal
     resistance, the leads and the fuse's behaviour. Internal resistance is
     taught in 00-07, and the fuse's time-current behaviour in 05-05. With an
     ideal source the instrument would show 300 A for 9 V across 0.03 Ω, which
     is wrong in practice; any figure it showed would be invented.
  3. *Symbols.* A blown-fuse state needs the fuse symbol, which the A1 table
     schedules for module 05.
  4. *Safety.* §3.1 allows simulation when the prose says so, but an animated
     "blown fuse" is a toy that invites trying it. A `:::safety` callout plus
     one paragraph of Ohm's law arithmetic does the job (see §8 and §9).
  The maintainer confirmed this (Decisions, D-1). An in-instrument misuse
  state was considered and rejected; do not build one.
- **Ohms mode.** Measuring resistance is a different question (what the meter
  pushes through the part, and why the circuit must be unpowered). The prose
  covers it without an instrument.
- **AC, true-RMS, scope probes.** 02-01, 02-02, 07-04.

---

## 2. Props (directive attributes)

Read each as `this.props()['key']`. Numeric props go through `parseValue`
(first argument, fallback as second argument, never `?? '…'`) so
`tools/widget-props.mjs` types them as numbers. Every numeric value is clamped
to its control's range after parsing, as `kirchhoff` does, so a preset can
never exceed the course's 24 V ceiling.

| Prop | Kind | Default | Clamp | Mode | Meaning |
|---|---|---|---|---|---|
| `mode` | text | `voltage` | `voltage` or `current`; anything else → `voltage` | both | Which measurement the instrument starts in. The reader can switch (§3). |
| `vin` | number | `9` | 1 – 24 V | both | Supply. One signal shared by both modes. |
| `r1` | number | `10k` | 100 Ω – 10 MΩ | voltage | Top resistor of the divider. |
| `r2` | number | `10k` | 100 Ω – 10 MΩ | voltage | Bottom resistor, the one being measured. |
| `rin` | number | `10M` | 100 kΩ – 1 GΩ | voltage | Voltmeter input resistance. 10 MΩ: "DC volts input impedance > 10 MΩ, < 100 pF" (`fluke-11x-manual` Table 7; `fluke-80v-manual` Table 18; `fluke-17x-cal` p. 6). |
| `rload` | number | `1k` | 10 Ω – 1 MΩ | current | The load the current flows through. |
| `range` | text | `mA` | `mA` or `A`; anything else → `mA` | current | Which current range (and jack) the meter is on. Sets the meter's resistance (below). |

**Meter resistance per range (constants in `meter-loading-math.ts`, not props).**
Derived from typical burden-voltage figures, not published resistances; the
code comment and the prose must say "typical, derived from the burden voltage".
The reference meter is the **Fluke 87V** (D-2): the prose names it as the
example meter; the instrument UI shows no brand. The Fluke 175/177/179 figures
are corroboration only and are not used for any displayed number.

| Range | Burden voltage (typical) | Resistance used | Source |
|---|---|---|---|
| `mA` (400 mA input) | 1.8 mV/mA (Fluke 87V, 60/400 mA ranges); 2 mV/mA (Fluke 175/177/179) | **1.8 Ω** | `fluke-80v-manual` Table 14 p. 48; `fluke-17x-cal` p. 5 note 5 |
| `A` (10 A input) | 0.03 V/A (Fluke 87V); 37 mV/A (Fluke 175/177/179) | **0.03 Ω** | same |
| µA (prose only) | 100 µV/µA (Fluke 87V) → 100 Ω | not in the instrument | `fluke-80v-manual` Table 14 |

**mA full scale: 400 mA** (`fluke-80v-manual` "400 mA range"; `fluke-17x-cal`
"400 mA input"). On the `mA` range a meter current above 0.4 A shows `OL`
(§4). The A range never reaches its 10 A limit inside these clamps
(24 V / 10 Ω = 2.4 A), so it needs no over-range state.

Why a range selector and not a free "meter resistance" slider: the reader's
real choice at the bench is which jack and range to use, and the two verified
figures map onto it exactly. A free slider would need an invented range and
would let worked examples drift from the prose. µA stays in prose only (D-3):
its burden figure is verified but its full scale is not.

The `rin` control still runs to 1 GΩ as a "what if" (an ideal meter in
practice), but the prose makes no claim that any real meter reaches it: no
source supports one (D-3).

Directive lines for the lesson (see §9):

```markdown
::widget{type="meter-loading" mode="voltage" vin="9" r1="10k" r2="10k" rin="10M"}
::widget{type="meter-loading" mode="current" vin="9" rload="1k" range="mA"}
```

---

## 3. Controls

Inside `panelControls`, in this DOM (and tab) order. Only the active mode's
controls render (`@if`), as `ohm-law` does for its unknown.

| # | Control | Kind | Label EN / ES | Unit | Range | Travel | E24 | Mode |
|---|---|---|---|---|---|---|---|---|
| 1 | Mode | `pix-segment`, two radio keys | legend **Measure** / **Medir**; keys **Voltage** / **Tensión** and **Current** / **Corriente** (reuse `widget.voltage`, `widget.current`) | — | — | — | — | both |
| 2 | Supply | `app-control` | **Supply** / **Fuente** (reuse `widget.supply`) | V | 1 – 24 | linear | no | both |
| 3 | R1 | `app-control` | `R1` | Ω | 100 Ω – 10 MΩ | log | yes | voltage |
| 4 | R2 | `app-control` | `R2` | Ω | 100 Ω – 10 MΩ | log | yes | voltage |
| 5 | Input resistance | `app-control` | **Input resistance** / **Resistencia de entrada** | Ω | 100 kΩ – 1 GΩ | log | **no** (a meter is not a bought resistor) | voltage |
| 3' | Load | `app-control` | **Load** / **Carga** (reuse `widget.load`) | Ω | 10 Ω – 1 MΩ | log | yes | current |
| 4' | Range | `pix-segment`, two radio keys, under a `pix-rule` | legend **Range** / **Rango**; keys `mA` and `A` (same in both languages) | — | — | — | — | current |

- **Step.** `app-control` has 1000 slider positions over its range (linear or
  log) and no step input; exact values come from the text box. Every worked
  example in §6 is reproduced by typing, e.g. `10M` in R1 and R2.
- **Keyboard.** Segments are native radios: Tab reaches the group, arrow keys
  move and select, as in `ohm-law`. Each `app-control` gives a text box
  (type, Enter or blur commits, clamped, E24-snapped where marked) and a range
  input (arrows, Page Up/Down, Home/End). Radio `name` per instance from a
  module counter, as `ohm-law` does, because the lesson places two instances
  on one page.
- **State across a mode switch.** Each mode keeps its own values (`r1`, `r2`,
  `rin`, `rload`, `range` are separate signals); `vin` is shared. Switching
  back restores what the reader had.
- **Presets.** None beyond the props. No reset key (no existing instrument has
  one).
- **Layout stability.** Both modes must give the panel the same nameplate
  size (pass the other mode's formula as `headingAlt`) and the same canvas
  size (`w=31 h=16` in both). Mode 1 has 4 controls + segment, mode 2 has
  2 controls + 2 segments; a small height change of the controls column is
  acceptable, but the mode segment itself must not move when toggled (it is
  first, so it does not).

---

## 4. Readouts, nameplate, schematic, tones

### Nameplate (`app-panel` heading)

| Mode | Visible (VT323) | Spoken EN (`headingLabel` and canvas `label` prefix) | Spoken ES |
|---|---|---|---|
| voltage | `Vread = Vtrue · Rin / (Zout + Rin)` | Reading = true voltage × Rin / (Zout + Rin) | Lectura = tensión real × Rin / (Zout + Rin) |
| current | `Iread = Itrue · RL / (RL + Rm)` | Reading = true current × RL / (RL + Rm) | Lectura = corriente real × RL / (RL + Rm) |

Accent run (inverse video): `Rin` in both places in the voltage plate; `Rm`
in the current plate (the meter's own term). Pass the inactive mode's plate
as `headingAlt` so the strip keeps one size. `Zout` is 00-03's output
impedance (R1 ∥ R2), which the prose must say.

### Readouts (`panelReadouts`, 4 per mode, a 2 × 2 grid on wide panels)

| # | Voltage mode | Current mode | Tone | Format |
|---|---|---|---|---|
| 1 | **Reading** / **Lectura**: Vread | **Reading** / **Lectura**: Iread, or `OL` when over range | `accent`; `danger` when `OL` | `formatSI(x, 'V' \| 'A', lang)` |
| 2 | **True value** / **Valor real**, note **without the meter** / **sin el medidor**: Vtrue | same: Itrue | `plain` | `formatSI` |
| 3 | **Error**: (Vread − Vtrue) / Vtrue | same with currents; `—` when `OL` | by `errorTone` (below) | `formatPercent(e, lang, 2)` (two decimals, so 0.05 % does not read as 0 %) |
| 4 | **Output impedance** / **Impedancia de salida** (reuse `widget.outputImpedance`): Zout = R1 ∥ R2 | **Burden voltage** / ES label per the rule below, note **across the meter** / **en el medidor**: Vb = Iread · Rm; `—` when `OL` | `plain` | `formatSI(x, 'Ω' \| 'V', lang)` |

**ES label for burden voltage (D-5).** Use the glossary's long form
**«Caída de tensión del amperímetro»** if, at 375 px (and at the two-column
widths 900 and 1280 px), it fits the readout without an awkward wrap: at most
two lines, breaking between words, with no word split and the readout row not
taller than its neighbour's. The instrument agent decides by testing and
records the result in its report. Otherwise use **«Caída del amperímetro»**.
Either way the glossary row lists the label that ships.

`OL` note (on readout 1): **over 400 mA: use the A range** / **más de 400 mA:
usa el rango A**. `OL` is what a real meter displays on overload; the prose
defines it (§9).

**Tones (`errorTone`, same thresholds as the divider):** |e| < 1 % →
`signal`; 1 % ≤ |e| < 10 % → `warn`; |e| ≥ 10 % → `danger`. So "error above
1 % warns". Exactly 1 % is `warn` (the divider's boundary).

### Schematic (`sch-canvas w=31 h=16`, both modes)

**Voltage mode:** the divider's drawing with the meter in RL's place.
`schSource` (4, 3); R1 (14, 3) and R2 (14, 7) vertical; ground (14, 13);
junctions (14, 7), (14, 13), (25, 7); wires as in `divider.ts` (`M40 30 H140`,
`M40 75 V130 H140`, `M140 110 V130`, `M140 70 H250`, `M250 110 V130 H140`).
**`schMeter` kind `V`, vertical, at (25, 7)**, `[highlight]="true"`, `name`
`Rin`, `value` its resistance (`10 MΩ`). Accent `schLabel` with the reading
(`3 V`) where the divider puts Vout's (≈ (21, 5.6)). No `Vout` terminal. Flow:
the main loop by supply current, the meter branch by meter current (hundreds
of nA, so it runs at the slowest speed: the reader sees a current entering the
meter, which is the point).

**Current mode:** one loop. `schSource` (4, 3); wire `M40 30 H90`;
**`schMeter` kind `A`, horizontal, at (9, 3)** (pins x = 90 and 140),
highlighted, `name` `Rm`, `value` `1.8 Ω` or `30 mΩ`, `+` on the left pin;
wire `M140 30 H250 V70`; RL vertical at (25, 7), `name` `RL`; wire
`M250 110 V130 H40 V75`; ground (14, 13) with a junction, as in voltage mode,
so the two drawings share a frame. Accent `schLabel` with the reading near the
meter. Flow: the loop current. The implementer may move parts by a unit to
avoid label collisions at 375 px; keep the canvas size.

**Canvas `label` (spoken):** the plate's spoken form, then a sentence from
`ui.ts` and the values, e.g. EN "A 9 V supply feeds R1, 10 MΩ, and R2,
10 MΩ, in series. A voltmeter with 10 MΩ input resistance is connected across
R2 and reads 3 V. Without the meter, R2 has 4.5 V." Current mode: "A 9 V
supply drives a current through the ammeter, on its mA range (1.8 Ω), and a
1 kΩ load in one loop. It reads 8.98 mA; without the meter, 9 mA flows." Use
`×` only in spoken strings.

### New symbols (step 3, `src/app/schematic/schematic.ts`)

Both extend `SchSymbol` (so `x`, `y`, `dim`, `highlight` work), use
`SYMBOL_STYLES`, `class="stroke"` / `fill` / `label` / `value`,
`currentColor`, whole-unit coordinates, even stroke widths (2, 4 when hot).
Add them to `SCHEMATIC`. Show both on a spec (the A1 "gallery or spec"
requirement): render each with `dim` and `highlight` and assert the classes.

**`svg:g[schMeter]`, the meter (ROADMAP A1, module 00).** A circle with a
letter, drawn as a pixel circle (DESIGN-PIXEL-ART asks for rectangles over
circles, so no `<circle>`: a staircase outline that reads as round at 14–16 px
labels).

- Inputs: `kind: 'V' | 'A' | 'Ω'` (default `'V'`), `vertical` (default
  `true`), `name`, `value`, `plus` (default `false`: draw `+` beside the first
  pin).
- Vertical: 4 units long like the vertical resistor, pins (0, 0) and (0, 40),
  leads `M0 0 v8` and `M0 32 v8`, body 24 × 24 centred on (0, 20). Suggested
  outline (whole units, symmetric):
  `M-4 8 H4 V10 H8 V12 H10 V16 H12 V24 H10 V28 H8 V30 H4 V32 H-4 V30 H-8 V28 H-10 V24 H-12 V16 H-10 V12 H-8 V10 H-4 Z`.
  Letter: `<text class="label" x="0" y="25" text-anchor="middle">` (tune `y`
  so the cap height centres; at 14 units the letter fits the 20-unit inner
  width). `name` at (16, 17), `value` at (16, 29), as `schResistor`.
- Horizontal: 5 units long, pins (0, 0) and (50, 0), body centred on (25, 0)
  (x 13–37), leads `M0 0 H13`, `M37 0 H50`; `name` above (25, −16), `value`
  below (25, 28), both `text-anchor="middle"`.
- The letter is drawn text in the pixel font: `V` and `A` by VT323, `Ω` by
  JetBrains Mono (allowed Greek fallback). Under `sch--hot` the letter stays
  `currentColor` (the hot colour); under `sch--dim` it switches to muted ink
  like other labels (already in `SYMBOL_STYLES`).

**Battery symbol: not in this change (D-4).** `meter-loading` uses the
existing `schSource` in both modes. The A1 battery symbol is built in 00-07's
step 3, where `thevenin` first uses it ("built in step 3 of its module, never
inline"). The symbol agent for 00-05 builds `schMeter` only.

---

## 5. Formulas, edge cases, pure functions

### Voltage mode (voltmeter across R2)

- True value: `Vtrue = Vin · R2 / (R1 + R2)`
- Output impedance: `Zout = R1 ∥ R2 = R1 · R2 / (R1 + R2)`
- Reading: `Vread = Vin · (R2 ∥ Rin) / (R1 + (R2 ∥ Rin))`, which equals
  `Vtrue · Rin / (Zout + Rin)` (00-03's "loaded output = unloaded output ×
  RL / (Zout + RL)", with the meter as the load)
- Error: `e = (Vread − Vtrue) / Vtrue = −Zout / (Zout + Rin)`
- Meter current: `Im = Vread / Rin`

### Current mode (ammeter in series with RL)

- True value: `Itrue = Vin / RL`
- Reading: `Iread = Vin / (RL + Rm) = Itrue · RL / (RL + Rm)`
- Error: `e = (Iread − Itrue) / Itrue = −Rm / (RL + Rm)`
- Burden voltage: `Vb = Iread · Rm`; the load is left with `Vin − Vb`
- Over range: `range === 'mA' && Iread > 0.4`

### The ratio rule (what the prose generalises)

Error depends only on the ratio of the meter's resistance to the circuit's:

| Voltmeter `Rin / Zout` | Ammeter `RL / Rm` | Error |
|---|---|---|
| 99 | 99 | −1 % |
| 9 | 9 | −10 % |
| 1 | 1 | −50 % |

Voltmeter: input resistance at least 100 × the circuit's output impedance for
1 %. Ammeter: meter resistance at most 1/100 of the circuit's resistance. This
is 00-03's key callout with the meter as the load.

### Edge cases (the function handles them; the controls cannot reach most)

| Case | Result |
|---|---|
| `rin = Infinity` (ideal voltmeter) | `parallel()` returns R2: `Vread = Vtrue`, `e = 0`, `Im = 0` |
| `rin = 0` | `R2 ∥ 0 = 0`: `Vread = 0`, `e = −1` |
| `r2 = 0` | `Vtrue = 0`: `e = 0` by convention (as the divider) |
| `r1 = 0` | `Vtrue = Vread = Vin`, `Zout = 0`, `e = 0` |
| `r1 + r2 = 0` | shorted supply: `Vtrue = Vread = 0`, `e = 0` (guard every division, as `solveDivider`) |
| `vin = 0` | everything 0, `e = 0` |
| `rMeter = 0` (ideal ammeter) | `Iread = Itrue`, `e = 0`, `Vb = 0` |
| `rLoad = 0` | `Itrue = Infinity`, `Iread = Vin / Rm`, `e = −1`; formatter shows `— A` |
| `rLoad + rMeter = 0` | `Iread = Infinity`, `e = 0` (no finite reference) |
| Any result non-finite | `formatSI` / `formatPercent` show `—`; never `∞` (fails the glyph rule) |

### `src/app/widgets/meter-loading/meter-loading-math.ts`

```ts
import { parallel } from '../../core/format';

export type MeterMode = 'voltage' | 'current';
export type CurrentRange = 'mA' | 'A';

/** Typical meter resistance per current range, derived from burden voltage
 *  (Fluke 87V: 1.8 mV/mA, 0.03 V/A; fluke-80v-manual Table 14). Not a
 *  published resistance. */
export const RANGE_OHMS: Readonly<Record<CurrentRange, number>> = { mA: 1.8, A: 0.03 };
/** The mA input's full scale (400 mA); above it the meter shows OL. */
export const RANGE_FULL_SCALE: Readonly<Record<CurrentRange, number>> = { mA: 0.4, A: 10 };

export interface VoltmeterInput { readonly vin: number; readonly r1: number; readonly r2: number; readonly rin: number; }
export interface VoltmeterResult {
  readonly reading: number;    // V across R2 with the meter connected
  readonly trueValue: number;  // V across R2 with no meter
  readonly error: number;      // fraction, ≤ 0; 0 when trueValue is 0
  readonly zout: number;       // R1 ∥ R2
  readonly iMeter: number;     // A into the meter
  readonly iSupply: number;    // A from the supply, meter connected
}
export function solveVoltmeter(input: VoltmeterInput): VoltmeterResult;

export interface AmmeterInput { readonly vin: number; readonly rLoad: number; readonly range: CurrentRange; }
export interface AmmeterResult {
  readonly reading: number;    // A through the loop with the meter in it
  readonly trueValue: number;  // A with the meter replaced by a wire
  readonly error: number;
  readonly burden: number;     // V across the meter
  readonly rMeter: number;     // RANGE_OHMS[range]
  readonly overRange: boolean; // reading > RANGE_FULL_SCALE[range]
}
export function solveAmmeter(input: AmmeterInput): AmmeterResult;

/** < 1 % signal, < 10 % warn, otherwise danger (the divider's thresholds). */
export function errorTone(error: number): 'signal' | 'warn' | 'danger';

/** Wire speed 0..1, log over 1 µA–1 A, min 0.08 for any positive current
 *  (the divider's dividerFlow); 0 for zero, negative or non-finite. */
export function meterFlow(amps: number): number;

/** Normalises the text props: unknown → default. */
export function parseMode(raw: string | undefined): MeterMode;   // → 'voltage'
export function parseRange(raw: string | undefined): CurrentRange; // → 'mA'
```

Keep `errorTone` and `meterFlow` local to this file (6 lines each), the same
way `divider` and `kirchhoff` each keep their own: widgets do not import each
other. Moving the shared error-tone and wire-speed helpers into `core/` is a
separate, later change (D-6), not part of this one. Exporting a lower-level
`solveAmmeterOhms(vin, rLoad, rMeter)` for the tests is fine.

### Spec cases (`meter-loading-math.spec.ts`, assert through the formatters)

1. Default voltage start (9 V, 10 k / 10 k, 10 MΩ): reading `4.5 V`, true
   `4.5 V`, error `-0.05%` / ES `-0,05 %`, Zout `5 kΩ`, tone `signal`,
   `iMeter` `450 nA`.
2. 1 M / 1 M: reading `4.29 V`, error `-4.76%`, Zout `500 kΩ`, tone `warn`.
3. 10 M / 10 M: reading `3 V` (toBeCloseTo 3), error `-33.33%` / `-33,33 %`,
   Zout `5 MΩ`, tone `danger`, `iMeter` `300 nA`.
4. 100 k / 100 k: reading `4.48 V`, error `-0.5%`.
5. 10 M / 10 M with `rin` 1 GΩ: reading `4.48 V`, error `-0.5%`.
6. Identity: for a grid of r1, r2, rin, `reading ≈ trueValue · rin / (zout + rin)`
   and `error ≈ −zout / (zout + rin)` (toBeCloseTo 12).
7. Ratio rule: `rin = 99 · zout` → error −0.01 (toBeCloseTo); `9 · zout` → −0.1;
   `zout` → −0.5. Same for `rLoad = k · rMeter` in current mode.
8. `rin = Infinity`: reading = true, error 0, iMeter 0.
9. Default current start (9 V, 1 kΩ, mA): reading `8.98 mA`, true `9 mA`,
   error `-0.18%`, burden `16.2 mV`, tone `signal`, not over range.
10. 9 V, 1 kΩ, A range: reading `9 mA`, error `0%` (−0.003 %), burden `270 µV`.
11. 1.5 V, 22 Ω, mA: reading `63 mA`, true `68.2 mA`, error `-7.56%` /
    `-7,56 %`, burden `113 mV`, tone `warn`.
12. 1.5 V, 22 Ω, A: reading `68.1 mA`, error `-0.14%`, burden `2.04 mV`, `signal`.
13. Over range: 24 V, 10 Ω, mA → `overRange` true (Iread 2.03 A); same on A →
    false, reading `2.39 A`, error `-0.3%`. Boundary: Iread exactly 0.4 A is
    not over range.
14. `errorTone` boundaries: −0.0099 signal, −0.01 warn, −0.0999 warn, −0.1 danger.
15. Guards: `vin` 0, `r1 + r2` 0, `r2` 0, `rLoad` 0 (error −1, trueValue
    Infinity), never NaN in any field (use `Number.isNaN` checks).
16. `parseMode` / `parseRange`: `undefined`, `''`, `'VOLTAGE'` (case-sensitive
    → default), `'current'`, `'A'`.
17. `meterFlow`: 1 A → 1; 1 mA → 0.5; 300 nA → 0.08; 0, −1, NaN → 0.

---

## 6. Worked examples (all numbers computed with `core/format.ts`)

Arithmetic shown to the precision the prose needs; the "displays" column is
what the instrument shows, EN | ES. ES percentages carry a no-break space
before `%` (`Intl` output); write it the same way in prose.

### V-1, voltmeter barely matters (the instrument's start state)

9 V, R1 = R2 = 10 kΩ, Rin = 10 MΩ.

- `Vtrue = 9 V × 10 kΩ / 20 kΩ = 4.5 V`
- `Zout = 10 kΩ ∥ 10 kΩ = 5 kΩ`
- `R2 ∥ Rin = (10 kΩ × 10 MΩ) / (10.01 MΩ) = 9.99 kΩ`
- `Vread = 9 V × 9.99 kΩ / 19.99 kΩ = 4.4978 V`, or
  `4.5 V × 10 MΩ / 10.005 MΩ = 4.4978 V`
- `e = −5 kΩ / 10.005 MΩ = −0.0500 %`
- Meter current `4.4978 V / 10 MΩ = 450 nA`

| Readout | EN | ES |
|---|---|---|
| Reading | 4.5 V | 4,5 V |
| True value | 4.5 V | 4,5 V |
| Error | -0.05% | -0,05 % |
| Output impedance | 5 kΩ | 5 kΩ |

Prose point: the meter is 2000 × the circuit's 5 kΩ (00-03 said the same).

### V-2, voltmeter clearly matters

9 V, R1 = R2 = 10 MΩ, Rin = 10 MΩ (type `10M` into R1 and R2).

- `Vtrue = 4.5 V` (same ratio)
- `Zout = 10 MΩ ∥ 10 MΩ = 5 MΩ`
- `R2 ∥ Rin = 10 MΩ ∥ 10 MΩ = 5 MΩ`
- `Vread = 9 V × 5 MΩ / (10 MΩ + 5 MΩ) = 3 V`, or `4.5 V × 10 / 15 = 3 V`
- `e = −5 MΩ / 15 MΩ = −33.33 %`

| Readout | EN | ES |
|---|---|---|
| Reading | 3 V | 3 V |
| True value | 4.5 V | 4,5 V |
| Error | -33.33% | -33,33 % |
| Output impedance | 5 MΩ | 5 MΩ |

Prose point: the same 4.5 V → 3 V as 00-03's 10 kΩ load, a thousand times
up; the meter's 10 MΩ is the load now. Error tone `danger`.

**V-2b (optional middle case, links back to 00-02).** R1 = R2 = 1 MΩ:
`Zout = 500 kΩ`, `R2 ∥ Rin = 909 kΩ`, `Vread = 9 V × 909.1 kΩ / 1.909 MΩ =
4.29 V` (4,29 V), error `-4.76%` (`-4,76 %`), tone `warn`. 00-02 said the
10 MΩ meter changes a lone 1 MΩ resistor by 9 % (that is a resistance:
`1 MΩ ∥ 10 MΩ = 909 kΩ`, −9.09 %). The voltage error here is about half that
because the meter sees Zout = 500 kΩ, not 1 MΩ. The prose must not make the
two numbers look contradictory.

The fix the prose gives is "use smaller resistors", as in V-1 (same ratio,
same 4.5 V, error -0.05%). No "higher-input-resistance meter" example: it has
no source (D-3).

### A-1, ammeter barely matters (the instrument's start state)

9 V, RL = 1 kΩ, mA range (Rm = 1.8 Ω).

- `Itrue = 9 V / 1 kΩ = 9 mA`
- `Iread = 9 V / 1001.8 Ω = 8.984 mA`
- `e = −1.8 / 1001.8 = −0.18 %`
- `Vb = 8.984 mA × 1.8 Ω = 16.2 mV` (check: 1.8 mV/mA × 8.98 mA)

| Readout | EN | ES |
|---|---|---|
| Reading | 8.98 mA | 8,98 mA |
| True value | 9 mA | 9 mA |
| Error | -0.18% | -0,18 % |
| Burden voltage | 16.2 mV | 16,2 mV |

### A-2, ammeter clearly matters

1.5 V (one AA cell's nominal voltage, or a bench supply set to 1.5 V), RL =
22 Ω, mA range. Type `1.5` in Supply and `22` in Load.

- `Itrue = 1.5 V / 22 Ω = 68.18 mA`
- `Iread = 1.5 V / 23.8 Ω = 63.03 mA`
- `e = −1.8 / 23.8 = −7.56 %`
- `Vb = 63.03 mA × 1.8 Ω = 113 mV`, out of only 1.5 V

| Readout | EN | ES |
|---|---|---|
| Reading | 63 mA | 63 mA |
| True value | 68.2 mA | 68,2 mA |
| Error | -7.56% | -7,56 % |
| Burden voltage | 113 mV | 113 mV |

Then switch Range to `A` (Rm = 0.03 Ω): `Iread = 1.5 V / 22.03 Ω = 68.09 mA`,
`e = −0.03 / 22.03 = −0.14 %`, `Vb = 2.04 mV`.

| Readout | EN | ES |
|---|---|---|
| Reading | 68.1 mA | 68,1 mA |
| True value | 68.2 mA | 68,2 mA |
| Error | -0.14% | -0,14 % |
| Burden voltage | 2.04 mV | 2,04 mV |

Prose point: low voltage + low resistance is where burden voltage bites; the
A range trades resolution for a smaller shunt. Power check for the content
agent: the 22 Ω resistor takes `1.5² / 22 = 102 mW`, inside a 1/4 W part
(no `:::safety` needed; 00-06 has not been taught, so do not dwell on it).
Use an ideal source in the prose ("a bench supply set to 1.5 V") or say the
cell's own resistance is ignored until 00-07.

### Misuse arithmetic (prose only, inside or next to callout 2)

Ohm's law with the meter's own resistance as the only resistance in the loop
gives an upper bound, not a prediction: 9 V across the mA input
`9 V / 1.8 Ω = 5 A`, more than eleven times the 440 mA fuse; across the A
input `9 V / 0.03 Ω = 300 A`. In practice the battery's own resistance
(00-07) and the leads limit it, and the fuse blows (fuses: 440 mA / 1000 V
FAST and 11 A / 1000 V FAST, `fluke-80v-manual` p. 43, `fluke-17x-cal` p. 4).
Full-scale burden on the 400 mA range is `400 mA × 1.8 Ω = 720 mV` (derived),
a useful line for "why the A jack exists".

---

## 7. Glyph check (every visible string)

Rule (DESIGN-PIXEL-ART §Glyph coverage, `tools/check-glyphs.mjs`): a
character passes if VT323 draws it; Greek also passes via JetBrains Mono;
∥ and arrows via Iosevka. `×` and U+2080–209C always fail in visible text.
Checked against `tools/glyph-coverage.json`.

| String(s) | Characters outside ASCII | Result |
|---|---|---|
| `Vread = Vtrue · Rin / (Zout + Rin)`, `Iread = Itrue · RL / (RL + Rm)` | `·` (VT323) | pass. No `×`, no subscripts (`Rin`, not `R_in`/`Rᵢₙ`). |
| Measure / Medir; Voltage / Tensión; Current / Corriente; Supply / Fuente; Load / Carga; Range / Rango; `mA`, `A` | `ó` (VT323) | pass |
| Input resistance / Resistencia de entrada; Reading / Lectura; True value / Valor real; without the meter / sin el medidor; Output impedance / Impedancia de salida; Burden voltage / Caída de tensión del amperímetro (or Caída del amperímetro); across the meter / en el medidor; Error | `í` (VT323) | pass |
| `OL`; over 400 mA: use the A range / más de 400 mA: usa el rango A | `á` (VT323) | pass |
| Schematic: `R1`, `R2`, `RL`, `Rin`, `Rm`, `+`, meter letters `V`, `A`, `Ω` | `Ω` (Greek → JetBrains Mono) | pass |
| Units and formatter output: `V`, `A`, `Ω`, `kΩ`, `MΩ`, `GΩ`, `mΩ`, `µA`, `nA`, `mV`, `µV`, `%`, NBSP before `%` in ES, `,` decimals, `-`, `—` | `µ` (VT323), NBSP U+00A0 (VT323), `—` (VT323), `Ω` (JBM) | pass (formatter output is checked by the tool) |
| Spoken only (`headingLabel`, canvas `label`, `aria-*`, `ui.ts` keys ending `Spoken`) | `×` allowed | exempt |

**Must not appear in visible text:** `×` (use `·`), `∞` (U+221E: not in VT323
or JetBrains Mono and not an allowed Iosevka class, so it fails; an ideal
meter is never labelled `∞`, the slider simply stops at 1 GΩ), `≈` (U+2248,
same), `∥` (allowed, but costs the 80 KiB Iosevka slice; write `||` if a
parallel sign is needed), `₁`/`ᵢₙ` subscripts, `−` U+2212 is in VT323 but use
the formatter's own sign for numbers.

New `ui.ts` keys (`UiStrings.widget`, EN and ES): `measure`, `inputResistance`,
`range`, `reading`, `trueValue`, `withoutMeter`, `burdenVoltage`,
`acrossMeter`, `overRange`, `meterVoltageSpoken`, `meterCurrentSpoken`,
`meterVoltageCircuitSpoken`, `meterCurrentCircuitSpoken`. Reuse `voltage`,
`current`, `supply`, `load`, `error`, `outputImpedance`. The four `…Spoken`
keys are exempt from the glyph check by name.

---

## 8. Safety (ROADMAP §3.1)

**The instrument must:**
- clamp `vin` to 1–24 V (presets cannot exceed the DC ceiling);
- keep the meter in series in current mode and across R2 in voltage mode:
  there is no state that draws the meter across the source in current mode;
- show `OL` on the mA range above 400 mA instead of a reading a real meter
  could not give;
- never use mains, CAT or high-voltage presets.

**The prose must not:**
- suggest measuring mains, opening a meter, or "testing" the fuse by shorting
  a source; suggest measuring a battery's short-circuit current (00-07 computes
  it);
- suggest replacing a fuse with anything but the type the manual names, or
  bridging it;
- present CAT categories as permission to measure mains.

**The prose must:**
- say the course works only on low-voltage, protected electronics (the
  category `fluke-abc-safety` Table 1 p. 2 calls "CAT 0" in this printing:
  electronic and protected equipment), and that the higher categories
  (CAT II receptacle-connected loads, CAT III distribution panels and
  switchgear, CAT IV the utility connection and outdoor conductors) are for
  work the course never does. Mentioning mains at all makes callout 1
  mandatory. Within a category, a higher voltage rating means a higher
  transient withstand; CAT III-600 V protects better than CAT II-1000 V
  (p. 7). Use that only if it helps a reader choose a meter.
- say that the current jacks are fused, and that the reader should check a
  meter has fused current inputs before buying or using it.

**The three required `:::safety` callouts and where they go** (each before the
step that creates the hazard; same callouts, same order, in EN and ES):

| # | Title (EN / ES, suggested) | Placed | Says |
|---|---|---|---|
| 1 | Measurement categories / Categorías de medición | In "The meter and its jacks", **before** the first instruction to touch probes to anything | Hazard: meters are rated by IEC 61010 category for where they may be used; mains circuits can carry transients that destroy an under-rated meter in the user's hand. Consequence: arc, burns. Instead: this course stays at ≤ 24 V DC on protected electronics; never use a meter on mains here. Cite `fluke-abc-safety`. |
| 2 | Never put the meter in current mode across a source / Nunca pongas el medidor en modo corriente sobre una fuente | In "Measuring current", **before** the step "move the red lead to the mA jack" | Hazard: in current mode the meter is a fraction of an ohm, so across a battery or supply it is a short circuit (`fluke-abc-safety` p. 5 Fig. 3; `fluke-80v-manual` pp. 13, 24). Consequence: amps of current, a blown fuse at best, a damaged meter or burned leads. Instead: current is measured in series, with the circuit broken; move the red lead back to the V jack as soon as you finish. The misuse arithmetic (§6) goes here or just after. |
| 3 | Fused current jacks / Bornes de corriente con fusible | Directly after callout 2, still before the jack step | Hazard: the current inputs rely on fuses (440 mA and 11 A, both 1000 V FAST on the cited meters); cheap meters may have a weak or no fuse on the A jack. Consequence: without the right fuse, an overload heats or explodes the meter. Instead: use a meter whose current jacks are fused; start on the A range when you do not know the current; replace a fuse only with the type the manual names; never bridge it. |

Two `:::safety` callouts in a row are acceptable (one per hazard). If the
content agent prefers, callout 3 may come at the end of the jack description
in section 2 of the lesson, as long as it precedes the current measurement.

---

## 9. Lesson outline: 00-05, Using a multimeter

- **Id:** `00-fundamentals/05-multimeter`. Slugs: EN `multimeter`, ES
  `multimetro` (suggested). Title EN "Using a Multimeter" / ES "Cómo usar un
  multímetro". Summary EN (draft): "Measure volts, amps and ohms, and see how
  much the meter itself changes the circuit it measures."
- **Minutes:** 14.
- **Misconception corrected:** a meter is an invisible observer that shows what
  the circuit was doing before it was connected.
- **Takeaway (one sentence):** a voltmeter is a large resistor in parallel and
  an ammeter a small resistor in series, so a reading is only right when the
  meter's resistance is far from the circuit's: about 100 × larger, or 100 ×
  smaller, for 1 %.
- **References (≥ 2, same ids EN/ES):** `fluke-abc-safety` (categories,
  misuse), `fluke-11x-manual` (10 MΩ; ohms test < 2.7 V open circuit,
  < 350 µA, Table 7), `fluke-80v-manual` (burden voltage Table 14; fuses
  p. 43; misuse pp. 13, 24), `fluke-17x-cal` (burden note 5 p. 5; fuses p. 4;
  10 MΩ p. 6), `horowitz-hill-2015` ch. 1, `kuphaldt-liec` vol. I.

| # | Section (working heading) | ~min | Content | Widget / callout |
|---|---|---|---|---|
| 1 | Opening situation | 1 | You built 00-03's divider with two 10 MΩ resistors to save battery. The maths says 4.5 V; the meter says 3 V. Is the divider wrong? (Answer comes in §3.) | — |
| 2 | The meter and its jacks | 2 | Define the dial, the jacks (COM, V/Ω, mA, A), probes (00-02), range and auto-ranging, `OL`. Voltmeter / ammeter / ohmmeter are the same meter in three modes. | **Safety 1** (categories) before any probing |
| 3 | Measuring voltage: across, in parallel | 3 | Voltage is measured across a part: one step of a KVL loop (00-04). The meter's input resistance (00-02) goes in parallel with the part. Worked V-1, then V-2 answers the opening; the 4.5 V → 3 V of 00-03 again. V-2b reconciles 00-02's 9 %. `:::key`: input resistance ≥ 100 × the circuit's output impedance for 1 % (00-03's rule with the meter as the load). Real example: reading a high-value divider or a sensor's output (stay with things 00-03 used). | `::widget{type="meter-loading" mode="voltage" vin="9" r1="10k" r2="10k" rin="10M"}` |
| 4 | Measuring current: in series | 4 | Current is measured through a branch: break the circuit and put the meter in series, so by KCL the whole branch current goes through it (00-04). Define burden voltage (glossary) and the shunt (00-01's USB meter). | **Safety 2** and **Safety 3** before "move the red lead to the mA jack"; then `::widget{type="meter-loading" mode="current" vin="9" rload="1k" range="mA"}`; worked A-1, A-2, the A-range switch |
| 5 | If you get it wrong | 1 | Current mode across a source: Ohm's law upper bound (5 A on the mA input, 300 A on the A input), why it is not the real figure (00-07), and the fuse. May be folded into Safety 2. | — |
| 6 | Measuring resistance | 2 | The meter pushes a small current (< 350 µA, under 2.7 V open circuit on the Fluke 115/117) and measures the voltage. So: power off, and lift one end of the part out of the circuit, or parallel paths (00-02) change the reading. Continuity beep: typically below a few tens of ohms. Real example: checking a resistor against its colour bands (tolerance in 01-01). | — |
| 7 | Next | 0.5 | One or two sentences: 00-06 uses these readings for power (`P = V × I`) and heat; 00-07 takes open-circuit and loaded readings with this meter. | — |

**Links back:** 00-01 (shunt, USB power meter; Ohm's law for the misuse
bound), 00-02 (multimeter, probe, input resistance, loading, the 1 MΩ / 9 %
paragraph, parallel paths for the ohms section), 00-03 (output impedance,
the ten/hundred-times rule, 4.5 V → 3 V), 00-04 (across = KVL, series = KCL;
its closing note promises this).

**Links ahead:** 00-06 (power from measured V and I), 00-07 (open-circuit vs
loaded readings, internal resistance limits a short-circuit current, never
short a battery), 02-01 (true-RMS vs average-responding meters, for AC), 02-02
(the oscilloscope: changing signals; it loads the circuit too), 07-04 (probe
loading, 10× probes), 05-05 (fuses in depth).

**Glossary terms the lesson defines** (update the planned rows and add the
rest, EN/ES): voltmeter, ammeter, ohmmeter; COM jack and the V/Ω, mA and A
jacks; range and auto-ranging; `OL` (overload); burden voltage (term
«caída de tensión del amperímetro (burden voltage)»; instrument label as
decided by the D-5 test); fuse (one line: a thin conductor that melts and opens the circuit
when too much current flows; module 05 goes further); measurement category
(CAT); continuity test; "true value" vs "reading" if the prose uses them.

---

## 10. Decisions (2026-10-27)

The coordinator and maintainer settled the brief's open items. They are
binding for the 00-05 change.

| # | Decision | Where it applies |
|---|---|---|
| D-1 | **Misuse state is prose only.** No mode, key or state shows the meter in current mode across the source or a blown fuse. An in-instrument design was considered and rejected. | §1, §6 (misuse arithmetic), §8 callout 2 |
| D-2 | **Reference meter: Fluke 87V** (1.8 mV/mA on the 60/400 mA ranges, 0.03 V/A on 6/10 A; `fluke-80v-manual` Table 14 p. 48), giving 1.8 Ω and 0.03 Ω. The prose names it as the example meter; the instrument shows no brand. | §2, §5 constants, §6 |
| D-3 | **µA range is prose only**, and there is no "> 1 GΩ input" example (no source). The `rin` control keeps its 1 GΩ top as an unclaimed "what if". | §2, §6 |
| D-4 | **Battery symbol is not in this change.** It is built in 00-07's step 3, where `thevenin` first uses it (A1: "built in step 3 of its module, never inline"). This change adds `schMeter` only. | §4 |
| D-5 | **ES burden-voltage label:** «Caída de tensión del amperímetro» if it fits at 375 px without an awkward wrap (rule in §4); the instrument agent decides by testing; fallback «Caída del amperímetro». | §4, §7, §9 glossary |
| D-6 | **Shared helpers stay where they are.** `meter-loading-math.ts` keeps its own `errorTone` and `meterFlow`, as `divider` and `kirchhoff` do. Moving the error-tone and wire-speed helpers into `core/` is a separate, later change. | §5 |
| D-7 | **Brief location.** Briefs live in `docs/briefs/<widget-type>.md` (`docs/briefs/README.md`). The docs agent names the folder in ROADMAP §3 step 2 in phase 2. | — |
| D-8 | **Two instances.** The voltage-mode widget sits in the "Measuring voltage" section and the current-mode widget in the "Measuring current" section, each with its own directive line (§2, §9). Each instance can still switch modes. | §2, §3 (per-instance radio names), §9 |
