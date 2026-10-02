# Roadmap: finishing every chapter

Status on 2026-10-01: module 00 has four lessons and four instruments
(`ohm-law`, `resistor-network`, `divider`, `kirchhoff`). The pixel-art skin
(A6) is built, with the REVIEW M-10 layout fix applied, and was merged in PR #1.
Modules 01–11 exist only as `_module.md` and render as "being written". This
document plans the rest: the shared infrastructure the remaining modules depend
on, the reference board for module 11, a repeatable per-chapter workflow with a
safety policy, and a lesson-by-lesson outline for every module.

Lesson ids are language-neutral and final once published (they key the language
switcher). Module folder ids (`00-fundamentals` … `11-pcb`) and the four
published lessons (`00-fundamentals/01-ohms-law`, `02-series-and-parallel`,
`03-voltage-divider`, `04-kirchhoff`) never change. Every other id below is
unpublished and may still move. Titles here are working titles; slugs are
chosen per language when the lesson is written.

---

## Changes since review

Revised against `docs/REVIEW.md` (2026-10-01). Finding ids refer to its §3
tables; "matrix" refers to its §4 readiness matrix.

| Change | Resolves |
|---|---|
| Added `00-04-kirchhoff` with a `kirchhoff` instrument. It cannot precede the divider (03 is published), so it comes straight after it and the published 02 and 03 get forward pointers (see follow-ups). Unpublished 00-04/00-05 renumbered to 00-06/00-07. | M-03; matrix 00 |
| Added `02-01-ac-signals` (sine, frequency/period, peak/RMS, phase, decibels) with `waveform-rms`. Placed at the opening of 02, not the end of 00: see the note under module 02. Complex-numbers sidebar budgeted in 02-05. | M-04; matrix 02 |
| Multimeter moved to `00-05-multimeter` (`meter-loading` replaces `burden-voltage`). Oscilloscope basics moved to `02-02-oscilloscope` (`scope-basics`), ahead of every trace-based lesson. Module 07 keeps one deeper lesson, `07-04-probing` (`scope-probe`). | M-05; matrix 00, 02, 07 |
| Dependency inversions removed: (a) 01-04 now teaches inductor derating as a static L-vs-I curve (`inductor-derating`); the time-domain saturating ramp moves to 05-02 `buck`, after V = L·di/dt (02-04). (b) 01-02 keeps ESR qualitative with a forward pointer to 02-05. (c) Thermal resistance θ is taught in 00-06, so 03-06 and 05-01 build on it. | M-06 (a), (b), (c); matrix 01, 03, 05 |
| Totals recounted from the tables: 69 lessons, 66 instruments. Every module has a count line; §5 is re-derived from them. | m-01 |
| New §3.1 safety policy: voltage and energy ceilings, experiments the course never suggests, mandatory `:::safety` callouts per lesson, review in step 8. 05-04 uses an enclosed low-voltage AC adapter; 00-05 cites measurement categories; 09-04 switches low-voltage loads only. | M-08; matrix 05, 09 |
| New Track H: the module 11 reference board in `hardware/`, with an owner, milestones H0–H5 starting with module 01, schematic freeze after 07, tested board before 11. | M-07; matrix 11 (❌) |
| A2, A3, A4 "done when" now require text equivalents; A3 has a hard level cap, a visible playing indicator and an on-screen mirror of every audible effect. | M-09; matrix 08 |
| New A8: glyph decision (τ, β, θ, →, ←, ₁, ₂, ∥, ×) before module 02. | M-11 (plan part), m-14 (plan part); matrix 02, 03, 05, 10 |
| A7 extended: axe gate on every route in four theme states, unknown widget props, glyph coverage, contrast-table script. | M-12 (plan part), m-11 (plan part), s-07 |
| A5: bibliography entries may carry an `es:` alternate edition. | s-08 |
| One-question briefs written for `zener-clamp`, `boost`, `inrush`, `electret-bias`, `relay-driver`, `ground-loop`. `cap-charge` replaced by `cap-holdup`. `stackup` cut: lessons 11-02 and 11-04 merged into `11-02-return-paths`, whose instrument gains the 2-vs-4-layer toggle. | m-02; matrix 01, 03, 05, 07, 08, 09, 11 |
| Overlaps given one home: reverse polarity in 05-05 only; bulk capacitance in 05-04, decoupling in 11-04; the inductive kick in 02-04, applied in 09-02. Flyback (09-02) now precedes the H-bridge (09-03). | m-03; matrix 05, 09 |
| Critical path: finishing 00 needs only A5, A6, A7, not all of Phase A. | m-04 |
| A1 symbol list extended, plus a symbols-by-first-use table so nothing is drawn inline. | m-05 |
| Formula sources named for `trace-width` (IPC-2152 curve fit or IPC-2221 formula) and `microstrip` (Wadell, with validity range). | m-06; matrix 11 |
| `class-d` plays the computed LC-filtered output; the carrier is shown visually at a scaled-down frequency. | m-07; matrix 08 |
| ADC source impedance picked up again in 06-06 and 10-04. | m-08 (follow-through) |
| 04-04 gets a pull-up paragraph for open-drain comparators, with a forward link to 06-02. | s-05; matrix 04 |
| Module 03 intro states that transistors are taught as switches and amplification is left to op-amps. | s-06 |
| Source gaps listed per module in §5 (08, 09, 10 have unverified notes in BIBLIOGRAPHY §8). | matrix 08, 09, 10 |

