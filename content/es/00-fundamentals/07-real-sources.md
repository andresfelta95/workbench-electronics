---
slug: fuentes-reales
title: "Fuentes reales: resistencia interna y Thévenin"
summary: Por qué baja la tensión de una pila cuando le conectas una carga, cómo medir con tu multímetro la resistencia que tiene adentro, cuánta potencia puede dar y por qué un divisor de tensión se comporta igual.
minutes: 17
references:
  - id: energizer-ir-bulletin
    note: "La resistencia interna y cómo la miden los fabricantes. Pilas alcalinas nuevas: unos 150 a 300 mΩ, medidos con un consumo de 5 mA y un pulso de 505 mA de 100 ms (p. 1). Una prueba rápida de impedancia a 1000 Hz suele dar menos que este método de continua (p. 1). Tensión con carga = tensión en vacío − resistencia efectiva total · corriente, con el ejemplo 1,6 V − 1,0 A · 0,1 Ω = 1,5 V, que hay que tomar como una guía general (p. 2). Pila AA nueva: unos 0,13 Ω a 20 °C y unos 0,4 Ω a −20 °C, leídos de la curva de la figura 2 (p. 2), valores típicos."
  - id: energizer-lithium-coin-manual
    note: "«The starting IR of AA alkaline batteries is near 0.25 ohms» y «the starting IR of a 2032 battery is near 10 ohms» (la resistencia interna inicial de una AA alcalina ronda los 0,25 Ω y la de una 2032, los 10 Ω). Ejemplo de doble pulso con una 2032 nueva: 3,279 V con un consumo de 1 MΩ, 2,429 V durante un pulso de 50 ms sobre 25 Ω, (3,279 V − 2,429 V) / (0,097 A − 0,000003 A) = 9 Ω. Resistencia interna a lo largo de la vida de la pila: de unos 10 Ω nueva a unos 65 Ω al final, leídos de la curva, valores típicos (todo en la p. 4). Tensión nominal de 3 V (p. 1)."
  - id: energizer-coin-ais
    note: "Pilas de botón: «KEEP OUT OF REACH OF CHILDREN. Swallowing may lead to serious injury or death in as little as 2 hours due to chemical burns and potential perforation of the esophagus» (mantener fuera del alcance de los niños; tragarla puede causar lesiones graves o la muerte en apenas 2 horas, por quemaduras químicas y una posible perforación del esófago). Ver a un médico de inmediato, guardar las pilas en su envase original hasta usarlas y desechar las usadas de inmediato (sección 7, p. 3). Si alguien la traga: no provocar el vómito ni dar comida ni bebida, y buscar atención médica de inmediato (sección 4). Desecharlas según las normas locales (secciones 12 y 13)."
  - id: energizer-alkaline-handbook
    note: "Los aparatos se diseñan para 1,6 V a 0,9 V por pila (p. 3). Resistencia interna de una AA: unos 0,13 Ω nueva, unos 0,2 Ω a mitad de su vida y unos 0,65 Ω al final, leídos de la figura 10 (p. 9), valores típicos. Una pila nueva marca unos 1,5 V sobre unos 10 Ω durante 1 a 2 s (p. 13). Mantener las pilas sueltas lejos de monedas y llaves; un cortocircuito puede hacer que una pila pierda líquido y cause lesiones (p. 14)."
  - id: duracell-mn1500
    note: "AA: impedancia de 120 mΩ a 1 kHz (p. 1). Resistencia en continua de unos 0,09 Ω al principio, que sube a unos 0,30 Ω al final, leída de la curva (p. 2), valores típicos."
  - id: duracell-mn1604
    note: "9 V: unos 9,5 a 9,7 V nueva con cargas livianas (pp. 1–2); 9,6 V es el medio. Impedancia de 1700 mΩ a 1 kHz (p. 1). Resistencia en continua de unos 2,3 Ω al principio, unos 3,1 Ω a la mitad y unos 4,1 Ω al final, leída de la curva (p. 2), valores típicos."
  - id: energizer-nh15-2500
    note: "AA de NiMH: tensión nominal de 1,2 V; resistencia interna de 30 mΩ cargada y 40 mΩ a media carga, ±20 %; impedancia en alterna de 12 mΩ a 1000 Hz (p. 1)."
  - id: energizer-nimh-handbook
    note: "Una pila de NiMH nueva y cargada tiene típicamente menos de 50 mΩ, y su tensión baja rápido de unos 1,4 V a su meseta de 1,2 V (p. 6). Una pila de NiMH en cortocircuito «can generate high currents … sufficient to cause burns or ignition of flammable materials» (puede dar corrientes suficientes para causar quemaduras o encender materiales inflamables) (p. 14)."
  - id: energizer-alkaline-ais-2025
    note: "Alcalinas: un cortocircuito prolongado calienta la pila y puede abrir su válvula de seguridad (sección 7, p. 3)."
  - id: energizer-nimh-ais
    note: "NiMH: un cortocircuito prolongado calienta la pila y puede abrir su válvula de seguridad (sección 7, p. 3)."
  - id: wa-battery-burn-2021
    note: "Las celdas de litio-ion sueltas pueden encenderse si monedas o llaves tocan sus terminales; una celda de vapeador que unas monedas pusieron en cortocircuito en un bolsillo se incendió y causó quemaduras que necesitaron injertos de piel (comunicado del 23 de junio de 2021)."
  - id: fluke-80v-manual
    note: "Fluke 87V, el multímetro de la lección 05: 10 MΩ de resistencia de entrada en tensión (tabla 18). Caída de tensión típica del amperímetro: 1,8 mV/mA en el borne mA y 0,03 V/A en el borne A, unos 1,8 Ω y 0,03 Ω (tabla 14, p. 48). Fusible de 440 mA en el borne mA (p. 43)."
  - id: kuphaldt-liec
    note: "Volumen I, capítulo 10: el teorema de Thévenin y el teorema de máxima transferencia de potencia (la carga toma la mayor potencia cuando es igual a la resistencia de Thévenin, y la máxima transferencia de potencia no es la máxima eficiencia). Gratis en línea, en inglés."
  - id: mit-6002-2007
    note: "Clase 3, «Superposition, Thévenin and Norton»: para leer más, en inglés."
  - id: horowitz-hill-2015
    note: "Referencia general; no se cita una página."
  - id: openstax-fisica-u2-es
    note: "Sección 10.1, «Resistencia interna y voltaje de los terminales»: la tensión en los terminales es la tensión en vacío menos I · r, y baja cuando sube la corriente."
  - id: hyperphysics-es
    note: "Página «Teorema de Thevenin»: cualquier red de pilas y resistores con dos terminales se comporta como una fuente y un resistor en serie; la tensión es la tensión en vacío y la resistencia es esa tensión dividida por la corriente de cortocircuito. Página «Fuentes de Voltaje y de Corriente»: una fuente real es una fuente ideal con una resistencia en serie."
