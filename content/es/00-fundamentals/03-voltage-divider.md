---
slug: divisor-de-tension
title: El divisor de tensión, y qué le hace la carga
summary: Cómo dos resistores dan una tensión más baja, y por qué la salida cae cuando le conectas algo.
minutes: 12
---

Quieres que un microcontrolador mida una batería de 12 V, pero su entrada solo
lee de 0 a 3,3 V. Un **microcontrolador** es una computadora pequeña en un solo
chip, como la de una placa Arduino. Su **ADC** (conversor analógico-digital) es
la parte que mide una tensión y la convierte en un número.

Dos resistores lo resuelven. Su fórmula tiene una condición: solo vale mientras
nada tome corriente del punto que hay entre ellos.

## El divisor ideal

Un **divisor de tensión** son dos resistores en serie conectados a una fuente.
R₁ va de la fuente al punto del medio, y R₂ del punto del medio a tierra. La
**salida** es el punto del medio, medido desde tierra. V_entrada es la tensión
que aplicas, y V_salida es la tensión en la salida:

`V_salida = V_entrada × R₂ / (R₁ + R₂)`

Deducirla lleva una línea. Los resistores están en serie, así que por los dos
pasa la misma corriente (la ley de corrientes de Kirchhoff, que la próxima
lección explica a fondo):

`I = V_entrada / (R₁ + R₂)`

Esa corriente a través de R₂ produce una tensión sobre él, y esa tensión es la
salida:

`V_salida = I × R₂ = V_entrada × R₂ / (R₁ + R₂)`

O sea, la salida es la entrada multiplicada por la parte que R₂ representa de
la resistencia total. Dos resistores iguales dan la mitad de la entrada, sea
cual sea su valor: 1 kΩ y 1 kΩ dividen entre dos, y 1 MΩ y 1 MΩ también.

Un **potenciómetro** es un divisor que puedes ajustar: una perilla desliza el
punto del medio a lo largo de un resistor. La perilla de volumen de una guitarra
eléctrica es uno.

## Qué pasa cuando le conectas algo

Una **carga** es lo que conectas a la salida para usar su tensión: la entrada
de un ADC, una placa de sensor, un motor pequeño. Sin nada conectado, el
divisor está **en vacío**. En el instrumento de abajo, el interruptor «Carga»
empieza apagado y dice «Ninguna», y la fórmula se cumple. Enciéndelo y mira
cómo cae la salida y cómo la fórmula de la parte de arriba del instrumento pasa
a la forma con carga.

::widget{type="divider" vin="9" r1="10k" r2="10k"}

Con los valores iniciales (9 V, dos resistores de 10 kΩ y una carga de 10 kΩ),
la salida cae de 4,5 V a 3 V. No se rompió nada. La carga es otro resistor, y
conectarla sobre R₂ la pone en paralelo con R₂. La mitad de abajo del divisor
ahora tiene menos resistencia que el R₂ que dibujaste.

R_carga es la resistencia de la carga, y `∥` significa «en paralelo con», así
que R₂ ∥ R_carga es `(R₂ × R_carga) / (R₂ + R_carga)`. El instrumento lo
escribe `R2||RL`. La forma con carga es:

`V_salida = V_entrada × (R₂ ∥ R_carga) / (R₁ + (R₂ ∥ R_carga))`

Ahora prueba otros valores con la misma proporción. Un divisor de
10 kΩ / 10 kΩ y uno de 100 Ω / 100 Ω dan los dos 4,5 V en vacío. Con una carga
de 10 kΩ, el primero cae a 3 V, un tercio menos. El segundo solo cae a 4,48 V.

La proporción entre R₁ y R₂ fija la tensión. Su tamaño fija cuánto cae con una
carga: un divisor de resistores más pequeños cae menos. Un divisor que mantiene
bien su tensión con carga se llama **firme**.

:::key
Mantén los resistores del divisor al menos diez veces por debajo de la
resistencia de la carga, y la salida queda a menos de un 10 % de su valor en
vacío. Para un 1 %, cien veces por debajo. El precio: los resistores más
pequeños toman más corriente de la fuente todo el tiempo y la convierten en
calor.
:::

A 9 V, la lectura «Desperdiciado en el divisor» marca 4,05 mW para la pareja de
10 kΩ y 405 mW para la de 100 Ω.

## Impedancia de salida: un número para la caída

El instrumento llama **impedancia de salida** al número que fija la caída.
**Impedancia** es la palabra general para cuánto se opone algo al paso de la
corriente. En **continua** (corriente continua, CC o DC: circula en un solo
sentido y se mantiene estable, como la de una pila) y solo con resistores, la
impedancia es simplemente la resistencia. En esta lección puedes leerla como
resistencia.

La impedancia de salida se comporta como un resistor escondido dentro de la
salida. En un divisor es R₁ en paralelo con R₂, porque, vistos desde la salida,
cada uno llega a una tensión fija (la fuente o tierra). Así, un divisor de
10 kΩ / 10 kΩ tiene 5 kΩ. La salida con carga es la salida en vacío
multiplicada por `R_carga / (Z_salida + R_carga)`, donde Z_salida es la
impedancia de salida. Una carga de 10 kΩ da `4,5 V × 10 / 15 = 3 V`, como
mostró el instrumento. Una carga de 5 kΩ deja la salida en la mitad, y una de
500 kΩ la baja alrededor de un 1 %.

