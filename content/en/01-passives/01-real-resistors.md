---
slug: real-resistors
title: "Real Resistors: Tolerance, Standard Values and Temperature"
summary: Why a resistor is never exactly its printed value, how the standard values were chosen, how far off a divider made of real parts can be, and how far off it usually is.
minutes: 14
references:
  - id: tt-tn004
    note: "Colour code, \"reference IEC60062\": tolerance gold 5 % (J), brown 1 % (F), red 2 % (G), silver 10 % (K); multipliers from black × 1 upward; the tolerance band is wider than, or further from, the other bands; five bands for three-digit values (p. 1). On chip resistors \"Tolerance is not marked\" (p. 2)."
  - id: hyperphysics-es
    note: "In Spanish. Page \"Resistencias de Carbón\": in the four-band code the fourth band is the tolerance, gold 5 % and silver 10 %; printed codes use R for the decimal point and a tolerance letter (1 % F, 2 % G, 5 % J, 10 % K), e.g. 8R2K = 8.2 Ω ±10 %."
  - id: openstax-fisica-u2-es
    note: "In Spanish. Section 9.3: the fourth colour band is the tolerance; R = R0(1 + αΔT), with α for bulk carbon −0.0005 per °C (−500 ppm/K) in Tabla 9.1, a material value, not a resistor rating."
  - id: iec-60063-2015
    note: "The standard that defines the E lists. Cited for that fact only; the values and pairings below come from makers."
  - id: vishay-std-ohmic-values
    note: "One decade of the E12, E24, E48 and E96 lists (pp. 1–2), with a tolerance pairing that puts ±2 % with E48. Several E24 values are not in E96: 220 is not, E96 has 221."
  - id: vishay-decade-table
    note: "E12 for ±10 %, E24 for ±2 % and ±5 %, E96 for ±1 %; neighbouring values related by about the 12th, 24th or 96th root of 10; \"Use of standard values is encouraged because stocking programs are designed around them\" (p. 335)."
  - id: yageo-cfr
    note: "Carbon film: tolerances G (±2 %) and J (±5 %) only (p. 2). Temperature coefficient −500 to +350 ppm/°C under 100 kΩ (Table 2, p. 4). Endurance, 1000 h at rated power and 70 °C: ±3.0 % + 0.05 Ω (p. 4)."
  - id: stackpole-cf
    note: "Carbon film: 2 % and 5 % only (p. 11). Temperature coefficient 0 to −500 ppm/°C from 10 kΩ to 99 kΩ (p. 1). Endurance at 70 °C: typically less than ±1 % (p. 3)."
  - id: yageo-mfr
    note: "Metal film: tolerances ±0.5 % to ±5 % (p. 1); temperature coefficient ±50 ppm/°C (code E) or ±100 ppm/°C (p. 2); 5-band colour code for ±0.5 % and ±1 % (p. 15). Endurance, 1000 h at rated power and 70 °C: ±1.5 % + 0.05 Ω (p. 4)."
  - id: vishay-mbx-sma
    note: "Metal film: temperature coefficient ±50 ppm/K (p. 1); 1 % parts sold in E24 and E96 values (note 1, p. 3); a laser cuts a helical groove in the resistive layer to reach the target value, and \"an extensive testing procedure performed on 100 % of the individual resistors\" (p. 7)."
  - id: yageo-rc-l
    note: "Thick-film chip RC0603: temperature coefficient ±100 ppm/°C from 10 Ω to 10 MΩ (Table 2, p. 5); \"the resistor is laser trimmed to the rated resistance value\" (p. 4)."
  - id: vishay-tnpw-e3
    note: "Thin-film chip: temperature coefficient down to ±10 ppm/K in the best grade (p. 1); at most 0.05 % change after 1000 h at rated dissipation (p. 2); laser trimmed (p. 5)."
  - id: ti-snva112
    note: "Worst case takes all tolerances at their extremes at once and gives \"excessively conservative\" limits (§1, §3). Vendors \"may be reluctant to release\" distribution data, so the note assumes a Gaussian spread (§6), with the tolerance taken as ±6σ (pp. 5, 8). Fig. 6, a measured histogram of 1 % 0805 chip resistors: one peak, every bar within about ±0.8 %, read from the plot (p. 5)."
  - id: knudtsen-2022
    note: "Monte Carlo analysis in LTspice against worst-case analysis: \"worst-case limits are statistically improbable\"; \"both worst-case and statistical analysis provide valuable insights\"."
  - id: johnson-2010
    note: "An anecdote, not a measurement: in 1983 the author found none of 300 carbon-composition resistors rated 10 % within ±1 %, and his mentor said the best parts had been sold as 5 %. No values or histogram are given."
  - id: fluke-80v-manual
    note: "Never place the probes across a circuit or part with the leads in the current jacks (p. 24); there the meter acts like a short circuit (p. 13). 440 mA fuse on the mA jack (p. 43)."