---

Supón que tu multímetro marca 1,6 V sobre una pila AA nueva. Conectas un
resistor de 10 Ω entre sus terminales, y la lectura baja a 1,561 V. ¿Adónde
fueron los otros 39 mV?

Las fuentes ideales de la lección 04 mantenían su tensión pasara la corriente
que pasara, y la lección dijo que en una pila real la tensión baja un poco.
Esta lección muestra cuánto, y por qué.

## Una resistencia dentro de la pila

Tres nombres describen una pila real:

- La **tensión en vacío** (Voc) es la tensión entre sus terminales sin nada
  conectado a ellos.
- La **tensión en los terminales** es la tensión entre sus terminales mientras
  alimenta una carga.
- La **resistencia interna** (Rint) es la resistencia que hay dentro de la
  pila y que hace bajar la tensión en los terminales cuando hay carga.

Una pila real se comporta como una fuente ideal en serie con un resistor
pequeño, los dos escondidos dentro de la carcasa. La corriente de la carga
también pasa por Rint, así que, por la ley de Ohm, en Rint caen `I · Rint`. A
los terminales les llega lo que queda:

`V = Voc − I · Rint`

El boletín de Energizer sobre resistencia interna da un ejemplo: 1,6 V en
vacío, 0,1 Ω adentro y 1,0 A. La caída es `1,0 A · 0,1 Ω = 0,1 V`, así que los
terminales dan `1,6 V − 0,1 V = 1,5 V`.

El instrumento escribe la fórmula arriba, con `I · Rint` resaltado. El
recuadro de líneas cortadas del dibujo es la pila; lo que hay dentro es el
modelo. La fuente ideal lleva el símbolo de
pila: una placa larga y delgada y una placa corta y gruesa. La placa larga es
el +. Cuál extremo es el + y cuál el − es la **polaridad** de la pila: el + es
el extremo que está a mayor tensión.

