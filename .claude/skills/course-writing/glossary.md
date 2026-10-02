# Course glossary

Every technical term the course uses, in course order, with the lesson that
defines it and the one-line plain definition used there. See `SKILL.md` §3.

**Rules for authors**

- Before writing a lesson, check each term you need. If it is "defined in" an
  earlier lesson, use it freely. If not, define it in your lesson where it
  first appears, or use a simpler word.
- After writing, add every term you defined, with your lesson id and the exact
  plain definition you used, in EN and ES. Change "to be defined in … (planned)"
  to "defined in …" when the lesson ships with the definition.
- Keep one name per idea. If you introduce a synonym, list it in the same row.

**Status values**

- `defined in 00-0N`: the published lesson defines it plainly today.
- `to be defined in 00-0N (planned)`: the lesson uses it but does not define
  it yet (seeded from the 2026-10-01 writing audit), or a future lesson will
  introduce it. The rewrite of that lesson adds the definition.
- `not used yet`: a term an earlier plan expected here, but the lesson now
  avoids it (the row says what it says instead). The first lesson that needs
  the term defines it and updates the row.

**Spanish term decisions (2026-10-01)**

- «resistor» is the part; «resistencia» is the property, measured in ohms.
- «tierra» (GND) for ground, never «masa».
- «carga» is only the load. Electric charge is always «carga eléctrica», and
  loading is «efecto de carga».
- «lazo» for a loop, matching 00-02 and the instruments' labels. «malla» is its
  synonym: 00-04 says once that many books use it, and the course does not.
- Kirchhoff's voltage law is «ley de tensiones de Kirchhoff», abbreviated LVK
  as on the instrument (from «ley de voltajes», a name 00-04 also mentions).
  LTK is not used. The current law is LCK.
- «pila» is a cell (EN "cell"). 00-01 says once that it is also called
  «celda», the word 00-04 uses for Li-ion cells and for «celda protegida».

## 00-01 Ohm's law

