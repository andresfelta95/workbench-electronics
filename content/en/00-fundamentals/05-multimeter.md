---
slug: multimeter
title: Using a Multimeter
summary: Measure volts, amps and ohms, and see how much the meter itself changes the circuit it measures.
minutes: 14
references:
  - id: fluke-abc-safety
    note: "Measurement categories: CAT IV, CAT III, CAT II, and the category this printing calls CAT 0 for electronic and protected equipment (Table 1, p. 2). Leads left in the current jacks and put across a voltage source make a short circuit, so the current inputs must be fused (p. 5)."
  - id: fluke-80v-manual
    note: "Fluke 87V: 10 MΩ input resistance on volts (Table 18). Typical burden voltage 1.8 mV/mA on the mA ranges, 0.03 V/A on the A ranges and 100 µV/µA on the µA ranges (Table 14, p. 48). Fuses 440 mA and 11 A, both 1000 V FAST (p. 43). In current mode the meter acts like a short circuit (pp. 13, 24)."
  - id: fluke-17x-cal
    note: "Fluke 175/177/179, for comparison: typical burden voltage 2 mV/mA and 37 mV/A (p. 5, note 5); fuses 440 mA and 11 A, 1000 V FAST (p. 4); more than 10 MΩ input resistance on volts (p. 6)."
  - id: fluke-11x-manual
    note: "Fluke 115/117: more than 10 MΩ on DC volts; the ohms test uses under 2.7 V open circuit and under 350 µA (Table 7). The continuity beeper sounds below 20 Ω (Table 6, p. 16)."
  - id: horowitz-hill-2015
    note: "Chapter 1."
  - id: kuphaldt-liec
    note: "Volume I (DC). Free online."
---

A voltage divider takes current from its battery all the time (lesson 03). To
make a 9 V battery last, you build one from two 10 MΩ resistors. Equal
resistors give half the input, so the output should be 4.5 V. You touch your
multimeter to it and it reads 3 V. Is the divider wrong?

The divider is fine. The meter changed it. This lesson shows how to use a
multimeter for volts, amps and ohms, and how to tell when the meter itself
throws the reading off.

## The meter and its jacks

A **multimeter** (lesson 02) is three meters in one box. As a **voltmeter** it
measures voltage, as an **ammeter** it measures current, and as an
**ohmmeter** it measures resistance. The **dial**, a knob that turns to fixed
positions, picks which one it is.

The leads plug into **jacks**, the sockets on the front of the meter. This
lesson's example meter is the Fluke 87V, which has four:

- **COM** (common): the black lead always goes here.
- **V/Ω**: the red lead goes here for volts, ohms and the continuity test.
- **mA**: the red lead goes here for small currents, up to 400 mA on the 87V.
- **A**: the red lead goes here for larger currents, up to 10 A.

Each dial setting has a **range**: the largest value it can show. An
**auto-ranging** meter picks the range for you; on other meters you pick it
with the dial. If the value is too big for the range, the display shows `OL`
(overload) instead of a number. Move to a larger range, or to the A jack for a
current.

:::safety Measurement categories
Meters are rated under IEC 61010, the international safety standard for test
equipment, by where they may be used. Each rating is a **measurement
category** (CAT). Fluke's safety guide lists CAT IV for the power company's
connection to a building and outdoor lines, CAT III for a building's
distribution panels, and CAT II for things plugged into wall sockets. It calls the lowest category CAT 0:
electronic and protected equipment, not connected to mains. Mains wiring can
carry **transients**, brief voltage spikes far above its normal voltage. A
spike can destroy an under-rated meter in your hand and start an **arc**, a
spark that jumps through the air, which burns. This course stays at 24 V DC or
less, on battery- and USB-powered electronics. Never use a meter on mains
here, whatever CAT rating is printed on it. A higher category is for work this
course never does, not permission to try it.
:::

## Measuring voltage: across, in parallel

Voltage is measured across a part. Put the red lead in the V/Ω jack and the
black lead in COM, and turn the dial to DC volts. Touch the black probe to one
end of the part and the red probe to the other. Each reading is one step of a
KVL loop from lesson 04.

