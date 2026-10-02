---
slug: ley-de-ohm
title: La ley de Ohm
summary: Cómo se relacionan la tensión, la corriente y la resistencia, y cómo comprobar que un resistor aguanta el calor.
minutes: 10
---

La etiqueta de un cargador de teléfono puede decir «5 V 2 A». El primer número
es la tensión que entrega. El segundo es la corriente máxima que puede dar. Una
ecuación une las dos con una tercera magnitud, la resistencia. La vas a usar en
casi todas las lecciones que siguen.

## Corriente, tensión y resistencia

Un **circuito** es un camino cerrado por el que circula la corriente: sale de
una pila, pasa por las piezas y vuelve a la pila.

La **carga eléctrica** es lo que llevan los electrones. La **corriente** es
carga eléctrica en movimiento: cuánta carga eléctrica pasa por un punto cada
segundo. Se mide en **amperios (A)**. Un amperio es un culombio por segundo, y
un **culombio** es una cantidad fija de carga eléctrica: unos 6,24 × 10¹⁸
electrones.

La corriente que atraviesa una pieza es lo que la hace funcionar. Calienta un
cable, hace girar un motor y enciende un **LED** (diodo emisor de luz): una
pieza pequeña que se ilumina cuando la atraviesa corriente, como la luz de
encendido de muchos cargadores.

La **tensión** (también llamada voltaje) es cuánto empuja la fuente a la carga
eléctrica de un punto a otro. Se mide en **voltios (V)**, y su nombre formal es
diferencia de potencial. La **fuente** es lo que aporta la tensión, como una
pila o un puerto USB. Una **pila** AA (una sola unidad de batería, también
llamada **celda**) da 1,5 V, un puerto USB da 5 V y el sistema eléctrico de un
auto funciona a unos 12 V.

La tensión siempre se mide entre dos puntos. Un punto solo no tiene tensión.
Por eso eliges un punto del circuito y lo llamas 0 V. Ese punto es la
**tierra** (GND), y casi siempre es el negativo de la pila. Cuando una lección
dice «la salida está a 3 V», quiere decir 3 V medidos desde tierra. Un
**esquema**, el dibujo de un circuito con símbolos para las piezas y líneas
para los cables, marca la tierra con un símbolo propio.

La **resistencia** es cuánto se opone algo al paso de la corriente. Se mide en
**ohmios (Ω)**. Un cable largo y delgado tiene más resistencia que uno corto y
grueso. Por eso son tan gruesos los cables que se usan para arrancar un auto
con la batería de otro. Un **resistor** es una pieza fabricada para tener una
resistencia determinada: la pieza pequeña con rayas de colores y dos patas de
alambre que encuentras en cualquier kit de iniciación. En este curso,
«resistor» es la pieza y «resistencia» es la propiedad, medida en ohmios.

La tensión se mide **entre los dos extremos** de una pieza; por eso se habla de
la tensión «sobre» un resistor. La corriente pasa **a través** de él.

## La ley

En un resistor, las tres magnitudes están ligadas:

`V = I × R`

Despejada según lo que necesites: `I = V / R` y `R = V / I`. Un ohmio es la
resistencia en la que 1 V hace circular 1 A.

Pruébalo abajo. En «Calcular», elige la magnitud que quieres que calcule el
instrumento y ajusta las otras dos. Empieza en 9 V y 470 Ω, lo que da 19,1 mA.
La «m» significa mili-, una milésima, así que 19,1 mA (miliamperios) son
0,0191 A.

::widget{type="ohm-law" v="9" r="470"}

La ley dice tres cosas:

- **Más tensión sobre el mismo resistor da más corriente.** Un empuje más
  fuerte mueve más carga eléctrica.
- **Más resistencia con la misma tensión da menos corriente.**
- **Una corriente a través de un resistor produce una tensión sobre él.** Al
  principio casi nadie se fija en esta, pero la vas a usar mucho. La mayoría de
  los medidores USB (las cajitas que se conectan entre el cargador y el cable
  del teléfono) miden la corriente así: miden la tensión sobre un resistor
  diminuto que está en el camino de la corriente, llamado shunt.