::widget{type="thevenin" source="aa" rload="10"}

Las teclas de «Fuente» eligen la pila: AA es una pila alcalina AA, 9 V la pila
alcalina de 9 V y NiMH una pila AA recargable de NiMH. El instrumento empieza
en la AA, con 1,6 V y 0,25 Ω (Energizer da para una AA nueva unos 0,25 Ω) y
una carga de 10 Ω:

- `0,25 Ω + 10 Ω = 10,25 Ω`, así que `I = 1,6 V / 10,25 Ω = 156 mA`
- Adentro se pierden `156 mA · 0,25 Ω = 39 mV`, así que
  `V = 1,6 V − 39 mV = 1,561 V`
- `P = I² · R` (lección 01), con la corriente sin redondear: 244 mW en la carga
  y 6,09 mW en Rint

«Tensión en los terminales» marca 1,561 V, «caen 39 mV dentro»; «Corriente de
carga», 156 mA; «Potencia en la carga», 244 mW. «Calor interno» marca 6,09 mW:
el calor dentro de la propia pila que anunció la lección 06.

Ahora apaga el interruptor «Carga». No circula corriente, así que no se pierde
nada adentro, y «Tensión en los terminales» marca 1,6 V, «en vacío».

Esa es la bajada de la lección 04: 39 mV con 10 Ω. Vuelve a encender «Carga» y
escribe `100` en «Carga»: la pila pierde 3,99 mV y marca 1,596 V. Con `1k`
pierde 400 µV, y con cuatro cifras vuelve a marcar 1,6 V.

El manual de pilas alcalinas de Energizer prueba una pila nueva con unos 10 Ω
durante 1 a 2 segundos y espera unos 1,5 V. El modelo da 1,561 V; las pilas
reales se apartan un poco. Una pila de 9 V baja de la misma forma: presiona
9 V con la carga en 10 Ω, y marca 7,805 V en lugar de 9,6 V.

:::key
Con carga, la tensión en los terminales de una pila baja `I · Rint`, e
`I² · Rint` se convierte en calor dentro de la pila.
:::

## Medirla con tu multímetro

Puedes hallar Rint con el multímetro de la lección 05 y un resistor.

:::safety Nunca pongas una pila en cortocircuito
Un cable, una moneda, unas llaves o un multímetro en su borne de corriente
entre los terminales de una pila son un cortocircuito (lección 05). Entonces
solo la resistencia interna limita la corriente: según el modelo, unos 6 A en
una AA nueva, más en una más nueva todavía (12 A con 0,13 Ω) y unos 40 A en
una AA de NiMH. Son valores calculados, no medidos. La pila y el cable se
calientan. Un cortocircuito prolongado puede abrir la válvula de seguridad de
la pila, una pequeña válvula que deja salir gas, y un cortocircuito puede hacer
que la pila pierda líquido, lo que puede lastimarte. Energizer advierte que
una pila de NiMH en cortocircuito da corrientes suficientes para causar
quemaduras o encender materiales inflamables. Nunca conectes nada directamente
entre los terminales de una pila para ver cuánto da: calcula la corriente como
`Voc / Rint` y usa los resistores de carga de abajo. Mantén las pilas sueltas
lejos de monedas y llaves. Los terminales de una pila de 9 V están uno al lado
del otro, así que una sola moneda puede unirlos.
:::

Tomas dos lecturas de tensión, con el multímetro en tensión continua y las
puntas en los terminales de la propia pila:

1. Sin nada conectado, lee la tensión en vacío: 1,6 V.
2. Conecta un resistor de 10 Ω y 1 W entre los terminales de la pila y vuelve
   a leer en pocos segundos: 1,561 V. Después desconéctalo.

La propia prueba de Energizer mantiene la carga solo 1 a 2 segundos. Deja el
resistor donde nada lo toque (lección 06), y desconéctalo antes de volver a
leer la tensión en vacío. Recibe 244 mW, un cuarto de su potencia nominal, lo
que deja el margen de la lección 06. En el instrumento, «Carga» apagada es la
lectura 1 y «Carga» encendida, la lectura 2.

