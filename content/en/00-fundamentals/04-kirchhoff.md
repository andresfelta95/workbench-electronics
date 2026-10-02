---
slug: kirchhoff
title: Kirchhoff's Laws
summary: "At every node, current in equals current out, and around every loop the voltages add up to zero: two rules that solve circuits series and parallel cannot."
minutes: 11
---

A car with its engine running has two power sources on the same wires. One is
the battery. The other is the **alternator**, a generator that the engine turns
to make electricity. Both feed the lights, the radio and everything else on the
car's 12 V system. Is the battery helping to run the lights, or is the
alternator charging the battery? That depends on the two voltages.

The series and parallel rules from lesson 02 cannot answer this. With a source
in each of two paths, no resistor is purely in series or purely in parallel
with another. Kirchhoff's laws can, and they work for any circuit of sources
and resistors.

## Nodes, branches and loops

A **node** is a point where two or more parts connect (lesson 02). All the wire
joining them counts as one node, and some books call it a **junction**. In the
instrument below, node A is where R1, R2 and R3 meet. Ground is a node too.

A **branch** is a path between two nodes that does not split on the way, so one
current flows through every part on it. This circuit has three branches from A
to ground: V1 with R1, R2 on its own, and V2 with R3.

A **loop** is any path around a circuit that ends where it started. The
instrument checks two: the left loop through V1, R1 and R2, and the right loop
through V2, R3 and R2.

## Which way does the current flow?

A battery has two **terminals**, the ends you connect wires to, marked + and −.
Schematics draw current leaving a source by its + terminal and coming back in
at −. This is the **conventional current direction**: the way a positive charge
would move. In a copper wire the moving charges are electrons, which drift the
other way, but the arithmetic comes out the same.

In a circuit like this one, you often cannot tell which way a current flows
until you solve it. So you pick a direction for each current, draw an arrow and
stick to it. That choice is your **sign convention**. If an answer comes out
negative, the current flows against your arrow, and the size is still right.

The instrument writes its convention under its controls, and its arrows show
the real direction. V1 and V2 are ideal sources, which hold their voltage
whatever current flows. A real battery sags a little, as a later lesson shows.

::widget{type="kirchhoff" v1="9" v2="6" r1="1k" r2="1k" r3="1k"}

## The current law: what flows in flows out

**Kirchhoff's current law** (KCL) says that at any node, the current flowing in
equals the current flowing out. Charge cannot pile up at a node or appear from
nowhere.

A USB hub without its own power adapter is a node you can hold. The current in
its cable from the computer equals the currents its ports supply, plus the
little its own chip uses. In the instrument, the "KCL at A" readout adds
`I1 + I3 - I2`. Change any control and it stays at 0 A.

## The voltage law: around a loop, it adds to zero

**Kirchhoff's voltage law** (KVL) says that if you go around any loop and add
up the voltages, the total is zero. The rises equal the drops. Each voltage
gets a sign as you walk past it:

- **Through a source from − to +**, you gain its voltage: +V.
- **Through a resistor the same way as its current**, you lose its voltage
  drop: −I × R.
- **Through a resistor against its current**, you gain it: +I × R.

Lesson 01's LED circuit is a single loop. The USB port gives a 5 V rise, the
LED takes about 2.0 V and the resistor takes 3.0 V: `5 V − 2.0 V − 3.0 V = 0`.

:::key
At any node, the current flowing in equals the current flowing out. Around any
loop, the voltages add up to zero.
:::

The formula at the top of the instrument, `ΣI = 0, ΣV = 0`, is both laws in
short: Σ (the Greek letter sigma) means "add up all the", each with its sign.

## Worked example: the voltage at A

Call the voltage at A, measured from ground, V_A. Once you know it, Ohm's law
gives every current. R1 has `9 V − V_A` across it, R3 has `6 V − V_A`, and R2
has V_A:

- `I1 = (9 V − V_A) / 1 kΩ`
- `I3 = (6 V − V_A) / 1 kΩ`
- `I2 = V_A / 1 kΩ`

KCL at A says `I1 + I3 = I2`. Every resistor is 1 kΩ, so multiply both sides by
1 kΩ and the resistance drops out:

`(9 V − V_A) + (6 V − V_A) = V_A`

That gives `15 V = 3 × V_A`, so `V_A = 5 V`. Since 1 V across 1 kΩ drives
1 mA, the currents are I1 = 4 mA, I3 = 1 mA and I2 = 5 mA. The instrument
shows the same: "in 5 mA = out 5 mA".

KVL checks the answer. The left loop goes up 9 V through V1, down 4 V across R1
(4 mA × 1 kΩ) and down 5 V across R2: `9 V - 4 V - 5 V`, which is 0 V. The
right loop gives `6 V - 1 V - 5 V`, also 0 V.

## When one source is forced to absorb energy

A source's power is its voltage times the current leaving its + terminal. If
that is positive, the source **delivers** energy. If current is pushed into its
+ terminal instead, the power is negative and the source **absorbs** energy. A
battery that absorbs energy is being charged.

Type 3 into the V2 box. V_A drops to 4 V, and I3 reads −1 mA, "from A to V2":
it flows against its arrow, into V2's + terminal. Power V2 shows −3 mW,
"absorbing (being charged)". The right loop reads `3 V + 1 V - 4 V`: the 1 V
across R3 is a rise now, because the loop walks through R3 against the real
current.

This is how a car charges its battery. With the engine running, the alternator
holds the wiring at about 14 V. The battery on its own sits at about 12.6 V
(typical figures for a 12 V car battery), so the alternator pushes
current into the battery's + terminal.

:::safety Never force current into a cell that is not made for it
An ordinary alkaline cell, such as an AA or a 9 V battery, is not rechargeable.
Forcing current into one, from a charger or from a fresher cell beside it, can
make it heat up, leak corrosive liquid or burst. Do not wire loose cells in
parallel, and do not mix old and new cells, or different types, in one holder.
Charge rechargeable NiMH (nickel-metal hydride) cells only in a charger made
for them. Lithium-ion (Li-ion) cells, the kind in phones, are charged only by a
ready-made charger board, never by a circuit you build. Use only a protected
cell: one with a small built-in circuit that cuts it off if it is overcharged,
run flat or has its + and − terminals joined directly. Try the reversal in the
instrument, not with real batteries.
:::

## Predict before you try it

Somewhere between 3 V and 6 V there is a value of V2 at which I3 is zero, so V2
neither delivers nor absorbs. With V1 at 9 V and all three resistors at 1 kΩ,
work out that value before you try it.

If no current flows through R3, it has no voltage across it, so V_A equals V2.
With R3 carrying nothing, V1, R1 and R2 are a plain voltage divider from lesson
03: `V_A = 9 V × 1 kΩ / 2 kΩ = 4.5 V`. So V2 must be 4.5 V. Type 4.5 into the
V2 box: I3 reads 0 A, "no current". Above 4.5 V, V2 helps to feed R2. Below it,
V1 charges V2.

## You have used these laws already

The series rule in lesson 02 is KCL: a node with only two parts on it has one
current in and the same current out. The divider in lesson 03 used both laws:
KCL gave one current through R₁ and R₂, and KVL gave
`V_in = I × R₁ + I × R₂`.

:::note What comes next
The next lesson is the multimeter. Measuring a voltage across a part is one
step of a KVL loop. Measuring a current means putting the meter in series, so
that by KCL the whole branch current goes through it.
:::
