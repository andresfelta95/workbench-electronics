---
slug: ohms-law
title: Ohm's Law
summary: The one equation the whole field is built on, and the physical picture that makes it obvious rather than memorised.
minutes: 9
---

Three quantities describe what is happening at any point in a circuit, and one
equation ties them together. Almost everything else in electronics is this law
applied somewhere less obvious.

## The three quantities

**Current** is the flow of charge past a point, measured in **amperes (A)**. One
amp is one coulomb of charge per second — about 6.24 × 10¹⁸ electrons going by.
Current is what actually *does* things: it heats a resistor, spins a motor, lights
an LED.

**Voltage** is the difference in electrical potential between two points,
measured in **volts (V)**. It is the push. The word "difference" is the part
people skip, and it is the part that matters: a single point in a circuit has no
voltage of its own. It only has a voltage *relative to somewhere else*, which is
why every schematic on this site has a ground symbol — that is the "somewhere
else" everything is measured against.

**Resistance** is how much a material opposes that flow, measured in **ohms (Ω)**.

## The law

For a resistor, the three are locked together:

`V = I × R`

Rearranged as you need it: `I = V / R` and `R = V / I`.

Move the controls below. Two of the three are yours to set; the third has no
choice in the matter.

::widget{type="ohm-law" v="9" r="470"}

Read the law out loud in each direction and it stops being an equation to
memorise:

- **Raise the voltage across a fixed resistor, and more current flows.** Push
  harder, more moves.
- **Raise the resistance at a fixed voltage, and less current flows.** Same push
  against a narrower path.
- **Force a known current through a resistor, and a voltage appears across it.**
  This third reading is the one beginners rarely internalise, and it is the one
  you will use constantly — it is how every current-sense resistor, every LED
  series resistor, and every pull-up works.

## Power: where the energy goes

Current through a resistance dissipates energy as heat. That rate is **power**,
measured in **watts (W)**:

`P = V × I`

Substituting Ohm's law gives the two forms you will actually reach for:

`P = I² × R` and `P = V² / R`

The widget above shows all three. Notice how power behaves: it goes with the
*square* of current. Double the current through a resistor and it does not get
twice as hot — it gets four times as hot. This is why a component that runs warm
at 1 A can vanish in a puff of smoke at 2 A, and why "it worked on the bench" is
not the same as "it works".

:::key
Every real resistor has a power rating — commonly 1/4 W for the through-hole
parts in a beginner's kit, and often just 1/10 W for a small surface-mount one.
`P = I² × R` is not an academic exercise. It is the calculation that tells you
whether the part you picked survives.
:::

## The hydraulic analogy, and where it lies

The standard picture: voltage is water pressure, current is flow rate,
resistance is a narrow section of pipe. It is a good first model. Pressure
difference drives flow; a constriction reduces it; the analogy gets you through
this entire module.

Where it breaks down is worth knowing early, because the analogy quietly teaches
two wrong things:

- **There is no "used up" charge.** Water leaves a tap and is gone. Electrons do
  not get consumed — exactly as many return to the source as leave it. What gets
  consumed is *energy*, not charge. A circuit is always a loop, and if you cannot
  trace the loop back to where it started, the circuit does not work.
- **Electrons are slow; the effect is not.** Individual electrons drift through
  copper at well under a millimetre per second. The *signal* propagates at a
  large fraction of the speed of light, because the push is transmitted through
  the field, not carried by any one electron. In this module the difference does
  not matter. In the PCB module it becomes the entire story of why return paths
  and impedance exist.

## Worked example

A 5 V supply drives an LED with a 220 Ω series resistor. The LED drops about
2.0 V across itself, so the resistor sees the rest:

- Voltage across the resistor: `5 V − 2.0 V = 3.0 V`
- Current: `I = 3.0 V / 220 Ω = 13.6 mA`
- Power in the resistor: `P = 3.0 V × 13.6 mA = 41 mW`

41 mW against a 250 mW part — comfortable. Now redo it for a 24 V supply with
the same 220 Ω resistor: the current jumps to 100 mA and the resistor is
dissipating 2.2 W. It is a 1/4 W part. It will not be a 1/4 W part for long.

:::note What comes next
You now have one resistor. Real circuits have many, and the next lesson is the
two rules for collapsing any pile of them into a single number.
:::