La ley de Ohm sobre el resistor conocido da la corriente, así que no necesitas
amperímetro:

- `I = 1,561 V / 10 Ω = 156 mA`
- `Rint = (Voc − V) / I`
- `1,6 V − 1,561 V = 0,039 V`, y `0,039 V / 0,156 A = 0,25 Ω`

Necesitas un multímetro que muestre cuatro cifras. Con tres, la lectura con
carga es 1,56 V y el resultado es `0,04 V / 0,156 A`, o sea 0,256 Ω.

Los 10 MΩ del multímetro no cambian nada aquí. Según la regla de la lección
05, son cuarenta millones de veces los 0,25 Ω de la pila, así que la lectura
sale un 0,0000025 % baja.

**Una pila de 9 V** usa un resistor de 220 Ω y 1 W. La 9 V del instrumento usa
9,6 V, el medio de los 9,5 a 9,7 V que da Duracell para una nueva, y 2,3 Ω.
Presiona 9 V y escribe `220` en «Carga»:

- `V = 9,6 V · 220 / 222,3`, que da 9,501 V
- `I = 9,501 V / 220 Ω`, que da 43,2 mA; el resistor recibe 410 mW
- `9,6 V − 9,501 V = 0,099 V`, y `0,099 V / 0,0432 A = 2,29 Ω`

Eso se acerca a los 2,3 Ω del instrumento; la última cifra de la lectura lo
limita. Una AA de NiMH con 10 Ω le da 143 mW a su resistor. El error del
propio resistor también cuenta: su valor real puede apartarse del marcado en
su tolerancia, por ejemplo un 5 % (módulo 01), y eso da hasta un 5 % de error
en Rint.

La **corriente de cortocircuito** (Isc) es la corriente que una fuente haría
pasar por un simple cable puesto entre sus terminales. Se calcula y nunca se
mide: `Isc = Voc / Rint`, `1,6 V / 0,25 Ω = 6,4 A` para la AA y
`9,6 V / 2,3 Ω = 4,17 A` para la 9 V. El instrumento la muestra debajo de
«Corriente de carga»: «en cortocircuito: 6,4 A (calculada)».

Los valores del instrumento son los de una pila nueva típica a temperatura
ambiente, medida con un escalón de continua: una carga que se conecta un
momento, como en tus lecturas. Los valores reales cambian con:

- **El método.** La prueba rápida de los fabricantes usa corriente alterna,
  que cambia de sentido muchas veces por segundo (módulo 02), y da menos:
  120 mΩ para la AA de Duracell, 1,7 Ω para su 9 V, y 12 mΩ frente a 30 mΩ
  para la AA de NiMH de Energizer.
- **La carga eléctrica que le queda.** Una AA va de unos 0,13 Ω nueva a unos
  0,2 Ω a mitad de su vida y unos 0,65 Ω al final; una 9 V, de unos 2,3 Ω a
  unos 3,1 Ω y 4,1 Ω; una AA de NiMH, de 30 mΩ a 40 mΩ a media carga.
- **El frío.** Una AA nueva tiene unos 0,13 Ω a 20 °C y unos 0,4 Ω a
  −20 °C.
- **El fabricante.** Los valores de una AA nueva van de unos 0,09 Ω (curva de
  Duracell) a 0,25 Ω (Energizer).

Los valores leídos de curvas son aproximados y típicos. Voc también cambia:
los aparatos se diseñan para 1,6 V a 0,9 V por pila alcalina, y una pila de
NiMH baja rápido de unos 1,4 V recién cargada a los 1,2 V que mantiene durante
casi todo su uso. El instrumento mantiene fijas Voc y Rint, y Energizer dice
que la fórmula es una guía general, no un valor preciso.

## ¿Cuánta potencia puede dar?

Debajo del dibujo, el gráfico muestra la potencia en la carga según la
resistencia de la carga. Su eje horizontal es una **escala logarítmica**: cada
paso igual multiplica la resistencia por diez, de 10 mΩ a 10 kΩ. El marcador
relleno es la carga actual. El marcador hueco es el pico, «máx. 2,56 W» para la
AA.

Presiona AA, escribe `10` en «Carga» y arrastra «Carga» hacia abajo: el
marcador relleno sube hasta el pico, donde la carga es igual a Rint, y baja por
el otro lado.

