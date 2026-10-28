# Brief: `power-dissipation` (lesson 00-06, Power, heat and thermal resistance)

ROADMAP §3 step 2 output for module 00's sixth lesson. The instrument agent
(step 4), the content agents (steps 5–7) and the docs agent build from this.
No new schematic symbol is needed (§4), so step 3 has nothing to build. Where
this brief and ROADMAP §4 differ, this brief wins for 00-06; record any change
of decision here first.

Sources named below are bibliography ids. All of them already exist in
`content/bibliography.yaml` and `docs/BIBLIOGRAPHY.md` (checked by the sources
agent on 2026-10-28): `stackpole-cf`, `yageo-cfr`, `vishay-mbx-sma`,
`ti-spra953`, `cenelec-guide-29`, `kuphaldt-liec`, `horowitz-hill-2015`
(general only, no page), `openstax-fisica-u2-es`, `hyperphysics-es`. Nothing in
BIBLIOGRAPHY §8 may be used for a figure.

All decisions are binding and listed in §10 (D-1 to D-21); the body cites
them by number.

---

## 1. The one question and its consequence

**How hot does a resistor get, and when is that too hot?** (D-4)

A resistor turns all of its power into heat. Its surface settles at a
temperature above the air around it, and the rise is the power times a number
that belongs to the part, its thermal resistance θ:

`T = Ta + P · θ`

"Too hot" has two separate limits, and the instrument shows both: the maker's
**power rating**, which shrinks once the air is hotter than 70 °C, and the
**temperature at which a surface burns skin**, which a part reaches well inside
its rating.

**What the reader sees.** The instrument starts at 5 V across a 100 Ω,
1/4 W resistor in 25 °C air: 250 mW, exactly its rating. Rating used reads
100 % in the warn tone, the surface reads 57 °C with the note "can burn skin".
The part is inside its rating and still too hot to touch. Switching the
segment to the 1 W part drops the surface to 46 °C at the same power. Raising
the supply to 10 V puts the 1 W part at its own rating, and it runs at 110 °C,
hotter than the small part ever did at its rating. Back on the 1/4 W part,
raising the ambient from 25 °C to 85 °C takes the same 250 mW from 100 % to
121.4 % of the (now smaller) rating, and the resistor turns the hot colour.

**Why it is not a sentence.** "Resistors get hot" is a sentence. The two
counter-intuitive results are not: a part at its rating is hot enough to burn,
and the bigger part runs *hotter* at its own rating even though it runs cooler
per watt. Moving power, part and ambient separately shows which knob moves the
rise (power, part) and which moves the limit and the starting point (ambient).
That split is the model 03-06, 05-01 and 11-03 reuse (`gate-drive-loss`,
`ldo-thermal`, `trace-width`).

**Misconception it corrects:** "A resistor used within its power rating stays
cool, and its rating holds in any conditions."

### Not in this instrument (decided)

- **Smoke, flame or a burnt-part animation (D-1).** Overload shows numbers
  (power, rating used), a danger tone and the resistor in the hot colour.
  "Smoke means stop" is a `:::safety` callout with no figure: no source states
  at what point a resistor smokes (BIBLIOGRAPHY §8).
- **Temperatures past the rated power (D-7).** The maker's curve is read at
  100 % of rated power. Above that the instrument shows no temperature (`—`),
  because any figure would be an extrapolation the sources do not support.
- **Other packages (D-2).** Only 1/4 W and 1 W through-hole carbon film, one
  family. Surface-mount parts, heat sinks, airflow and board copper are prose
  pointers (05-01, 11-03).
- **Time.** The instrument shows the settled temperature. How long a part takes
  to warm up is not modelled; the prose says it takes a while and that a part
  stays hot after switch-off.