| Term (EN) | Término (ES) | Status | Plain definition (EN) | Definición (ES) |
|---|---|---|---|---|
| circuit | circuito | defined in 00-01 | A closed path that current flows around: out of a battery, through the parts and back to the battery. | Un camino cerrado por el que circula la corriente: sale de una pila, pasa por las piezas y vuelve a la pila. |
| electric charge | carga eléctrica | defined in 00-01 | What electrons carry. | Lo que llevan los electrones. |
| current (I) | corriente (I) | defined in 00-01 | Charge on the move: how much charge flows past a point each second. | Carga eléctrica en movimiento: cuánta carga eléctrica pasa por un punto cada segundo. |
| ampere (A), amp | amperio (A) | defined in 00-01 | The unit of current: one coulomb per second. | La unidad de corriente: un culombio por segundo. |
| coulomb (C) | culombio (C) | defined in 00-01 | A fixed amount of charge, about 6.24 × 10¹⁸ electrons. | Una cantidad fija de carga eléctrica: unos 6,24 × 10¹⁸ electrones. |
| LED | LED | defined in 00-01 | Light-emitting diode: a small part that lights up when current flows through it, like the power light on many chargers. | Diodo emisor de luz: una pieza pequeña que se ilumina cuando la atraviesa corriente, como la luz de encendido de muchos cargadores. |
| voltage (V), potential difference | tensión (también llamada voltaje), diferencia de potencial | defined in 00-01 | How hard the supply pushes charge from one point to another; always measured between two points. Its formal name is potential difference. | Cuánto empuja la fuente a la carga eléctrica de un punto a otro; siempre se mide entre dos puntos. Su nombre formal es diferencia de potencial. |
| volt (V) | voltio (V) | defined in 00-01 | The unit of voltage. Examples: an AA cell 1.5 V, USB 5 V, a car about 12 V. | La unidad de tensión. Ejemplos: pila AA 1,5 V, USB 5 V, un auto unos 12 V. |
| cell | pila (también celda) | defined in 00-01 | A single battery unit, such as an AA cell (1.5 V). | Una sola unidad de batería, también llamada celda, como una pila AA (1,5 V). |
| supply, source | fuente | defined in 00-01 | Whatever provides the voltage, such as a battery or a USB port. | Lo que aporta la tensión, como una pila o un puerto USB. |
| ground (GND) | tierra (GND) | defined in 00-01 | The point you pick and call 0 V, usually the battery's negative end; other voltages are measured from it. | El punto que eliges y llamas 0 V, casi siempre el negativo de la pila; las demás tensiones se miden desde él. |
| schematic | esquema | defined in 00-01 | A circuit drawing with symbols for parts and lines for wires. | El dibujo de un circuito con símbolos para las piezas y líneas para los cables. |
| resistance (R) | resistencia (R) | defined in 00-01 | How much something opposes current. | Cuánto se opone algo al paso de la corriente. |
| ohm (Ω) | ohmio (Ω) | defined in 00-01 | The unit of resistance: the resistance that lets 1 V drive 1 A. | La unidad de resistencia: la resistencia en la que 1 V hace circular 1 A. |
| resistor | resistor | defined in 00-01 | A part made to have a set resistance: the small striped part with two wire legs in a beginner's kit. | Una pieza fabricada para tener una resistencia determinada: la pieza pequeña con rayas de colores y dos patas de alambre de un kit de iniciación. |
| across / through | entre los extremos («sobre») / a través de | defined in 00-01 | Voltage is measured across a part, between its two ends; current flows through it. | La tensión se mide entre los dos extremos de una pieza (la tensión «sobre» ella); la corriente pasa a través de ella. |
| milli- (m) | mili- (m) | defined in 00-01 | One thousandth: 19.1 mA (milliamps) = 0.0191 A; a milliwatt (mW) is a thousandth of a watt. | Una milésima: 19,1 mA (miliamperios) = 0,0191 A; un milivatio (mW) es una milésima de vatio. |
| shunt, current-sense resistor | shunt | defined in 00-01 | A tiny resistor in the current's path; the voltage across it gives the current, as in a USB power meter. | Un resistor diminuto en el camino de la corriente; la tensión sobre él da la corriente, como en un medidor USB. |
| dissipate | disipar | defined in 00-01 | To turn electrical energy into heat. | Convertir energía eléctrica en calor. |
| power (P) | potencia (P) | defined in 00-01 | How fast energy turns into heat; P = V × I. Example: a 5 V 2 A charger gives at most 10 W. | La rapidez con la que la energía se convierte en calor; P = V × I. Ejemplo: un cargador de 5 V 2 A entrega como máximo 10 W. |
| watt (W) | vatio (W) | defined in 00-01 | The unit of power. | La unidad de potencia. |
| power rating | potencia nominal | defined in 00-01 | The most power a part can turn into heat without damage: usually 1/4 W for kit resistors, often 1/10 W for small surface-mount ones. | La máxima potencia que una pieza puede convertir en calor sin dañarse: suele ser 1/4 W en los resistores de kit y 1/10 W en los pequeños de montaje superficial. |
| surface-mount | montaje superficial | defined in 00-01 | Tiny parts soldered flat onto a board, like most of the parts in a phone. (The abbreviation SMD is not used yet.) | Piezas diminutas soldadas planas sobre la placa, como casi todas las de un teléfono. (La sigla SMD todavía no se usa.) |
| voltage drop | caída de tensión | defined in 00-01 | The voltage across a part while current flows through it; a red LED typically takes about 2.0 V. | La tensión entre los extremos de una pieza mientras la atraviesa corriente; en un LED rojo caen típicamente unos 2,0 V. |
| current-limiting resistor | resistor limitador (del LED) | not used yet | 00-01 describes it without the name: "a resistor in line with an LED that sets how much current it gets". | 00-01 lo describe sin nombrarlo: «un resistor en línea con un LED que fija cuánta corriente le llega». |
| through-hole | de inserción (through-hole) | not used yet | 00-01 says "resistors with wire legs". Definition for later: parts whose wire legs go through holes in the board. | 00-01 dice «resistores con patas de alambre». Definición futura: piezas cuyas patas atraviesan agujeros de la placa. |
| pull-up resistor | resistor de pull-up | not used yet (dropped from 00-01) | A resistor that holds an input at the supply voltage until something, like a pressed button, pulls it to ground. | Un resistor que mantiene una entrada en la tensión de alimentación hasta que algo, como un botón presionado, la lleva a tierra. |
| signal | señal | not used yet (dropped from 00-01) | A voltage that carries information, like the audio going to your headphones. | Una tensión que lleva información, como el audio que va a tus audífonos. |
| PCB | PCB, placa de circuito impreso | not used yet (00-01 says "module 11, on circuit boards") | Printed circuit board: the board, often green, that holds and connects the parts in almost every device. | Placa de circuito impreso: la placa, a menudo verde, que sostiene y conecta las piezas de casi cualquier aparato. |