## Potencia: adónde va la energía

Cuando la corriente atraviesa una resistencia, esa resistencia convierte
energía eléctrica en calor. A esto se le llama **disipar** la energía. La
rapidez con la que la energía se convierte en calor es la **potencia**, que se
mide en **vatios (W)**:

`P = V × I`

Si metes la ley de Ohm en esta fórmula, salen las dos formas que más vas a
usar:

`P = I² × R` y `P = V² / R`

El cargador del principio puede entregar como máximo `5 V × 2 A = 10 W`. Un
cable de carga que se siente tibio está convirtiendo un poco de esa potencia en
calor, en la resistencia de sus hilos.

La potencia va con el *cuadrado* de la corriente. Si duplicas la corriente por
un resistor, produce cuatro veces más calor. Por eso una pieza que se pone
tibia a 1 A puede quemarse a 2 A.

Toda pieza tiene una **potencia nominal**: la máxima potencia que puede
convertir en calor sin dañarse. Los resistores con patas de alambre de un kit
de iniciación suelen ser de 1/4 W. Los resistores diminutos de montaje
superficial, soldados planos sobre la placa como casi todas las piezas de un
teléfono, suelen ser de 1/10 W. La lectura «Potencia» del instrumento agrega un
aviso cuando el calor pasa de 1/10 W y otro al pasar de 1/4 W.

:::key
Usa `P = I² × R` para comprobar que la potencia en tu resistor queda por debajo
de su potencia nominal.
:::

## La imagen del agua en las tuberías, y sus límites

Una imagen común: la tensión es la presión del agua, la corriente es cuánta
agua circula y la resistencia es un tramo estrecho de tubería. La imagen te
sirve para todo este módulo.

Se equivoca en dos cosas:

- **La carga eléctrica no se gasta.** El agua sale de la llave y se va. Los
  electrones no se consumen: a la pila vuelven tantos electrones como salieron
  de ella. Lo que se gasta es *energía*, no carga eléctrica. Cuando se agotan
  las pilas del control remoto del televisor, se quedaron sin energía, no sin
  electrones. Por eso un circuito tiene que ser un camino cerrado. Si no puedes
  seguir el camino hasta el punto de partida, no circula corriente.
- **Los electrones son lentos, pero el empuje es rápido.** Cada electrón avanza
  por el cobre a bastante menos de un milímetro por segundo. Aun así, una
  linterna se enciende en cuanto aprietas el botón, porque el empuje recorre el
  cable a una fracción grande de la velocidad de la luz. En este módulo la
  diferencia no importa. Vuelve a importar en el módulo 11, sobre placas de
  circuito.

## Un ejemplo resuelto

Los 5 V de un puerto USB encienden un LED rojo a través de un resistor de
220 Ω conectado en línea con él. El resistor fija cuánta corriente le llega al
LED. En un LED rojo caen típicamente unos 2,0 V de los 5 V. Esa es su **caída
de tensión**: la tensión entre los extremos de una pieza mientras la atraviesa
corriente. El resistor se queda con el resto:

- Tensión en el resistor: `5 V − 2,0 V = 3,0 V`
- Corriente: `I = 3,0 V / 220 Ω = 13,6 mA`
- Potencia en el resistor: `P = 3,0 V × 13,6 mA = 40,9 mW`

Un milivatio (mW) es una milésima de vatio. Para comprobar las cuentas, pon el
instrumento en 3 V y 220 Ω. 40,9 mW queda muy por debajo de una potencia
nominal de 1/4 W (250 mW).

Ahora usa el mismo resistor de 220 Ω con una fuente de 24 V. Al resistor le
quedan `24 V − 2,0 V = 22 V`, así que la corriente es `22 V / 220 Ω = 100 mA`, y
el resistor convierte 2,2 W en calor. Eso es casi nueve veces su potencia
nominal de 1/4 W, así que se recalienta y se quema.

:::note Lo que viene ahora
Ya sabes cómo se comporta un resistor. Los circuitos reales tienen muchos. La
próxima lección da las dos reglas para reducir un grupo de resistores a un solo
valor.
:::