**Follow-ups outside this file** (owned by the content and design agents). All
of them are done and were merged in PR #1; REVIEW §0 has the evidence:
- Done: the `07-buses-and-instruments/_module.md` summary (EN/ES) promises
  logic analysers and probing, not a scope and multimeter course; the
  `02-time-and-frequency/_module.md` summary mentions AC signals and the scope.
- Done: published 00-02 names Kirchhoff's laws and points ahead to their own
  lesson (00-04); its meter-loading paragraph points ahead to the multimeter
  lesson (00-05).
- Done: README's example path is `02-time-and-frequency/03-rc-transient.md`.
- Done: content fixes M-01, M-02, m-08, m-09, m-10, m-11 and the M-10/M-12
  layout and prose fixes, the preconditions for "00 finish" (§5) that were not
  plan items.

---

## 1. Critical path

```
A5 refs · A6 skin · A7 gates ──► 00 finish (04–07)

A1 symbols ──► 01 ─► 02 ─► 03 ─► 04 ─► 05 ─► 06 ─► 07 ─┬─► 08 ┐
A2·A3·A8 ────────────┘                 A4 ───┘         ├─► 09 ├─► 11
                                                       └─► 10 ┘   ▲
Track H:  H0 (with 01) ─► H1 ─► H2 (freeze after 07) ─► H3 ─► H4 ─┘
```

A2 trace, A3 audio, A8 glyph decision; A4 logic analyser; Track H is the
reference board (§2).

- **00 finish runs in parallel with A1–A4.** Lessons 04–07 reuse existing
  symbols plus one meter symbol drawn in 00's step 3, and use no traces or audio.
- **Exception: 00-04 shipped before A5 and A7** at the maintainer's request
  (2026-10-02). The bridge is the interim rule in
  `.claude/skills/course-writing/SKILL.md` §4: the figures in 00-01 to 00-04
  are sourced in `docs/BIBLIOGRAPHY.md` by lesson id, and their `references:`
  are owed when A5 lands.
- **01–07 are sequential**: each module's prose leans on the vocabulary of the
  one before it (a filter needs reactance, a MOSFET switch needs Ohm's law and
  power, a bus needs logic levels and pull-ups).
- **02 is gated on A2, A3 and A8**; **06 on A4**.
- **08, 09 and 10 are independent applications** of 02–07 and can be written in
  parallel by different authors or agents. Their step 1–2 (outline and briefs)
  must be done before H2, because the board uses their parts.
- **11 comes last** and is gated on H4: it is told over one real, tested board.

## 2. Shared infrastructure

### Phase A (do once; A1–A4 and A8 before the modules that need them)

