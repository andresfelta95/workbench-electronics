---
name: course-writing
description: Plain-writing rules for the Workbench course. Use when writing, rewriting, translating or reviewing any lesson or _module.md in content/en or content/es. Covers voice, AI tells to remove, defining every term on first use (with glossary.md), real-world examples, lesson structure, Spanish rules and the course invariants that must not break.
---

# Writing Workbench lessons

The reader is a curious beginner with a breadboard, a cheap multimeter and no
electronics vocabulary yet. Write so they can follow every sentence without
looking anything up.

Before you start, read `glossary.md` in this folder. When you finish, update it.

## 1. Voice

Write like a friend who knows electronics, standing next to the reader at the
bench.

- **Short sentences.** Aim for an average under 20 words. Split anything over
  30. One idea per sentence.
- **Common words.** "Use", not "utilise". "Turns into heat", not "dissipates"
  (until you have defined it). "Parts", not "components", if either will do.
- **Active voice and "you".** "You connect a load", not "a load is connected".
  Name who or what does the action: "the resistor turns 41 mW into heat".
- **Present tense.** "The output drops", not "the output will drop".
- **One idea per paragraph.** Most paragraphs are 2 to 5 sentences. A
  one-sentence paragraph is fine.
- **Say the thing; do not announce it.** Cut "Here is the part that matters",
  "It is worth saying plainly", "The rule that changes how you read a
  schematic:". Start with the point itself.
- **Plain verbs.** "Is", not "serves as". "Shows", not "underscores".

## 2. AI tells to remove

These patterns make prose sound generated. Calibrate: one rhetorical move in a
section is fine, and a real contrast the reader needs stays ("charge is not
used up; energy is"). The rule is that **no sentence exists only for rhythm.**
If you delete it and the reader learns nothing less, keep it deleted.

1. **Em-dash chains.** At most one em dash per paragraph. Use a comma, colon,
   parentheses or a full stop.
   - Bad: "conductance — not resistance — is the thing that adds linearly in
     parallel."
   - Good: "In parallel, conductances add. Resistances do not."
2. **"Not X, but Y" and other set-up/pay-off reversals.** State the true thing
   directly.
   - Bad: "Double the current and it does not get twice as hot — it gets four
     times as hot."
   - Good: "Double the current and the resistor makes four times the heat."
3. **Groups of three.** Lists of three parallel phrases written for cadence.
   Keep a list of three only when there really are three things.
   - Bad: "It is the first circuit in every textbook, it appears inside almost
     every other circuit you will ever build, and the standard formula for it
     is only true under a condition…"
   - Good: "You will find this circuit behind a guitar's volume knob. Its
     formula has one catch: it only holds while nothing draws current from the
     output."
4. **Rhetorical setups and staged run-ups.** A sentence whose only job is to
   point at the next one.
   - Bad: "The word 'difference' is the part people skip, and it is the part
     that matters: a single point has no voltage of its own."
   - Good: "Voltage is always measured between two points. One point on its
     own has no voltage."
5. **Inflated words and stakes.** "Crucial", "delve", "robust", "pivotal",
   "the entire story", "the whole question comes down to", "the single most
   common", "predicts everything", "the one equation the whole field is built
   on".
   - Bad: "The whole question of whether two blocks can be connected together
     comes down to comparing those two numbers."
   - Good: "To check whether one circuit can feed another, compare the first
     one's output impedance with the second one's input impedance."
6. **Hedges and signposting.** "It is worth noting", "worth knowing early",
   "Conviene decirlo claro", "Read the law out loud and it stops being an
   equation to memorise".
   - Bad: "Where it breaks down is worth knowing early, because the analogy
     quietly teaches two wrong things:"
   - Good: "The water picture gets two things wrong:"
7. **Summary sentences that repeat the paragraph.** Bad: "This is the
   textbook-correct use." (after the ADC example). Good: delete it.
8. **Bolded aphorisms.** Bold is for a term at the moment you define it, and
   for the lead-in of a list item. Never bold a slogan.
   - Bad: "**The ratio sets the output; the absolute values set how well it
     holds that output.**"
   - Good: "The ratio of R₁ to R₂ sets the voltage. Their size sets how much it
     drops under a load: smaller resistors drop less."
9. **Punchline closers and cute personification.**
   - Bad: "It is a 1/4 W part. It will not be a 1/4 W part for long." /
     "the third has no choice in the matter."
   - Good: "That is almost nine times its 1/4 W rating, so it will overheat and
     fail." / "The instrument works out the third."
10. **Needless intensifiers.** "Exactly", "every", "single", "entire", "just",
    "instantly", "constantly", "comfortably", when the sentence is true without
    them.
    - Bad: "Two equal resistors in parallel give exactly half the value — the
      single most common case, and worth recognising instantly."
    - Good: "Two equal resistors in parallel give half the value of one. You
      will meet this case often."

Do not hunt tells mechanically: a rewrite that only swaps dashes for commas
still sounds generated. Fix the sentence's job, then its punctuation.

## 3. Define every term on first use

Every technical word must be one of these three things at the point the reader
first meets it:

1. **Already defined in an earlier lesson** (check `glossary.md`), or
2. **Defined in the same sentence**, in everyday words, with the formal name or
   definition after it if the course needs it later. Example: "An ADC
   (analog-to-digital converter) is the part of a microcontroller that measures
   a voltage and turns it into a number." Or
3. **Replaced** by a word the reader already has. "Load resistance" instead of
   "load impedance" in a DC lesson; "a small board" instead of "a module" when
   "module" also means a course module.

A forward pointer ("module 05 covers regulators") is fine for a name that only
tells the reader where to go next. It is not fine for a concept the current
lesson relies on. If the lesson's argument needs "regulator", give the
one-line definition here and the pointer as well.

What counts as a term: units and prefixes (mA, kΩ, MΩ), part names (resistor,
LED, thermistor, comparator), circuit words (node, branch, ground, short,
load, supply), measurement words (across, through, voltage drop, current
draw), document words (datasheet, schematic, tolerance, power rating),
abbreviations (DC, ADC, PCB, SMD) and borrowed notation (∥). If a smart
14-year-old would stop at it, it is a term.

**Method.** Before you write, list the terms the lesson will use, in order.
Check each one against `glossary.md`. While you write, define each new one where
it first appears. When you finish, add every newly defined term to
`glossary.md` with the lesson id and the one-line definition you used, in both
languages. Planned terms (marked "to be defined in…") become "defined in…" when
the lesson ships. Every lesson author keeps the glossary current; a reviewer
treats a missing entry as a finding.

Use one name per idea. If a lesson calls it "ground", do not switch to
"0 V rail" or "common" without saying they are the same thing.

## 4. Real examples

Every concept gets at least one concrete place where it shows up in the real
world, in the prose near where the concept is introduced.

- **Prefer things the reader owns or has seen:** a phone charger and USB's 5 V,
  a TV remote with two AA cells in series, a car's 12 V system and its
  headlights wired in parallel, a guitar pedal's volume pot (a voltage
  divider), an Arduino reading a battery through a divider, a thermostat's
  thermistor, a battery-level indicator, a warm phone cable (I²R heating).
