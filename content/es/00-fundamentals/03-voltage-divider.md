---
slug: divisor-de-tension
title: El divisor de tensión, y qué le hace la carga
summary: El circuito más usado de la electrónica, la fórmula que todo el mundo aprende, y por qué deja de valer en cuanto le conectas algo.
minutes: 12
---

Dos resistencias en serie sobre una fuente, con la salida tomada del punto
central. Es el primer circuito de cualquier libro, aparece dentro de casi
cualquier otro circuito que vayas a montar, y su fórmula estándar solo es cierta
bajo una condición que los libros suelen mencionar una vez y abandonar.

## El divisor ideal

`V_salida = V_entrada × R₂ / (R₁ + R₂)`

La deducción ocupa una línea y merece hacerla una vez en lugar de memorizar el
resultado. Las dos resistencias están en serie, así que las atraviesa la misma
corriente (la ley de corrientes de Kirchhoff, que tiene su propia lección más
adelante en este módulo):

`I = V_entrada / (R₁ + R₂)`

Esa corriente por R₂ produce una tensión sobre ella, y esa tensión *es* la
salida:

`V_salida = I × R₂ = V_entrada × R₂ / (R₁ + R₂)`

O sea, la salida es la entrada escalada por la porción que R₂ representa de la
resistencia total. Dos resistencias iguales dan exactamente la mitad de la
entrada, sea cual sea su valor: 1 kΩ y 1 kΩ dividen entre dos, y 1 MΩ y 1 MΩ
también.

## Qué pasa cuando le conectas algo

Aquí está lo que importa. Pon la carga de abajo en «ninguna» y la fórmula se
cumple exacta. Después conecta una carga y mira cómo se hunde la salida.

::widget{type="divider" vin="9" r1="10k" r2="10k"}

No se ha roto nada. Una carga no es más que otra resistencia, y conectarla sobre
R₂ la pone **en paralelo** con R₂: la regla de la lección anterior. El divisor
sigue siendo un divisor; simplemente no es el divisor que dibujaste:

`V_salida = V_entrada × (R₂ ∥ R_carga) / (R₁ + (R₂ ∥ R_carga))`

Juega con los dos valores manteniendo la misma proporción. Un divisor de
10 kΩ / 10 kΩ y uno de 100 Ω / 100 Ω tienen salidas idénticas en vacío, pero con
una carga de 10 kΩ el primero se desploma y el segundo apenas se mueve. **La
proporción fija la salida; los valores absolutos fijan cuánto aguanta esa
salida.**

:::key
La regla práctica: mantén las resistencias del divisor al menos diez veces *por
debajo* de la impedancia de la carga y el error de carga se queda por debajo de
un 10 %. Para un uno por ciento, cien veces por debajo. Lo que pagas a cambio es
corriente: un divisor más «duro» desperdicia más potencia sin hacer nada.
:::

## Impedancia de salida, sin el álgebra

Existe un nombre para «cuánto se hunde esta salida cuando le saco corriente»:
**impedancia de salida**. En un divisor resulta ser R₁ en paralelo con R₂ —las
dos resistencias vistas desde la salida, tratando la fuente como un cortocircuito
a masa.

Un divisor de 10 kΩ / 10 kΩ tiene 5 kΩ de impedancia de salida. Ese único número
lo predice todo: con una carga de 5 kΩ caerá a la mitad de su valor en vacío, y
con una de 500 kΩ caerá alrededor de un 1 %.

El concepto no se queda en esta lección. Toda fuente de señal en electrónica
tiene una impedancia de salida y toda entrada tiene una impedancia de entrada, y
la pregunta de si dos bloques se pueden conectar entre sí se reduce a comparar
esos dos números.

## Dónde el divisor es la respuesta correcta

**Leer una tensión demasiado alta para tu microcontrolador.** Una batería de
12 V hacia una entrada de ADC de 3,3 V, a través de un divisor que la escala a
3,0 V. El ADC apenas consume corriente continua, pero su condensador de muestreo
quiere una impedancia de fuente por debajo de unos 10 kΩ (la hoja de datos del
ATmega328P pide 10 kΩ o menos). Un divisor de 10 kΩ / 3,3 kΩ tiene unos 2,5 kΩ
de impedancia de salida, holgadamente dentro de ese margen. Este es el uso de
libro.

**Fijar una referencia o un umbral.** Alimentar la entrada de un comparador o el
pin de realimentación de un regulador, que casi no consumen corriente.

**Leer un sensor resistivo.** Un termistor como R₁ y una resistencia fija como R₂
convierten una resistencia en una tensión que el ADC puede leer. Con eso abre
entero el módulo 10, y es un divisor.

## Dónde el divisor es la respuesta equivocada

**Alimentar cualquier cosa.** El error de principiante más repetido: un divisor
de 12 V a 5 V para hacer funcionar un módulo que consume 100 mA. No puede
funcionar. Para aguantar 100 mA de carga las resistencias tendrían que ser de
unos pocos ohmios, con lo que estarían quemando vatios de forma continua en
calor, y aun así la salida se movería con cada cambio de consumo. Para eso existe
un regulador, y es el módulo 05.

**Cualquier cosa que consuma corriente variable.** Incluso a corrientes bajas, si
el consumo de la carga cambia, tu tensión «de referencia» se mueve con él.

:::warning Un divisor no aísla
Conviene decirlo claro: un divisor no proporciona aislamiento ni una protección
en la que se pueda confiar. Si la entrada se va a 100 V, la salida sube
proporcionalmente y lo que haya conectado lo recibe. Escalar una tensión hacia
abajo no es lo mismo que volverla segura.
:::

## Predice antes de arrastrar

La forma más rápida de que esto se fije: antes de tocar los controles de arriba,
decide cuál va a ser la salida y después compruébalo. Fuente de 9 V,
R₁ = 10 kΩ, R₂ = 4,7 kΩ, con una carga de 10 kΩ.

La salida en vacío sería 9 × 4,7/14,7 = 2,88 V. La carga de 10 kΩ en paralelo con
4,7 kΩ da 3,20 kΩ, así que la salida real es 9 × 3,20/13,20 = 2,18 V: un 24 % de
error. Si ese divisor estaba escalando la tensión de una batería hacia un ADC, tu
lectura está equivocada en una cuarta parte, y nada en el circuito parece roto.