## 00-02 Series and parallel

| Term (EN) | Término (ES) | Status | Plain definition (EN) | Definición (ES) |
|---|---|---|---|---|
| kilo- (k) | kilo- (k) | defined in 00-02 | A thousand: 15 kΩ = 15 000 Ω. | Mil: 15 kΩ = 15 000 Ω. |
| equivalent resistance | resistencia equivalente | defined in 00-02 | The single resistor that would take the same current from the same supply as the whole group. | La resistencia única que tomaría de la misma fuente la misma corriente que todo el grupo. |
| network | red | not used yet | 00-02 says "a group of resistors". | 00-02 dice «un grupo de resistores». |
| series | serie | defined in 00-02 | Parts connected end to end on one path, so the same current flows through each, like the two AA cells in a TV remote. | Piezas conectadas una tras otra en un solo camino, así que por todas pasa la misma corriente, como las dos pilas AA de un control remoto. |
| parallel | paralelo | defined in 00-02 | Parts with both ends connected to the same two points, so they share the same voltage, like a car's headlights. | Piezas con sus dos extremos conectados a los mismos dos puntos, así que comparten la misma tensión, como los faros de un auto. |
| branch | rama | defined in 00-02 (formal in 00-04) | Each separate path in a parallel group. | Cada camino separado de un grupo en paralelo. |
| node, junction | nodo, unión | defined in 00-02 (formal in 00-04) | A point where two or more parts connect; all the wire joining them counts as one node. Some books call it a junction. | Un punto donde se conectan dos o más piezas; todo el cable que las une cuenta como un solo nodo. Algunos libros lo llaman unión. |
| loop | lazo (sinónimo: malla) | defined in 00-02 (formal in 00-04) | Any path around a circuit that ends where it started. | Cualquier recorrido por el circuito que termina donde empezó. |
| Kirchhoff's current law (KCL) | ley de corrientes de Kirchhoff (LCK) | defined in 00-02 (brief); full in 00-04 | The current flowing into a node equals the current flowing out. | La corriente que entra en un nodo es igual a la que sale. |
| Kirchhoff's voltage law (KVL) | ley de tensiones de Kirchhoff (LVK) | defined in 00-02 (brief); full in 00-04 | The voltages around any loop add up to zero: the rise across the supply equals the drops across the parts added together. | Las tensiones alrededor de cualquier lazo suman cero: lo que sube la tensión en la fuente es igual a la suma de lo que baja en las piezas. |
| conductance (G), siemens (S) | conductancia (G), siemens (S) | defined in 00-02 | How easily current gets through: G = 1/R, in siemens. In parallel, conductances add. | La facilidad con que pasa la corriente: G = 1/R, en siemens. En paralelo se suman las conductancias. |
| E-series, standard values (E12) | listas de valores normalizados (lista E12) | defined in 00-02 (E12 only; full in 01-01) | The standard lists of values resistors are sold in; E12 has 12 values per factor of ten (10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82). Say "list", not "series", to avoid the clash with "in series". | Las listas estándar de valores en que se venden los resistores; la E12 tiene 12 valores por cada factor de diez (10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82). Se dice «lista», no «serie», para no confundir con «en serie». |
| multimeter | multímetro | defined in 00-02 (one line; full in 00-05) | The handheld meter that measures volts, amps and ohms. | El medidor de mano que mide voltios, amperios y ohmios. |
| probe | punta | defined in 00-02 | The meter leads you touch to the circuit. | Los cables del multímetro que tocas contra el circuito. |
| input resistance (of a meter) | resistencia de entrada | defined in 00-02 | The resistance a meter puts between its two probes when it measures volts; typically 10 MΩ. | La resistencia que el multímetro pone entre sus dos puntas cuando mide tensión; típicamente 10 MΩ. |
| mega- (M) | mega- (M) | defined in 00-02 | A million: 10 MΩ is ten million ohms. | Un millón: 10 MΩ son diez millones de ohmios. |
| loading | efecto de carga | defined in 00-02 | Connecting something changes the circuit you connect it to. | Que conectar algo cambie el circuito al que lo conectas. |