---

You build lesson 00-03's voltage divider from a 9 V battery and two 10 kΩ
resistors from your kit. The formula says the output is
`9 V · 10 kΩ / 20 kΩ = 4.5 V`. Your meter shows about 4.37 V. Is the circuit
wrong?

It is not. Lesson 00-05 said a resistor will rarely read its printed value,
and that module 01 explains how far off it may be. This lesson does that, for
one resistor and then for a divider made of two. Many people expect a divider
built from 5 % resistors to be about 5 % off. It can be off by more than that,
and it is usually off by much less.

## Tolerance and how it is marked

The value printed on a resistor is its **nominal value**: the value the maker
aims for. Its **tolerance** is how far the real value may be from the nominal
value, as a percentage of it. A 10 kΩ, 5 % resistor is somewhere from 9.5 kΩ
to 10.5 kΩ. Any value inside that band is a good part.

Most beginner kits hold carbon-film resistors (lesson 00-06) marked with
colour bands. The **colour code** says which colour stands for which digit. A
four-band resistor carries two digits, then a multiplier (how many zeros to
add), then the tolerance. A 10 kΩ, 5 % part reads brown (1), black (0),
orange (three zeros), gold. The tolerance band is wider than the others or
sits a little apart from them, so you know which end to read from. The usual
tolerance colours are:

- gold: 5 %
- red: 2 %
- brown: 1 %
- silver: 10 %

Parts of 1 % usually carry five bands: three digits, the multiplier and the
tolerance. When a value is printed in characters instead of colours, a
**tolerance letter** gives the tolerance: J is 5 %, G is 2 %, F is 1 % and K
is 10 %. The letter R marks the decimal point, so `8R2K` is 8.2 Ω, 10 %.

A **chip resistor** is a surface-mount resistor (lesson 00-01): a tiny block
with no legs, like most of the resistors in a phone. TT Electronics' marking
guide says that on chip resistors "Tolerance is not marked". You find it in
the datasheet, as a letter in the part number.

Each kind of resistor comes in its own tolerances. Yageo and Stackpole both
make carbon film in 2 % and 5 % only. For 1 % you need a **metal-film
resistor**, which has a thin layer of metal where carbon film has carbon.
Yageo's metal-film line comes in 0.5 % to 5 %.

Tolerance is also why lesson 00-07's internal resistance came out only
"about": a 5 % load resistor can put up to 5 % of error into it.

:::safety Measuring resistors safely
To measure resistance, the meter pushes its own small current through the
part. In a powered circuit, the circuit's voltage adds to the meter's and the
reading is wrong. With the red lead in the mA or A jack, the meter is almost
a plain wire between its probes (lesson 00-05). Touch them across the 9 V
battery and that is a short circuit: it blows the meter's fuse and heats the
battery and the leads. Disconnect the battery and lift one end of the
resistor out of the circuit before you measure it. Keep the leads in the COM
and V/Ω jacks. Never connect anything straight across the battery's two
terminals, which sit side by side on a 9 V battery (lesson 00-07).
:::

