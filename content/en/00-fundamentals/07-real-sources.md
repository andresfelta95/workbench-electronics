---
slug: real-sources
title: "Real Sources: Internal Resistance and Thévenin"
summary: Why a battery's voltage drops under load, how to measure the resistance inside it with your meter, how much power it can give, and why a voltage divider behaves the same way.
minutes: 17
references:
  - id: energizer-ir-bulletin
    note: "Internal resistance and how makers measure it. Fresh alkaline cells about 150 to 300 mΩ, measured with a 5 mA drain and a 505 mA pulse of 100 ms (p. 1). A quick 1000 Hz impedance test typically reads lower than this DC method (p. 1). Loaded voltage = open-circuit voltage − total effective resistance · current, with the example 1.6 V − 1.0 A · 0.1 Ω = 1.5 V, to be taken as a general guideline (p. 2). Fresh AA about 0.13 Ω at 20 °C and about 0.4 Ω at −20 °C, read from the curve in fig. 2 (p. 2), typical."
  - id: energizer-lithium-coin-manual
    note: "\"The starting IR of AA alkaline batteries is near 0.25 ohms\" and \"the starting IR of a 2032 battery is near 10 ohms\". Dual-pulse example on a fresh 2032: 3.279 V on a 1 MΩ drain, 2.429 V during a 50 ms pulse on 25 Ω, (3.279 V − 2.429 V) / (0.097 A − 0.000003 A) = 9 Ω. Internal resistance over life, about 10 Ω fresh to about 65 Ω at the end, read from the curve, typical (all p. 4). Nominal 3 V (p. 1)."
  - id: energizer-coin-ais
    note: "Coin cells: \"KEEP OUT OF REACH OF CHILDREN. Swallowing may lead to serious injury or death in as little as 2 hours due to chemical burns and potential perforation of the esophagus.\" See a doctor at once, keep cells in the original package until use, dispose of used cells at once (Section 7, p. 3). After swallowing: do not induce vomiting or give food or drink, and seek medical attention immediately (Section 4). Dispose of under local regulations (Sections 12 and 13)."
  - id: energizer-alkaline-handbook
    note: "Devices are designed for 1.6 V to 0.9 V per cell (p. 3). AA internal resistance about 0.13 Ω fresh, about 0.2 Ω at mid-life and about 0.65 Ω at the end, read from fig. 10 (p. 9), typical. A fresh cell tests at about 1.5 V on about 10 Ω for 1 to 2 s (p. 13). Keep loose cells away from coins and keys; a short can make a cell leak and cause injury (p. 14)."
  - id: duracell-mn1500
    note: "AA: impedance 120 mΩ at 1 kHz (p. 1). DC resistance about 0.09 Ω near the start, rising to about 0.30 Ω at the end, read from the curve (p. 2), typical."
  - id: duracell-mn1604
    note: "9 V: about 9.5 to 9.7 V fresh under light loads (pp. 1–2); 9.6 V is the middle. Impedance 1,700 mΩ at 1 kHz (p. 1). DC resistance about 2.3 Ω near the start, about 3.1 Ω at half and about 4.1 Ω at the end, read from the curve (p. 2), typical."
  - id: energizer-nh15-2500
    note: "AA NiMH: nominal 1.2 V; internal resistance 30 mΩ charged and 40 mΩ half discharged, ±20 %; AC impedance 12 mΩ at 1000 Hz (p. 1)."
  - id: energizer-nimh-handbook
    note: "A fresh, fully charged NiMH cell is typically under 50 mΩ, and its voltage falls quickly from about 1.4 V to its 1.2 V plateau (p. 6). Shorted NiMH cells \"can generate high currents … sufficient to cause burns or ignition of flammable materials\" (p. 14)."
  - id: energizer-alkaline-ais-2025
    note: "Alkaline: a prolonged short circuit heats the cell and can open its safety vent (Section 7, p. 3)."
  - id: energizer-nimh-ais
    note: "NiMH: a prolonged short circuit heats the cell and can open its safety vent (Section 7, p. 3)."
  - id: wa-battery-burn-2021
    note: "Loose lithium-ion cells can ignite if coins or keys touch their terminals; a vape cell shorted by coins in a pocket caught fire and caused burns that needed skin grafts (media release, 23 June 2021)."
  - id: fluke-80v-manual
    note: "Fluke 87V, lesson 05's meter: 10 MΩ input resistance on volts (Table 18). Typical burden voltage 1.8 mV/mA on the mA jack and 0.03 V/A on the A jack, about 1.8 Ω and 0.03 Ω (Table 14, p. 48). 440 mA fuse on the mA jack (p. 43)."
  - id: kuphaldt-liec
    note: "Volume I, chapter 10: Thevenin's theorem, and the maximum power transfer theorem (the load takes the most power when it equals the Thevenin resistance, and maximum power transfer is not maximum efficiency). Free online."
  - id: mit-6002-2007
    note: "Lecture 3, \"Superposition, Thévenin and Norton\": further reading."
  - id: horowitz-hill-2015
    note: "General reference; no page cited."
  - id: openstax-fisica-u2-es
    note: "In Spanish. Section 10.1, \"Resistencia interna y voltaje de los terminales\": the terminal voltage is the open-circuit voltage minus I · r and falls as the current rises."
  - id: hyperphysics-es
    note: "In Spanish. Page \"Teorema de Thevenin\": any two-terminal network of batteries and resistors acts like one source and one series resistor; the voltage is the open-circuit voltage and the resistance is that voltage divided by the short-circuit current. Page \"Fuentes de Voltaje y de Corriente\": a real source is an ideal source with a series resistance."