| # | Work item | Why it blocks chapters | Done when |
|---|---|---|---|
| A1 | **Schematic symbols v2** in `src/app/schematic/`, per the table below | Every module from 01 on draws parts the library lacks (today: canvas, resistor, capacitor, source, ground, terminal, junction, current arrow, wire, label) | The 01–04 rows exist before module 01. Later rows are built in step 3 of their module, from this list, never inline. Each symbol on the 10-unit grid, inherits `currentColor`, supports `highlight`/`dim`, shown on a symbol gallery route or spec |
| A2 | **`app-trace` plot primitive** in `src/app/ui/`: time-domain (scope) and frequency-domain (Bode, log axes) traces as SVG polylines, cursors, labelled axes, two channels | Modules 02, 03, 04, 05, 06, 07, 08 are mostly "watch the waveform change" | Renders 2k-point traces without jank; keyboard-movable cursor; axis text through `formatSI`; **key values (cursor time/frequency, value per channel, and the widget's headline numbers) exposed through `app-readout` or a visually hidden summary that updates on cursor move (WCAG 1.1.1)** |
| A3 | **`AudioOut` service** wrapping Web Audio: oscillator/noise source → `BiquadFilterNode` → gain, muted by default, explicit play button, ramped gain | Module 02 promises "a filter you can hear"; module 08 is about sound | Never autoplays; global mute; SSR-safe (no-op on the server); **hard output cap enforced in the service, not per widget (master gain ceiling about −12 dBFS, default lower); visible "playing" indicator while sound is on; stops on Escape and when the tab is hidden; every audible effect is also shown on screen (trace or readout)** |
| A4 | **Logic-analyser primitive** (`app-logic-trace`): stacked digital lanes, decoded byte annotations | Module 06 (debounce, PWM) and all of 07 | UART/SPI/I²C frames render from a bit array; **decoded frames also available as text (a list or table), and the lane under the cursor announced through a visually hidden summary** |
| A5 | **References in content**: a `references:` list in lesson front matter (ids into `content/bibliography.yaml`), rendered as a "Sources and further reading" block; the build fails on an unknown id | Every lesson needs citable sources; one shared bibliography avoids 69 copies of Horowitz & Hill | `pnpm content` validates ids; an entry may carry an `es:` alternate edition, rendered on ES pages (Boylestad, Floyd, Malvino, Sedra & Smith, Franco have one) |
| A6 | **Pixel-art instrument skin** (see `docs/DESIGN-PIXEL-ART.md`) applied to `Panel`, `Control`, `Readout`, the schematic canvas and the three existing widgets | Every new instrument inherits it for free if it lands before the first new widget | Both themes, WCAG AA, keyboard and reduced-motion intact, `pnpm build` passes; drawing fills at least about 70 % of its screen (REVIEW M-10) |
| A7 | **Quality gates**: `ng test` specs for `core/format.ts` and each widget's arithmetic; axe over every prerendered route in four theme states (light, system-dark, explicit dark, explicit light on a dark OS) as a **build gate**; a check in `build-content.mjs` that every `::widget` type is registered **and every prop is known to that widget**; a **glyph-coverage check** of instrument strings against the pixel font; a script that regenerates the contrast table from `_pixel.scss` | Sixty-nine lessons cannot be checked by eye | Scriptable, documented in README. The pre-existing prose failures (REVIEW M-12) are fixed, so nothing holds the axe gate back: `tools/axe-check.mjs` already covers every route in all four states and exits 1 on any violation. Still open: running it automatically on every build |
| A8 | **Glyph decision** for τ, β, θ, →, ←, ₁, ₂, ∥ and the small `×` (VT323 lacks them; IBM Plex Mono lacks τ, β, θ, Ω, ∥) | `rc-transient` (τ, module 02), `bjt-switch` (β), `ldo-thermal`/`power-dissipation` (θ), `thermistor-divider` (β) | Before module 02 starts: one option chosen (ASCII names in instruments, a pixel Greek fallback face, or SVG glyphs like the tone glyphs), recorded in DESIGN-PIXEL-ART.md §Font, and enforced by the A7 glyph check. 00-06 avoids θ in instrument strings until then. **Status (2026-10-01):** the font side is recorded in DESIGN-PIXEL-ART.md §Glyph coverage: `--pix-font` falls back to JetBrains Mono for Greek and Iosevka Charon Mono for ∥, arrows and subscripts, and visible text prefers `·` to `×` and `R1` to `R₁`. Still open: the A7 glyph check |

**Symbols by first use** (A1). Prose never draws a symbol the library lacks.

| First module | Symbols |
|---|---|
| 00 | meter (circle with V / A / Ω), drawn in 00's step 3; battery |
| 01 | inductor (air and cored), potentiometer / variable resistor |
| 02 | AC source, switch (SPST), scope probe |
| 03 | diode, Schottky, zener, TVS, LED, NPN, PNP, N-MOSFET, P-MOSFET |
| 04 | op-amp, comparator, IC box with pins |
| 05 | transformer, bridge rectifier, fuse, polyfuse (PTC) |
| 06 | logic gates (buffer, NOT, AND, OR), Schmitt mark, pushbutton |
| 07 | crystal |
| 08 | electret microphone, speaker, audio jack |
| 09 | DC motor, relay coil and contact, optocoupler, stepper |
| 10 | NTC thermistor, strain gauge |

### Track H: the reference board (parallel, from module 01)

Module 11 is told over "one real board you can download and order". Designing,
fabricating and bringing up that board takes months, so it runs as its own
track instead of being discovered when 11 starts.

- **Owner:** the course maintainer. Design work may be delegated, but the owner
  signs off every milestone.
- **Where:** `hardware/reference-board/`, a KiCad 9 project with its own
  `README.md` (status, revision, bring-up log).
- **Constraints:** within the §3.1 safety policy: USB-C 5 V or a ≤ 12 V DC wall
  adapter input, no mains, no on-board Li-ion charging, no node above 24 V.
  Built from parts the course teaches (regulators from 05, op-amp and
  comparator from 04, MOSFET switch from 03, I²C/SPI from 07, plus at least
  one block each from 08, 09 and 10). Two-layer or four-layer, decided at H1
  so module 11 can show the trade-off.

| # | Milestone | Starts | Done when |
|---|---|---|---|
| H0 | Requirements | With module 01 | One page: what the board does, which lessons it illustrates, input power, layer count candidates, budget |
| H1 | Block diagram and skeleton | During 02–04 | Block diagram and part shortlist in `hardware/`; KiCad project builds; ERC/DRC run by `kicad-cli` in a script |
| H2 | Schematic freeze | After 07 ships, and after 08–10 steps 1–2 | Schematic reviewed against the lessons it illustrates; BOM with in-stock parts; tagged `board-rev-a-schematic` |
| H3 | Layout and order | During 08–10 prose | DRC clean; Gerber, drill, BOM and CPL generated; rev A ordered |
| H4 | Bring-up | When rev A arrives | Every block tested against its lesson's numbers; bring-up log in `hardware/`; rev B only if a defect blocks a lesson |
| H5 | Release | Before 11 step 1 | Final files tagged and downloadable; module 11 outlines against this revision |

## 3. The per-chapter workflow

Run this for every module. Nothing moves to the next step until its exit check
passes.

| Step | Output | Exit check |
|---|---|---|
| 1. **Outline** | Lesson list (ids, working titles, minutes), one sentence per lesson on the misconception it corrects; the lessons that need a `:::safety` callout (§3.1) | Every lesson has a single takeaway; none over ~15 min; every lesson depends only on earlier ones (forward references are pointers, not prerequisites) |
| 2. **Instrument brief** | For each instrument: the one question it answers (ARCHITECTURE §6), props, controls, readouts, the consequence the reader sees; the formula source | If the takeaway could be a sentence, the instrument is cut |
| 3. **Symbols and primitives** | Any missing schematic symbol (from the A1 table) or `ui/` primitive | Built once and reused, never drawn inline in a widget |
| 4. **Instrument build** | Standalone component in the pixel-art skin, registered in `widget-registry.ts`, arithmetic in a pure function with a spec | Keyboard-only operation, 375 px layout, both themes, axe clean, text equivalent for any trace or audio, A7 glyph check passes, prose worked example reproducible by typing values |
| 5. **EN prose** | `content/en/<module>/<nn-id>.md` with worked example and callouts | Numbers in prose match the instrument to the displayed precision; required `:::safety` callouts present |
| 6. **ES prose** | `content/es/...`, same ids, translated slug | `pnpm content` cross-check passes; locale decimals (`4,5 V`); same callouts as EN |
| 7. **References** | `references:` ids per lesson; new entries in `bibliography.yaml` | Every quantitative claim (rule of thumb, standard, datasheet figure) traceable to a source |
| 8. **Review** | Technical (maths, §3.1 safety), pedagogical, and accessibility review | Module checklist (REVIEW §6 template) ticked in `docs/REVIEW.md` §7 |
| 9. **Ship** | `pnpm build`, compose deploy, sitemap and hreflang verified | Lesson reachable in both languages; prev/next chain intact |

### 3.1 Safety policy

Readers will build what the course shows. The course therefore stays inside
low-voltage, low-energy electronics, and says so where a reader might be
tempted to go further.

**Ceilings for anything the course suggests building or measuring**

| Quantity | Limit |
|---|---|
| DC supply | ≤ 24 V, from a bench supply, USB, alkaline cells or a wall adapter |
| AC | Only the secondary of an enclosed plug-in AC adapter, ≤ 12 V AC. Never a bare transformer wired to mains by the reader |
| Any node, including deliberate transients | ≤ 50 V, except the inductive kick (02-04, 09-02), which is shown and then clamped |
| Batteries | Alkaline or NiMH cells, 9 V batteries, or a USB power bank |

**Never suggested**, in prose, exercises or instrument presets:
- Anything connected to mains: building or opening mains-powered devices,
  mains transformers, dimmers, mains relay loads, measuring mains with a meter.
- Stored energy above 50 V: camera-flash, microwave or CRT capacitors, boost or
  flyback converters that generate high voltage (Nixie supplies, ignition
  coils).
- Li-ion and LiPo cells handled bare: charging or discharging circuits built by
  the reader, shorting, puncturing, or building packs. If a lesson mentions
  Li-ion, it says to use a protected cell with a ready-made charger module.
- Measuring short-circuit current by shorting a source. 00-07 computes it from
  the internal resistance instead.

Instruments may *simulate* mains or high voltages (for example a CAT rating
explanation in 00-05) when the prose makes clear it is a simulation.

**`:::safety` callout usage**
- Mandatory in any lesson that touches mains (even to explain why not), more
  than 50 V, stored energy, batteries, meter use, or parts hot enough to burn.
- Syntax `:::safety <short title>` … `:::`. One callout per hazard, placed
  before the step that creates it. It names the hazard, the consequence and
  what to do instead. Use `:::warning` for non-safety pitfalls.
- Same callouts in EN and ES. The step 8 reviewer ticks the REVIEW §6
  "Safety callout present" box against the table below.

| Lesson | Required `:::safety` content |
|---|---|
| 00-05 multimeter | IEC 61010 measurement categories (via `fluke-abc-safety`); never put the meter in current mode across a source; fused current jack |
| 00-06 power-and-heat | A resistor at its rating can burn skin; smoke means stop |
| 00-07 real-sources | Never short a battery to measure its short-circuit current; Li-ion shorts start fires |
| 02-04 rl-transient | The inductive kick reaches tens to hundreds of volts; low energy, but it destroys transistors and can shock |
| 05-01 linear-regulators | Regulator tabs run hot enough to burn |
| 05-04 ripple-and-bulk | Enclosed AC adapter only; electrolytic polarity, venting |
| 05-05 protection | Reversed electrolytics; fuses are not to be bypassed |
| 08-04 headphone-driver | Hearing: start at low volume; A3 cap explained |
| 09-01 dc-motor | Stall current heats wiring and drivers |
| 09-02 flyback | As 02-04, applied to relay and motor coils |
| 09-04 relays | A contact rated 250 V AC does not make a mains build safe; the course switches low-voltage loads only |

## 4. Module outlines

Instrument names are proposed `::widget` types. ★ marks the module's signature
instrument, the one worth over-investing in. Each instrument's consequence (the
answer to its one question) is given after the colon.