Now set your meter to ohms and measure a few of your 10 kΩ resistors. Each
should read between 9.5 kΩ and 10.5 kΩ, and they will rarely all read the same.
Your meter adds a small error of its own; its manual says how much.

## Standard values: why 10, 11, 12, 13

Resistors are sold in a few standard lists of values, set by the standard
IEC 60063. Lesson 00-02's E12 list has 12 values per factor of ten: 10, 12,
15, 18, 22, 27, 33, 39, 47, 56, 68 and 82. The **E24 list** has 24: the E12
values plus 11, 13, 16, 20, 24, 30, 36, 43, 51, 62, 75 and 91. The **E96
list** has 96 values with three digits each: 100, 102, 105, 107, 110 and so
on. Each list repeats in every factor of ten, so E24 gives 1.1 kΩ, 11 kΩ and
110 kΩ.

Each value is about the same ratio above the one before it: about 10 % in
E24, 21 % in E12 and 2.4 % in E96. (Each step multiplies by the 24th, 12th or
96th root of ten.) That spacing fits the tolerances. A 10 kΩ, 5 % part covers
9.5 kΩ to 10.5 kΩ, and the next E24 value, 11 kΩ, covers 10.45 kΩ to
11.55 kΩ. E12 does the same at 10 %: 10 kΩ covers 9 kΩ to 11 kΩ, and 12 kΩ
covers 10.8 kΩ to 13.2 kΩ. The bands nearly cover each factor of ten, but
some neighbours leave a small gap. At 5 %, 13 kΩ reaches up to 13.65 kΩ and
15 kΩ reaches down to 14.25 kΩ, so nothing in E24 covers the 4.4 % between
them. A value you work out at about 14 kΩ is about 7 % from the nearest E24
value, a little beyond the tolerance.

The usual pairing is E12 for 10 % parts, E24 for 5 % and 2 %, and E96 for
1 %. It is a convention, not a law: another Vishay table puts 2 % with a
48-value list instead. Vishay also gives the reason to stay on the lists:
"stocking programs are designed around them". You can buy 1 % parts in E24
values too, even though some E24 values, such as 220, are not in E96 (it has
221).

The instrument below works the same way. Type a value into R1 or R2 and it
moves to an E24 value, so every divider it shows is one you could buy.

## The worst case

The **worst case** is the output you get when every part sits at the end of
its band that pushes the output furthest, all at once. The divider's output is
lowest when R1 is as high as it can be and R2 as low, and highest the other
way round:

- R1 = 10.5 kΩ, R2 = 9.5 kΩ: `9 V · 9.5 / 20 = 4.275 V`
- R1 = 9.5 kΩ, R2 = 10.5 kΩ: `9 V · 10.5 / 20 = 4.725 V`

The total is still 20 kΩ in both cases, so the output moves by the same 5 %
as R2. Two equal resistors always give this: the worst case equals the parts'
tolerance.

::widget{type="tolerance-spread" vin="9" r1="10k" r2="10k"}

The instrument draws lesson 00-03's divider with both resistors marked ±5 %.
Worst case reads ±5 %, from 4.275 V to 4.725 V. The two dashed lines on the
plot under the drawing mark the same two voltages. The bars between them are
for the next section.

How far a tolerance moves the output depends on the circuit. Type `1k` in R2.
The output is now 818.2 mV, a small slice of 9 V, and Worst case reads ±9.5 %
(746.7 mV to 895.7 mV): almost twice the parts' tolerance. With R2 this small,
R1 alone sets the current. A high R1 means less current, and a low R2 gives
less voltage for that current, so the two errors add.

Now type `1k` in R1 and `10k` in R2. The output is 8.182 V, most of the 9 V,
and Worst case reads ±0.9 % (8.104 V to 8.253 V). The output is close to Vin
whatever the parts do, so they can only nudge it.

