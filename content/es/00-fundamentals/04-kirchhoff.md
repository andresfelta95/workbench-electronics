---
slug: leyes-de-kirchhoff
title: Las leyes de Kirchhoff
summary: "En cada nodo entra tanta corriente como sale, y alrededor de cada lazo las tensiones suman cero: dos reglas que resuelven circuitos que serie y paralelo no pueden."
minutes: 11
---

Un auto con el motor en marcha tiene dos fuentes conectadas a los mismos
cables. Una es la batería. La otra es el **alternador**, un generador que el
motor hace girar para producir electricidad. Las dos alimentan las luces, la
radio y todo lo demás que funciona con el sistema de 12 V del auto. ¿La batería
ayuda a mantener encendidas las luces, o el alternador está cargando la
batería? Depende de las dos tensiones.

Las reglas de serie y paralelo de la lección 02 no responden esa pregunta. Con
una fuente en cada uno de dos caminos, ningún resistor queda del todo en serie
ni del todo en paralelo con otro. Las leyes de Kirchhoff sí la responden, y
sirven para cualquier circuito de fuentes y resistores.

## Nodos, ramas y lazos

Un **nodo** es un punto donde se conectan dos o más piezas (lección 02). Todo el
cable que las une cuenta como un solo nodo, y algunos libros lo llaman
**unión**. En el instrumento de abajo, el nodo A es donde se juntan R1, R2 y
R3. La tierra también es un nodo.

Una **rama** es un camino entre dos nodos que no se divide en el trayecto, así
que por todas sus piezas pasa una sola corriente. Este circuito tiene tres
ramas de A a tierra: V1 con R1, R2 solo, y V2 con R3.

Un **lazo** es cualquier recorrido por el circuito que termina donde empezó.
Muchos libros llaman **malla** a un lazo que no encierra a otro, como estos;
este curso dice lazo, igual que el instrumento. El instrumento revisa dos: el
lazo izquierdo, por V1, R1 y R2, y el derecho, por V2, R3 y R2.

## ¿Hacia dónde va la corriente?

Una pila tiene dos **terminales**, los extremos donde conectas los cables,
marcados + y −. Los esquemas dibujan la corriente saliendo de la fuente por su
terminal + y volviendo a entrar por el −. Es el **sentido convencional de la
corriente**: el sentido en que se movería una carga eléctrica positiva. En un
cable de cobre, las cargas que se mueven son electrones, que avanzan al revés,
pero las cuentas dan lo mismo.

En un circuito como este, muchas veces no sabes hacia dónde va una corriente
hasta que lo resuelves. Por eso eliges un sentido para cada corriente, dibujas
una flecha y lo mantienes. Esa elección es tu **convención de signos**. Si un
resultado sale negativo, la corriente circula contra tu flecha, y el valor
sigue siendo correcto.

El instrumento escribe su convención debajo de los controles, y sus flechas
muestran el sentido real. V1 y V2 son fuentes ideales, que mantienen su tensión
pase la corriente que pase. En una pila real, la tensión baja un poco, como
muestra una lección posterior.

::widget{type="kirchhoff" v1="9" v2="6" r1="1k" r2="1k" r3="1k"}

## La ley de corrientes: lo que entra, sale

La **ley de corrientes de Kirchhoff** (LCK) dice que en cualquier nodo la
corriente que entra es igual a la que sale. La carga eléctrica no se acumula en
un nodo ni aparece de la nada.

Un hub USB sin adaptador de corriente propio es un nodo que puedes tener en la
mano. La corriente del cable que llega de la computadora es igual a la suma de
las que dan sus puertos, más lo poco que consume su propio chip. En el
instrumento, la lectura «LCK en A» suma `I1 + I3 - I2`. Cambia cualquier
control y sigue en 0 A.

## La ley de tensiones: alrededor de un lazo, suman cero

La **ley de tensiones de Kirchhoff** (LVK) dice que si recorres cualquier lazo
y sumas las tensiones, el total es cero. Lo que sube es igual a lo que baja.
Muchos libros la llaman ley de voltajes de Kirchhoff, y de ahí viene la sigla
LVK que usa el instrumento. Cada tensión lleva un signo según cómo pasas por la
pieza:

- **Por una fuente, de − a +**, ganas su tensión: +V.
- **Por un resistor, en el mismo sentido que su corriente**, pierdes su caída
  de tensión: −I × R.
- **Por un resistor, contra su corriente**, la ganas: +I × R.

El circuito del LED de la lección 01 es un solo lazo. El puerto USB da una
subida de 5 V, en el LED caen unos 2,0 V y en el resistor 3,0 V:
`5 V − 2,0 V − 3,0 V = 0`.

:::key
En cualquier nodo, la corriente que entra es igual a la que sale. Alrededor de
cualquier lazo, las tensiones suman cero.
:::