The meter's input resistance (lesson 02) now sits in parallel with the part.
On the Fluke 87V it is 10 MΩ. So the meter is a load, like the loads in lesson
03. A divider's output impedance is R1 in parallel with R2, and the
reading follows lesson 03's formula with the meter as the load. The instrument
writes it at the top:

`Vread = Vtrue · Rin / (Zout + Rin)`

Here the **true value** is what the circuit has with no meter connected, and
the **reading** is what the meter shows. Rin is the meter's input resistance
and Zout is the divider's output impedance. The instrument shows both values
side by side, and Error is how far the reading is from the true value.

::widget{type="meter-loading" mode="voltage" vin="9" r1="10k" r2="10k" rin="10M"}

**Two 10 kΩ resistors.** The true value is `9 V · 10 kΩ / 20 kΩ = 4.5 V`. The
output impedance is 10 kΩ in parallel with 10 kΩ, which is 5 kΩ. The meter's
10 MΩ is 2000 times that, so the reading is
`4.5 V · 10 MΩ / 10.005 MΩ = 4.4978 V`. The instrument shows a Reading of
4.5 V, a True value of 4.5 V and an Error of 0.05 % low.

**Two 10 MΩ resistors.** Type `10M` into R1 and R2. The true value is still
4.5 V, because the ratio has not changed. The output impedance is now 5 MΩ,
the same order as the meter's 10 MΩ. R2 in parallel with that 10 MΩ is 5 MΩ, so
the reading is `9 V · 5 MΩ / (10 MΩ + 5 MΩ) = 3 V`. Error shows 33.33 % low.
This is the opening question. It is the same drop from 4.5 V to 3 V that a
10 kΩ load caused in lesson 03, with resistors a thousand times larger. The
meter's 10 MΩ is the load now.

The fix is lesson 03's fix: smaller resistors with the same ratio. The 10 kΩ
pair gives the same 4.5 V and reads within 0.05 %. The cost is more current
from the battery.

**Two 1 MΩ resistors.** Type `1M` into R1 and R2. The output impedance is
500 kΩ and the reading is 4.29 V, 4.76 % low. Lesson 02 said a 10 MΩ meter
changes a lone 1 MΩ resistor by 9 %. That was a resistance: 1 MΩ in parallel
with 10 MΩ is 909 kΩ, 9.09 % less. Here R2 also drops to 909 kΩ, but the
voltage moves about half as much. The meter does not see R2 alone. It sees R1
and R2 in parallel, 500 kΩ, and `500 kΩ / 10.5 MΩ` is 4.76 %.

:::key
For a reading within 1 %, the meter's input resistance must be at least 100
times the circuit's output impedance. Ten times gives about 10 % low, and equal
values give half the voltage. A 10 MΩ meter reads within 1 % on outputs up to
about 100 kΩ.
:::

## Measuring current: in series

Current flows through a branch. To measure it, you break the circuit at one
point and put the meter in the gap, in series. By KCL (lesson 04), the whole
branch current then flows through the meter.

Inside, an ammeter works like lesson 01's USB power meter. The current flows
through a shunt, a tiny resistor, and the meter measures the voltage across
it. That voltage is the **burden voltage**: the small voltage the ammeter
takes from the circuit it measures. The Fluke 87V's manual gives typical
figures of 1.8 mV for each mA on the mA jack and 0.03 V for each amp on the
A jack. So the meter acts like a resistor of 1.8 Ω on the mA jack and 0.03 Ω
on the A jack. These are typical values, derived from the burden voltage, not
resistances the manual prints. The 87V's µA ranges, for millionths of an amp,
share the mA jack and take 100 µV for each µA: about 100 Ω.

:::safety Never put the meter in current mode across a source
On its mA and A ranges, the meter is a few ohms or less between its probes. Put it
across a battery or supply and it is a **short circuit**: a connection with
almost no resistance, like a plain wire. Ohm's law with only the meter in the
loop gives an upper bound. A 9 V battery across the mA jack's 1.8 Ω would push
up to `9 V / 1.8 Ω = 5 A`, more than eleven times the 440 mA fuse. Across the
A jack's 0.03 Ω, it would be `9 V / 0.03 Ω = 300 A`. The real current is
lower, because the battery's own resistance (lesson 07) and the leads limit
it. It is still amps: at best the fuse blows, and at worst the meter is
damaged or the leads burn. Measure current only in series, with the circuit
broken. Move the red lead back to the V/Ω jack as soon as you finish.
:::