Toda entrada tiene una **impedancia de entrada**: la resistencia que le
presenta a lo que la alimenta. Una impedancia de entrada alta toma poca
corriente. Un circuito puede alimentar bien a otro cuando la impedancia de
entrada del segundo es mucho mayor que la impedancia de salida del primero.
Vale la misma regla de diez veces. Los 10 MΩ de un multímetro son dos mil
veces una salida de 5 kΩ, así que casi no cambian la lectura. La pastilla de
una guitarra es la pieza bajo las cuerdas que convierte su vibración en una
tensión. Tiene una impedancia de salida alta, así que los amplificadores de
guitarra suelen tener una impedancia de entrada de alrededor de 1 MΩ.

## Dónde el divisor es la respuesta correcta

**Leer una tensión demasiado alta para tu microcontrolador.** La batería de
12 V de un auto no siempre está a 12 V. Marca unos 11 V cuando está casi
descargada y alimentando una carga, y hasta unos 14,4 V mientras el motor la
recarga (valores típicos).
La electrónica del propio auto suele leer esa tensión con un divisor como este.
Para probarlo tú, alimenta el divisor con una **fuente de laboratorio** (una
fuente de alimentación con una perilla que fija su tensión de salida) puesta en
cualquier valor entre 11 V y 14,4 V, no con una batería de auto. El divisor
tiene que mantener incluso 14,4 V por debajo de 3,3 V. Dos valores estándar de
la lista E12, R₁ = 10 kΩ y R₂ = 2,7 kΩ, lo logran:

- A 14,4 V: `14,4 V × 2,7 / 12,7 = 3,06 V`
- A 11 V: `11 V × 2,7 / 12,7 = 2,34 V`
- La salida queda por debajo de 3,3 V hasta `3,3 V × 12,7 / 2,7 = 15,5 V`.

El ADC casi no toma corriente, pero necesita una impedancia de salida baja
detrás. En cada lectura llena un **condensador** diminuto que tiene adentro (una
pieza que almacena un poco de carga eléctrica), y una impedancia alta lo llena
demasiado despacio. La **hoja de datos** del ATmega328P, el microcontrolador de
un Arduino Uno, pide 10 kΩ o menos. (La hoja de datos es el documento del
fabricante con lo que hace una pieza y sus límites.) El Uno hace funcionar este
chip a 5 V, así que su entrada lee hasta 5 V. El límite de 10 kΩ es el mismo
cuando el chip funciona a 3,3 V. Este divisor tiene
`10 kΩ ∥ 2,7 kΩ = 2,13 kΩ`, muy por debajo de ese límite.

**Fijar una referencia o un umbral.** Una **referencia** es una tensión fija con
la que otro circuito compara. Un **umbral** es la tensión a la que algo cambia
de estado. Un indicador de batería baja puede usar un **comparador**, un chip
que indica cuál de dos tensiones es mayor. Con él compara la tensión de la
batería, reducida con un divisor, con una referencia. Las entradas de un
comparador toman muy poca corriente, así que no producen efecto de carga sobre
el divisor.

**Leer un sensor resistivo.** Un **sensor resistivo** cambia su resistencia
según lo que mide. Un **termistor** es un resistor cuyo valor cambia con la
temperatura, como el de muchos termostatos digitales. Con un termistor como R₁
y un resistor fijo como R₂, la salida sigue a la temperatura. El módulo 10
empieza aquí.

## Dónde el divisor es la respuesta equivocada

**Alimentar cualquier cosa.** Un error común de principiante: un divisor de
12 V a 5 V para hacer funcionar una placa pequeña, como una placa wifi.
Supón que consume 100 mA. No puede funcionar. Para aguantar 100 mA, los
resistores tendrían que ser de unos 10 Ω. Convertirían varios vatios en calor
sin parar, y aun así la salida se movería cada vez que cambiara el
**consumo** de la placa (la corriente que toma). Ese es el trabajo de un
**regulador**, una pieza que mantiene fija su tensión de salida tome la carga
la corriente que tome. El módulo 05 trata los reguladores. El cargador USB de
un auto saca 5 V de los 12 V con un regulador, no con un divisor.

**Cualquier cosa cuya corriente cambie.** Incluso a corrientes bajas, si el
consumo de la carga cambia, tu tensión de referencia se mueve con él.

:::warning Un divisor no aísla
Un divisor no da **aislamiento**: nada separa su salida de su entrada, así que
no protege lo que le conectas. Si la entrada sube, la salida sube en la misma
proporción. El divisor de la batería de arriba convierte 14,4 V en 3,06 V.
Conéctalo por error a 24 V y la salida es de 5,1 V, más de lo que soporta una
entrada de 3,3 V.
:::

## Predice antes de arrastrar

Antes de tocar los controles de arriba, decide cuál va a ser la salida y
después compruébalo. Fuente de 9 V, R₁ = 10 kΩ, R₂ = 4,7 kΩ, con una carga de
10 kΩ.

En vacío, la salida sería `9 V × 4,7 / 14,7 = 2,88 V`. La carga de 10 kΩ en
paralelo con 4,7 kΩ da 3,20 kΩ, así que la salida real es
`9 V × 3,20 / 13,20 = 2,18 V`. La lectura «Error» muestra que está un 24,2 %
por debajo. Si ese divisor alimentara un ADC que lee una batería, la lectura
saldría casi una cuarta parte más baja.

Lo que sigue: las leyes de Kirchhoff, para los circuitos que las reglas de
serie y paralelo no pueden reducir.