### 00: Fundamentals (4 of 7 done)

| Id | Lesson | Instrument |
|---|---|---|
| 01-ohms-law | Ohm's law ✅ | `ohm-law` ✅ |
| 02-series-and-parallel | Series and parallel ✅ | `resistor-network` ✅ |
| 03-voltage-divider | The voltage divider and loading ✅ | `divider` ✅ |
| 04-kirchhoff | Kirchhoff's laws ✅ | `kirchhoff` ✅ |
| 05-multimeter | Using a multimeter: volts, amps, ohms, and what the meter does to the circuit | `meter-loading`: the voltmeter's 10 MΩ across a divider and the ammeter's shunt (burden voltage) in series with a load; reading vs true value |
| 06-power-and-heat | Power, heat and thermal resistance | ★ `power-dissipation`: resistor that visibly heats past its rating; ¼ W vs 1 W package; temperature rise = P × θ, the model 03-06 and 05-01 reuse |
| 07-real-sources | Real sources: internal resistance and Thévenin | `thevenin`: battery with internal R, load sweep, maximum-power point; open-circuit and loaded readings as you would take them with the 00-05 meter |

Kirchhoff comes after the published divider rather than before it; the divider
lesson only needs the series rule, and 04 names what 02 and 03 used implicitly.
The multimeter follows Kirchhoff because voltage is measured across (KVL) and
current in series (KCL), and meter loading is the divider's loading again.