## 00-03 The voltage divider

| Term (EN) | Término (ES) | Status | Plain definition (EN) | Definición (ES) |
|---|---|---|---|---|
| microcontroller | microcontrolador | defined in 00-03 | A small computer on one chip, like the one on an Arduino board. | Una computadora pequeña en un solo chip, como la de una placa Arduino. |
| ADC | ADC, conversor analógico-digital | defined in 00-03 | Analog-to-digital converter: the part of a microcontroller that measures a voltage and turns it into a number. | Conversor analógico-digital: la parte de un microcontrolador que mide una tensión y la convierte en un número. |
| voltage divider | divisor de tensión | defined in 00-03 | Two resistors in series across a supply, with the output taken from the point between them. | Dos resistores en serie conectados a una fuente, con la salida tomada del punto entre ellos. |
| output, V_in, V_out | salida, V_entrada, V_salida | defined in 00-03 | The output is the middle point, measured from ground; V_in is the voltage you feed in and V_out the voltage at the output. | La salida es el punto del medio, medido desde tierra; V_entrada es la tensión que aplicas y V_salida la tensión en la salida. |
| potentiometer | potenciómetro | defined in 00-03 | A divider you can adjust: a knob slides the middle point along one resistor, as in an electric guitar's volume knob. | Un divisor que puedes ajustar: una perilla desliza el punto del medio a lo largo de un resistor, como la perilla de volumen de una guitarra eléctrica. |
| load | carga | defined in 00-03 | Whatever you connect to the output to use its voltage: an ADC input, a sensor board, a small motor. | Lo que conectas a la salida para usar su tensión: la entrada de un ADC, una placa de sensor, un motor pequeño. |
| unloaded | en vacío | defined in 00-03 | With nothing connected to the output. | Sin nada conectado a la salida. |
| ∥ (in parallel with) | ∥ (en paralelo con) | defined in 00-03 | Shorthand for the parallel value: R₂ ∥ R_load = (R₂ × R_load)/(R₂ + R_load). The instrument writes R2\|\|RL. | Abreviatura del valor en paralelo: R₂ ∥ R_carga = (R₂ × R_carga)/(R₂ + R_carga). El instrumento escribe R2\|\|RL. |
| stiff (divider) | firme (divisor) | defined in 00-03 | Holds its voltage well under a load. | Que mantiene bien su tensión con carga. |
| impedance | impedancia | defined in 00-03 | The general word for how much something opposes current; with DC and only resistors it is just resistance, so 00-03 reads it as resistance. Later modules extend it to signals that change. | La palabra general para cuánto se opone algo al paso de la corriente; en continua y solo con resistores es simplemente la resistencia, así que 00-03 la lee como resistencia. Módulos posteriores la amplían a señales que cambian. |
| DC | continua (corriente continua, CC o DC) | defined in 00-03 | Direct current: flows one way and holds steady, as from a battery. | Corriente continua: circula en un solo sentido y se mantiene estable, como la de una pila. |
| output impedance | impedancia de salida | defined in 00-03 (full in 00-07) | Acts like a resistor hidden inside an output; for a divider it is R₁ ∥ R₂. Loaded output = unloaded output × R_load / (Z_out + R_load). | Se comporta como un resistor escondido dentro de una salida; en un divisor es R₁ ∥ R₂. Salida con carga = salida en vacío × R_carga / (Z_salida + R_carga). |
| source impedance | impedancia de fuente | not used yet | 00-03 says "output impedance" (one name per idea). | 00-03 dice «impedancia de salida» (un nombre por idea). |
| input impedance | impedancia de entrada | defined in 00-03 | The resistance an input presents to whatever feeds it; high means it takes little current. A guitar amplifier's is typically about 1 MΩ. | La resistencia que una entrada le presenta a lo que la alimenta; si es alta, toma poca corriente. La de un amplificador de guitarra suele ser de alrededor de 1 MΩ. |
| pickup (guitar) | pastilla | defined in 00-03 | The part under a guitar's strings that turns their movement into a voltage. | La pieza bajo las cuerdas de una guitarra que convierte su vibración en una tensión. |
| short circuit, short | cortocircuito | not used yet | 00-03 explains R₁ ∥ R₂ without it ("each one leads to a fixed voltage, the supply or ground"). Definition for later: a connection with almost no resistance, like a plain wire. | 00-03 explica R₁ ∥ R₂ sin el término. Definición futura: una conexión casi sin resistencia, como un simple cable. |
| bench supply | fuente de laboratorio | defined in 00-03 | A power supply with a knob that sets its output voltage; 00-03 uses one, set from 11 V to 14.4 V, in place of a car battery. | Una fuente de alimentación con una perilla que fija su tensión de salida; 00-03 la usa, puesta entre 11 V y 14,4 V, en lugar de una batería de auto. |
| capacitor | condensador | one line in 00-03; full in 01-02 (planned) | A part that stores a little charge. | Una pieza que almacena un poco de carga eléctrica. |
| sampling capacitor | condensador de muestreo | not used yet | 00-03 says "a tiny capacitor inside the ADC" that it fills for each reading. | 00-03 dice «un condensador diminuto que tiene adentro» el ADC y que llena en cada lectura. |
| datasheet | hoja de datos | defined in 00-03 (full in 01-05) | The maker's document that lists what a part does and its limits. | El documento del fabricante con lo que hace una pieza y sus límites. |
| reference voltage | referencia, tensión de referencia | defined in 00-03 | A fixed voltage that another circuit compares against. | Una tensión fija con la que otro circuito compara. |
| threshold | umbral | defined in 00-03 | The voltage at which something switches. | La tensión a la que algo cambia de estado. |
| comparator | comparador | defined in 00-03 (full in module 04) | A chip that tells you which of two voltages is higher. | Un chip que indica cuál de dos tensiones es mayor. |
| regulator | regulador | defined in 00-03 (full in module 05) | A part that holds its output voltage steady whatever the load takes, like the one in a car USB charger. | Una pieza que mantiene fija su tensión de salida tome la carga la corriente que tome, como la de un cargador USB de auto. |
| feedback pin, adjust pin | pin de realimentación, pin de ajuste | not used yet (LM317 example cut from 00-03) | The pin an adjustable regulator watches to set its output; a divider sets the voltage it aims for. | El pin que vigila un regulador ajustable para fijar su salida; un divisor fija la tensión que busca. |
| resistive sensor | sensor resistivo | defined in 00-03 (full in module 10) | A sensor whose resistance changes with what it measures. | Un sensor cuya resistencia cambia según lo que mide. |
| thermistor | termistor | defined in 00-03 | A resistor whose value changes with temperature, as in many digital thermostats. | Un resistor cuyo valor cambia con la temperatura, como el de muchos termostatos digitales. |
| current draw | consumo (de corriente) | defined in 00-03 | The current a load takes. | La corriente que toma una carga. |
| isolation | aislamiento | defined in 00-03 | Nothing separates a circuit's output from its input, so it does not protect what you connect to it. | Nada separa la salida de un circuito de su entrada, así que no protege lo que le conectas. |