- **They must be true.** If you are not sure that a product works the way you
  say, pick a different example. Do not claim a specific product contains a
  specific circuit unless a datasheet, schematic or teardown shows it.
- **No invented numbers.** Use datasheet figures (name the part:
  "the ATmega328P datasheet asks for 10 kΩ or less"), standard figures (USB is
  5 V; an AA alkaline cell is 1.5 V), or say "typical" ("a typical multimeter
  has 10 MΩ of input resistance"). Quantitative claims also need a source in
  `references:` (ROADMAP §3 step 7).
- **Until `references:` exists, source figures in `docs/BIBLIOGRAPHY.md`.**
  ROADMAP A5 (the `references:` front matter and `content/bibliography.yaml`)
  is not built yet. Until it lands, every quantitative claim about a real
  device (a datasheet limit, a battery voltage, a meter's input resistance)
  needs an entry in `docs/BIBLIOGRAPHY.md` whose Modules column names the
  lesson that uses it and the figure, for example `00-04 (12.6 V resting)`,
  and the source goes in that module's row of the module map. List the new
  entries in the PR body. When A5 lands, each entry moves into the
  `references:` of the lessons it names. A figure with no entry is a review
  finding.
- **Stay inside the safety policy.** Examples come from the low-voltage world
  of ROADMAP §3.1. Do not use mains appliances (kettles, wall wiring, dimmers)
  as examples: mentioning mains at all makes a `:::safety` callout mandatory.

## 5. Structure

- **Open with a situation, not a definition dump.** "You want an Arduino to
  read a 12 V battery, but its input only takes 0 to 5 V." Then the idea that
  solves it. Then the formula.
- **One takeaway per lesson.** It should fit in one sentence (ROADMAP §3).
- **Headings say what the section is about.** "Parallel: more than one path",
  not "Everything is in parallel with something".
- **Keep the worked examples.** Show each step with units. Every number in the
  prose must match what the instrument displays, to its displayed precision
  (if the widget shows 2.18 V, the prose says 2.18 V, not 2.2 V or 2.180 V).
  Re-do the arithmetic yourself; do not copy it.
- **Use callouts for what they are for.** `:::key` holds the one rule of thumb
  the reader should keep; `:::note` is an aside or what comes next;
  `:::warning` is a non-safety pitfall; `:::safety` is a hazard (ROADMAP §3.1).
  A callout is not a place for a slogan.
- **Close on the next step** in one or two sentences. No recap of the lesson.

## 6. Spanish (ES)

Write natural, neutral Latin-American technical Spanish. Write the lesson in
Spanish from the same plan; do not translate the English word for word. The
rules above apply in full: plain, short, every term defined on first use.

- **Address:** tú ("conecta", "mides"). No vos, no usted, no vosotros.
- **Neutral LatAm word choice:** agregar (not añadir), computadora (not
  ordenador), tomar (not coger), auto (not coche), "este sitio" (not "esta
  web"), "en otro punto" or "en otro lugar" (not "en otro sitio"). For
  finished actions prefer the simple past ("conectaste"), not the Spain-style
  perfect ("has conectado").
- **Avoid calques.** "El LED cae 2 V" means the LED falls; write "en el LED
  caen unos 2 V". "No tiene opinión al respecto" is not "has no choice".
  "Colapsar una red" → "reducir una red". "Enseña en voz baja" → "enseña sin
  que te des cuenta". "Donde más duele" → "donde más se nota". "Quiere una
  impedancia" (for a chip) → "necesita".
- **Watch words with several meanings.** "Carga" is electric charge, a load and
  the loading effect. Say "carga eléctrica" for charge, "carga" for the load,
  "efecto de carga" for loading. "Resistencia" is both the part and the
  property: make clear which one you mean. "Módulo" is also a course module.
- **Fixed term choices** (record any change in `glossary.md`): tensión (say
  once that it is also called voltaje), tierra (GND) for ground, nodo, rama,
  malla or lazo for a loop (pick one in 00-04 and keep it), hoja de datos,
  impedancia, carga.
- **Numbers:** decimal comma (`4,5 V`, `0,01 %`), a space before the unit,
  units and symbols unchanged (mA, kΩ). Quotation marks «…», as the course
  already uses.
- **Parity:** EN and ES have the same sections, the same callouts with the same
  tones, the same widgets with the same props, and the same numbers.

## 7. Course invariants (do not break)

- **Front matter:** `slug`, `title`, `summary` required; `minutes` optional;
  `references:` when the lesson has sources (once ROADMAP A5 lands; until
  then, use the interim `docs/BIBLIOGRAPHY.md` rule in §4). `_module.md` has
  `slug`, `title`, `summary`.
- **Published ids and slugs never change.** The file name is the id; only the
  slug is translated, and a published slug stays as it is.
- **Widgets:** keep every `::widget{type="…" …}` line exactly as it is unless
  your brief says to change it. Prose that describes a widget control must use
  the label the widget shows (see `src/app/i18n/ui.ts`).
- **Callout syntax:** `:::key`, `:::note`, `:::warning`, `:::safety <title>`,
  each closed with `:::` on its own line.
- **Safety policy (ROADMAP §3.1):** ceilings of ≤ 24 V DC, ≤ 12 V AC from an
  enclosed adapter, ≤ 50 V at any node. Never suggest mains, high stored
  energy or bare Li-ion work. A hypothetical over 50 V or any mention of mains
  needs a `:::safety` callout, so prefer an example inside the ceilings.
- **EN and ES change together** in the same change.
- **Language policy:** Spanish only in `content/es/**` (and the UI strings);
  everything else stays English.

## 8. Self-check before handing back

Run every item for both languages.

- [ ] **Read it aloud.** Any sentence you would not say to a friend at the
      bench gets rewritten. Any sentence you stumble on gets split.
- [ ] **Terms.** Every technical term is in `glossary.md` from an earlier
      lesson, or defined where it first appears. New terms are added to
      `glossary.md` in EN and ES.
- [ ] **Examples.** Each concept has at least one true, real-world example.
- [ ] **Tells.** None of the ten tells in §2 remain without a reason. At most
      one em dash per paragraph. No bolded slogans.
- [ ] **Numbers.** Arithmetic re-done by hand; prose matches the instrument to
      its displayed precision; ES uses decimal commas; every datasheet or
      standard figure has a source (until A5, an entry in
      `docs/BIBLIOGRAPHY.md` that names this lesson; see §4).
- [ ] **Invariants.** Front matter, widget lines, callout syntax and ids
      unchanged; safety policy respected; EN and ES have the same structure.

## Sources

- WP:AISIGNS, https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
  (negative parallelisms, rule of three, em dashes, bold, AI vocabulary,
  section summaries; the signs are symptoms, not a checklist to game).
- blader/humanizer skill, https://github.com/blader/humanizer ("staging instead
  of stating", rhythm by rule, the read-aloud check). The "calibrate, do not
  over-correct" rule in §2 is this skill's own; humanizer's "calibration"
  means matching a sample of the user's own voice.
- US Federal Plain Language Guidelines (2011),
  https://wid.org/wp-content/uploads/2022/03/FederalPLGuidelines.pdf, and
  digital.gov, https://digital.gov/guides/plain-language/writing (about 20
  words a sentence, one idea each, active voice, "you", define terms, examples).
- Google developer style guide, https://developers.google.com/style/jargon and
  https://developers.google.com/style/translation (define jargon at first use;
  one term per idea).
- Guía SAIJ de lenguaje claro (Argentina),
  https://www.argentina.gob.ar/sites/default/files/guia_saij_de_lenguaje_claro.pdf
  (sujeto + verbo + complementos, voz activa, sin tecnicismos innecesarios).