**Count:** 7 lessons (4 done, 3 to write) · 7 instruments (4 built, 3 new) · 0 without instrument.

### 01: Passive Components

| Id | Lesson | Instrument |
|---|---|---|
| 01-real-resistors | Tolerance, E-series and tempco | ★ `tolerance-spread`: Monte-Carlo histogram of a divider built from 5 % vs 1 % parts |
| 02-capacitors | Capacitors: dielectrics, what C means, and ESR (qualitative; quantified in 02-05) | `cap-holdup`: how long a capacitor keeps a load alive after the supply drops (I = C·dV/dt), against a brown-out threshold |
| 03-mlcc-dc-bias | The ceramic capacitor that loses most of its value | `mlcc-derating`: capacitance vs DC bias by package and dielectric |
| 04-inductors | Inductors: DCR and saturation current | `inductor-derating`: inductance vs DC current past Isat, and I²·DCR heat; shares the curve plot with `mlcc-derating` |
| 05-reading-datasheets | Reading a passive's datasheet | none (annotated datasheet figure) |

**Count:** 5 lessons · 4 instruments (4 new) · 1 without instrument (05).

### 02: Time and Frequency

| Id | Lesson | Instrument |
|---|---|---|
| 01-ac-signals | Sine waves: frequency, period, peak, RMS, phase and the decibel | `waveform-rms`: shape and amplitude → peak, peak-to-peak, RMS, average and dB; a true-RMS vs average-responding meter disagreeing on a square wave |
| 02-oscilloscope | Using an oscilloscope: volts/div, time/div, trigger, coupling | `scope-basics`: an untriggered trace that rolls until the trigger level is inside the signal; wrong timebase hides the waveform |
| 03-rc-transient | The RC transient | `rc-transient`: scope trace, τ marker, step input |
| 04-rl-transient | RL transients and the inductive kick | `rl-transient`: current ramp (V = L·di/dt), voltage spike on switch-open, clamped by a diode |
| 05-reactance | Reactance and impedance (with a short complex-numbers sidebar for phasors) | `reactance`: X_C and X_L vs frequency, phasor; ESR from 01-02 as the real part |
| 06-filters-and-bode | Filters and the Bode plot | ★ `bode-filter`: RC low/high-pass with live audio through the filter (A2 + A3) |
| 07-resonance | Resonance and Q | `rlc-resonance`: peak sharpening with Q, ringing in time domain |