:::safety Fused current jacks
The current jacks rely on **fuses**. A fuse is a thin conductor that melts and
opens the circuit when too much current flows; module 05 covers them. On the
Fluke 87V the mA jack has a 440 mA fuse and the A jack an 11 A fuse, both
fast-acting types rated for 1000 V. If a current jack has no fuse, or the
wrong one, an overload heats the meter until it can burst. Before you buy or
use a meter, check in its manual that both current jacks are fused. If you do
not know how big a current is, start on the A jack. Replace a blown fuse only
with the type the manual names, and never bridge it.
:::

To measure current, turn the supply off first. Open the circuit at one point.
Turn the dial to DC current, and move the red lead to the mA jack if you know
the current is under 400 mA (otherwise the A jack). Connect the meter into
the gap, red probe on the side toward the supply's + terminal, then turn the
supply back on.

::widget{type="meter-loading" mode="current" vin="9" rload="1k" range="mA"}

The instrument's formula is now `Iread = Itrue · RL / (RL + Rm)`, where RL is
the load and Rm the meter's own resistance. The Burden voltage readout shows
the voltage across the meter.

**A 1 kΩ load on the mA jack.** Without the meter, `9 V / 1 kΩ = 9 mA` flows.
With it, the loop has 1001.8 Ω, so `9 V / 1001.8 Ω = 8.98 mA`. Error shows
0.18 % low. The burden voltage is `8.98 mA · 1.8 Ω = 16.2 mV`. Next to a
1 kΩ load, 1.8 Ω hardly matters.

**A 22 Ω load at 1.5 V.** Type `1.5` in Supply and `22` in Load. Take the
supply as a bench supply set to 1.5 V: a real AA cell has its own resistance,
which lesson 07 covers. Without the meter, `1.5 V / 22 Ω = 68.2 mA` flows.
With it, `1.5 V / 23.8 Ω = 63 mA`, 7.56 % low. The burden voltage is 113 mV,
taken out of only 1.5 V. Low voltage and low resistance are where burden
voltage matters most.

Now switch Range to A. The meter adds only 0.03 Ω, so the reading is
`1.5 V / 22.03 Ω = 68.1 mA`, 0.14 % low, with a burden voltage of 2.04 mV.
The A jack's shunt is smaller, but on the A jack the meter shows small
currents with fewer digits. This is also why the A jack exists: at the mA
jack's full 400 mA, the burden voltage would be `400 mA · 1.8 Ω = 720 mV`. On
the mA range, above 400 mA, the Reading shows `OL`.

The ammeter follows the same 100-times rule, turned around. For a reading
within 1 %, the meter's resistance must be at most a hundredth of the
circuit's. The 22 Ω load is only about twelve times the 1.8 Ω shunt, which is
why that reading was 7.56 % low.

## Measuring resistance

As an ohmmeter, the meter pushes a small current through the part and
measures the voltage across it. Ohm's law gives the resistance. The Fluke
115/117 uses under 2.7 V and under 350 µA for this. The µ stands for micro-,
a millionth, so 350 µA is 0.35 mA.

Turn the circuit's power off first. The circuit's own voltage would add to the
meter's and give a wrong reading. Then lift one end of the part out of the
circuit. Any other path between its two ends is in parallel with it (lesson
02), and the meter measures the whole group.

A real use: check that a resistor from your kit is the value its colored
stripes say. It will rarely read the printed value exactly; module 01 explains
how far off it may be.

The **continuity test** is a beep for "connected". The Fluke 115/117 beeps
below 20 Ω. With the power off, use it to check that a wire has no break
inside, or that a switch connects when you press it.

:::note What comes next
The next lesson uses these voltage and current readings to find power,
`P = V · I`, and the heat it makes. Lesson 07 takes readings with and without
a load on a battery, with this same meter.
:::
