---
slug: voltage-divider
title: The Voltage Divider, and What Loading Does to It
summary: The most-used circuit in electronics, the formula everyone learns, and the reason it stops working the moment you connect something to it.
minutes: 12
---

Two resistors in series across a supply, with the output taken from the middle.
It is the first circuit in every textbook, it appears inside almost every other
circuit you will ever build, and the standard formula for it is only true under a
condition that textbooks tend to mention once and move on from.

## The ideal divider

`V_out = V_in × R₂ / (R₁ + R₂)`

The derivation takes one line and is worth doing once rather than memorising the
result. The two resistors are in series, so the same current flows through both
(Kirchhoff's current law, which gets its own lesson later in this module):

`I = V_in / (R₁ + R₂)`

That current through R₂ produces a voltage across it, and that voltage *is* the
output:

`V_out = I × R₂ = V_in × R₂ / (R₁ + R₂)`

So the output is the input scaled by R₂'s share of the total resistance. Equal
resistors give exactly half the input, regardless of their value — 1 kΩ and 1 kΩ
divide by two, and so do 1 MΩ and 1 MΩ.

## What happens when you connect something

Here is the part that matters. With the Load switch below off, reading "None",
the formula holds exactly. Then switch it on and watch the output sag, and watch
the formula on the instrument's nameplate change to the loaded form as you do.

::widget{type="divider" vin="9" r1="10k" r2="10k"}

Nothing is broken. A load is just another resistor, and connecting it across R₂
puts it **in parallel** with R₂ — the rule from the previous lesson. The divider
is still a divider; it just is not the divider you drew. Read `∥` as "in
parallel with": the nameplate's `R2||RL` is the instrument's shorthand for
R₂ ∥ R_load, not a logical OR from C. Written out in full, the loaded form is:

`V_out = V_in × (R₂ ∥ R_load) / (R₁ + (R₂ ∥ R_load))`

Play with the two resistor values at a fixed ratio. A 10 kΩ / 10 kΩ divider and a
100 Ω / 100 Ω divider have identical no-load outputs, but under a 10 kΩ load the
first collapses and the second barely moves. **The ratio sets the output; the
absolute values set how well it holds that output.**

:::key
The rule of thumb: keep the divider's resistances at least ten times *smaller*
than the load impedance, and the loading error stays under about 10 %. For
one percent, make it a hundred times smaller. What you are trading away is
current — a stiffer divider wastes more power sitting there doing nothing.
:::

## Output impedance, without the algebra

There is a name for "how much does this output sag when I draw current from it":
**output impedance**. For a divider it happens to be R₁ in parallel with R₂ — the
two resistors seen from the output, with the supply treated as a short to ground.

A 10 kΩ / 10 kΩ divider has a 5 kΩ output impedance. That single number predicts
everything: against a 5 kΩ load it will drop to half its unloaded value, against
a 500 kΩ load it will drop by about 1 %.

This concept does not stay in this lesson. Every signal source in electronics has
an output impedance and every input has an input impedance, and the whole
question of whether two blocks can be connected together comes down to comparing
those two numbers.

## Where dividers are the right answer

**Reading a voltage that is too high for your microcontroller.** A 12 V battery
into a 3.3 V ADC input, through a divider that scales it to 3.0 V. The ADC draws
almost no DC current, but its sampling capacitor wants a source impedance below
about 10 kΩ (the ATmega328P datasheet asks for 10 kΩ or less). A 10 kΩ / 3.3 kΩ
divider has an output impedance of about 2.5 kΩ, comfortably inside that. This
is the textbook-correct use.

**Setting a reference or a threshold.** Feeding the input of a comparator or a
regulator's feedback pin, both of which draw almost no current.

**Reading a resistive sensor.** A thermistor as R₁ and a fixed resistor as R₂
turns a resistance into a voltage the ADC can read. This is module 10's whole
opening, and it is a divider.

## Where a divider is the wrong answer

**Powering anything.** The single most common beginner mistake: a divider from
12 V to 5 V to run a module that draws 100 mA. It cannot work. To hold up under a
100 mA load the divider resistors would have to be a few ohms, which means they
would be burning watts continuously as heat, and the output would still move with
every change in the load's current draw. That is what a regulator is for, and it
is module 05.

**Anything that draws variable current.** Even at low currents, if the load's
draw changes, your "reference" voltage moves with it.

:::warning A divider does not isolate
It is worth saying plainly: a divider provides no isolation and no protection
worth relying on. If the input goes to 100 V, the output goes up proportionally
and whatever it is connected to sees it. Scaling a voltage down is not the same
as making it safe.
:::

## Try to predict before you drag

The fastest way to make this stick: before touching the controls above, decide
what the output will be, then check. A 9 V supply, R₁ = 10 kΩ, R₂ = 4.7 kΩ,
loaded with 10 kΩ.

The unloaded output would be 9 × 4.7/14.7 = 2.88 V. The 10 kΩ load in parallel
with 4.7 kΩ gives 3.20 kΩ, so the real output is 9 × 3.20/13.20 = 2.18 V — a
24 % error. If that divider was scaling a battery voltage into an ADC, your
reading is wrong by a quarter, and nothing in the circuit looks broken.