AC basics open 02 rather than closing 00: module 01 needs no sinusoids (ESR
stays qualitative), the lesson needs `app-trace` (A2), which would block 00 on
Phase A (REVIEW m-04), and it lands just before reactance and the Bode plot,
where RMS, phase and dB are used. The scope lesson follows it because the
scope's controls are described in the vocabulary it introduces.

**Count:** 7 lessons · 7 instruments (7 new) · 0 without instrument.

### 03: Semiconductors

The module intro says so up front: transistors are taught as switches here;
small-signal amplification is done with op-amps in 04 (REVIEW s-06).

| Id | Lesson | Instrument |
|---|---|---|
| 01-diodes | The diode and its forward drop | `diode-iv`: I–V curve with operating point on a load line |
| 02-leds | LEDs and the current-limiting resistor | `led-resistor`: colour → Vf, brightness and resistor power |
| 03-zeners-and-tvs | Zeners and TVS clamps | `zener-clamp`: surge current → clamp voltage rises above the nominal, and the zener's dissipation passes its rating |
| 04-bjt-switch | The BJT as a switch | `bjt-switch`: base resistor, β, saturation vs linear region |
| 05-mosfet-switch | The MOSFET as a switch | `mosfet-switch`: Vgs vs Rds(on), "logic-level" explained |
| 06-switching-losses | Why a slow gate gets hot | ★ `gate-drive-loss`: gate resistor → edge time → switching loss → temperature (θ from 00-06) |

Reverse-polarity protection moved to 05-05 (its only home).

**Count:** 6 lessons · 6 instruments (6 new) · 0 without instrument.

### 04: Analog ICs

| Id | Lesson | Instrument |
|---|---|---|
| 01-golden-rules | Op-amps and the two golden rules | ★ `opamp-config`: inverting / non-inverting / follower, gain, clipping at the rails |
| 02-feedback-and-bandwidth | Feedback, gain-bandwidth and stability | `gbw`: closed-loop gain vs bandwidth on a Bode plot |
| 03-real-op-amps | Offset, rail-to-rail, slew rate | `slew-rate`: sine distorting into triangle |
| 04-comparators | Comparators and hysteresis (with a paragraph on open-drain outputs and their pull-up; forward link to 06-02) | `schmitt`: noisy input, chatter without hysteresis |
| 05-the-555 | The 555 timer | `timer-555`: astable R/C → frequency and duty |

**Count:** 5 lessons · 5 instruments (5 new) · 0 without instrument.

### 05: Power Supplies

| Id | Lesson | Instrument |
|---|---|---|
| 01-linear-regulators | Linear regulators, dropout and heat | ★ `ldo-thermal`: Vin/Iload → dissipation → junction temperature vs θJA (builds on 00-06) |
| 02-buck | The buck converter | `buck`: duty cycle, inductor ripple current, efficiency; peak current past Isat makes the ramp bend upward (the saturation moved from 01-04) |
| 03-boost | The boost converter | `boost`: input current = Iout/(1 − D), so input current and losses climb steeply as the duty cycle rises |
| 04-ripple-and-bulk | Rectifiers, ripple and bulk capacitance | `ripple`: low-voltage AC adapter → bridge rectifier → capacitor; ripple vs C and load |
| 05-protection | Fuses, polyfuses, reverse polarity and inrush | `inrush`: plugging into a bulk capacitor draws a current spike set by ESR and wiring resistance; compare its I²t with the fuse's |

