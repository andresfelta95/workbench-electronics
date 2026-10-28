---
slug: power-and-heat
title: Power, Heat and Thermal Resistance
summary: Work out how hot a resistor runs, why a part at its rating can still burn you, and why the rating shrinks in hot air.
minutes: 13
references:
  - id: stackpole-cf
    note: "CF14 rated 0.25 W and CF1 rated 1 W at 70 °C (p. 1). Bodies 6.00 mm by 2.30 mm and 11.00 mm by 4.50 mm (p. 2). Derating from 100 % at 70 °C to 0 % at 155 °C, the top of the operating range (p. 3). Surface temperature rise at full rated power, measured at the middle of the body: about 32 °C for the CF14 and about 85 °C for the CF1, read from the curve on p. 9. The datasheet prints no θ; 128 °C/W and 85 °C/W are derived from that curve (typical)."
  - id: yageo-cfr
    note: "The same derating from a second maker: 100 % up to 70 °C, 0 % at 155 °C (p. 3). Lesson 01's CFR-25 is rated 1/4 W at 70 °C (Table 1)."
  - id: vishay-mbx-sma
    note: "Another maker's curve gives similar numbers: about 140 °C/W for its 0207 size and about 85 °C/W for its 0414 size, derived from the rise curve (p. 8). The temperature rise depends on how much heat flows into the circuit board (Application Information, p. 2)."
  - id: ti-spra953
    note: "Thermal resistance is the temperature difference divided by the power, in °C/W, and it holds only for the stated mounting and test board (section 1, p. 2, and Table 1-1)."
  - id: cenelec-guide-29
    note: "Burn thresholds for skin touching a hot smooth surface. Bare metal: about 65–70 °C for 1 s and about 55–59 °C for 10 s, read from the curves in Figure A.2 (p. 17); 51 °C for 1 min. Any material: 48 °C for 10 min and 43 °C for 8 h (Table A.1, p. 20)."
  - id: usb-if-usb2
    note: "A USB port gives 5 V."
  - id: kuphaldt-liec
    note: "Volume I, chapter 2: P = I²R and P = E²/R, and a resistor's power rating is roughly proportional to its size. Free online."
  - id: horowitz-hill-2015
    note: "General reference; no page cited."
  - id: openstax-fisica-u2-es
    note: "In Spanish. Section 9.5: P = IV = I²R = V²/R, and a resistor turns that power into heat."
  - id: hyperphysics-es
    note: "In Spanish. Page \"Potencia Eléctrica\": P = VI and the power a resistor turns into heat."
---

Suppose a 100 Ω resistor sits across a USB port's 5 V. It is a 1/4 W resistor
from a beginner's kit. Lesson 01's check gives `P = V² / R = 5² / 100 = 0.25 W`,
which is its power rating and no more. The check passes. Is the resistor cool
enough to touch?

To answer, you need one more number for the part besides its rating: how many
degrees it warms up for each watt.

## From power to temperature

A resistor turns all the power in it into heat (lesson 01). Lesson 05's meter
gives you both numbers you need. Across this resistor you would read 5 V, and
through it 50 mA, so `P = V · I = 5 V · 50 mA = 250 mW`. The divider in lesson
03 does the same: it turns its current into heat all the time.

The heat leaves the part into the air around it. After you switch on, the
resistor warms up until it sheds heat as fast as it makes it. Then its
temperature stops climbing. That takes a while, and the part stays hot for a
while after you switch off.

Four names describe where it settles:

- **Ambient temperature** (Ta) is the temperature of the air around the part.
  A room might be 25 °C. The air inside a car parked in the sun, or inside a
  closed box with a warm part in it, is much hotter.
- **Temperature rise** is how far above the ambient temperature the part
  settles.
- **Thermal resistance**, written θ (the Greek letter theta), is how many
  degrees a part's surface rises for each watt it turns into heat, for a stated
  mounting. Its unit is °C/W. Datasheets also write it in K/W (kelvin per
  watt). A step of one kelvin is the same size as a step of one degree
  Celsius, so the number is the same.
- **Surface temperature** is the temperature of the outside of the part, at
  the middle of its body, where the maker measures it.

The rise is the power times θ, and the surface sits that far above the air:

`T = Ta + P · θ`

The instrument writes this formula at the top, with `P · θ`, the rise,
highlighted.

The resistors in this lesson are carbon-film resistors. In a **carbon-film
resistor**, the resistance is a thin layer of carbon, the film, coated onto a
small ceramic rod under the paint. Makers rarely print θ for these parts.
Stackpole's datasheet for its CF carbon-film family gives a curve instead: the
surface temperature rise against the power. At full rating the curve reads
about 32 °C for the 1/4 W part and about 85 °C for the 1 W part. Divide by the
power and you get θ: `32 / 0.25 = 128 °C/W` and `85 / 1 = 85 °C/W`. These θ
values are typical, derived from the maker's temperature-rise curve. Another
maker's curve, Vishay's, gives similar numbers.

The instrument makes three simplifications, so read its temperatures as
"about":