- **Working voltage.** At ≤ 24 V the power limit is always reached first (the
  CF14's maximum working voltage is 350 V, `stackpole-cf` p. 1). Prose only,
  one sentence at most.

---

## 2. Props (directive attributes)

Read each as `this.props()['key']`. Numeric props go through `parseValue`
(first argument, fallback as second, never `?? '…'`) so
`tools/widget-props.mjs` types them as numbers. Every numeric value is clamped
to its control's range after parsing, as `meter-loading` does, so a preset can
never exceed the course's 24 V ceiling.

| Prop | Kind | Default | Clamp | Meaning |
|---|---|---|---|---|
| `rating` | text | `1/4` | `1/4` or `1`; anything else → `1/4` | Which resistor the instrument starts with. The reader can switch (§3). |
| `vin` | number | `5` | 1 – 24 V | Supply across the resistor. |
| `r` | number | `100` | 10 Ω – 100 kΩ, then E24 | The resistor's value. |
| `ambient` | number | `25` | 10 – 150 °C | Air temperature around the part. |

**The two parts (constants in `power-dissipation-math.ts`, not props; D-2).**
One family, Stackpole CF carbon film, because both θ values come from the same
maker's curve, measured the same way (mid-body surface), so the comparison is
fair. The UI shows no brand; the prose names the family once as the source.

| Key | Rating at 70 °C | Surface rise at rated power (typical) | θ used (derived) | Body | Source |
|---|---|---|---|---|---|
| `1/4` (CF14) | **0.25 W** | ≈ 32 °C | **128 °C/W** (32 / 0.25) | 6.00 × 2.30 mm | `stackpole-cf` p. 1 (rating), p. 2 (body), p. 9 (rise curve, read ±2 °C) |
| `1` (CF1) | **1 W** | ≈ 85 °C | **85 °C/W** (85 / 1) | 11.00 × 4.50 mm | same |

Code comment and prose must say "typical, derived from the maker's
temperature-rise curve; surface at the middle of the body; for the maker's
mounting". The datasheet states no θ (`stackpole-cf` comment).

**Why Stackpole and not the alternatives (D-2 justification).**
- `yageo-cfr` (the CFR-25 that 00-01 cites for 1/4 W) gives ratings and the
  same derating curve, but no temperature rise or θ (BIBLIOGRAPHY §8). The
  prose still cites it: a second maker with the same 70 °C / 155 °C derating.
- `vishay-mbx-sma` corroborates the θ values from a second maker (0207 ≈
  140 K/W next to CF14's 128; 0414 ≈ 85 K/W next to CF1's 85, p. 8), but its
  parts are rated 0.4/0.6 W (0207) and 0.65/1 W (0414) depending on mode, so
  it does not give a clean 1/4 W and 1 W pair. Cite it only as "another maker's
  curve gives similar numbers".

**Derating (`stackpole-cf` p. 3; the same curve in `yageo-cfr` p. 3).** 100 %
of the rating up to 70 °C ambient, falling in a straight line to 0 % at
155 °C. 155 °C is also the top of the operating range (−55 °C to +155 °C).

| Constant | Value | Source |
|---|---|---|
| `T_KNEE` | 70 °C | `stackpole-cf` p. 3; `yageo-cfr` p. 3 |
| `T_MAX` | 155 °C | same (0 % rating; top of the operating range) |
| `T_TOUCH` | 51 °C | `cenelec-guide-29` Table A.1 p. 20: bare metal, 1 min contact (stated, not read from a curve) |
| `HEADROOM` | 0.5 (50 % of the rating) | Course convention, no source (D-9) |

Directive line for the lesson (one instance, D-16):

```markdown
::widget{type="power-dissipation" rating="1/4" vin="5" r="100" ambient="25"}
```

---

## 3. Controls

Inside `panelControls`, in this DOM (and tab) order.

| # | Control | Kind | Label EN / ES | Unit | Range | Travel | E24 |
|---|---|---|---|---|---|---|---|
| 1 | Part | `pix-segment`, two radio keys | legend **Resistor** / **Resistor**; keys `1/4 W` and `1 W` (same in both languages) | — | — | — | — |
| 2 | Supply | `app-control` | **Supply** / **Fuente** (reuse `widget.supply`) | V | 1 – 24 | linear | no |
| 3 | Resistance | `app-control` | `R` | Ω | 10 Ω – 100 kΩ | log | yes |
| 4 | Ambient | `pix-rule` above it, then `app-control` | **Ambient temperature** / **Temperatura ambiente** | °C | 10 – 150 | linear | no |

- **Why V and R (D-5).** The earlier instruments all drive a resistor from a
  supply; `P = V² / R` is 00-01's form; and a reader sets a supply voltage
  and picks a resistor at the bench, not a current. Current appears as the
  Power readout's note, so `P = V · I` (00-05) stays visible.
- **Why the ambient starts at 10 °C, not 0 (D-6).** `app-control` formats its
  value, min and max labels through `formatSI`, so a value under 1 would read
  `140 m°C`. With a 10 °C floor the control never shows a prefix. Nothing is
  lost: below 70 °C the ambient changes only the surface temperature's
  starting point. Typing `-5` clamps to 10. **Why it stops at 150 °C:** at
  155 °C the rating is 0 and "rating used" has no value; at 150 °C it is
  5.9 % (14.7 mW for the 1/4 W part), so every readout stays finite.
- **Step.** `app-control` has 1000 slider positions and no step input; exact
  values come from the text box (3 significant figures, so the ambient slider
  gives values like `25.1 °C`). Every worked example in §6 is reproduced by
  typing.
- **Keyboard.** The segment is native radios (Tab reaches the group, arrows
  move and select), radio `name` from a module counter as in `meter-loading`.
  Each `app-control` gives a text box (Enter or blur commits, clamped,
  E24-snapped for R) and a range input (arrows, Page Up/Down, Home/End).
- **State across a part switch.** `vin`, `r` and `ambient` are shared; only θ
  and the rating change. That is the point of the comparison.
- **Presets.** None beyond the props. No reset key.
- **Layout stability.** One mode, one drawing, four readouts, and every readout
  always carries a note (§4), so no state change adds or removes a line. The
  nameplate never changes, so no `headingAlt` is needed.

---

## 4. Readouts, nameplate, schematic, tones

### Nameplate (`app-panel` heading)

| Visible (VT323 + JetBrains Mono for θ) | Spoken EN (`headingLabel`, canvas `label` prefix) | Spoken ES |
|---|---|---|
| `T = Ta + P · θ` | Surface temperature = ambient temperature + power × thermal resistance | Temperatura superficial = temperatura ambiente + potencia × resistencia térmica |

Accent run (inverse video): `P · θ`, the temperature rise, which is the
headline (D-3). `Ta` is ASCII (no subscript). Alternative `ΔT = P · θ` was
considered and rejected (D-13): it hides the ambient, which D-3 wants as the
starting point, and the full form is what 05-01 writes as TJ = TA + P · θJA.

### Readouts (`panelReadouts`, 4, a 2 × 2 grid on wide panels)

| # | Label EN / ES | Value | Note | Tone |
|---|---|---|---|---|
| 1 | **Power** / **Potencia** (reuse `widget.power`) | `formatSI(P, 'W')` | **{current} through R** / **{current} en R** (`formatSI(I, 'A')`) | `plain` |
| 2 | **Temperature rise** / **Aumento de temperatura** | `{rise} °C` (temperature format below); `—` off the data | `θ = 128 °C/W` or `θ = 85 °C/W` (always) | `accent`; `danger` when off the data |
| 3 | **Surface temperature** / **Temperatura superficial** | `{Ta + rise} °C`; `—` off the data | by state, below | by `surfaceTone`, below |
| 4 | **Rating used** / **Potencia nominal usada** | `formatPercent(used, lang)` (1 decimal, the default) | **of {rating} at {ambient}** / **de {rating} a {ambient}**, with `formatSI(ratedNow, 'W')` and the ambient as the control shows it (`formatSI(Ta, '°C')`) | by `ratingTone`, below |

The derated rating (D-3) is readout 4's note: it is always visible and moves
with the ambient. Showing it as its own readout would need a fifth readout or
would drop the power.

**"Off the data" (D-7).** When `P > rated` (the part's 70 °C rating, 0.25 W or
1 W), the maker's curve says nothing, so readouts 2 and 3 show `—`, tone
`danger`, and readout 3's note is **past its rating: no maker data** /
**sobre su potencia nominal: sin datos del fabricante**. Readouts 1 and 4 keep
their numbers (D-1: overload is shown with numbers).

**Readout 3 notes and `surfaceTone`:**

| State | Tone | Note EN / ES |
|---|---|---|
| off the data (`P > rated`) | `danger` | past its rating: no maker data / sobre su potencia nominal: sin datos del fabricante |
| surface > 155 °C (only reachable with Ta > 70 °C, P ≤ rated) | `danger` | above the part's 155 °C limit / sobre el límite de 155 °C de la pieza |
| 51 °C ≤ surface ≤ 155 °C | `warn` | can burn skin / puede quemar la piel |
| surface < 51 °C | `plain` | middle of the body / centro del cuerpo |

Below 51 °C the tone is `plain`, never `signal`: the instrument does not call
any temperature "safe to touch" (43 °C burns over 8 h, `cenelec-guide-29`
Table A.1). Why 51 °C (D-10): it is the threshold the guide *states* (not read
from a curve) for the material that burns fastest (metal; a resistor's leads
are metal) at a contact time a person might really hold a part (1 min). The
1 s and 10 s figures are read from curves (±1 °C) and appear in the prose
only. A shorter contact time would give a higher threshold and a less
cautious flag.

The surface value is shown even above 155 °C when `P ≤ rated` (D-8): it is
then still the maker's curve applied as given; the danger tone and note say
the part is past its limit.

**`ratingTone` (D-9):** `used ≤ 0.5` → `signal`; `0.5 < used ≤ 1` → `warn`;
`used > 1` → `danger`. Exactly 50 % is `signal`, exactly 100 % is `warn` (at
the rating is allowed, and is what the default state shows). The 50 % line is
a course convention ("leave half the rating spare"), not a sourced figure; the
prose says so.

**Temperature format.** Temperatures are whole degrees:
`` `${formatNumber(t, lang, 0)} °C` `` (a plain space, as `formatSI` writes).
Not `formatSI`: a rise of 0.4 °C would read `400 m°C`. Whole degrees match the
±2 °C the rise was read to. θ in the note uses the same format with `°C/W`.
Keep this helper local to the widget file (or the math file). Do not change
`core/format.ts` in this change.

### Schematic (`sch-canvas w=29 h=15`, `ohm-law`'s loop)

`schSource` (4, 4) with `value` the supply; `schResistor` horizontal at (10, 4),
`name` `R`, `value` its resistance; wires `M40 40 H100` and
`M150 40 H250 V130 H40 V85`, both with `[flow]="heatFlow(current)"`.
`[highlight]` on the resistor when `used > 1` (D-1: the hot colour, thicker
stroke, value in the hot colour). One accent `schLabel` near the resistor (≈
(20, 11.2), as `ohm-law`) showing the **power** (`250 mW`), always defined,
so the drawing never shows `—`. No ground (the loop needs none; `ohm-law` has
none). The implementer may move the label by a unit at 375 px.

**No new symbol (D-15).** No thermometer, no heat glyph, no package-size
drawing: the hot colour is the "visibly heats" of ROADMAP §4, and it already
exists (`sch--hot`, `--pix-hot`). The resistor symbol does not change size
between 1/4 W and 1 W (a schematic is not a picture of the part).

**Canvas `label` (spoken):** the plate's spoken form, then a sentence from
`ui.ts`, e.g. EN "Surface temperature = ambient temperature + power × thermal
resistance. A 5 V supply drives 50 mA through R, 100 Ω, a 1/4 W resistor in
25 °C air. It turns 250 mW into heat, 100% of its rating at this temperature,
and its surface sits about 32 °C above the air, at about 57 °C." Off the data:
"… It turns 1.44 W into heat, 576% of its rating at this temperature. That is
past its rating, where the maker gives no temperature figure." `×` only in
spoken strings.

---

## 5. Formulas, edge cases, pure functions

### Formulas

- Current and power (00-01): `I = V / R`, `P = V · I = V² / R`
- Thermal resistance, derived (`ti-spra953` §1 p. 2: θ = (T1 − T2) / P, valid
  only for the stated mounting): `θ = rise at rated power / rated power`
- Temperature rise: `ΔT = P · θ`
- Surface temperature: `T = Ta + P · θ`
- Derating factor: `f(Ta) = 1` for `Ta ≤ 70`; `(155 − Ta) / 85` for
  `70 < Ta < 155`; `0` for `Ta ≥ 155`
- Rating now: `Prated(Ta) = Prated · f(Ta)`
- Rating used: `used = P / Prated(Ta)`
- In the data: `P ≤ Prated` (the 70 °C figure, not the derated one)

**Model assumptions the code comment and prose state (D-20).**
1. A straight line from 0 to the 100 % point of the maker's curve. The real
   curve may bend a little below 100 %; the prose says "about".
2. θ does not depend on the ambient: the same power gives the same rise in
   25 °C or 85 °C air.
3. The temperature is the surface at the middle of the body, as the maker
   measured it, in the maker's mounting. Lead length, the board, neighbouring
   parts and an enclosure change it (`vishay-mbx-sma` p. 2: the rise depends on
   heat flow into the board; `ti-spra953`: θ is valid only for the stated
   mounting).

### The 1 W line (what the prose may say, and how far)

For the 1 W part above 70 °C, running at its derated rating:
`T = Ta + 85 °C/W × 1 W × (155 − Ta) / 85 = 155 °C` for every Ta. So the 1 W
part's derating line is where its surface estimate reaches 155 °C. At 70 °C
ambient and 1 W: `70 + 85 = 155 °C` (worked example W-4c).

For the 1/4 W part at 70 °C, the surface reaches 155 °C only at
`(155 − 70) / 128 = 0.664 W`, 2.7 times its 0.25 W rating; at its rating in
70 °C air the surface estimate is `70 + 32 = 102 °C`.

How the prose uses it, without over-claiming:
- **May say:** "For the 1 W part the numbers line up: its rating is the power
  that brings the surface to 155 °C. The 1/4 W part's rating leaves more room
  by this estimate." And: "Follow the rating anyway: the surface is not the
  hottest point (the film inside makes the heat), and your board is not the
  maker's test mounting."
- **Must not say:** that the maker *chose* the rating this way, that the
  1/4 W part is safe up to 0.66 W, or that the surface figure is the part's
  internal temperature. The match is within the ±2 °C the curve was read to;
  say "line up", not "exactly".

### Edge cases (the function handles them; the controls cannot reach most)

| Case | Result |
|---|---|
| `vin = 0` | `I = P = 0`, `rise = 0`, `surface = Ta`, `used = 0`, in the data |
| `r = 0`, `vin > 0` | `I = P = Infinity`, `used = Infinity`, not in the data; formatters show `— A`, `— W`, `—` (never `∞`) |
| `r = 0`, `vin = 0` | everything 0 |
| `r = Infinity` | `I = P = 0` |
| `Ta ≥ 155` | `ratedNow = 0`; `used = Infinity` if `P > 0`, else 0; surface tone `danger` |
| `Ta ≤ 70` | `f = 1` |
| `P` exactly `Prated` | in the data (`≤`) |
| any NaN input | never NaN out: guard every division (`Number.isNaN` checks in the spec) |

### `src/app/widgets/power-dissipation/power-dissipation-math.ts`

```ts
export type PartRating = '1/4' | '1';

export interface Part {
  /** Rating at 70 °C ambient, W (stackpole-cf p. 1). */
  readonly rated: number;
  /** °C per W, typical, derived: surface rise at rated power / rated power
   *  (stackpole-cf p. 9 curve, read ±2 °C; mid-body surface, maker's mounting). */
  readonly theta: number;
}
export const PARTS: Readonly<Record<PartRating, Part>> = {
  '1/4': { rated: 0.25, theta: 128 },
  '1': { rated: 1, theta: 85 },
};
/** Derating: 100 % to 70 °C, 0 % at 155 °C (stackpole-cf p. 3; yageo-cfr p. 3). */
export const T_KNEE = 70;
export const T_MAX = 155;
/** Bare metal, 1 min contact (cenelec-guide-29 Table A.1 p. 20). */
export const T_TOUCH = 51;
/** Course convention: warn above half the rating. No source. */
export const HEADROOM = 0.5;

/** 1 up to T_KNEE, linear to 0 at T_MAX, 0 above. */
export function derating(ambient: number): number;

export interface DissipationInput {
  readonly vin: number;
  readonly r: number;
  readonly part: PartRating;
  readonly ambient: number;
}
export interface DissipationResult {
  readonly current: number;   // A
  readonly power: number;     // W
  readonly theta: number;     // °C/W, PARTS[part].theta
  readonly rise: number;      // °C, power · theta (always computed; the widget hides it off the data)
  readonly surface: number;   // °C, ambient + rise
  readonly ratedNow: number;  // W, PARTS[part].rated · derating(ambient)
  readonly used: number;      // fraction of ratedNow; 0 when power is 0
  readonly inData: boolean;   // power ≤ PARTS[part].rated
  readonly overRating: boolean; // used > 1 (drives the hot colour)
}
export function solveDissipation(input: DissipationInput): DissipationResult;

/** ≤ 0.5 signal, ≤ 1 warn, otherwise danger. */
export function ratingTone(used: number): 'signal' | 'warn' | 'danger';

/** Off the data or above T_MAX: danger; ≥ T_TOUCH: warn; otherwise plain. */
export function surfaceTone(result: DissipationResult): 'plain' | 'warn' | 'danger';

/** Wire speed 0..1, log over 10 µA–1 A, min 0.08 for any positive current
 *  (ohm-law's ohmFlow); 0 for zero, negative or non-finite. */
export function heatFlow(amps: number): number;

/** Normalises the `rating` prop: anything but '1' is '1/4'. */
export function parseRating(raw: string | undefined): PartRating;
```

Keep `ratingTone`, `surfaceTone` and `heatFlow` local to this file, as every
other widget keeps its own tone and flow helpers (meter-loading brief D-6).
The temperature formatter (§4) may live here too, exported for the spec.

### Spec cases (`power-dissipation-math.spec.ts`, assert through the formatters)

1. Default (1/4, 5 V, 100 Ω, 25 °C): power `250 mW`, current `50 mA`, rise
   `32 °C`, surface `57 °C`, used `100%` / ES `100 %`, ratedNow `250 mW`,
   `inData` true, `overRating` false, ratingTone `warn`, surfaceTone `warn`.
2. Same, part `1`: rise `21 °C` (21.25), surface `46 °C`, used `25%`,
   ratingTone `signal`, surfaceTone `plain`.
3. Part `1`, 10 V, 100 Ω, 25 °C: power `1 W`, rise `85 °C`, surface `110 °C`,
   used `100%`, in the data.
4. Part `1/4`, 5 V, 100 Ω, 85 °C: rise `32 °C`, surface `117 °C`, ratedNow
   `206 mW`, used `121.4%` / `121,4 %`, `overRating` true, ratingTone `danger`,
   surfaceTone `warn`.
5. Part `1`, 9 V, 100 Ω, 85 °C: power `810 mW`, rise `69 °C`, surface
   `154 °C`, ratedNow `824 mW`, used `98.4%` / `98,4 %`, ratingTone `warn`.
6. The 1 W line: part `1`, any Ta in {71, 85, 100, 120, 150}, power set to
   `ratedNow` → `surface` toBeCloseTo 155 (12 digits). Part `1`, 10 V, 100 Ω,
   70 °C: surface `155 °C`, used `100%`, surfaceTone `warn` (155 is not above
   T_MAX).
7. Part `1`, 10 V, 100 Ω, 85 °C: in the data, surface 170 → surfaceTone
   `danger`, used `121.4%`.
8. Off the data: part `1/4`, 12 V, 220 Ω, 25 °C: power `655 mW`, used
   `261.8%` / `261,8 %`, `inData` false, surfaceTone `danger`. Part `1` with
   the same: used `65.5%`, rise `56 °C`, surface `81 °C`, surfaceTone `warn`,
   ratingTone `warn`.
9. Boundary: part `1/4`, 5.01 V, 100 Ω → `inData` false, used `100.4%`,
   `overRating` true.
10. `derating`: 25 → 1, 70 → 1, 112.5 → 0.5, 155 → 0, 160 → 0.
11. Ta 150, part `1/4`: ratedNow `14.7 mW` / `14,7 mW`.
12. `ratingTone` boundaries: 0.5 signal, 0.5001 warn, 1 warn, 1.0001 danger.
13. `surfaceTone` boundaries (in the data): 50.9 plain, 51 warn, 155 warn,
    155.1 danger.
14. Guards: `vin` 0 (all zero, used 0, surface = Ta); `r` 0 (power Infinity,
    used Infinity, `inData` false, formatted `— W`); Ta 155 with power 0
    (used 0); never NaN in any field.
15. `parseRating`: `undefined`, `''`, `'0.25'`, `'1/4'` → `'1/4'`; `'1'` → `'1'`.
16. `heatFlow`: 1 A → 1; 1 mA → 0.4; 10 µA → 0.08; 0, −1, NaN → 0.
17. Temperature format: 21.25 → `21 °C`; 56.5 → `57 °C`; 0.00128 → `0 °C`
    (never `m°C`); ES 153.85 → `154 °C`.

---

## 6. Worked examples (all numbers computed with `core/format.ts`)

Computed by importing `src/app/core/format.ts` under Node 22
(`--experimental-strip-types`), so the "displays" are what the instrument shows,
EN | ES. ES percentages carry a no-break space before `%`; write it the same way
in prose. Temperatures use the §4 format.

### W-1, at its rating and too hot to touch (the start state)

1/4 W part, 5 V (USB), R = 100 Ω, 25 °C.

- `I = 5 V / 100 Ω = 50 mA`
- `P = 5 V × 50 mA = 250 mW` (or `5² / 100 = 0.25 W`): 100 % of 1/4 W
- `ΔT = 0.25 W × 128 °C/W = 32 °C`
- `T = 25 °C + 32 °C = 57 °C`

| Readout | EN | ES |
|---|---|---|
| Power | 250 mW (50 mA through R) | 250 mW (50 mA en R) |
| Temperature rise | 32 °C (θ = 128 °C/W) | 32 °C (θ = 128 °C/W) |
| Surface temperature | 57 °C, can burn skin | 57 °C, puede quemar la piel |
| Rating used | 100% of 250 mW at 25 °C | 100 % de 250 mW a 25 °C |

Prose point: inside the rating, and above the 51 °C at which bare metal burns
skin in a minute (`cenelec-guide-29` Table A.1). The 00-05 link: with the meter
you would read 5 V across R and 50 mA through it, and `P = V · I` gives the
same 250 mW.

### W-2, the bigger part at the same power

Switch to 1 W. Same 5 V, 100 Ω, 25 °C.

- `ΔT = 0.25 W × 85 °C/W = 21.25 °C`, shown `21 °C`
- `T = 25 + 21.25 = 46.25 °C`, shown `46 °C`

| Readout | EN | ES |
|---|---|---|
| Power | 250 mW (50 mA through R) | 250 mW (50 mA en R) |
| Temperature rise | 21 °C (θ = 85 °C/W) | 21 °C (θ = 85 °C/W) |
| Surface temperature | 46 °C, middle of the body | 46 °C, centro del cuerpo |
| Rating used | 25% of 1 W at 25 °C | 25 % de 1 W a 25 °C |

Prose point: a bigger body has more surface to shed heat, so fewer degrees per
watt (`kuphaldt-liec` vol. I ch. 2: the rating is roughly proportional to
size; bodies 6.00 × 2.30 mm and 11.00 × 4.50 mm, `stackpole-cf` p. 2). Do not
call 46 °C safe; say only that it is under the 1-minute figure.

**W-2b (optional, the headroom habit).** 1/4 W part at 3.5 V: `P = 3.5² / 100 =
122.5 mW`, shown `123 mW`; used `49%` (`49 %`), signal; rise `16 °C`
(15.68); surface `41 °C`.

### W-3, the bigger part at its own rating runs hotter

1 W part, 10 V, 100 Ω, 25 °C. Type `10` in Supply.

- `P = 10² / 100 = 1 W`; `I = 100 mA`
- `ΔT = 1 W × 85 °C/W = 85 °C`; `T = 25 + 85 = 110 °C`

| Readout | EN | ES |
|---|---|---|
| Power | 1 W (100 mA through R) | 1 W (100 mA en R) |
| Temperature rise | 85 °C (θ = 85 °C/W) | 85 °C (θ = 85 °C/W) |
| Surface temperature | 110 °C, can burn skin | 110 °C, puede quemar la piel |
| Rating used | 100% of 1 W at 25 °C | 100 % de 1 W a 25 °C |

Prose point: 110 °C against W-1's 57 °C. "Rated for more" does not mean "runs
cooler at its rating". Per watt it is cooler (85 vs 128 °C/W); at four times
the power it is hotter. 110 °C is far past the 1 s burn figure for metal
(about 65–70 °C, read from `cenelec-guide-29` Fig. A.2 p. 17).

### W-4, hot air shrinks the rating (D-3)

**W-4a.** Back to 1/4 W, 5 V, 100 Ω; type `85` in Ambient (a part inside a
warm, closed box: keep it generic, no product claim).

- `f = (155 − 85) / 85 = 0.8235`; `Prated = 0.25 W × 0.8235 = 205.9 mW`
- `used = 250 / 205.9 = 121.4 %`
- `ΔT = 32 °C` (unchanged); `T = 85 + 32 = 117 °C`

| Readout | EN | ES |
|---|---|---|
| Power | 250 mW (50 mA through R) | 250 mW (50 mA en R) |
| Temperature rise | 32 °C (θ = 128 °C/W) | 32 °C (θ = 128 °C/W) |
| Surface temperature | 117 °C, can burn skin | 117 °C, puede quemar la piel |
| Rating used | 121.4% of 206 mW at 85 °C | 121,4 % de 206 mW a 85 °C |

Resistor in the hot colour. Prose point: same power, same rise, but the limit
moved. The ambient moves the starting point and the rating, not the rise.

**W-4b, the 1 W part just inside its derated rating.** Part 1 W, 9 V, 100 Ω,
85 °C: `P = 81 / 100 = 810 mW`; `Prated = 1 W × 0.8235 = 823.5 mW`, shown
`824 mW`; used `98.4%` (`98,4 %`), warn; `ΔT = 0.81 × 85 = 68.85 °C`, shown
`69 °C`; `T = 85 + 68.85 = 153.85 °C`, shown `154 °C`, warn.

**W-4c, the 1 W line.** Part 1 W, 10 V, 100 Ω, ambient `70`: `1 W`, rise
`85 °C`, surface `155 °C`, used `100%` (`100 %`). Then ambient `85`: used
`121.4%`, surface `170 °C`, danger, "above the part's 155 °C limit". For the
1/4 W part at 70 °C and its rating: surface `102 °C` (70 + 32); it would take
`(155 − 70) / 128 = 664 mW` to reach 155 °C. Use with the limits in §5 ("The
1 W line").

### W-5, past the rating, and the fix

1/4 W, 12 V, 220 Ω, 25 °C (a resistor across a 12 V bench supply set to the
car's nominal voltage; do not suggest wiring into a car).

- `P = 12² / 220 = 654.5 mW`, shown `655 mW`; `I = 54.5 mA`
- `used = 0.6545 / 0.25 = 261.8 %`; past 0.25 W, so no temperature

| Readout | EN | ES |
|---|---|---|
| Power | 655 mW (54.5 mA through R) | 655 mW (54,5 mA en R) |
| Temperature rise | — | — |
| Surface temperature | —, past its rating: no maker data | —, sobre su potencia nominal: sin datos del fabricante |
| Rating used | 261.8% of 250 mW at 25 °C | 261,8 % de 250 mW a 25 °C |

Switch to 1 W: used `65.5%` (`65,5 %`), warn; rise `56 °C` (55.64); surface
`81 °C`, can burn skin. The fix works for the rating; the part still runs hot,
so mount it where nothing touches it.

**W-6, 00-01's example, revisited (prose only).** 00-01 put 22 V across a 220 Ω
1/4 W resistor: `22² / 220 = 2.2 W`. The instrument (type `22` and `220`):
`2.2 W`, used `880%` (`880 %`). Even the 1 W part is at `220%`. Neither part
here can take it; the answer is a larger resistor value, a lower voltage, or a
part rated for more (a pointer, not a figure).

---

## 7. Glyph check (every visible string)

Rule (DESIGN-PIXEL-ART §Glyph coverage, `tools/check-glyphs.mjs`): a character
passes if VT323 draws it; Greek also passes via JetBrains Mono; ∥ and arrows
via Iosevka. `×` and U+2080–209C always fail in visible text. Checked against
`tools/glyph-coverage.json` (VT323 covers U+00A0–017E, which includes `°`
U+00B0, `²` U+00B2, `·` U+00B7 and `¼` U+00BC; JetBrains Mono's Greek slice
covers `θ` U+03B8 and `Δ` U+0394).

| String(s) | Characters outside ASCII | Result |
|---|---|---|
| `T = Ta + P · θ` | `·` (VT323), `θ` (JetBrains Mono, the Greek slice every instrument page already loads for Ω) | pass |
| Resistor / Resistor; keys `1/4 W`, `1 W`; Supply / Fuente; `R`; Ambient temperature / Temperatura ambiente | none | pass |
| Power / Potencia; {current} through R / {current} en R | none | pass |
| Temperature rise / Aumento de temperatura; `θ = 128 °C/W`, `θ = 85 °C/W` | `θ` (JBM), `°` (VT323) | pass |
| Surface temperature / Temperatura superficial; can burn skin / puede quemar la piel; middle of the body / centro del cuerpo; above the part's 155 °C limit / sobre el límite de 155 °C de la pieza; past its rating: no maker data / sobre su potencia nominal: sin datos del fabricante | `í` (VT323), `°`, `’` if the EN apostrophe is typographic (U+2019, VT323) | pass |
| Rating used / Potencia nominal usada; of {rating} at {ambient} / de {rating} a {ambient} | none | pass |
| Units and formatter output: `W`, `mW`, `µW`, `A`, `mA`, `µA`, `V`, `Ω`, `kΩ`, `°C`, `°C/W`, `%`, NBSP before `%` in ES, `,` decimals, EN `,` thousands (`1,047.3%`), ES `.` thousands from 5 digits (`23.040 %`; es-ES does not group 4 digits: `1047,3 %`), `—` | `µ`, NBSP, `—`, `°` (VT323), `Ω` (JBM) | pass |
| Spoken only (`headingLabel`, canvas `label`, `ui.ts` keys ending `Spoken`) | `×` allowed | exempt |

**Decisions recorded here (D-12).**
- **`θ` is visible.** ROADMAP A8 said "00-06 avoids θ in instrument strings
  until then"; A8 is done (glyph rule enforced 2026-10-27), and θ is drawn by
  the JetBrains Mono Greek slice that Ω already loads, so it costs nothing.
  **Docs agent:** update ROADMAP A8's sentence "00-06 avoids θ in instrument
  strings until then" to say 00-06 shows θ (drawn by JetBrains Mono, per the
  A7 glyph check).
- **`1/4 W`, not `¼ W`.** `¼` is covered by VT323, but 00-01's prose, the
  `ohm-law` power note (`> 1/4 W`) and the glossary all write `1/4 W`. Keep one
  spelling.
- **`°C` and `°C/W`, not `K` and `K/W` (D-11).** `ti-spra953` writes θ in
  °C/W; the readouts are in °C; a beginner has not met the kelvin. The prose
  says once that datasheets also write K/W and that it is the same number.
- **Must not appear in visible text:** `×` (use `·`), `∞`, `≈` (U+2248, only
  Iosevka `math`: write "about"), `ΔT` is allowed but not used (the label
  says "Temperature rise"), `²` is allowed but not needed (no formula on the
  panel uses it), subscripts (`Ta`, not `Tₐ`).

New `ui.ts` keys (`UiStrings.widget`, EN and ES): `resistor`,
`ambientTemperature`, `temperatureRise`, `surfaceTemperature`, `ratingUsed`,
`ratingOf` (`of {rating} at {ambient}`), `currentThrough` (`{current} through
R`), `canBurn`, `midBody`, `aboveMax`, `noMakerData`, `heatSpoken`,
`heatCircuitSpoken`, `heatOverSpoken`. Reuse `supply`, `power`. The three
`…Spoken` keys are exempt from the glyph check by name. `aboveMax` may embed
`155 °C` as text (it is a constant), or a `{max}` placeholder.

---

## 8. Safety (ROADMAP §3.1)

**The instrument must:**
- clamp `vin` to 1–24 V and `ambient` to 10–150 °C;
- show overload with numbers, the danger tone and the hot colour only: no
  smoke, flame, glow or burnt-part animation (D-1);
- show no temperature past the rated power (D-7): no invented figure;
- never colour a surface temperature `signal` (green-ish "fine"): below 51 °C
  it is `plain`, not "safe".

**The prose must not:**
- suggest touching a resistor, powered or just switched off, to feel how warm
  it is, or using a finger as a thermometer;
- suggest overloading a part on purpose "to see what happens", or present the
  maker's short-time overload test (2.5 × rated voltage for 5 s, `yageo-cfr`
  p. 4) as permission for brief overloads (leave it out);
- give a temperature at which resistors smoke, char or catch fire, or cite ISO
  13732-1 or IEC 62368-1 by number (BIBLIOGRAPHY §8);
- call any surface temperature "safe to touch";
- use mains appliances as examples, or suggest a supply above 24 V.

**The prose must:**
- say the temperatures are typical, derived from the maker's temperature-rise
  curve, at the middle of the body, for the maker's mounting; that on a real
  board the number changes; and that the film inside is at least as hot as
  the surface;
- give the burn figures with their contact times and material
  (`cenelec-guide-29`): bare metal about 65–70 °C for 1 s and about 55–59 °C
  for 10 s (read from curves, Fig. A.2 p. 17), 51 °C for 1 min (stated, Table
  A.1 p. 20); 48 °C for 10 min and 43 °C for 8 h for any material;
- say that a part stays hot after the supply is switched off;
- follow the derated rating even where the surface estimate looks fine (§5);
- if the reader is invited to try W-1 or W-5 at the bench, say: a 1 W
  resistor for anything at or above 1/4 W, a supply of 24 V or less, the part
  standing where nothing touches it, and the supply off before you touch
  anything.

**The two required `:::safety` callouts and where they go** (each before the
step that creates the hazard; same callouts, same order, in EN and ES; D-19).
ROADMAP §3.1 lists two hazards for 00-06, so one callout each.

| # | Title (EN / ES, suggested) | Placed | Says |
|---|---|---|---|
| 1 | Resistors at their rating can burn you / Un resistor en su potencia nominal puede quemarte | In section 2, **before the widget** and before any bench step (the start state is already at the rating) | Hazard: at its rating a 1/4 W resistor reaches about 57 °C at its surface in 25 °C air, a 1 W resistor about 110 °C (`stackpole-cf`, typical). Consequence: bare metal burns skin at 51 °C in a minute and at about 65–70 °C in about a second (`cenelec-guide-29`); the leads are metal. Instead: do not touch a powered resistor or one just switched off; switch off and let it cool; mount hot parts where nothing rests against them; work the temperature out with `T = Ta + P · θ`, not by touch. |
| 2 | Smoke means stop / Si sale humo, apaga | In section 5 ("Past the rating"), **before W-5** and before the text invites the reader to drag past 100 % | Hazard: past its rating a resistor keeps heating; smoke, a burning smell or a discoloured body mean it is being damaged. No figure (no source gives one). Consequence: it can change value or open, scorch the board and burn you. Instead: switch the supply off or unplug it at once; do not touch the part; let it cool; work out the power again; use a part with a higher rating or change the circuit. Never overload a part on purpose. |

---

## 9. Lesson outline: 00-06, Power, heat and thermal resistance

- **Id:** `00-fundamentals/06-power-and-heat`. Slugs: EN `power-and-heat`, ES
  `potencia-y-calor` (suggested). Title EN "Power, Heat and Thermal
  Resistance" / ES "Potencia, calor y resistencia térmica". Summary EN
  (draft): "Work out how hot a resistor runs, why a part at its rating can
  still burn you, and why the rating shrinks in hot air."
- **Minutes:** 13.
- **Misconception corrected:** a resistor used within its power rating stays
  cool, and its rating holds in any conditions.
- **Takeaway (one sentence):** a resistor's surface sits `P · θ` above the air
  around it, so a part at its rating is hot enough to burn, and above 70 °C
  ambient its rating shrinks.
- **References (same ids EN/ES; D-18):** `stackpole-cf` (ratings, bodies,
  derating, rise curve, θ derived), `yageo-cfr` (same derating from a second
  maker; 00-01's 1/4 W part), `vishay-mbx-sma` (similar θ from another maker;
  rise depends on the board), `ti-spra953` (definition of θ; valid only for the
  stated mounting), `cenelec-guide-29` (burn thresholds), `kuphaldt-liec`
  vol. I ch. 2 (P = I²R, P = E²/R; rating roughly proportional to size),
  `horowitz-hill-2015` (general, no page), `openstax-fisica-u2-es` §9.5 and
  `hyperphysics-es` ("Potencia Eléctrica"), the Spanish-language explanations
  of `P = V · I = I² · R = V² / R`.

| # | Section (working heading) | ~min | Content | Widget / callout |
|---|---|---|---|---|
| 1 | Opening situation | 1 | You put a 100 Ω, 1/4 W resistor across a USB port's 5 V. `5² / 100 = 0.25 W`: exactly its rating (00-01's check passes). Is it fine to touch? (Answer in §2.) | — |
| 2 | Power becomes heat: `T = Ta + P · θ` | 3 | Recap `P = V · I` (00-01) and that 00-05's meter gives V and I (5 V, 50 mA). Define **ambient temperature**, **temperature rise**, **thermal resistance θ** (°C/W; datasheets also write K/W), **surface temperature** (middle of the body). Where θ comes from: the maker's rise curve, typical, for its mounting. Worked W-1 (57 °C), then W-2 (switch to 1 W: 46 °C). `:::key`: temperature rise = power × θ; the surface sits that far above the air. | **Safety 1** before the widget; then `::widget{type="power-dissipation" rating="1/4" vin="5" r="100" ambient="25"}` |
| 3 | Inside the rating, still too hot to touch | 2 | Burn thresholds with their contact times (§8). W-1 is inside its rating and above 51 °C. W-3: the 1 W part at its own rating, 110 °C. Bigger parts run cooler per watt, hotter at their rating. The headroom habit (course rule: about half the rating; W-2b) and why the Rating used readout warns above 50 %. | widget (type values) |
| 4 | Hot air shrinks the rating | 3 | Define **derating** and the derating curve (100 % to 70 °C, 0 at 155 °C; two makers agree). W-4a: same power, same rise, but 121.4 % of a 206 mW rating. W-4b/W-4c: for the 1 W part the derating line is where the surface estimate reaches 155 °C; the 1/4 W rating leaves more room. Follow the rating anyway: the film inside is hotter than the surface, and your board is not the maker's mounting (`vishay-mbx-sma`, `ti-spra953`). Real example: a part inside a closed box warms the air around itself. | widget |
| 5 | Past the rating | 2 | W-5: 12 V across 220 Ω, 261.8 %, no temperature (the maker's curve stops at the rating). Fix: the 1 W part (65.5 %, 81 °C). W-6: 00-01's 2.2 W is past both parts. 00-02's "two 1/4 W in parallel share 1/2 W" holds for the power; add that parts packed together warm each other (no figure). | **Safety 2** before W-5 |
| 6 | Where θ comes back | 1 | The same `T = Ta + P · θ` gives a regulator's or a transistor's temperature (05-01, 03-06), and copper traces heat up the same way (11-03). Next: 00-07, a battery's internal resistance and its open-circuit and loaded readings with the 00-05 meter. | `:::note` |

**Links back:** 00-01 (power, `P = V × I = I² × R = V² / R`, dissipate, power
rating, 1/4 W kit resistors, the 220 Ω / 2.2 W example), 00-02 (two parts in
parallel share the heat), 00-03 (the divider "wastes" power as heat), 00-05
(V across and I through from the meter give `P = V · I`; its closing note
promises this).

**Links ahead:** 00-07 (internal resistance turns power into heat inside the
battery), 03-02 (`led-resistor`: the LED resistor's power), 03-03 (a zener past
its rating), 03-06 (`gate-drive-loss`: switching loss → temperature with θ),
05-01 (`ldo-thermal`: junction temperature with θJA, regulator tabs that burn),
11-03 (`trace-width`: copper temperature rise).

**Glossary terms the lesson defines** (EN/ES; update the planned θ row):
ambient temperature / temperatura ambiente; temperature rise / aumento de
temperatura; thermal resistance θ / resistencia térmica θ (°C/W; "how many
degrees a part's surface rises per watt it turns into heat, for a stated
mounting"); surface temperature / temperatura superficial (if the prose uses
it as a term); derating, derating curve / reducción de la potencia nominal,
curva de reducción (say once that datasheets in English call it derating);
burn threshold / umbral de quemadura (if used as a term); headroom / margen
(if used as a term). `power rating` / `potencia nominal` is already defined in
00-01; the prose adds "at 70 °C or below".

---

## 10. Decisions (2026-10-28)

The maintainer and the coordinator settled the brief's open items. They are
binding for the 00-06 change. "Maintainer" marks a decision the maintainer
made or confirmed explicitly; "coordinator" marks one the coordinator accepted
as this brief recommended.

| # | Decision | Where it applies |
|---|---|---|
| D-1 | **Overload is shown with numbers and a danger tone, and the resistor in the hot colour. No smoke or flame animation.** "Smoke means stop" is a `:::safety` callout with no figure. (Maintainer) | §1, §4 (tones, highlight), §8 callout 2 |
| D-2 | **Two parts, 1/4 W and 1 W through-hole, one family** (a two-key segment): Stackpole CF14 and CF1, θ 128 and 85 °C/W, both read from the same curve (`stackpole-cf` p. 9). Prose: "typical, derived from the maker's temperature-rise curve". (Maintainer) | §2, §3, §5 constants |
| D-3 | **Ambient control and derated rating.** 100 % to 70 °C, linear to 0 at 155 °C. The rise `P · θ` stays the headline; the ambient moves only the limit and the starting point of the surface temperature. (Maintainer) | §2, §3, §4 (plate accent, readout 4 note), §5 |
| D-4 | **The one question:** "How hot does a resistor get, and when is that too hot?" **Misconception:** "A resistor used within its power rating stays cool, and its rating holds in any conditions." (Coordinator) | §1, §9 |
| D-5 | **Driven by supply voltage and resistance** (`P = V² / R`): V 1–24 V linear, R 10 Ω–100 kΩ log E24; the current is Power's note. Not driven by current. (Coordinator) | §2, §3 |
| D-6 | **Ambient 10–150 °C, linear, default 25 °C; `app-control` unchanged.** The 10 °C floor keeps `formatSI` from showing `m°C`; the 150 °C cap keeps the rating above 0. (Maintainer) | §2, §3 |
| D-7 | **No temperature past the rated power.** When `P > Prated` (0.25 W or 1 W, the 70 °C figure), the rise and surface readouts show `—` in the danger tone, note "past its rating: no maker data"; Power and Rating used keep their numbers. If the sources agent later shows the maker's curve extends past 100 %, the cutoff moves to its end (record it here first). (Maintainer) | §1, §4, §5, §8 |
| D-8 | **Inside the data, a surface above 155 °C is shown as a number** in the danger tone, note "above the part's 155 °C limit" (e.g. 170 °C in W-4c). Not saturated. (Coordinator) | §4, §5 |
| D-9 | **Rating used tones: ≤ 50 % signal, ≤ 100 % warn, > 100 % danger.** The 50 % line is a course convention with no source, and the prose says so. (Coordinator) | §2 (`HEADROOM`), §4, §5 |
| D-10 | **Touch flag in the instrument:** surface ≥ 51 °C → warn, note "can burn skin" (`cenelec-guide-29` Table A.1 p. 20, bare metal, 1 min, stated); below 51 °C the tone is `plain`, never `signal`. The other contact times are prose only. (Maintainer) | §2 (`T_TOUCH`), §4, §8 |
| D-11 | **Units: °C for temperatures and rises, θ in °C/W.** The prose says once that datasheets also write K/W and that it is the same number. (Coordinator) | §4, §7 |
| D-12 | **Glyphs:** θ is visible on the panel; the keys read `1/4 W`, not `¼ W`; no `×`, `≈` or subscripts in visible text. The docs agent updates ROADMAP A8's "00-06 avoids θ in instrument strings until then". (Coordinator) | §7 |
| D-13 | **Nameplate `T = Ta + P · θ`**, accent on `P · θ`. (Coordinator) | §4 |
| D-14 | **Four readouts:** Power (note: current), Temperature rise (note: θ), Surface temperature (tones by D-7, D-8, D-10), Rating used (note: the derated rating at the ambient). (Coordinator) | §4 |
| D-15 | **No new schematic symbol.** `ohm-law`'s loop; the resistor takes the hot colour only above 100 % of the rating; the accent label shows the power. Step 3 has nothing to build. (Coordinator) | §4 |
| D-16 | **One widget instance**, start state 1/4 W, 5 V, 100 Ω, 25 °C (at its rating); every worked example is typed into it. (Coordinator) | §2, §9 |
| D-17 | **Temperatures in whole degrees** with a local helper (`formatNumber(t, lang, 0)` + ` °C`), not `formatSI`. `core/format.ts` is not changed in this change; a shared temperature formatter is a later change, when 05-01 or 03-06 needs it. (Coordinator) | §4, §5 |
| D-18 | **References include the Spanish-language ids** `openstax-fisica-u2-es` and `hyperphysics-es` in both EN and ES, so both lessons cite the same ids. (Coordinator) | §9 |
| D-19 | **Two `:::safety` callouts:** "Resistors at their rating can burn you" before the widget in section 2; "Smoke means stop" before W-5 in section 5. (Coordinator) | §8, §9 |
| D-20 | **Model assumptions stated in code and prose:** a straight line through the 100 % point of the maker's curve; θ independent of the ambient; mid-body surface in the maker's mounting. (Coordinator) | §5, §8 |
| D-21 | **`docs/briefs/README.md` is unchanged:** it describes the folder and does not list briefs. (Coordinator) | — |