Decoupling lives in 11-04; this module covers bulk capacitance only.

**Count:** 5 lessons · 5 instruments (5 new) · 0 without instrument.

### 06: Digital and the Analog Boundary

| Id | Lesson | Instrument |
|---|---|---|
| 01-logic-levels | Logic levels and noise margins | `logic-thresholds`: VIL/VIH/VOL/VOH bands, 3.3 V ↔ 5 V compatibility |
| 02-pull-ups | Pull-ups, pull-downs and rise time | `pullup-rc`: R × bus capacitance → edge |
| 03-level-shifting | Level shifting | `level-shifter`: BSS138 bidirectional shifter |
| 04-debouncing | Contact bounce and debouncing | `bounce`: raw vs RC vs software-debounced lanes (A4) |
| 05-pwm | PWM and averaging | `pwm`: duty → average, RC-filtered output, LED brightness |
| 06-adc-and-aliasing | ADCs, resolution, source impedance and aliasing | ★ `aliasing`: sample rate vs signal frequency, the wagon-wheel effect; the sampling capacitor's need for a source below about 10 kΩ (REVIEW m-08) |

**Count:** 6 lessons · 6 instruments (6 new) · 0 without instrument.

### 07: Buses and Instruments

| Id | Lesson | Instrument |
|---|---|---|
| 01-uart | UART on the wire | `uart-frame`: type a character, see start/data/stop bits, baud mismatch |
| 02-spi | SPI | `spi-timing`: CPOL/CPHA modes |
| 03-i2c | I²C, addressing and ACKs | ★ `i2c-trace`: decoded transaction, pull-up value vs edge (reuses `pullup-rc`) |
| 04-probing | Probing real signals: 10× probes, ground leads, protocol triggers | `scope-probe`: a clean edge rings once a long ground lead is added; 1× vs 10× loading; probe compensation; single-shot trigger on a bus frame |

The multimeter (00-05) and scope basics (02-02) moved earlier. This lesson
stays because fast bus edges are where probe technique first matters.

**Count:** 4 lessons · 4 instruments (4 new) · 0 without instrument.

### 08: Application, Sound (parallel track)

| Id | Lesson | Instrument |
|---|---|---|
| 01-microphones | Electret microphone bias | `electret-bias`: bias resistor and supply set the capsule's operating point; the wrong value clips loud sounds or loses level |
| 02-preamp | A microphone preamp | `preamp-gain` (reuses `opamp-config` maths) |
| 03-active-filters | Active filters (Sallen-Key) | `sallen-key` with audio |
| 04-headphone-driver | Driving headphones | `headphone-driver`: output impedance vs a 32 Ω load |
| 05-class-d | Class D amplification | ★ `class-d`: PWM + LC filter; the audio is the computed LC-filtered output, and the carrier is drawn at a scaled-down frequency (a real carrier would alias, see 06-06) |
| 06-hum | Where the hum comes from: ground loops | `ground-loop`: shield resistance and loop current → 50/60 Hz hum level; break the loop and it disappears (audible, level-capped) |

**Count:** 6 lessons · 6 instruments (6 new) · 0 without instrument.

### 09: Application, Motors (parallel track)

| Id | Lesson | Instrument |
|---|---|---|
| 01-dc-motor | The DC motor: back-EMF and stall current | `dc-motor`: load torque → speed and current |
| 02-flyback | Flyback diodes and snubbers (applies the 02-04 inductive kick) | `flyback`: spike with and without the diode |
| 03-h-bridge | The H-bridge and shoot-through (freewheeling diodes from 02) | ★ `h-bridge`: four switches, forbidden states flash |
| 04-relays | Relays and their drivers (low-voltage loads only) | `relay-driver`: coil current vs the GPIO's limit; transistor and base resistor; spike without the diode — "will this pin drive this relay?" |
| 05-steppers | Stepper motors | `stepper`: full/half/micro-step sequences |
| 06-servos | Hobby servos | `servo-pwm`: pulse width → angle |
| 07-isolation | Optocouplers and isolation | `optocoupler`: CTR and output swing |

**Count:** 7 lessons · 7 instruments (7 new) · 0 without instrument.

### 10: Application, Sensors (parallel track)

