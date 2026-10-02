---
slug: voltage-divider
title: The Voltage Divider, and What Loading Does to It
summary: How two resistors make a smaller voltage, and why the output drops when you connect something to it.
minutes: 12
---

You want a microcontroller to measure a 12 V battery, but its input only reads
0 to 3.3 V. A **microcontroller** is a small computer on one chip, like the one
on an Arduino board. Its **ADC** (analog-to-digital converter) is the part that
measures a voltage and turns it into a number.

Two resistors solve this. Their formula has one catch: it only holds while
nothing takes current from the point between them.

## The ideal divider

A **voltage divider** is two resistors in series across a supply. R₁ runs from
the supply to the middle point, and R₂ from the middle point to ground. The
**output** is the middle point, measured from ground. V_in is the voltage you
feed in, and V_out is the voltage at the output:

`V_out = V_in × R₂ / (R₁ + R₂)`

Working it out takes one line. The resistors are in series, so the same current
flows through both (Kirchhoff's current law, which the next lesson covers in
full):

`I = V_in / (R₁ + R₂)`

That current through R₂ makes a voltage across it, and that voltage is the
output:

`V_out = I × R₂ = V_in × R₂ / (R₁ + R₂)`

So the output is the input scaled by R₂'s share of the total resistance. Equal
resistors give half the input, whatever their value: 1 kΩ and 1 kΩ divide by
two, and so do 1 MΩ and 1 MΩ.

A **potentiometer** is a divider you can adjust: a knob slides the middle point
along one resistor. The volume knob on an electric guitar is one.

## What happens when you connect something

A **load** is whatever you connect to the output to use its voltage: an ADC
input, a sensor board, a small motor. With nothing connected, the divider is
**unloaded**. In the instrument below, the Load switch starts off and reads
"None", and the formula holds. Switch it on and watch the output drop, and the
formula at the top of the instrument change to the loaded form.

::widget{type="divider" vin="9" r1="10k" r2="10k"}

With the starting values (9 V, two 10 kΩ resistors and a 10 kΩ load), the
output drops from 4.5 V to 3 V. Nothing is broken. The load is another
resistor, and connecting it across R₂ puts it in parallel with R₂. The lower
half of the divider now has less resistance than the R₂ you drew.

R_load is the load's resistance, and `∥` means "in parallel with", so
R₂ ∥ R_load is `(R₂ × R_load) / (R₂ + R_load)`. The instrument writes it as
`R2||RL`. The loaded form is:

`V_out = V_in × (R₂ ∥ R_load) / (R₁ + (R₂ ∥ R_load))`

Now try other values with the same ratio. A 10 kΩ / 10 kΩ divider and a
100 Ω / 100 Ω divider both give 4.5 V unloaded. Under a 10 kΩ load, the first
drops to 3 V, a third lower. The second only drops to 4.48 V.

The ratio of R₁ to R₂ sets the voltage. Their size sets how much it drops under
a load: a divider of smaller resistors drops less. A divider that holds its
voltage well under a load is called **stiff**.

:::key
Keep the divider's resistors at least ten times smaller than the load
resistance, and the output stays within 10 % of its unloaded value. For 1 %,
make them a hundred times smaller. The cost: smaller resistors take more
current from the supply all the time and turn it into heat.
:::

At 9 V, the "Wasted in the divider" readout shows 4.05 mW for the 10 kΩ pair
and 405 mW for the 100 Ω pair.

## Output impedance: one number for the drop

The instrument calls the number that sets the drop **output impedance**.
**Impedance** is the general word for how much something opposes current. With
**DC** (direct current, which flows one way and holds steady, as from a
battery) and only resistors, impedance is just resistance. In this lesson you
can read it as resistance.

Output impedance acts like a resistor hidden inside the output. For a divider
it is R₁ in parallel with R₂, because seen from the output, each one leads to a
fixed voltage (the supply or ground). So a 10 kΩ / 10 kΩ divider has 5 kΩ.
The loaded output is the unloaded output times `R_load / (Z_out + R_load)`,
where Z_out is the output impedance. A 10 kΩ load gives
`4.5 V × 10 / 15 = 3 V`, as the instrument showed. A 5 kΩ load halves the
output, and a 500 kΩ load lowers it by about 1 %.