You have met the sensitive kind already. Lesson 00-03's divider for reading a
12 V battery with a microcontroller uses R1 = 10 kΩ and R2 = 2.7 kΩ. Type
`12` in Vin, `10k` in R1 and `2.7k` in R2: the output is 2.551 V, and Worst
case reads ±8.1 % (2.356 V to 2.758 V). From the resistors alone, the battery
reading could be about 8 % off. Press `1%` and it reads ±1.6 %.

A design that must always work is checked against the worst case. Texas
Instruments' note on this calculation also calls worst-case limits
"excessively conservative": every part at its extreme, in the worst direction,
at the same time, is rare. Before you go on, press `5%`, and set Vin back to
9 and R1 and R2 back to 10k.

## What usually happens

To see what usually happens, you could build the divider a thousand times from
a thousand different pairs of resistors and measure each one. A **Monte Carlo
simulation** does that on a computer: it builds the circuit many times, picks
each part's value at random inside its band, and collects the results. An
Analog Devices article shows how to run one in the free circuit simulator
LTspice.

The instrument builds the divider 1000 times; each one is a build. The plot
under the drawing is a **histogram** of the outputs: a bar chart in which each
bar counts how many of the 1000 outputs landed in one narrow range of
voltages. Tall bars mean many builds landed there.

To pick values at random, the computer needs a rule for how they are spread
inside the band. Makers do not publish it: TI's note says vendors "may be
reluctant to release this data". So the instrument offers two shapes, and the
Assumed shape keys say they are assumptions:

- **Bell** is a **bell curve**, also called a normal or Gaussian distribution:
  most parts near the nominal value, fewer further out. The instrument sets it
  so that about two parts in three lie within a third of the tolerance of the
  nominal value, and none lie outside the band.
- **Flat** is a **flat spread**: every value in the band is equally likely.
  This is the cautious case.

The bell is the shape TI's note assumes. TI's bell is narrower, though: it
puts the band's edge six times as far out as a typical part's error, where the
instrument puts it three times as far, the more cautious choice. The one
measured histogram in TI's note, of 1 % chip resistors, has a single peak, with every bar within about ±0.8 %.
Makers also set each part's value instead of sorting a wide spread. In
**laser trimming**, a laser cuts a groove in the film until the part reaches
its target value, and Vishay tests every resistor in its professional
metal-film line.
Still, neither shape is a measurement of 5 % parts.

The instrument starts on Bell and `5%`. The bars make one hump centred on
4.5 V, well inside the dashed lines. 95% of builds reads ±2.5 %: 95 of every
100 builds landed between 4.388 V and 4.605 V. Furthest of 1000 reads +3.7 %,
"4.668 V, batch 1": even the furthest of the thousand did not reach the worst
case. Your 4.37 V divider is about 2.9 % low, an ordinary build.

Press `1%`. The same 1000 builds, each error a fifth as large, shrink into a
narrow spike. Worst case reads ±1 % (4.455 V to 4.545 V), 95% of builds ±0.5 %
(4.477 V to 4.521 V), and the furthest build is +0.7 % (4.534 V). The axis
stays where it was, so you can compare: every one of these builds lies inside
the range that held 95 of every 100 of the 5 % builds.

Press `5%` again, then Flat. The dashed lines do not move; only the shape
inside them changes. The hump spreads out: 95% of builds reads ±3.9 %
(4.327 V to 4.671 V), and the furthest build, 4.719 V, is 4.9 % off, close to
the edge. A few dozen of the thousand builds now land more than 4 % off.

Press Bell, then New batch a few times. Each press builds a new set of 1000
dividers. 95% of builds stays between ±2.3 % and ±2.5 %. The furthest build
moves more: from 3.4 % to 4.3 % off in batches 1 to 5. In those 5000 builds,
none reaches 5 %. The Analog Devices article puts it this way: "worst-case
limits are statistically improbable".