## 00-04 Kirchhoff's laws

| Term (EN) | Término (ES) | Status | Plain definition (EN) | Definición (ES) |
|---|---|---|---|---|
| alternator | alternador | defined in 00-04 | A generator that a car's engine turns to make electricity. | Un generador que el motor del auto hace girar para producir electricidad. |
| node (formal), junction | nodo, unión | defined in 00-04 (first in 00-02) | A point where two or more parts connect; all the wire joining them counts as one node. Ground is a node too. | Un punto donde se conectan dos o más piezas; todo el cable que las une cuenta como un solo nodo. La tierra también es un nodo. |
| branch (formal) | rama | defined in 00-04 (one-line in 00-02) | A path between two nodes that does not split on the way, so one current flows through every part on it. | Un camino entre dos nodos que no se divide en el trayecto, así que por todas sus piezas pasa una sola corriente. |
| loop | lazo (sinónimo: malla) | defined in 00-04 (first in 00-02) | Any path around a circuit that ends where it started. | Cualquier recorrido por el circuito que termina donde empezó. ES decision: «lazo» is the main term, as in 00-02 and the instrument's readouts («LVK lazo izquierdo»); 00-04 says once that many books say «malla» (strictly, a loop that encloses no other). |
| terminal (+ and −) | terminal (+ y −) | defined in 00-04 | The ends of a battery or source that you connect wires to, marked + and −. | Los extremos de una pila o fuente donde conectas los cables, marcados + y −. |
| conventional current direction | sentido convencional de la corriente | defined in 00-04 | Current is drawn leaving a source by its + terminal and coming back in at −: the way a positive charge would move. Electrons in a wire drift the other way. | La corriente se dibuja saliendo de la fuente por su terminal + y volviendo a entrar por el −: el sentido en que se movería una carga eléctrica positiva. Los electrones de un cable avanzan al revés. |
| sign convention, reference direction | convención de signos | defined in 00-04 | The direction you pick for each current before solving and stick to; a negative answer means the current really flows the other way. | El sentido que eliges para cada corriente antes de resolver y que mantienes; un resultado negativo indica que la corriente circula en realidad al revés. |
| ideal source | fuente ideal | defined in 00-04 | A source that holds its voltage whatever current flows through it. Real batteries sag a little (00-07). | Una fuente que mantiene su tensión, pase la corriente que pase por ella. Las pilas reales bajan un poco (00-07). |
| Kirchhoff's current law (KCL) | ley de corrientes de Kirchhoff (LCK) | defined in 00-04 (brief in 00-02) | At any node, the current flowing in equals the current flowing out. | En cualquier nodo, la corriente que entra es igual a la que sale. |
| Kirchhoff's voltage law (KVL) | ley de tensiones de Kirchhoff (LVK; también ley de voltajes de Kirchhoff) | defined in 00-04 (brief in 00-02) | Go around any loop and add up the voltages, each with its sign: the total is zero. The rises equal the drops. | Si recorres cualquier lazo y sumas las tensiones, cada una con su signo, el total es cero. Lo que sube es igual a lo que baja. ES decision: the name is «ley de tensiones»; the abbreviation is LVK because the instrument's readouts use it. LTK is not used. |
| deliver / absorb (a source's power), charging | entregar / absorber (potencia de una fuente), cargar(se) | defined in 00-04 | A source's power is its voltage times the current leaving its + terminal. Positive: it delivers energy. Negative: current is pushed into its + terminal and it absorbs energy; a battery that absorbs energy is being charged, as a car battery is by the alternator. | La potencia de una fuente es su tensión por la corriente que sale de su terminal +. Positiva: entrega energía. Negativa: la corriente entra a la fuerza por su terminal + y absorbe energía; una batería que absorbe energía se está cargando, como la del auto con el alternador. |
| alkaline cell, NiMH, Li-ion | pila alcalina, NiMH, litio-ion (Li-ion) | defined in 00-04 (safety callout) | Alkaline: an ordinary non-rechargeable cell such as an AA or a 9 V battery. NiMH (nickel-metal hydride): rechargeable cells that need a charger made for them. Li-ion (lithium-ion): the cells in phones, charged only by a ready-made charger board, and only as a protected cell. | Alcalina: una pila común no recargable, como una AA o una de 9 V. NiMH (níquel-metal hidruro): pilas recargables que necesitan un cargador hecho para ellas. Li-ion (litio-ion): las celdas de los teléfonos, que se cargan solo con una placa cargadora ya armada, y solo si son celdas protegidas. |
| protected cell | celda protegida | defined in 00-04 (safety callout) | A cell with a small built-in circuit that cuts it off if it is overcharged, run flat or has its + and − terminals joined directly. | Una celda con un pequeño circuito interno que la desconecta si se sobrecarga, si se descarga demasiado o si sus terminales + y − quedan unidos directamente. |
| Σ (sigma) | Σ (sigma) | defined in 00-04 | The Greek letter sigma, meaning "add up all the", each with its sign. The instrument writes the two laws as `ΣI = 0, ΣV = 0`. | La letra griega sigma, que significa «la suma de todas las», cada una con su signo. El instrumento escribe las dos leyes como `ΣI = 0, ΣV = 0`. |
| polarity | polaridad | to be defined in a later lesson (planned; 00-04 does not use the word) | Which end of a part is at the higher voltage, marked + and −. | Qué extremo de una pieza está a mayor tensión, marcado con + y −. |
| V_A (node voltage notation) | V_A | defined in 00-04 | The voltage of node A measured from ground; the instrument shows it as "VA" and "Voltage at A". | La tensión del nodo A medida desde tierra; el instrumento la muestra como «VA» y «Tensión en A». |

## Later lessons (planned, from ROADMAP §4)

| Term (EN) | Término (ES) | Status | Plain definition (EN) | Definición (ES) |
|---|---|---|---|---|
| burden voltage | caída de tensión del amperímetro (burden voltage) | to be defined in 00-05 (planned) | The small voltage an ammeter's own shunt takes from the circuit it measures. | La pequeña tensión que el shunt del amperímetro le quita al circuito que mide. |
| measurement category (CAT) | categoría de medición (CAT) | to be defined in 00-05 (planned) | The IEC 61010 rating that says where a meter is safe to use. | La clasificación IEC 61010 que indica dónde es seguro usar un medidor. |
| thermal resistance (θ) | resistencia térmica (θ) | to be defined in 00-06 (planned) | How many degrees a part heats up per watt it turns into heat. | Cuántos grados se calienta una pieza por cada vatio que convierte en calor. |
| internal resistance | resistencia interna | to be defined in 00-07 (planned) | The resistance inside a battery or supply that makes its voltage drop under load. | La resistencia dentro de una pila o fuente que hace caer su tensión con carga. |
| Thévenin equivalent | equivalente de Thévenin | to be defined in 00-07 (planned) | Any network of sources and resistors, seen from two terminals, acts like one voltage source in series with one resistor. | Cualquier red de fuentes y resistencias, vista desde dos terminales, se comporta como una fuente de tensión en serie con una resistencia. |
| tolerance | tolerancia | to be defined in 01-01 (planned) | How far a part's real value may be from the value printed on it, such as ±5 %. | Cuánto puede apartarse el valor real de una pieza del valor marcado, por ejemplo ±5 %. |