---

Suppose your meter reads 1.6 V across a fresh AA cell. You clip a 10 Ω
resistor across it, and the reading falls to 1.561 V. Where did the other
39 mV go?

Lesson 04's ideal sources held their voltage whatever current flowed, and it
said a real battery sags a little. This lesson shows how much, and why.

## A resistance inside the battery

Three names describe a real battery:

- The **open-circuit voltage** (Voc) is the voltage across its terminals with
  nothing connected to them.
- The **terminal voltage** is the voltage across its terminals while it drives
  a load.
- The **internal resistance** (Rint) is the resistance inside the battery that
  makes its terminal voltage drop under load.

A real battery behaves like an ideal source in series with a small resistor,
both hidden inside the case. The load's current also flows through Rint, so by
Ohm's law Rint takes `I · Rint`. The terminals get what is left:

`V = Voc − I · Rint`

Energizer's bulletin on internal resistance gives an example: 1.6 V open
circuit, 0.1 Ω inside and 1.0 A. The drop is `1.0 A · 0.1 Ω = 0.1 V`, so the
terminals give `1.6 V − 0.1 V = 1.5 V`.

The instrument writes the formula at the top, with `I · Rint` highlighted. The
dashed box in the drawing is the battery; what is inside it is the model. The ideal source has the battery symbol: a long thin
plate and a short thick plate. The long plate is +. Which end is + and which
is − is the battery's **polarity**: the + end is at the higher voltage.

::widget{type="thevenin" source="aa" rload="10"}

The Source keys pick the battery: AA is an alkaline AA cell, 9 V the alkaline
9 V battery and NiMH a rechargeable NiMH AA cell. The instrument starts on the
AA, with 1.6 V and 0.25 Ω (Energizer puts a fresh AA near 0.25 ohms) and a
10 Ω load:

- `0.25 Ω + 10 Ω = 10.25 Ω`, so `I = 1.6 V / 10.25 Ω = 156 mA`
- `156 mA · 0.25 Ω = 39 mV` is lost inside, so
  `V = 1.6 V − 39 mV = 1.561 V`
- `P = I² · R` (lesson 01), with the unrounded current: 244 mW in the load and
  6.09 mW in Rint

Terminal voltage reads 1.561 V, "39 mV lost inside"; Load current 156 mA;
Load power 244 mW. Heat inside reads 6.09 mW: the heat inside the battery
itself that lesson 06 promised.

Now switch Load off. No current flows, so nothing is lost inside, and Terminal
voltage reads 1.6 V, "open circuit".