La fórmula de la parte de arriba del instrumento, `ΣI = 0, ΣV = 0`, resume las
dos leyes: Σ (la letra griega sigma) significa «la suma de todas las», cada una
con su signo.

## Un ejemplo resuelto: la tensión en A

Llama V_A a la tensión en A, medida desde tierra. Cuando la conoces, la ley de
Ohm te da todas las corrientes. R1 tiene `9 V − V_A` entre sus extremos, R3
tiene `6 V − V_A` y R2 tiene V_A:

- `I1 = (9 V − V_A) / 1 kΩ`
- `I3 = (6 V − V_A) / 1 kΩ`
- `I2 = V_A / 1 kΩ`

La LCK en A dice `I1 + I3 = I2`. Todos los resistores son de 1 kΩ, así que
multiplicas los dos lados por 1 kΩ y la resistencia desaparece:

`(9 V − V_A) + (6 V − V_A) = V_A`

Eso da `15 V = 3 × V_A`, así que `V_A = 5 V`. Como 1 V sobre 1 kΩ hace circular
1 mA, las corrientes son I1 = 4 mA, I3 = 1 mA e I2 = 5 mA. El instrumento
muestra lo mismo: «entra 5 mA = sale 5 mA».

La LVK comprueba el resultado. El lazo izquierdo sube 9 V por V1, baja 4 V en
R1 (4 mA × 1 kΩ) y baja 5 V en R2: `9 V - 4 V - 5 V`, que da 0 V. El lazo
derecho da `6 V - 1 V - 5 V`, también 0 V.

## Cuando una fuente tiene que absorber energía

La potencia de una fuente es su tensión por la corriente que sale de su
terminal +. Si da positiva, la fuente **entrega** energía. Si en cambio la
corriente entra a la fuerza por su terminal +, la potencia es negativa y la
fuente **absorbe** energía. Una batería que absorbe energía se está cargando.

Escribe 3 en la casilla de V2. V_A baja a 4 V, e I3 marca −1 mA, «de A hacia
V2»: circula contra su flecha y entra en V2 por su terminal +. «Potencia V2»
marca −3 mW, «absorbiendo (se está cargando)». El lazo derecho marca
`3 V + 1 V - 4 V`: ahora el 1 V de R3 es una subida, porque el lazo pasa por R3
contra la corriente real.

Así carga un auto su batería. Con el motor en marcha, el alternador mantiene el
sistema eléctrico a unos 14 V. La batería sola está a unos 12,6 V (valores
típicos de una batería de auto de 12 V), así que el alternador empuja
corriente hacia el terminal + de la batería.

:::safety Nunca fuerces corriente dentro de una pila que no está hecha para eso
Una pila alcalina común, como una AA o una de 9 V, no es recargable. Forzar
corriente dentro de ella, desde un cargador o desde una pila más nueva al lado,
puede hacer que se caliente, que pierda líquido corrosivo o que reviente. No
conectes pilas sueltas en paralelo, y no mezcles en un mismo portapilas pilas
nuevas con usadas ni de distinto tipo. Carga las pilas recargables de NiMH
(níquel-metal hidruro) solo en un cargador hecho para ellas. Las celdas de
litio-ion (Li-ion), las de los teléfonos, se cargan solo con una placa
cargadora ya armada, nunca con un circuito que armes tú. Usa solo una celda
protegida: una con un pequeño circuito interno que la desconecta si se
sobrecarga, si se descarga demasiado o si sus terminales + y − quedan unidos
directamente. Prueba la inversión en el instrumento, no con pilas reales.
:::

## Predice antes de probar

Entre 3 V y 6 V hay un valor de V2 en el que I3 vale cero, así que V2 ni
entrega ni absorbe. Con V1 en 9 V y los tres resistores en 1 kΩ, calcula ese
valor antes de probarlo.

Si no pasa corriente por R3, no hay tensión entre sus extremos, así que V_A es
igual a V2. Con R3 sin corriente, V1, R1 y R2 forman un divisor de tensión
como los de la lección 03: `V_A = 9 V × 1 kΩ / 2 kΩ = 4,5 V`. Así que V2 tiene
que valer 4,5 V. Escribe 4,5 en la casilla de V2: I3 marca 0 A, «sin
corriente». Por encima de 4,5 V, V2 ayuda a alimentar a R2. Por debajo, V1
carga a V2.

## Ya usaste estas leyes

La regla de la serie de la lección 02 es la LCK: un nodo con solo dos piezas
tiene una corriente que entra y la misma corriente que sale. El divisor de la
lección 03 usó las dos leyes: la LCK dio una sola corriente en R₁ y R₂, y la
LVK dio `V_entrada = I × R₁ + I × R₂`.

:::note Lo que viene ahora
La próxima lección es el multímetro. Medir la tensión entre los extremos de una
pieza es un paso de un lazo de la LVK. Medir una corriente obliga a poner el
multímetro en serie, así que, por la LCK, toda la corriente de la rama pasa por
él.
:::