| Id | Lesson | Instrument |
|---|---|---|
| 01-thermistors | Thermistors (NTC) | `thermistor-divider`: β equation, linearisation resistor |
| 02-wheatstone | The Wheatstone bridge | ★ `bridge`: microvolt imbalance from a strain gauge |
| 03-instrumentation-amps | Instrumentation amplifiers | `in-amp`: CMRR made visible |
| 04-signal-conditioning | Signal conditioning for an ADC | `adc-scaling` (reuses `divider`, `opamp-config`): range, offset, and source impedance into the ADC |
| 05-noise | Noise, averaging and shielding | `noise-averaging`: √N improvement |

**Count:** 5 lessons · 5 instruments (5 new) · 0 without instrument.

### 11: From Schematic to PCB (last; gated on Track H)

| Id | Lesson | Instrument |
|---|---|---|
| 01-schematic-to-footprint | Symbols, footprints and the netlist | none (annotated KiCad figures from the reference board) |
| 02-return-paths | Return paths and layer stackups | ★ `return-path`: current hugging the trace above a plane; a slot in the plane; 2-layer vs 4-layer toggle (replaces `stackup`) |
| 03-trace-width | Trace width and current | `trace-width`: temperature rise vs width and copper weight, from a published IPC-2152 curve fit with attribution, or the IPC-2221 formula flagged as conservative |
| 04-decoupling | Decoupling and power integrity | `decoupling-impedance`: impedance vs frequency of parallel caps |
| 05-controlled-impedance | Controlled impedance | `microstrip`: width/height/εr → Z₀, Wadell's equations with their validity range shown |
| 06-fab-files | The files a fab actually needs | none: Gerber/drill/BOM/CPL checklist; the downloadable board lives in `hardware/reference-board/` |

**Count:** 6 lessons · 4 instruments (4 new) · 2 without instrument (01, 06).

**Total: 69 lessons (4 done, 65 to write) · 66 instruments (4 built, 62 new) ·
3 lessons without an instrument (01-05, 11-01, 11-06).**
Lessons: 7 + 5 + 7 + 6 + 5 + 5 + 6 + 4 + 6 + 7 + 5 + 6 = 69.
Instruments: 7 + 4 + 7 + 6 + 5 + 5 + 6 + 4 + 6 + 7 + 5 + 4 = 66.
Against the pre-review figures (62 lessons, about 55 instruments): +11 % and
+20 %.

## 5. Sizing and order of attack

| Block | Lessons to write | New instruments | Needs | Notes |
|---|---|---|---|---|
| Phase A | 0 | 4 primitives (A2–A4, symbols A1) + skin, refs, gates, glyphs | — | Unblocks everything; A1–A4 and A8 only before their first user |
| Track H | 0 | 0 | — | Reference board, parallel from module 01 |
| 00 finish | 3 | 3 | A5, A6, A7; meter symbol | Reuses existing symbols; the content fixes from REVIEW have landed (PR #1) |
| 01 | 5 | 4 | A1 (inductor, potentiometer) | |
| 02 | 7 | 7 | A2, A3, A8 | First user of `app-trace` and audio |
| 03 | 6 | 6 | A1 semiconductors | Biggest symbol demand |
| 04 | 5 | 5 | Op-amp symbol, A2 Bode | |
| 05 | 5 | 5 | Transformer, bridge, fuse | Thermal model from 00-06, shared with 03-06 |
| 06 | 6 | 6 | A4 | First user of `app-logic-trace` |
| 07 | 4 | 4 | A4 | |
| 08 / 09 / 10 | 6 / 7 / 5 | 6 / 7 / 5 | A3 (08) | Run in parallel. Close source gaps (BIBLIOGRAPHY §8) in step 7: electret note (08-01), optocoupler and stepper/servo notes (09), strain-gauge note (10-02) |
| 11 | 6 | 4 | H4 | Told over the tested reference board |
| **Total** | **65** | **62** | | Plus 4 lessons and 4 instruments already done: 69 and 66 |

## 6. Definition of done for the course

- Every module page lists only published lessons; no "being written" remains.
- Every lesson: both languages, at least one instrument (except the three marked
  none), at least two references, worked example reproducible in the instrument,
  and every `:::safety` callout §3.1 requires.
- Axe gate passes on every prerendered route in all four theme states (light,
  system-dark, explicit dark, explicit light on a dark OS); keyboard-only
  walkthrough of every instrument; 375 px layout checked; every trace and audio
  instrument has a text equivalent; the A7 glyph check passes.
- The reference board is downloadable from `hardware/reference-board/` and
  matches module 11.
- `docs/BIBLIOGRAPHY.md` generated from `content/bibliography.yaml`.