Every input has an **input impedance**: the resistance it presents to whatever
feeds it. A high input impedance takes little current. One circuit can feed
another well when the second one's input impedance is much larger than the
first one's output impedance, by the same ten-times rule. A multimeter's 10 MΩ
is two thousand times a 5 kΩ output, so it barely changes the reading. A
guitar's pickup is the part under the strings that turns their movement into a
voltage. It has a high output impedance, so guitar amplifiers typically have an
input impedance of about 1 MΩ.

## Where dividers are the right answer

**Reading a voltage that is too high for your microcontroller.** A car's 12 V
battery is not always at 12 V. It reads about 11 V when it is nearly flat and
powering a load, and up to about 14.4 V while the engine charges it (typical
figures). The car's own electronics usually read that voltage through a
divider like this one.
To try it yourself, feed the divider from a **bench supply** (a power supply
with a knob that sets its output voltage) set anywhere from 11 V to 14.4 V,
not from a car battery. The divider must keep even 14.4 V under 3.3 V. Two
standard E12 values, R₁ = 10 kΩ and R₂ = 2.7 kΩ, do it:

- At 14.4 V: `14.4 V × 2.7 / 12.7 = 3.06 V`
- At 11 V: `11 V × 2.7 / 12.7 = 2.34 V`
- The output stays under 3.3 V up to `3.3 V × 12.7 / 2.7 = 15.5 V`.

The ADC takes almost no current, but it needs a low output impedance behind it.
Each reading, it fills a tiny **capacitor** inside it (a part that stores a
little charge), and a high impedance fills it too slowly. The **datasheet** for
the ATmega328P, the microcontroller on an Arduino Uno, asks for 10 kΩ or less.
(A datasheet is the maker's document that lists what a part does and its
limits.) The Uno runs this chip at 5 V, so its input reads up to 5 V. The
10 kΩ limit is the same when the chip runs at 3.3 V. This divider has
`10 kΩ ∥ 2.7 kΩ = 2.13 kΩ`, well under that.

**Setting a reference or a threshold.** A **reference** is a fixed voltage that
another circuit compares against, and a **threshold** is the voltage at which
something switches. A battery-low light can use a **comparator**, a chip that
tells you which of two voltages is higher, to compare a divided-down battery
voltage with a reference. A comparator's inputs take very little current, so
they do not load the divider.

**Reading a resistive sensor.** A **resistive sensor** changes its resistance
with what it measures. A **thermistor** is a resistor whose value changes with
temperature, as in many digital thermostats. With a thermistor as R₁ and a
fixed resistor as R₂, the output follows the temperature. Module 10 starts
here.

## Where a divider is the wrong answer

**Powering anything.** A common beginner mistake: a divider from 12 V to 5 V to
run a small board, such as a Wi-Fi board. Say it takes 100 mA. It cannot work.
To hold up under 100 mA, the resistors would have to be around 10 Ω. They would
turn several watts into heat all the time, and the output would still move
whenever the board's **current draw** (the current it takes) changes. That is
the job of a **regulator**, a part that holds its output voltage steady
whatever the load takes. Module 05 covers regulators. A car's USB charger makes
5 V from 12 V with a regulator, not a divider.

**Anything whose current changes.** Even at low currents, if the load's current
draw changes, your reference voltage moves with it.

:::warning A divider does not isolate
A divider gives no **isolation**: nothing separates its output from its input,
so it does not protect what you connect to it. If the input rises, the output
rises by the same ratio. The battery divider above turns 14.4 V into 3.06 V.
Connect it to 24 V by mistake and the output is 5.1 V, more than a 3.3 V input
is built to take.
:::

## Try to predict before you drag

Before you touch the controls above, decide what the output will be, then
check. A 9 V supply, R₁ = 10 kΩ, R₂ = 4.7 kΩ, with a 10 kΩ load.

Unloaded, the output would be `9 V × 4.7 / 14.7 = 2.88 V`. The 10 kΩ load in
parallel with 4.7 kΩ gives 3.20 kΩ, so the real output is
`9 V × 3.20 / 13.20 = 2.18 V`. The Error readout shows it is 24.2 % low. If
that divider fed an ADC reading a battery, the reading would be about a quarter
low.

Next: Kirchhoff's laws, for circuits that the series and parallel rules cannot
reduce.