Una carga diez veces mayor que Rint y una diez veces menor reciben la misma
potencia: escribe `2,5` y después `0,025`, y las dos dan 846 mW. Eso vale para
cualquier factor, así que en este eje la curva es su propia imagen en un
espejo puesto en `RL = Rint`, y tiene su pico sobre la línea del espejo. La
potencia del pico es:

`Pmax = Voc² / (4 · Rint)`

Para la AA, `1,6² / (4 · 0,25) = 2,56 W`. Esto es la **máxima transferencia de
potencia**: una fuente le da a su carga la mayor potencia cuando la
resistencia de la carga es igual a la resistencia interna de la fuente.

Escribe `0,25` en «Carga». Esto es solo una simulación: 0,25 Ω en una AA es
casi un cortocircuito.

- `I = 1,6 V / 0,5 Ω = 3,2 A`, la mitad de la corriente de cortocircuito
- `V = 800 mV`, la mitad de la tensión en vacío
- `P = 3,2² · 0,25 = 2,56 W` en la carga, y 2,56 W dentro de la pila

El marcador relleno queda sobre el hueco. El modelo predice estos vatios;
ningún fabricante especifica una AA para 3,2 A.

«Calor interno» también marca 2,56 W, con una eficiencia del 50 %. La
**eficiencia** es la parte de la potencia de la fuente que llega a la carga:

`eficiencia = potencia en la carga / (potencia en la carga + calor interno)`

Por RL y por
Rint pasa una sola corriente, así que, por `P = I² · R`, la potencia se reparte
en la proporción de sus resistencias. En el pico son iguales, así que la mitad
calienta la fuente. La máxima transferencia de potencia no es la máxima
eficiencia. Las pilas trabajan muy a la derecha del pico: con 10 Ω, la AA
funciona al 97,6 %. El pico importa donde la resistencia de una fuente es fija
y su potencia pequeña, como en una salida de audífonos (módulo 08).

Más tensión no significa más potencia. Deja la carga en 10 Ω y presiona cada
tecla:

- **AA:** 1,6 V, 0,25 Ω. Máximo de 2,56 W, corriente de cortocircuito de
  6,4 A. Con 10 Ω: 1,561 V, 244 mW.
- **9 V:** 9,6 V, 2,3 Ω. Máximo de 10 W, corriente de cortocircuito de
  4,17 A. Con 10 Ω: 7,805 V, 6,09 W.
- **NiMH:** 1,2 V, 30 mΩ. Máximo de 12 W, corriente de cortocircuito de 40 A.
  Con 10 Ω: 1,196 V, 143 mW.

Con 10 Ω, la pila de 9 V da 6,09 W, el 60,8 % de su máximo (1,4 W de calor
interno, eficiencia del 81,3 %); la de NiMH da 143 mW, el 1,2 % de su máximo.
Pero con su propia carga de máxima potencia, la pila de 1,2 V puede dar 12 W,
frente a los 10 W de la de 9 V. Son predicciones del modelo, no valores del
fabricante: los 12 W necesitan 20 A. Lo que una fuente puede dar depende de
`Voc² / Rint`; lo que da de verdad depende de la carga. Un aparato que toma
poca corriente recibe más de la pila de 9 V. Uno que toma amperios, como un
motor, puede recibir más de la pila de baja resistencia.

:::safety Mantén las pilas de botón lejos de los niños
Una **pila de botón** es una pila pequeña, plana y redonda, como la pila de
litio CR2032 de 3 V. Un niño se la puede tragar. La hoja de seguridad de
Energizer advierte que tragarla puede causar lesiones graves o la muerte en
apenas 2 horas, por quemaduras químicas y una posible perforación del esófago
(el tubo que lleva la comida al estómago). Guarda las pilas de botón, nuevas y
usadas, fuera del alcance de los niños, y deja las nuevas en su envase hasta
usarlas. Desecha una usada de inmediato, según las normas de tu lugar, en vez
de dejarla suelta. Si un niño pudo haberse tragado una, busca atención médica
de inmediato; la hoja dice que no lo hagas vomitar ni le des comida ni bebida.
Esta lección usa la pila de botón solo en el instrumento: no la midas, no le
conectes una carga ni la abras en la mesa de trabajo.
:::

La cuarta tecla, CR2032, es esa pila de botón, solo en el instrumento. Usa
3,2 V y 10 Ω (Energizer da para una nueva unos 10 Ω). Presiona CR2032 con la
carga en 10 Ω.