That is lesson 04's sag: 39 mV on 10 Ω. Switch Load back on and type `100` in
Load: the cell loses 3.99 mV and reads 1.596 V. With `1k` it loses 400 µV, and
four digits show 1.6 V again.

Energizer's alkaline handbook tests a fresh cell on about 10 Ω for 1 to
2 seconds and expects about 1.5 V. The model gives 1.561 V; real cells differ a
little. A 9 V battery sags the same way: press 9 V with the load at 10 Ω, and
it reads 7.805 V instead of 9.6 V.

:::key
Under load, a battery's terminal voltage drops by `I · Rint`, and `I² · Rint`
turns into heat inside the battery.
:::

## Measuring it with your meter

You can find Rint with lesson 05's meter and one resistor.

:::safety Never short a battery
A wire, a coin, keys or a meter on its current jack across a battery's
terminals is a short circuit (lesson 05). Then only the internal resistance
limits the current: about 6 A for a fresh AA by the model, more for a fresher
one (12 A with 0.13 Ω), and about 40 A for a NiMH AA. These are computed, not
measured. The cell and the wire heat up. A prolonged short can open the
cell's safety vent, a small valve that lets gas out, and a short can make a
cell leak, which can injure you. Energizer warns that shorted NiMH cells give
currents "sufficient to cause burns or ignition of flammable materials". Never
connect anything straight across a battery to see what it gives: work the
current out as `Voc / Rint`, and use the load resistors below. Keep loose
cells away from coins and keys. A 9 V battery's terminals sit side by side, so
one coin can join them.
:::

You take two voltage readings, with the meter on DC volts and the probes on
the battery's own terminals:

1. With nothing connected, read the open-circuit voltage: 1.6 V.
2. Connect a 10 Ω, 1 W resistor across the cell and read again within a few
   seconds: 1.561 V. Then disconnect it.

Energizer's own test holds its load for only 1 to 2 seconds. Keep the resistor
where nothing touches it (lesson 06), and disconnect it before you read the
open-circuit voltage again. It takes 244 mW, a quarter of its rating, which
leaves lesson 06's headroom. In the instrument, Load off is reading 1 and Load
on is reading 2.

Ohm's law on the known resistor gives the current, so you need no ammeter:

- `I = 1.561 V / 10 Ω = 156 mA`
- `Rint = (Voc − V) / I`
- `1.6 V − 1.561 V = 0.039 V`, and `0.039 V / 0.156 A = 0.25 Ω`

You need a meter that shows four digits. With three, the loaded reading is
1.56 V and the result is `0.04 V / 0.156 A`, or 0.256 Ω.

The meter's 10 MΩ changes nothing here. By lesson 05's rule, it is forty
million times the cell's 0.25 Ω, so the reading is 0.0000025 % low.

**A 9 V battery** takes a 220 Ω, 1 W resistor. The instrument's 9 V uses
9.6 V, the middle of the 9.5 to 9.7 V Duracell gives for a fresh one, and
2.3 Ω. Press 9 V and type `220` in Load:

- `V = 9.6 V · 220 / 222.3`, which is 9.501 V
- `I = 9.501 V / 220 Ω`, which is 43.2 mA; the resistor takes 410 mW
- `9.6 V − 9.501 V = 0.099 V`, and `0.099 V / 0.0432 A = 2.29 Ω`

That is about the preset's 2.3 Ω; the reading's last digit limits it. A NiMH
AA on 10 Ω puts 143 mW into its resistor. The resistor's own error counts too:
its real value can be off by its tolerance, such as 5 % (module 01), and that
gives up to 5 % error in Rint.

The **short-circuit current** (Isc) is the current a source would push through
a plain wire across its terminals. You compute it and never measure it:
`Isc = Voc / Rint`, `1.6 V / 0.25 Ω = 6.4 A` for the AA and
`9.6 V / 2.3 Ω = 4.17 A` for the 9 V. The instrument shows it under Load
current: "short circuit: 6.4 A (computed)".

