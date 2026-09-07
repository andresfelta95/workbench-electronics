---
slug: ley-de-ohm
title: La ley de Ohm
summary: La única ecuación sobre la que está construido todo el campo, y la imagen física que la vuelve obvia en vez de memorizada.
minutes: 9
---

Tres magnitudes describen lo que ocurre en cualquier punto de un circuito, y una
ecuación las ata entre sí. Casi todo lo demás en electrónica es esta misma ley
aplicada en un sitio menos evidente.

## Las tres magnitudes

La **corriente** es el flujo de carga que pasa por un punto, y se mide en
**amperios (A)**. Un amperio es un culombio de carga por segundo: unos
6,24 × 10¹⁸ electrones pasando de largo. La corriente es lo que *hace* cosas:
calienta una resistencia, gira un motor, enciende un LED.

La **tensión** es la diferencia de potencial eléctrico entre dos puntos, y se
mide en **voltios (V)**. Es el empuje. La palabra «diferencia» es la que todo el
mundo se salta, y es justo la que importa: un punto suelto de un circuito no
tiene tensión propia. Solo tiene tensión *respecto a otro sitio*, y por eso todos
los esquemáticos de esta web llevan un símbolo de masa: ese es el «otro sitio»
contra el que se mide todo.

La **resistencia** es cuánto se opone un material a ese flujo, y se mide en
**ohmios (Ω)**.

## La ley

En una resistencia, las tres están encadenadas:

`V = I × R`

Y despejada según haga falta: `I = V / R` y `R = V / I`.

Mueve los controles de abajo. Dos de las tres las pones tú; la tercera no tiene
opinión al respecto.

::widget{type="ohm-law" v="9" r="470"}

Lee la ley en voz alta en cada dirección y deja de ser una ecuación que
memorizar:

- **Sube la tensión sobre una resistencia fija y circula más corriente.**
  Empujas más fuerte, se mueve más.
- **Sube la resistencia a tensión fija y circula menos corriente.** El mismo
  empuje contra un camino más estrecho.
- **Fuerza una corriente conocida por una resistencia y aparece una tensión
  sobre ella.** Esta tercera lectura es la que casi nadie interioriza al
  principio, y es la que vas a usar sin parar: así funciona toda resistencia de
  medida de corriente, toda resistencia limitadora de LED y todo pull-up.

## Potencia: a dónde va la energía

Una corriente atravesando una resistencia disipa energía en forma de calor. Ese
ritmo es la **potencia**, medida en **vatios (W)**:

`P = V × I`

Sustituyendo la ley de Ohm salen las dos formas que de verdad vas a usar:

`P = I² × R` y `P = V² / R`

El instrumento de arriba muestra las tres. Fíjate en cómo se comporta la
potencia: va con el *cuadrado* de la corriente. Si duplicas la corriente por una
resistencia no se calienta el doble: se calienta cuatro veces más. Por eso un
componente que trabaja templado a 1 A puede desaparecer en una nube de humo a
2 A, y por eso «funcionaba en el banco» no es lo mismo que «funciona».

:::key
Toda resistencia real tiene una potencia nominal: normalmente 1/4 W en las de
inserción de un kit de iniciación, y a menudo solo 1/10 W en un encapsulado SMD
pequeño. `P = I² × R` no es un ejercicio académico. Es la cuenta que te dice si
la pieza que elegiste sobrevive.
:::

## La analogía hidráulica, y dónde miente

La imagen de siempre: la tensión es la presión del agua, la corriente es el
caudal, la resistencia es un estrechamiento de la tubería. Es un buen primer
modelo. La diferencia de presión provoca caudal, un estrechamiento lo reduce, y
la analogía te lleva entero hasta el final de este módulo.

Dónde se rompe conviene saberlo pronto, porque la analogía enseña en voz baja dos
cosas falsas:

- **No hay carga que «se gaste».** El agua sale del grifo y se va. Los electrones
  no se consumen: vuelven exactamente los mismos a la fuente que salieron de
  ella. Lo que se consume es *energía*, no carga. Un circuito es siempre un lazo
  cerrado, y si no puedes trazar el camino de vuelta hasta el punto de partida,
  el circuito no funciona.
- **Los electrones son lentos; el efecto no.** Un electrón individual se desplaza
  por el cobre a bastante menos de un milímetro por segundo. La *señal* se
  propaga a una fracción grande de la velocidad de la luz, porque el empuje se
  transmite por el campo y no lo transporta ningún electrón concreto. En este
  módulo la diferencia da igual. En el módulo de PCB es exactamente el motivo de
  que existan los caminos de retorno y la impedancia.

## Un ejemplo resuelto

Una fuente de 5 V alimenta un LED con una resistencia de 220 Ω en serie. El LED
cae unos 2,0 V, así que la resistencia se queda con el resto:

- Tensión en la resistencia: `5 V − 2,0 V = 3,0 V`
- Corriente: `I = 3,0 V / 220 Ω = 13,6 mA`
- Potencia en la resistencia: `P = 3,0 V × 13,6 mA = 41 mW`

41 mW frente a una pieza de 250 mW: holgado. Ahora repite la cuenta con una
fuente de 24 V y la misma resistencia de 220 Ω: la corriente sube a 100 mA y la
resistencia está disipando 2,2 W. Es una pieza de 1/4 W. No lo va a ser mucho
tiempo.

:::note Lo que viene ahora
Ya tienes una resistencia. Los circuitos reales tienen muchas, y la siguiente
lección son las dos reglas para colapsar cualquier montón de ellas en un solo
número.
:::
