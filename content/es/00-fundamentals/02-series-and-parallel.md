---
slug: serie-y-paralelo
title: Serie y paralelo
summary: Dos reglas que reducen cualquier grupo de resistores a un solo valor, y por qué conectar algo cambia un circuito.
minutes: 9
---

Necesitas un resistor de 15 kΩ y tu kit no lo tiene. La «k» significa kilo-,
mil, así que 15 kΩ son 15 000 Ω. Puedes armar ese valor con resistores que sí
tienes, cuando sabes cómo se combinan.

Las piezas se conectan de dos formas básicas: en serie y en paralelo. Cada
forma tiene una regla que reduce un grupo de resistores a una sola
**resistencia equivalente**: la resistencia única que tomaría de la misma
fuente la misma corriente. Cuando el grupo es un solo valor, la ley de Ohm se
le aplica directamente.

## Serie: un solo camino

Dos piezas están **en serie** cuando se conectan una tras otra en un solo
camino. Toda la corriente que pasa por una tiene que pasar por la siguiente,
porque no tiene otro lugar adonde ir. Así que por todas las piezas de una
cadena en serie pasa la misma corriente.

`R_total = R₁ + R₂ + R₃ + …`

La tensión de la fuente se reparte entre los resistores, y el más grande se
lleva la parte más grande. Uno de 1 kΩ y otro de 9 kΩ en serie sobre 10 V se
quedan con 1 V y 9 V. La próxima lección parte de aquí.

Las dos pilas AA de un control remoto están en serie: 1,5 V más 1,5 V dan 3 V,
y por las dos pasa la misma corriente. El LED y su resistor de la lección
anterior también estaban en serie.

## Paralelo: más de un camino

Dos piezas están **en paralelo** cuando sus dos extremos se conectan a los
mismos dos puntos. Cada camino separado se llama **rama**. Todas las ramas
tienen la misma tensión, y la corriente se reparte entre ellas. La rama de
menor resistencia se lleva la parte más grande de la corriente.

`1 / R_total = 1 / R₁ + 1 / R₂ + …`

Para dos resistores, este atajo es más cómodo:

`R_total = (R₁ × R₂) / (R₁ + R₂)`

Los faros de un auto van conectados en paralelo al sistema de 12 V. Cada uno
recibe los 12 V completos, y si se quema uno, el otro sigue encendido.

## De dónde salen las reglas

Las dos reglas salen de otras dos más generales, las **leyes de Kirchhoff**.
Usan dos palabras nuevas. Un **nodo** es un punto donde se conectan dos o más
piezas. Todo el cable que las une cuenta como un solo nodo, y algunos libros lo
llaman unión. Un **lazo** es cualquier recorrido por el circuito que termina
donde empezó.

- **La ley de corrientes:** la corriente que entra en un nodo es igual a la que
  sale. La carga eléctrica no se acumula ni desaparece en un nodo.
- **La ley de tensiones:** las tensiones alrededor de cualquier lazo suman
  cero. Lo que sube la tensión en la fuente es igual a la suma de lo que
  baja en las piezas.

Que la corriente sea la misma en toda una cadena en serie es la ley de
corrientes en acción. Que la tensión sea la misma en todas las ramas en
paralelo es la ley de tensiones. Las leyes de Kirchhoff tienen su propia
lección más adelante en este módulo, para los circuitos que las reglas de serie
y paralelo no pueden reducir.

Arma un grupo de resistores abajo. Usa «Conexión» para pasar de serie a
paralelo, y observa la resistencia equivalente, la corriente de cada rama y la
potencia en cada resistor. Empieza con 1 kΩ y 4,7 kΩ en serie, que suman
5,7 kΩ y toman 1,58 mA de la fuente de 9 V.

::widget{type="resistor-network" supply="9"}

## Dos comprobaciones rápidas

- **El total en serie siempre es mayor que el mayor de los resistores.** Le
  pusiste más obstáculos al único camino.
- **El total en paralelo siempre es menor que el menor de ellos.** Agregaste
  otro camino, así que pasa más corriente con el mismo empuje.

Si tu resultado rompe cualquiera de las dos, la cuenta está mal. En el
instrumento, pasa la pareja inicial a «Paralelo»: el total baja a 825 Ω, por
debajo del menor, de 1 kΩ. Dos resistores iguales en paralelo dan la mitad del
valor de uno. Este caso te lo vas a encontrar a menudo.

:::key
Diez resistores de 1 kΩ en paralelo dan 100 Ω. Cien dan 10 Ω. En paralelo se
suman las conductancias, no las resistencias. La **conductancia** es la
facilidad con que pasa la corriente: `G = 1/R`, medida en siemens (S). Cada
resistor de 1 kΩ tiene 0,001 S, así que diez tienen 0,01 S, que son 100 Ω.
:::

## Dónde vas a usar estas reglas

**Conseguir un valor que no tienes.** Los resistores se venden en listas
estándar de valores. La lista E12 tiene 12 valores por cada factor de diez: 10,
12, 15, 18, 22, 27, 33, 39, 47, 56, 68 y 82, y después 100, 120, etc. Los
valores de un kit suelen salir de ella. Supón que necesitas 15 kΩ y en tu
cajón solo hay de 10 kΩ y de 33 kΩ. Dos de 10 kΩ en paralelo dan 5 kΩ. Un
tercero de 10 kΩ en serie con esa pareja lleva el total a 15 kΩ.

**Repartir el calor.** Dos resistores de 1 Ω en paralelo dan 0,5 Ω, y cada uno
lleva la mitad de la corriente. Como `P = I² × R`, cada uno convierte
`(I/2)² × 1 Ω = I²/4` en calor. Un solo resistor de 0,5 Ω con toda la
corriente convertiría `I² × 0,5 Ω = I²/2` en calor. Así que cada resistor de la
pareja se lleva la *mitad* del calor de la pieza única a la que reemplaza. Es
un recurso común cuando la potencia nominal de un resistor no alcanza: dos
resistores iguales de 1/4 W en paralelo pueden repartirse 1/2 W.

## Conectar un multímetro agrega un camino en paralelo

Cuando conectas cualquier cosa entre dos nodos, la pones en paralelo con lo
que ya hay entre esos nodos, aunque no lo busques.

Un **multímetro** es el medidor de mano que mide voltios, amperios y ohmios.
Cuando mide tensión, pone su propia resistencia entre sus dos puntas (los
cables que tocas contra el circuito). Es su **resistencia de entrada**, y un
multímetro típico tiene 10 MΩ. La «M» significa mega-, un millón, así que
10 MΩ son diez millones de ohmios.

Sobre un resistor de 1 kΩ, esos 10 MΩ en paralelo cambian la resistencia un
0,01 %, tan poco que no se nota. Sobre un resistor de 1 MΩ la cambian un 9 %,
así que el propio multímetro desvía la lectura. El multímetro tiene su propia
lección más adelante en este módulo, incluido lo que le hace al circuito que
mide.

Que conectar algo cambie el circuito al que lo conectas se llama **efecto de
carga**. La próxima lección muestra un circuito donde el efecto de carga se
nota mucho: el divisor de tensión.