The presets are one typical fresh cell at room temperature, measured with a DC
step, a load switched on for a moment as in your readings. Real values move
with:

- **The method.** Makers' quick test uses alternating current, which reverses
  direction many times a second (module 02), and reads lower: 120 mΩ for
  Duracell's AA, 1.7 Ω for its 9 V, and 12 mΩ against 30 mΩ for Energizer's
  NiMH AA.
- **The charge left.** An AA goes from about 0.13 Ω fresh to about 0.2 Ω at
  mid-life and about 0.65 Ω at the end; a 9 V from about 2.3 Ω to about
  3.1 Ω and 4.1 Ω; a NiMH AA from 30 mΩ to 40 mΩ at half charge.
- **The cold.** A fresh AA is about 0.13 Ω at 20 °C and about 0.4 Ω at
  −20 °C.
- **The maker.** Fresh AA figures run from about 0.09 Ω (Duracell's curve) to
  0.25 Ω (Energizer).

Values read from curves are "about" and typical. Voc moves too: devices are
designed for 1.6 V down to 0.9 V per alkaline cell, and a NiMH cell falls
quickly from about 1.4 V off the charger to the 1.2 V it holds for most of its
use. The instrument keeps Voc and Rint fixed, and Energizer calls the formula
a general guideline, not a precise value.

## How much power can it give?

Under the drawing, the plot shows load power against load resistance. Its
horizontal axis is a **logarithmic scale**: each equal step multiplies the
resistance by ten, from 10 mΩ to 10 kΩ. The filled marker is the load now. The
hollow marker is the peak, "max 2.56 W" for the AA.

Press AA, type `10` in Load and drag Load down: the filled marker climbs to the
peak, where the load equals Rint, and comes down the other side.

A load ten times Rint and a load ten times smaller get the same power: type
`2.5`, then `0.025`, and both give 846 mW. That holds for any factor, so on
this axis the curve is its own mirror image about `RL = Rint`, and it peaks on
the mirror line. The peak power is:

`Pmax = Voc² / (4 · Rint)`

For the AA, `1.6² / (4 · 0.25) = 2.56 W`. This is **maximum power transfer**: a
source gives its load the most power when the load resistance equals the
source's internal resistance.

Type `0.25` in Load. This is simulation only: 0.25 Ω on an AA is close to a
short.

- `I = 1.6 V / 0.5 Ω = 3.2 A`, half the short-circuit current
- `V = 800 mV`, half the open-circuit voltage
- `P = 3.2² · 0.25 = 2.56 W` in the load, and 2.56 W inside the cell

The filled marker sits on the hollow one. The model predicts these watts; no
maker rates an AA for 3.2 A.

Heat inside also reads 2.56 W, at 50 % efficiency. **Efficiency** is the share
of the source's power that reaches the load:

`efficiency = load power / (load power + heat inside)`

One current flows through RL and
Rint, so by `P = I² · R` the power splits in the ratio of their resistances.
At the peak they are equal, so half heats the source. Maximum power transfer
is not maximum efficiency. Batteries work far to the right of the peak: on
10 Ω the AA runs at 97.6 %. The peak matters where a source's resistance is
fixed and its power small, such as a headphone output (module 08).

A higher voltage does not mean more power. Keep the load at 10 Ω and press
each key:

- **AA:** 1.6 V, 0.25 Ω. Maximum 2.56 W, short-circuit current 6.4 A. On
  10 Ω: 1.561 V, 244 mW.
- **9 V:** 9.6 V, 2.3 Ω. Maximum 10 W, short-circuit current 4.17 A. On 10 Ω:
  7.805 V, 6.09 W.
- **NiMH:** 1.2 V, 30 mΩ. Maximum 12 W, short-circuit current 40 A. On 10 Ω:
  1.196 V, 143 mW.

On 10 Ω the 9 V battery gives 6.09 W, 60.8 % of its maximum (1.4 W of heat
inside, 81.3 % efficiency); the NiMH cell gives 143 mW, 1.2 % of its maximum.
At its own maximum-power load, though, the 1.2 V cell can give 12 W against
the 9 V battery's 10 W. These are model predictions, not ratings: the 12 W
needs 20 A. What a source can give depends on `Voc² / Rint`; what it does give
depends on the load. A device that draws a small current gets more from the
9 V battery. One that draws amps, such as a motor, can get more from the
low-resistance cell.

:::safety Keep coin cells away from children
A **coin cell** is a small, flat, round cell, such as the 3 V CR2032 lithium
cell. A child can swallow one. Energizer's safety sheet warns: "Swallowing may
lead to serious injury or death in as little as 2 hours due to chemical burns
and potential perforation of the esophagus" (the food pipe). Keep coin cells,
new and used, out of children's reach, and keep new ones in their packaging
until you use them. Dispose of a used one at once, under your local rules,
instead of leaving it loose. If a child may have swallowed one, get medical
help immediately; the sheet says not to make the child vomit or give food or
drink. This lesson uses the coin cell only in the instrument: do not measure,
load or open one at the bench.
:::

The fourth key, CR2032, is that coin cell, in the instrument only. It uses
3.2 V and 10 Ω (Energizer puts a fresh one near 10 ohms). Press CR2032 with
the load at 10 Ω. With Load off it reads 3.2 V.
`Isc = 3.2 V / 10 Ω`, which is 320 mA, and `Pmax = 3.2² / 40 = 256 mW`. With Load on,
`I = 3.2 V / 20 Ω = 160 mA` and `V = 1.6 V`: half the voltage is lost inside.
Load power reads 256 mW at 50 % efficiency: this ordinary 10 Ω load sits on
the coin cell's peak.

The same 10 Ω took 39 mV from the AA. On `100` the coin cell reads 2.909 V and
loses 291 mV, where the AA loses 3.99 mV; it gives 29.1 mA and 84.6 mW
(33.1 % of its maximum, 90.9 % efficiency). It has twice the AA's voltage, but
a twentieth of its short-circuit current and a tenth of its maximum power,
because its resistance is forty times larger.

Energizer's coin-cell manual shows the same. A fresh 2032 read 3.279 V with
only a 1 MΩ load, and 2.429 V during a **pulse**, a load connected for a short
time: 50 ms on 25 Ω, about 97 mA. So `3.279 V − 2.429 V = 0.85 V`, and `0.85 V / 0.097 A = 9 Ω`
(8.76 Ω before rounding). Type `25` in Load: 2.286 V and 91.4 mA. The maker
tests in short pulses, not with a steady load.

Rint also rises with use, from about 10 Ω to about 65 Ω near the end of life
(read from the manual's curve, typical). Type `65` in Internal resistance,
which selects Custom, and `100` in Load: 1.939 V, and a short-circuit current
of 49.2 mA. Voc stays at 3.2 V here to show the resistance alone; a worn
cell's open-circuit voltage is lower too.

A coin cell suits circuits that draw very little current, where `I · Rint`
stays small: at 1 mA, its 10 Ω takes only 10 mV.

## Past the peak

Left of the peak the load is smaller than Rint. The current keeps rising, the
load gets less power, and more heat stays in the source than reaches the load:
Heat inside turns the warning colour, and Rint the hot colour. The far left of
the curve is where a short circuit would be.

:::safety Shorted lithium-ion cells start fires
Lithium-ion (Li-ion) cells, the kind in phones, vapes (e-cigarettes) and power
banks, can catch fire or explode if keys or coins touch their terminals.
Western Australia's energy-safety regulator reported a loose vape cell that
coins shorted in a pocket: it caught fire, and the burns needed skin grafts.
This course never uses bare Li-ion cells. Use a USB power bank, with its cells
closed inside, or a protected cell with a ready-made charger board
(lesson 04). Never carry loose cells in a pocket or bag with metal objects.
:::

Press 9 V and type `1` in Load, in the instrument only:

- `I = 9.6 V / 3.3 Ω = 2.91 A`
- `V = 9.6 V · 1 / 3.3`, which is 2.909 V: 6.69 V is lost inside
- Load power 8.46 W, 84.5 % of the 10 W maximum
- Heat inside 19.5 W, efficiency 30.3 %

These are the model's predictions, not what a real 9 V battery is rated for.

Lesson 05 said a 9 V battery would push up to 5 A through the mA jack's 1.8 Ω
and 300 A through the A jack's 0.03 Ω, less in practice because of the
battery's own resistance. Type `1.8` in Load: `9.6 V / 4.1 Ω = 2.34 A`. Type
`0.03`: `9.6 V / 2.33 Ω = 4.12 A` (leads ignored). Still amps, more than five
times the 440 mA fuse. Never try it; the instrument computes it.

A real short can be larger than the preset says. Energizer's curve gives a
fresh AA about 0.13 Ω: press AA and type `0.13` in Internal resistance (it
selects Custom). Isc becomes 12.3 A and the maximum 4.92 W.

## Any two terminals: Thévenin

Seen from two terminals, any circuit of sources and resistors acts like one
ideal source behind one resistor: its **Thévenin equivalent**. The source's
voltage is the **Thévenin voltage** (Vth), the open-circuit voltage at those
terminals. The resistor is the **Thévenin resistance** (Rth), equal to
`Vth / Isc`. A battery's Voc and Rint are its Vth and Rth.

A voltage divider has two terminals too: the output and ground. Its Vth is
lesson 03's unloaded output, `Vin · R2 / (R1 + R2)`. Its Rth is lesson 03's
output impedance, R1 in parallel with R2, `R1 · R2 / (R1 + R2)`. Output
impedance and Thévenin resistance are two names for the same thing.

::widget{type="thevenin" source="divider" vin="9" r1="10k" r2="10k" rload="10k"}

This instrument starts on Divider with lesson 03's circuit: 9 V, two 10 kΩ
resistors and a 10 kΩ load. The box holds the divider, with Vth and Rth
beside it:

- `Vth = 9 V · 10 / 20`, which is 4.5 V
- `Rth = 10 kΩ · 10 kΩ / 20 kΩ`, which is 5 kΩ
- `V = 4.5 V · 10 / 15 = 3 V`, lesson 03's number
- `I = 3 V / 10 kΩ = 300 µA`, and `P = 3 V · 300 µA = 900 µW`

Output reads 3 V, "1.5 V lost inside"; Load current 300 µA, "short circuit:
900 µA (computed)"; Load power 900 µW, 88.9 % of its 1.01 mW maximum. Type
`5k` in Load to reach the peak: 2.25 V, 450 µA, 1.01 mW. Switch Load off and
Output reads 4.5 V, lesson 03's unloaded value.

A 4.5 V source behind 5 kΩ, the first instrument's drawing with other values,
gives the same numbers: `4.5 V / 15 kΩ = 300 µA`, and
`300 µA · 10 kΩ = 3 V`.

The equivalent does not tell you the heat inside, though. Its 5 kΩ would turn
`(300 µA)² · 5 kΩ = 450 µW` into heat, but R1 and R2 really turn 4.5 mW into
heat, ten times more. So this readout is Heat in R1 and R2, worked out from the
real divider: 4.5 mW at 16.7 % efficiency, 5.06 mW at the peak and 4.05 mW
with the load off (lesson 03's "Wasted in the divider"). The equivalent
describes what the load sees, not what happens inside.

Type `100` in R1 and R2 with the load at `10k`: Rth is 50 Ω, Output reads
lesson 03's 4.48 V, and the load takes 2 mW, 2 % of a 101 mW maximum, because
lesson 03's ten-times rule keeps a stiff divider's load far right of its
peak. Lesson 05's meter loading was this same source too, with a 10 MΩ
voltmeter as the load, reading 0.05 % low.

:::key
Seen from two terminals, any circuit of sources and resistors acts like one
voltage, Vth, behind one resistance, Rth. Under load its voltage drops by
`I · Rth`, and it gives the most power into a load equal to Rth.
:::

:::note What comes next
Module 00 ends here. Module 01 starts with real resistors. Their values are not
quite the printed ones either (tolerance), which is one reason the Rint you
measure is only "about".
:::
