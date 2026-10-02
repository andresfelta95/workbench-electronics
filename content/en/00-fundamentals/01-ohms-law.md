---
slug: ohms-law
title: Ohm's Law
summary: How voltage, current and resistance are linked, and how to check that a resistor can take the heat.
minutes: 10
---

A phone charger's label might say "5 V 2 A". The first number is the voltage
it gives. The second is the most current it can supply. One equation links them
with a third quantity, resistance. You will use it in almost every lesson after
this one.

## Current, voltage and resistance

A **circuit** is a closed path that current flows around: out of a battery,
through the parts and back to the battery.

**Electric charge** is what electrons carry. **Current** is charge on the move:
how much charge flows past a point each second. It is measured in
**amperes (A)**, or amps. One amp is one coulomb per second, and a **coulomb**
is a fixed amount of charge, about 6.24 × 10¹⁸ electrons.

Current flowing through a part is what makes it do something. It warms a wire,
spins a motor and lights an **LED** (light-emitting diode): a small part that
lights up when current flows through it, like the power light on many chargers.

**Voltage** is how hard the supply pushes charge from one point to another. It
is measured in **volts (V)**, and its formal name is potential difference. The
**supply** is whatever provides the voltage, such as a battery or a USB port.
An AA **cell** (a single battery unit) gives 1.5 V, a USB port gives 5 V, and a
car's electrical system runs at about 12 V.

Voltage is always measured between two points. One point on its own has no
voltage. So you pick one point in the circuit and call it 0 V. That point is
**ground** (GND), and it is usually the battery's negative end. When a lesson
says "the output is 3 V", it means 3 V measured from ground. A **schematic**, a
circuit drawing with symbols for parts and lines for wires, marks ground with
its own symbol.

**Resistance** is how much something opposes current. It is measured in
**ohms (Ω)**. A long, thin wire has more resistance than a short, thick one.
That is why the jumper cables used to start a car are so thick. A
**resistor** is a part made to have a set resistance: the small striped part
with two wire legs that you find in any beginner's kit.

Voltage is measured **across** a part, between its two ends. Current flows
**through** it.

## The law

For a resistor, the three quantities are linked:

`V = I × R`

Rearranged as you need it: `I = V / R` and `R = V / I`. One ohm is the
resistance that lets 1 V drive 1 A.

Try it below. Under Solve for, pick the quantity you want the instrument to
work out, then set the other two. It starts at 9 V and 470 Ω, which gives
19.1 mA. The "m" stands for milli-, one thousandth, so 19.1 mA (milliamps) is
0.0191 A.

::widget{type="ohm-law" v="9" r="470"}

The law says three things:

- **More voltage across the same resistor gives more current.** A harder push
  moves more charge.
- **More resistance with the same voltage gives less current.**
- **A current through a resistor makes a voltage across it.** Beginners often
  miss this one, but you will use it a lot. Most USB power meters (the small
  boxes that sit between a charger and a phone cable) read current this way:
  they measure the voltage across a tiny resistor in the current's path, called
  a shunt.

## Power: where the energy goes

When current flows through a resistance, the resistance turns electrical energy
into heat. This is called **dissipating** the energy. How fast energy turns
into heat is **power**, measured in **watts (W)**:

`P = V × I`

Put Ohm's law into it and you get the two forms you will use most:

`P = I² × R` and `P = V² / R`

The charger from the opening can give at most `5 V × 2 A = 10 W`. A charging
cable that feels warm is turning a little of that into heat in the resistance
of its wires.

Power goes with the *square* of the current. Double the current through a
resistor and it makes four times the heat. So a part that runs warm at 1 A can
burn out at 2 A.

Every part has a **power rating**: the most power it can turn into heat without
damage. The resistors with wire legs in a beginner's kit are usually 1/4 W.
The tiny surface-mount resistors soldered flat onto a board, like most of the
parts in a phone, are often 1/10 W. The instrument's Power readout adds a note
when the heat passes 1/10 W and again past 1/4 W.

:::key
Use `P = I² × R` to check that the power in your resistor stays below its
power rating.
:::

## The water-pipe picture, and its limits

A common picture: voltage is water pressure, current is how much water flows,
and resistance is a narrow section of pipe. The picture works for everything
in this module.

It gets two things wrong:

- **Charge is not used up.** Water leaves a tap and is gone. Electrons are not
  consumed: as many return to the battery as leave it. What gets used up is
  *energy*, not charge. When a TV remote's batteries go flat, they have run out
  of energy, not electrons. This is also why a circuit must be a closed path.
  If you cannot trace the path back to where it started, no current flows.
- **Electrons are slow, but the push is fast.** Each electron drifts through
  copper at well under a millimetre per second. Yet a flashlight lights the
  moment you press its button, because the push travels along the wire at a
  large fraction of the speed of light. In this module the difference does not
  matter. It matters again in module 11, on circuit boards.

## Worked example

A USB port's 5 V lights a red LED through a 220 Ω resistor in line with it.
The resistor sets how much current the LED gets. A red LED typically takes
about 2.0 V of the 5 V. This is its **voltage drop**: the voltage across a part
while current flows through it. The resistor gets the rest:

- Voltage across the resistor: `5 V − 2.0 V = 3.0 V`
- Current: `I = 3.0 V / 220 Ω = 13.6 mA`
- Power in the resistor: `P = 3.0 V × 13.6 mA = 40.9 mW`

A milliwatt (mW) is a thousandth of a watt. To check the numbers, set the
instrument to 3 V and 220 Ω. 40.9 mW is well under a 1/4 W (250 mW) rating.

Now use the same 220 Ω resistor with a 24 V supply. The resistor gets
`24 V − 2.0 V = 22 V`, so the current is `22 V / 220 Ω = 100 mA`, and the
resistor turns 2.2 W into heat. That is almost nine times its 1/4 W rating, so
it overheats and fails.

:::note What comes next
You now know how one resistor behaves. Real circuits have many. The next lesson
gives the two rules for turning a group of resistors into one value.
:::