Con «Carga» apagada marca 3,2 V. `Isc = 3,2 V / 10 Ω`, que da 320 mA, y
`Pmax = 3,2² / 40 = 256 mW`. Con «Carga» encendida, `I = 3,2 V / 20 Ω = 160 mA`
y `V = 1,6 V`: la mitad de la tensión se pierde adentro. «Potencia en la
carga» marca 256 mW con una eficiencia del 50 %: esta carga común de 10 Ω queda
en el pico de la pila de botón.

Los mismos 10 Ω le quitaron 39 mV a la AA. Con `100`, la pila de botón marca
2,909 V y pierde 291 mV, donde la AA pierde 3,99 mV; da 29,1 mA y 84,6 mW (el
33,1 % de su máximo, con una eficiencia del 90,9 %). Tiene el doble de tensión
que la AA, pero la vigésima parte de su corriente de cortocircuito y la décima
parte de su potencia máxima, porque su resistencia es cuarenta veces mayor.

El manual de pilas de botón de Energizer muestra lo mismo. Una 2032 nueva marcó
3,279 V con solo una carga de 1 MΩ, y 2,429 V durante un **pulso**, una carga
conectada por un tiempo corto: 50 ms sobre 25 Ω, unos 97 mA. Así,
`3,279 V − 2,429 V = 0,85 V`, y `0,85 V / 0,097 A = 9 Ω` (8,76 Ω antes de
redondear). Escribe `25`
en «Carga»: 2,286 V y 91,4 mA. El fabricante mide con pulsos cortos, no con una
carga fija.

Rint también sube con el uso, de unos 10 Ω a unos 65 Ω cerca del final de la
vida de la pila (leído de la curva del manual, valores típicos). Escribe `65`
en «Resistencia interna», lo que elige «Libre», y `100` en «Carga»: 1,939 V, y
una corriente de cortocircuito de 49,2 mA. Aquí Voc se queda en 3,2 V para
mostrar solo la resistencia; en una pila gastada, la tensión en vacío también
es menor.

Una pila de botón sirve para circuitos que toman muy poca corriente, donde
`I · Rint` se mantiene pequeño: con 1 mA, sus 10 Ω le quitan solo 10 mV.

## Más allá del pico

A la izquierda del pico, la carga es menor que Rint. La corriente sigue
subiendo, la carga recibe menos potencia y queda más calor en la fuente que el
que llega a la carga: «Calor interno» toma el color de advertencia, y Rint, el
de sobrecalentamiento. El extremo izquierdo de la curva es donde estaría un
cortocircuito.

:::safety Una celda de litio-ion en cortocircuito puede incendiarse
Las celdas de litio-ion (Li-ion), las de los teléfonos, los vapeadores
(cigarrillos electrónicos) y las baterías externas, pueden incendiarse o
explotar si unas llaves o monedas tocan sus terminales. El organismo de
seguridad eléctrica de Australia Occidental informó de una celda de vapeador
suelta que unas monedas pusieron en cortocircuito en un bolsillo: se incendió,
y las quemaduras necesitaron injertos de piel. Este curso nunca usa celdas de
Li-ion sueltas. Usa una batería externa USB (power bank), con sus celdas
cerradas adentro, o una celda protegida con una placa cargadora ya armada
(lección 04). Nunca lleves celdas sueltas en un bolsillo o un bolso con
objetos de metal.
:::

Presiona 9 V y escribe `1` en «Carga», solo en el instrumento:

- `I = 9,6 V / 3,3 Ω = 2,91 A`
- `V = 9,6 V · 1 / 3,3`, que da 2,909 V: se pierden 6,69 V adentro
- Potencia en la carga de 8,46 W, el 84,5 % del máximo de 10 W
- Calor interno de 19,5 W, eficiencia del 30,3 %

Son predicciones del modelo, no valores para los que esté especificada una pila de
9 V real.

La lección 05 dijo que una pila de 9 V empujaría hasta 5 A por los 1,8 Ω del
borne mA y 300 A por los 0,03 Ω del borne A, menos en la práctica por la
resistencia propia de la pila. Escribe `1,8` en «Carga»:
`9,6 V / 4,1 Ω = 2,34 A`. Escribe `0,03`: `9,6 V / 2,33 Ω = 4,12 A` (sin
contar los cables). Siguen siendo amperios, más de cinco veces el fusible de
440 mA. Nunca lo pruebes; el instrumento lo calcula.