- It draws a straight line from zero up to that point on the maker's curve.
  The real curve may bend a little below full power.
- It takes θ to be the same in any air, so the same power gives the same rise
  at 25 °C or at 85 °C.
- Its temperature is the surface at the middle of the body, in the maker's
  test mounting. The **mounting** is how the part is held: how long its legs
  are, the board it is soldered to, the parts around it and any box it sits
  in. On your board the number changes, because the rise depends on how much
  heat flows into the board. The film inside, where the heat is made, is at
  least as hot as the surface.

:::safety Resistors at their rating can burn you
At its rating, in 25 °C air, a 1/4 W carbon-film resistor's surface reaches
about 57 °C and a 1 W one about 110 °C (typical, from the maker's curve). Bare
metal burns skin at 51 °C in a minute and at about 65–70 °C in about a second,
and a resistor's legs are metal. Do not touch a powered resistor, or one you
have just switched off: it stays hot for a while. Switch off and let it cool
before you handle it. Mount hot parts where nothing rests against them. Work
the temperature out with `T = Ta + P · θ`, not by touch.
:::

::widget{type="power-dissipation" rating="1/4" vin="5" r="100" ambient="25"}

The instrument starts with the opening's resistor: 1/4 W under Resistor, 5 V
in Supply, 100 Ω in R and 25 °C in Ambient temperature.

- Current: `I = 5 V / 100 Ω = 50 mA`
- Power: `P = 5 V · 50 mA = 250 mW`, all of the 1/4 W rating
- Temperature rise: `0.25 W · 128 °C/W = 32 °C`
- Surface temperature: `25 °C + 32 °C = 57 °C`

The instrument shows a Power of 250 mW with "50 mA through R", a Temperature
rise of 32 °C with θ = 128 °C/W, and a Surface temperature of 57 °C with the
note "can burn skin". Rating used reads 100 % "of 250 mW at 25 °C". That answers
the opening: the resistor is inside its rating and too hot to touch.

Now pick 1 W under Resistor. The power is still 250 mW, but θ is now
85 °C/W:

- Temperature rise: `0.25 W · 85 °C/W = 21.25 °C`, shown as 21 °C
- Surface temperature: `25 °C + 21.25 °C = 46.25 °C`, shown as 46 °C

Rating used drops to 25 % "of 1 W at 25 °C", and the surface note says only
"middle of the body". The 1 W part is bigger, 11.00 mm by 4.50 mm against
6.00 mm by 2.30 mm, so it has more surface to pass heat to the air. That is
why it rises fewer degrees per watt, and why makers rate bigger resistors for
more power.

:::key
A resistor's surface settles `P · θ` above the air around it: the temperature
rise is the power times the thermal resistance.
:::

## Inside the rating, still too hot to touch

How hot is too hot depends on what you touch and for how long. CENELEC, the
European body for electrical standards, publishes a guide to hot surfaces. It
gives the **burn threshold**: the surface temperature at which skin starts to
burn, for a given material and contact time. For bare metal, which burns
fastest of the materials it lists:

- about 65–70 °C for 1 second, and about 55–59 °C for 10 seconds (read from
  the guide's curves);
- 51 °C for 1 minute.

For any material it gives 48 °C for 10 minutes and 43 °C for 8 hours. The
instrument's "can burn skin" note appears from 51 °C, the 1-minute figure for
metal. Below that it says where the temperature is measured and nothing more.
The 1 W part's 46 °C is under the 1-minute figure, but it is not harmless: it
is above the 8-hour figure.

The 1/4 W part at 57 °C is inside its rating and above 51 °C. A rating tells
you how much heat the part can take without damage. It does not tell you
whether the part is cool enough to touch.

Now give the 1 W part its own full rating. Keep 1 W under Resistor and type
`10` in Supply:

- Power: `P = 10² / 100 = 1 W`, with `I = 10 V / 100 Ω = 100 mA`
- Temperature rise: `1 W · 85 °C/W = 85 °C`
- Surface temperature: `25 °C + 85 °C = 110 °C`

The instrument shows 1 W "100 mA through R", a rise of 85 °C, a surface of
110 °C "can burn skin", and Rating used 100 % "of 1 W at 25 °C". Compare that
with the 1/4 W part's 57 °C at its rating. Per watt the 1 W part runs cooler
(85 °C/W against 128 °C/W), but at its rating it takes four times the power,
so it runs hotter. 110 °C is far past the 1-second figure for metal.

The habit that helps is **headroom**: the part of the rating you leave
unused. This course uses a rule of thumb: plan for about half the rating. The
rule is a course convention, not a figure from a datasheet. That is why Rating
used changes colour above 50 %, and again above 100 %. Pick 1/4 W under
Resistor and type `3.5` in Supply:

- Power: `P = 3.5² / 100 = 122.5 mW`, shown as 123 mW
- Rating used: 49 %, under the 50 % line
- Temperature rise: `0.1225 W · 128 °C/W = 15.68 °C`, shown as 16 °C
- Surface temperature: 41 °C

Headroom also keeps the part cooler: 41 °C instead of 57 °C. It leaves room
for the next problem too: hot air.

## Hot air shrinks the rating

A resistor's power rating holds only while the ambient temperature is 70 °C or
below. Above that, the rating falls in a straight line, down to zero at 155 °C.
155 °C is also the top of the part's operating temperature range. This fall
is called **derating**, and the graph of it in a datasheet is the **derating
curve**. Stackpole and Yageo print the same curve for their carbon-film parts.
So lesson 01's 1/4 W really means 1/4 W at 70 °C or below.

Room air is far from 70 °C. Air inside a closed box is not: every warm part in
the box heats the air around the others. Type `5` in Supply and `85` in
Ambient temperature, with the 1/4 W part still selected:

- Derating: `(155 − 85) / 85 = 0.8235` of the rating
- Rating now: `0.25 W · 0.8235 = 205.9 mW`, shown as 206 mW
- Rating used: `250 mW / 205.9 mW = 121.4 %`
- Temperature rise: still 32 °C; surface temperature `85 °C + 32 °C = 117 °C`

Rating used reads 121.4 % "of 206 mW at 85 °C", and the resistor in the drawing
turns the hot colour. The power and the rise did not change. The ambient
temperature moved two things: the starting point of the surface temperature,
and the rating itself.

The 1 W part can take more. Pick 1 W and type `9` in Supply. The power is
`9² / 100 = 810 mW`. The rating at 85 °C is `1 W · 0.8235 = 823.5 mW`, shown
as 824 mW, so Rating used reads 98.4 %. The rise is
`0.81 W · 85 °C/W = 68.85 °C`, shown as 69 °C, and the surface is
`85 °C + 68.85 °C = 153.85 °C`, shown as 154 °C.

That is close to 155 °C. Type `10` in Supply and `70` in Ambient
temperature. The part takes 1 W, its full rating, and rises 85 °C to a
surface of `70 + 85 = 155 °C`, with Rating used at 100 %. Now type `85` in
Ambient temperature: Rating used goes to 121.4 % and the surface reads 170 °C,
"above the part's 155 °C limit". For the 1 W part the numbers line up: at any
ambient temperature above 70 °C, its derated rating is the power that brings
the surface estimate to 155 °C.

The 1/4 W part's rating leaves more room by this estimate. At its rating in
70 °C air its surface is about `70 + 32 = 102 °C` (pick 1/4 W, type `5` in
Supply and `70` in Ambient temperature). By the estimate it would take
`(155 − 70) / 128 = 664 mW` to reach 155 °C. Follow the rating anyway. The
surface is not the hottest point, because the film inside makes the heat. And
your board is not the maker's test mounting, so your part may run hotter than
the curve says.

## Past the rating

:::safety Smoke means stop
Past its rating, a resistor keeps heating. Smoke, a burning smell or a
darkened body mean it is being damaged. It can change value or break open,
scorch the board, and burn you. Switch the supply off or unplug it at once. Do
not touch the part; let it cool. Then work out the power again, and use a part
with a higher rating or change the circuit. Never overload a part on purpose.
:::

Suppose a 220 Ω, 1/4 W resistor sat across 12 V, about what a car's electrical
system runs at. Try it in the instrument, not on the bench. Pick 1/4 W, then
type `12` in Supply, `220` in R and `25` in Ambient temperature:

- Power: `P = 12² / 220 = 654.5 mW`, shown as 655 mW, with
  `I = 12 V / 220 Ω = 54.5 mA`
- Rating used: `0.6545 W / 0.25 W = 261.8 %`

Rating used reads 261.8 % "of 250 mW at 25 °C". Temperature rise and Surface
temperature show `—`, with the note "past its rating: no maker data". The
maker's curve stops at the rating, so the instrument gives no temperature
rather than a guess.

The fix here is the 1 W part. Pick 1 W: Rating used drops to 65.5 %, the rise
is `0.6545 W · 85 °C/W = 55.64 °C`, shown as 56 °C, and the surface is 81 °C,
"can burn skin". The part is now inside its rating, but it still runs hot. Mount
it where nothing touches it.

Lesson 01's last example put 22 V across a 220 Ω, 1/4 W resistor:
`22² / 220 = 2.2 W`. Pick 1/4 W and type `22` in Supply. The instrument shows
2.2 W and Rating used at 880 %. Even the 1 W part is at 220 %. Neither
part can take it. The answer is a larger resistance, a lower voltage, or a part
rated for much more power.

Lesson 02 showed that two equal 1/4 W resistors in parallel can share 1/2 W.
That still holds for the power. But two warm parts side by side heat the air
around each other, so each runs hotter than it would alone. Leave space
between hot parts.

## Where θ comes back

The same `T = Ta + P · θ` gives the temperature of a regulator (module 05) and
of a transistor, a part that switches or controls current (module 03). Their
datasheets give θ for the part. The copper tracks on a circuit board heat up
the same way when current flows through them (module 11).

:::note What comes next
Lesson 07 looks at the resistance inside a battery, which turns power into
heat inside the battery itself. It reads a battery with and without a load,
with lesson 05's meter.
:::
