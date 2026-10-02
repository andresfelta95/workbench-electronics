---
slug: series-and-parallel
title: Series and Parallel
summary: Two rules that turn any group of resistors into one value, and why connecting something changes a circuit.
minutes: 9
---

You need a 15 kΩ resistor and your kit does not have one. The "k" stands for
kilo-, a thousand, so 15 kΩ is 15 000 Ω. You can build that value from
resistors you do have, once you know how resistors combine.

Parts connect in two basic ways: in series and in parallel. Each way has a rule
that turns a group of resistors into one **equivalent resistance**: the single
resistor that would take the same current from the same supply. Once a group
is one value, Ohm's law works on it directly.

## Series: one path

Parts are **in series** when they connect end to end on one path. All the
current that goes through one must go through the next, because it has nowhere
else to go. So the same current flows through every part in a series chain.

`R_total = R₁ + R₂ + R₃ + …`

The supply voltage splits between the resistors, and the bigger resistor gets
the bigger share. A 1 kΩ and a 9 kΩ in series across 10 V get 1 V and 9 V. The
next lesson builds on this.

The two AA cells in a TV remote are in series: 1.5 V plus 1.5 V gives 3 V, and
the same current flows through both. The LED and its resistor in the last
lesson were in series too.

## Parallel: more than one path

Parts are **in parallel** when both their ends connect to the same two points.
Each separate path is called a **branch**. Every branch has the same voltage
across it, and the current splits between the branches. The branch with the
lower resistance takes the bigger share of the current.

`1 / R_total = 1 / R₁ + 1 / R₂ + …`

For two resistors, this shortcut is easier:

`R_total = (R₁ × R₂) / (R₁ + R₂)`

A car's headlights are wired in parallel across its 12 V system. Each one gets
the full 12 V, and if one fails, the other stays on.

## Where the rules come from

Both rules come from two more general ones, **Kirchhoff's laws**. These use
two new words. A **node** is a point where two or more parts connect. All the
wire joining them counts as one node, and some books call it a junction. A
**loop** is any path around a circuit that ends where it started.

- **The current law:** the current flowing into a node equals the current
  flowing out. Charge does not pile up or vanish at a node.
- **The voltage law:** the voltages around any loop add up to zero. The rise
  across the supply equals the drops across the parts added together.

The same current in a series chain is the current law at work. The same voltage
across parallel branches is the voltage law. Kirchhoff's laws get their own
lesson later in this module, for circuits that the series and parallel rules
cannot reduce.

Build a group of resistors below. Use Arrangement to switch between series and
parallel, and watch the equivalent resistance, the current in each branch and
the power in each resistor. It starts with 1 kΩ and 4.7 kΩ in series, which
make 5.7 kΩ and take 1.58 mA from the 9 V supply.

::widget{type="resistor-network" supply="9"}

## Two quick checks

- **A series total is always larger than the largest resistor.** You made the
  one path harder to get through.
- **A parallel total is always smaller than the smallest resistor.** You added
  another path, so more current gets through for the same push.

If your answer breaks either rule, the arithmetic is wrong. In the instrument,
switch the starting pair to Parallel: the total drops to 825 Ω, below the
smaller 1 kΩ. Two equal resistors in parallel give half the value of one. You
will meet this case often.

:::key
Ten 1 kΩ resistors in parallel make 100 Ω. A hundred of them make 10 Ω. In
parallel, conductances add. Resistances do not. **Conductance** is how easily
current gets through: `G = 1/R`, measured in siemens (S). Each 1 kΩ resistor
has 0.001 S, so ten of them have 0.01 S, which is 100 Ω.
:::

## Where you use these rules

**Making a value you do not have.** Resistors are sold in standard lists of
values. The E12 list has 12 values in each factor of ten: 10, 12, 15, 18, 22,
27, 33, 39, 47, 56, 68 and 82, then 100, 120 and so on. Kit values usually
come from it. Say you need 15 kΩ and your drawer only has 10 kΩ and
33 kΩ. Two 10 kΩ in parallel make 5 kΩ. A third 10 kΩ in series with that pair
brings the total to 15 kΩ.

**Sharing the heat.** Two 1 Ω resistors in parallel make 0.5 Ω, and each one
carries half the current. Since `P = I² × R`, each one turns
`(I/2)² × 1 Ω = I²/4` into heat. A single 0.5 Ω resistor carrying all the
current would turn `I² × 0.5 Ω = I²/2` into heat. So each resistor in the pair
takes *half* the heat of the single part it replaces. This is a common fix when
one resistor's power rating is too low: two equal 1/4 W resistors in parallel
can share 1/2 W between them.

## Connecting a meter adds a parallel path

When you connect anything between two nodes, you put it in parallel with
whatever is already between those nodes, even by accident.

A **multimeter** is the handheld meter that measures volts, amps and ohms. When
it measures volts, it puts its own resistance between its two probes (the
leads you touch to the circuit). This is its **input resistance**, and a
typical multimeter has 10 MΩ. The "M" stands for mega-, a million, so 10 MΩ is
ten million ohms.

Across a 1 kΩ resistor, that 10 MΩ in parallel changes the resistance by
0.01 %, too little to notice. Across a 1 MΩ resistor it changes it by 9 %, so
the meter itself throws the reading off. The multimeter gets its own lesson
later in this module, including what it does to the circuit it measures.

This effect is called **loading**: connecting something changes the circuit you
connect it to. The next lesson shows a circuit where loading matters a lot,
the voltage divider.
