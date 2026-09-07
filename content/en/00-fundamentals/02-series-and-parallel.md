---
slug: series-and-parallel
title: Series and Parallel
summary: Two rules that collapse any resistor network into one number — and the reason your circuit's behaviour changes when you connect something to it.
minutes: 8
---

Real circuits contain more than one resistance. Two rules reduce any combination
of them to a single equivalent value, and once a network is a single value, Ohm's
law works on it directly.

## Series: one path

Components are **in series** when they share a single path — all the current that
goes through one must go through the next, because it has nowhere else to go.

`R_total = R₁ + R₂ + R₃ + …`

Resistances add. The consequence that matters more than the formula: **the
current is identical everywhere in a series chain**, and the supply voltage
divides across the components in proportion to their resistance. A 1 kΩ and a
9 kΩ in series across 10 V give you 1 V and 9 V respectively — which is the
entire idea behind the next lesson.

## Parallel: multiple paths

Components are **in parallel** when they share both connection points, so
current splits between them.

`1 / R_total = 1 / R₁ + 1 / R₂ + …`

For exactly two resistors, the shortcut is easier:

`R_total = (R₁ × R₂) / (R₁ + R₂)`

Here the **voltage is identical across every branch**, and the current divides in
inverse proportion to resistance — the lower resistance takes the larger share.

Build a network below and watch the equivalent value, the branch currents and
the power in each part.

::widget{type="resistor-network" supply="9"}

## The two sanity checks

You should never need to trust arithmetic you can check by eye:

- **Series total is always larger than the largest resistor.** You added a
  constriction to the path.
- **Parallel total is always smaller than the smallest resistor.** You added
  another path, so more current gets through for the same push.

If your answer breaks either rule, the arithmetic is wrong. Two equal resistors
in parallel give exactly half the value — the single most common case, and worth
recognising instantly.

:::key
Ten 1 kΩ resistors in parallel are 100 Ω. A hundred of them are 10 Ω. Adding
paths adds conductance, and conductance — not resistance — is the thing that
adds linearly in parallel. Thinking in conductance (`G = 1/R`, in siemens) makes
parallel networks trivial and is worth the ten minutes it takes to get used to.
:::

## Why this is not an exercise

Two situations where these rules stop being academic:

**Getting a value you do not have.** Resistors come in preferred series — E12,
E24 — not in every value you might want. Need 15 kΩ and have a drawer of 10 kΩ
and 33 kΩ? A 10 kΩ in series with a 4.7 kΩ gets you to 14.7 kΩ, inside the
tolerance band of most jobs.

**Sharing current.** Two 1 Ω resistors in parallel are 0.5 Ω, but they also split
the current in half — so each dissipates a *quarter* of the power a single
0.5 Ω part would have to handle, since `P = I² × R` and the current through each
one is halved. Paralleling parts to spread heat is standard practice in power
circuits, and it works because of the square in that equation.

## Everything is in parallel with something

The rule that changes how you read a schematic: whenever you connect anything
across an existing pair of nodes, you have created a parallel combination,
whether you meant to or not.

Connect a multimeter across a resistor and you have put the meter's input
impedance — typically 10 MΩ — in parallel with it. Against a 1 kΩ resistor,
10 MΩ in parallel changes the value by 0.01 %, which is invisible. Against a
1 MΩ resistor it changes it by 9 %, and your measurement is now measuring your
meter.

That effect — the act of connecting something changes the thing you connected it
to — is called **loading**, and the next lesson is about the circuit where it
bites hardest.