So a divider of 5 % parts is not "about 5 % off". Its worst case is 5 % with
equal resistors and nearly 10 % with a small R2. With the bell assumption, 95
of every 100 builds are within about half of that.

You may read that 1 % parts are picked out of 5 % production, so 5 % parts
have a gap in the middle where the good ones were taken out. One account comes
from an EDN column by Howard Johnson. In 1983 he checked 300 resistors rated
10 % and found none within 1 % of their value; with values spread evenly,
about one in ten should have been. His mentor's explanation was that the maker
had pulled out the best parts and sold them as 5 %. Those were
carbon-composition resistors, an older kind than the carbon film in your kit,
and the column gives no measurements. No measurement of modern film resistors
shows such a gap. TI's measured 1 % parts have one peak, laser trimming sets
each part's value, and carbon film has no 1 % grade to pick out. The
instrument leaves the gap out.

:::key
A circuit built from parts with tolerances can reach its worst case, so check
that the design still works there. Most builds land far inside it: for this
divider, with the bell assumption, 95 of every 100 are within about half the
worst case.
:::

## Temperature and age

A resistor's value also moves with temperature. Its **temperature
coefficient**, or **tempco**, says by how much, in ppm/K: parts per million of
its value for each kelvin of temperature change. A kelvin is the same step as
a degree Celsius, so datasheets also write ppm/°C, and 100 ppm/K is 0.01 % per
degree. As a formula, `R = R₀ · (1 + α · ΔT)`, where R₀ is the value at the
starting temperature, ΔT the change in temperature and α the tempco as a
fraction.

Most chip resistors are **thick film**. Precision chips are **thin film**,
with a much thinner resistive layer. Take a 10 kΩ resistor that warms from
25 °C to 75 °C, 50 K, as it might inside a closed box with a warm part in it
(lesson 00-06). By the datasheet limits:

- **Carbon film:** 0 to −500 ppm/K for 10 kΩ to 99 kΩ (Stackpole). Down to
  −2.5 %, or 9.75 kΩ.
- **Thick-film chip** (Yageo RC0603): ±100 ppm/K. ±0.5 %, or 10.05 kΩ.
- **Metal film:** ±50 ppm/K. ±0.25 %, about 10.03 kΩ.
- **Thin-film chip:** ±10 ppm/K in the best grade of Vishay's TNPW line. ±0.05 %, about
  10.01 kΩ.

Carbon as a bulk material has −500 ppm/K in OpenStax's table: a property of
the material, not a resistor rating.

In a divider, only the difference between the two drifts matters. If both
resistors are the same type at the same temperature, both change by the same
fraction and the ratio stays put: 4.5 V stays 4.5 V. But carbon film's range
allows one part to stay at 10 kΩ while the other drops 2.5 %. With R2 down,
`9 V · 9.75 / 19.75 = 4.443 V`, 1.27 % low. Two metal-film parts at opposite
ends of ±50 ppm/K give 4.511 V. That is why precision dividers use metal film
or thin film, both parts from one family. These are datasheet limits. No
source says how much tempco varies from one part to the next, so the
instrument leaves temperature out.

Resistors also drift with age. **Load life** is the drift after long use at
the rating: makers run parts at their rated power for 1000 hours, about six
weeks, and state the most the value may change. Yageo allows ±3.0 % + 0.05 Ω
for its carbon film at 70 °C and ±1.5 % + 0.05 Ω for its metal film.
Stackpole's carbon film typically drifts less than ±1 %, and Vishay's thin-film
chips at most 0.05 %. So a 10 kΩ carbon-film part run at its rating can end up
at 10.3 kΩ: a drift of more than half its 5 % tolerance.

:::note What comes next
Capacitors come next, in lesson 01-02. They have tolerances and drift too, and
some drift much further: lesson 01-03 shows a ceramic capacitor that loses most
of its value.
:::