Un cortocircuito real puede ser mayor de lo que dice el instrumento. La curva
de Energizer da para una AA nueva unos 0,13 Ω: presiona AA y escribe `0,13` en
«Resistencia interna» (elige «Libre»). Isc pasa a 12,3 A y el máximo a 4,92 W.

## Dos terminales cualesquiera: Thévenin

Visto desde dos terminales, cualquier circuito de fuentes y resistores se
comporta como una fuente ideal detrás de un resistor: su **equivalente de
Thévenin**. La tensión de la fuente es la **tensión de Thévenin** (Vth), la
tensión en vacío entre esos terminales. El resistor es la **resistencia de
Thévenin** (Rth), igual a `Vth / Isc`. La Voc y la Rint de una pila son su Vth
y su Rth.

Un divisor de tensión también tiene dos terminales: la salida y tierra. Su Vth
es la salida en vacío de la lección 03, `Vin · R2 / (R1 + R2)`. Su Rth es la
impedancia de salida de la lección 03, R1 en paralelo con R2,
`R1 · R2 / (R1 + R2)`. Impedancia de salida y resistencia de Thévenin son dos
nombres para lo mismo.

::widget{type="thevenin" source="divider" vin="9" r1="10k" r2="10k" rload="10k"}

Este instrumento empieza en «Divisor» con el circuito de la lección 03: 9 V,
dos resistores de 10 kΩ y una carga de 10 kΩ. El recuadro contiene el divisor,
con Vth y Rth al lado:

- `Vth = 9 V · 10 / 20`, que da 4,5 V
- `Rth = 10 kΩ · 10 kΩ / 20 kΩ`, que da 5 kΩ
- `V = 4,5 V · 10 / 15 = 3 V`, el número de la lección 03
- `I = 3 V / 10 kΩ = 300 µA`, y `P = 3 V · 300 µA = 900 µW`

«Salida» marca 3 V, «caen 1,5 V dentro»; «Corriente de carga», 300 µA, «en
cortocircuito: 900 µA (calculada)»; «Potencia en la carga», 900 µW, el 88,9 %
de su máximo de 1,01 mW. Escribe `5k` en «Carga» para llegar al pico: 2,25 V,
450 µA, 1,01 mW. Apaga el interruptor «Carga» y «Salida» marca 4,5 V, el valor
en vacío de la lección 03.

Una fuente de 4,5 V detrás de 5 kΩ, el dibujo del primer instrumento con otros
valores, da los mismos números: `4,5 V / 15 kΩ = 300 µA`, y
`300 µA · 10 kΩ = 3 V`.

Pero el equivalente no te dice el calor de adentro. Sus 5 kΩ convertirían
`(300 µA)² · 5 kΩ = 450 µW` en calor, mientras que R1 y R2 convierten en
realidad 4,5 mW, diez veces más. Por eso esta lectura es «Calor en R1 y R2»,
calculada con el divisor real: 4,5 mW con una eficiencia del 16,7 %, 5,06 mW
en el pico y 4,05 mW sin carga (el «Desperdiciado en el divisor» de la lección
03). El equivalente describe lo que ve la carga, no lo que pasa adentro.

Escribe `100` en R1 y en R2 con la carga en `10k`: Rth es de 50 Ω, «Salida»
marca los 4,48 V de la lección 03 y la carga toma 2 mW, el 2 % de un máximo de
101 mW, porque la regla de diez veces de la lección 03 deja la carga de un
divisor firme muy a la derecha de su pico. El efecto de carga del multímetro
en la lección 05 también era esta misma fuente, con un voltímetro de 10 MΩ
como carga, que marcaba un 0,05 % por debajo.

:::key
Visto desde dos terminales, cualquier circuito de fuentes y resistores se
comporta como una tensión, Vth, detrás de una resistencia, Rth. Con carga, su
tensión baja `I · Rth`, y da la mayor potencia a una carga igual a Rth.
:::

:::note Lo que viene ahora
El módulo 00 termina aquí. El módulo 01 empieza con los resistores reales. Sus
valores tampoco son exactamente los marcados (la tolerancia), y esa es una de
las razones por las que la Rint que mides es solo aproximada.
:::
