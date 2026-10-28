---
slug: multimetro
title: Cómo usar un multímetro
summary: Mide voltios, amperios y ohmios, y descubre cuánto cambia el propio medidor el circuito que mide.
minutes: 14
references:
  - id: fluke-abc-safety
    note: "Categorías de medición: CAT IV, CAT III, CAT II y la categoría que esta edición llama CAT 0, para equipos electrónicos y protegidos (tabla 1, p. 2). Si las puntas quedan en los bornes de corriente y se ponen sobre una fuente de tensión, hacen un cortocircuito, así que las entradas de corriente deben tener fusible (p. 5)."
  - id: fluke-80v-manual
    note: "Fluke 87V: 10 MΩ de resistencia de entrada en tensión (tabla 18). Caída de tensión típica del amperímetro: 1,8 mV/mA en los rangos de mA, 0,03 V/A en los rangos de A y 100 µV/µA en los rangos de µA (tabla 14, p. 48). Fusibles de 440 mA y 11 A, los dos de 1000 V, rápidos (p. 43). En modo corriente el medidor se comporta como un cortocircuito (pp. 13 y 24)."
  - id: fluke-17x-cal
    note: "Fluke 175/177/179, para comparar: caída de tensión típica de 2 mV/mA y 37 mV/A (p. 5, nota 5); fusibles de 440 mA y 11 A, 1000 V, rápidos (p. 4); más de 10 MΩ de resistencia de entrada en tensión (p. 6)."
  - id: fluke-11x-manual
    note: "Fluke 115/117: más de 10 MΩ en tensión continua; la medición de resistencia usa menos de 2,7 V en circuito abierto y menos de 350 µA (tabla 7). El aviso sonoro de continuidad suena por debajo de 20 Ω (tabla 6, p. 16)."
  - id: horowitz-hill-2015
    note: "Capítulo 1."
  - id: kuphaldt-liec
    note: "Volumen I (corriente continua). Gratis en línea, en inglés."
---

Un divisor de tensión toma corriente de su pila todo el tiempo (lección 03).
Para que una pila de 9 V dure más, armas uno con dos resistores de 10 MΩ. Dos
resistores iguales dan la mitad de la entrada, así que la salida debería ser
4,5 V. Tocas el divisor con las puntas del multímetro y marca 3 V. ¿Está mal
el divisor?

El divisor está bien. Lo cambió el multímetro. Esta lección muestra cómo usar
un multímetro para medir voltios, amperios y ohmios, y cómo saber cuándo el
propio medidor desvía la lectura.

## El multímetro y sus bornes

Un **multímetro** (lección 02) reúne tres medidores en una caja. Como
**voltímetro** mide tensión, como **amperímetro** mide corriente y como
**óhmetro** mide resistencia. El **selector**, una perilla que gira entre
posiciones fijas, elige cuál de los tres es.

Los cables se enchufan en los **bornes**, los conectores del frente del
multímetro. El medidor de ejemplo de esta lección es el Fluke 87V, que tiene
cuatro:

- **COM** (común): aquí va siempre el cable negro.
- **V/Ω**: aquí va el cable rojo para medir tensión, resistencia y continuidad.
- **mA**: aquí va el cable rojo para corrientes pequeñas, hasta 400 mA en el
  87V.
- **A**: aquí va el cable rojo para corrientes más grandes, hasta 10 A.

Cada posición del selector tiene un **rango**: el valor más grande que puede
mostrar. Un multímetro **de rango automático** elige el rango por ti; en otros
lo eliges tú con el selector. Si el valor es demasiado grande para el rango, la
pantalla muestra `OL` (sobrecarga, del inglés «overload») en lugar de un
número. Pasa a un rango mayor, o al borne A si mides una corriente.

:::safety Categorías de medición
Los multímetros se clasifican según la norma IEC 61010, la norma internacional
de seguridad para equipos de medición, por el lugar donde se pueden usar. Cada
clase es una **categoría de medición** (CAT). La guía de seguridad de Fluke
pone en CAT IV la conexión de la compañía eléctrica con un edificio y las
líneas exteriores, en CAT III los tableros de distribución de un edificio y en
CAT II los aparatos enchufados a un tomacorriente. A la categoría más baja la
llama CAT 0: equipos electrónicos y protegidos, sin conexión a la red
eléctrica. El cableado de la red puede llevar **transitorios**, picos breves de
tensión muy por encima de su tensión normal. Un pico puede destruir en tu mano
un multímetro de categoría insuficiente y provocar un **arco**, una chispa que
salta por el aire y quema. Este curso se queda en 24 V de continua o menos, en
electrónica alimentada con pilas o por USB. Aquí nunca uses un multímetro en la
red eléctrica, diga lo que diga la categoría CAT impresa en él. Una categoría
más alta es para trabajos que este curso nunca hace, no un permiso para
intentarlos.
:::

## Medir tensión: entre los extremos, en paralelo

La tensión se mide entre los extremos de una pieza. Pon el cable rojo en el
borne V/Ω y el negro en COM, y gira el selector a tensión continua. Toca un
extremo de la pieza con la punta negra y el otro con la roja. Cada lectura es
un paso de un lazo de la LVK de la lección 04.

La resistencia de entrada del multímetro (lección 02) queda ahora en paralelo
con la pieza. En el Fluke 87V es de 10 MΩ. O sea, el multímetro es una carga,
como las cargas de la lección 03. La impedancia de salida de un divisor es R1
en paralelo con R2, y la lectura sigue la fórmula de la lección 03 con el
multímetro como carga. El instrumento la escribe arriba:

`Vread = Vtrue · Rin / (Zout + Rin)`

Aquí el **valor real** es lo que tiene el circuito sin el multímetro conectado,
y la **lectura** es lo que muestra el multímetro. Rin es la resistencia de
entrada del multímetro y Zout es la impedancia de salida del divisor. El
instrumento muestra los dos valores uno al lado del otro, y «Error» indica
cuánto se aparta la lectura del valor real.

::widget{type="meter-loading" mode="voltage" vin="9" r1="10k" r2="10k" rin="10M"}

**Dos resistores de 10 kΩ.** El valor real es
`9 V · 10 kΩ / 20 kΩ = 4,5 V`. La impedancia de salida es 10 kΩ en paralelo
con 10 kΩ, o sea 5 kΩ. Los 10 MΩ del multímetro son 2000 veces eso, así que la
lectura es `4,5 V · 10 MΩ / 10,005 MΩ = 4,4978 V`. El instrumento muestra una
«Lectura» de 4,5 V, un «Valor real» de 4,5 V y un «Error» de un 0,05 % por
debajo.

**Dos resistores de 10 MΩ.** Escribe `10M` en R1 y en R2. El valor real sigue
siendo 4,5 V, porque la proporción no cambió. La impedancia de salida ahora es
de 5 MΩ, del mismo orden que los 10 MΩ del multímetro. R2 en paralelo con esos
10 MΩ da 5 MΩ, así que la lectura es `9 V · 5 MΩ / (10 MΩ + 5 MΩ) = 3 V`.
«Error» marca un 33,33 % por debajo. Esta es la pregunta del principio. Es la
misma caída de 4,5 V a 3 V que provocó una carga de 10 kΩ en la lección 03,
con resistores mil veces más grandes. Ahora la carga son los 10 MΩ del
multímetro.

La solución es la de la lección 03: resistores más pequeños con la misma
proporción. La pareja de 10 kΩ da los mismos 4,5 V y mide con un error del
0,05 %. El precio es más corriente de la pila.

**Dos resistores de 1 MΩ.** Escribe `1M` en R1 y en R2. La impedancia de
salida es de 500 kΩ y la lectura es de 4,29 V, un 4,76 % por debajo. La
lección 02 decía que un multímetro de 10 MΩ cambia un resistor de 1 MΩ en un
9 %. Eso era una resistencia: 1 MΩ en paralelo con 10 MΩ da 909 kΩ, un
9,09 % menos. Aquí R2 también baja a 909 kΩ, pero la tensión cambia más o
menos la mitad. El multímetro no ve solo a R2. Ve a R1 y R2 en paralelo,
500 kΩ, y `500 kΩ / 10,5 MΩ` es un 4,76 %.

:::key
Para que la lectura tenga menos de un 1 % de error, la resistencia de entrada
del multímetro debe ser al menos 100 veces la impedancia de salida del
circuito. Con diez veces, la lectura sale alrededor de un 10 % baja, y con
valores iguales, la mitad. Un multímetro de 10 MΩ mide con menos de un 1 % de
error en salidas de hasta unos 100 kΩ.
:::

## Medir corriente: en serie

La corriente pasa a través de una rama. Para medirla, abres el circuito en un
punto y pones el multímetro en el hueco, en serie. Por la LCK (lección 04),
toda la corriente de la rama pasa entonces por el multímetro.

Por dentro, un amperímetro funciona como el medidor USB de la lección 01. La
corriente pasa por un shunt, un resistor diminuto, y el multímetro mide la
tensión sobre él. Esa tensión es la **caída de tensión del amperímetro** (en
inglés, «burden voltage»): la pequeña tensión que el amperímetro le quita al
circuito que mide. El manual del Fluke 87V da valores típicos de 1,8 mV por
cada mA en el borne mA y de 0,03 V por cada amperio en el borne A. Así que el
multímetro se comporta como un resistor de 1,8 Ω en el borne mA y de 0,03 Ω en
el borne A. Son valores típicos, deducidos de la caída de tensión, no
resistencias que imprima el manual. Los rangos de µA del 87V, para millonésimas
de amperio, comparten el borne mA y toman 100 µV por cada µA: unos 100 Ω.

:::safety Nunca pongas el medidor en modo corriente sobre una fuente
En sus rangos de mA y A, el multímetro tiene unos pocos ohmios o menos entre sus
puntas. Si lo pones sobre una pila o una fuente, es un **cortocircuito**: una
conexión casi sin resistencia, como un simple cable. La ley de Ohm, con el
multímetro como única resistencia del lazo, da un límite superior. Una pila de
9 V sobre los 1,8 Ω del borne mA empujaría hasta `9 V / 1,8 Ω = 5 A`, más de
once veces el fusible de 440 mA. Sobre los 0,03 Ω del borne A serían
`9 V / 0,03 Ω = 300 A`. La corriente real es menor, porque la resistencia
propia de la pila (lección 07) y los cables la limitan. Aun así son amperios:
en el mejor caso se quema el fusible, y en el peor se daña el multímetro o se
queman los cables. Mide la corriente solo en serie, con el circuito abierto.
Vuelve a poner el cable rojo en el borne V/Ω apenas termines.
:::

:::safety Bornes de corriente con fusible
Los bornes de corriente dependen de **fusibles**. Un fusible es un conductor
delgado que se funde y abre el circuito cuando pasa demasiada corriente; el
módulo 05 los trata a fondo. En el Fluke 87V, el borne mA tiene un fusible de
440 mA y el borne A uno de 11 A, los dos de acción rápida y para 1000 V. Si un
borne de corriente no tiene fusible, o tiene uno equivocado, una sobrecarga
calienta el multímetro hasta que puede reventar. Antes de comprar o usar un
multímetro, revisa en su manual que los dos bornes de corriente tengan fusible.
Si no sabes qué tan grande es una corriente, empieza en el borne A. Cambia un
fusible quemado solo por el tipo que indica el manual, y nunca lo puentees.
:::

Para medir corriente, primero apaga la fuente. Abre el circuito en un punto.
Gira el selector a corriente continua y pasa el cable rojo al borne mA si sabes
que la corriente es menor de 400 mA (si no, al borne A). Conecta el multímetro
en el hueco, con la punta roja del lado que va al terminal + de la fuente, y
vuelve a encender la fuente.

::widget{type="meter-loading" mode="current" vin="9" rload="1k" range="mA"}

Ahora la fórmula del instrumento es `Iread = Itrue · RL / (RL + Rm)`, donde RL
es la carga y Rm la resistencia propia del multímetro. La lectura «Caída del
amperímetro» muestra la caída de tensión del amperímetro, la tensión sobre el
multímetro.

**Una carga de 1 kΩ en el borne mA.** Sin el multímetro circulan
`9 V / 1 kΩ = 9 mA`. Con él, el lazo tiene 1001,8 Ω, así que
`9 V / 1001,8 Ω = 8,98 mA`. «Error» marca un 0,18 % por debajo. La caída de
tensión del amperímetro es `8,98 mA · 1,8 Ω = 16,2 mV`. Al lado de una carga
de 1 kΩ, 1,8 Ω casi no influye.

**Una carga de 22 Ω a 1,5 V.** Escribe `1,5` en «Fuente» y `22` en «Carga».
Toma la fuente como una fuente de laboratorio puesta en 1,5 V: una pila AA real
tiene su propia resistencia, que trata la lección 07. Sin el multímetro
circulan `1,5 V / 22 Ω = 68,2 mA`. Con él, `1,5 V / 23,8 Ω = 63 mA`, un 7,56 %
por debajo. La caída de tensión del amperímetro es de 113 mV, sacados de solo
1,5 V. Con tensiones bajas y resistencias bajas es donde más se nota la caída
de tensión del amperímetro.

Ahora cambia «Rango» a A. El multímetro agrega solo 0,03 Ω, así que la lectura
es `1,5 V / 22,03 Ω = 68,1 mA`, un 0,14 % por debajo, con una caída de 2,04 mV.
El shunt del borne A es más pequeño, pero en el borne A el multímetro muestra
las corrientes pequeñas con menos cifras. Por eso también existe el borne A:
con los 400 mA máximos del borne mA, la caída sería de
`400 mA · 1,8 Ω = 720 mV`. En el rango mA, por encima de 400 mA, la «Lectura»
muestra `OL`.

El amperímetro sigue la misma regla de las 100 veces, pero al revés. Para que
la lectura tenga menos de un 1 % de error, la resistencia del multímetro debe
ser como mucho la centésima parte de la del circuito. Los 22 Ω de la carga
son solo unas doce veces el shunt de 1,8 Ω, y por eso esa lectura salió un
7,56 % baja.

## Medir resistencia

Como óhmetro, el multímetro hace pasar una corriente pequeña por la pieza y
mide la tensión entre sus extremos. La ley de Ohm da la resistencia. El Fluke
115/117 usa para esto menos de 2,7 V y menos de 350 µA. La µ significa micro-,
una millonésima, así que 350 µA son 0,35 mA.

Primero apaga el circuito. La tensión propia del circuito se sumaría a la del
multímetro y daría una lectura equivocada. Después saca un extremo de la pieza
del circuito. Cualquier otro camino entre sus dos extremos queda en paralelo
con ella (lección 02), y el multímetro mide todo el grupo.

Un uso real: comprobar que un resistor de tu kit tiene el valor que dicen sus
rayas de colores. Rara vez marcará justo el valor impreso; el módulo 01 explica
cuánto se puede apartar.

La **prueba de continuidad** es un pitido que significa «conectado». El Fluke
115/117 pita por debajo de 20 Ω. Con la alimentación apagada, úsala para
comprobar que un cable no está cortado por dentro, o que un interruptor conecta
cuando lo presionas.

:::note Lo que viene ahora
La próxima lección usa estas lecturas de tensión y corriente para calcular la
potencia, `P = V · I`, y el calor que produce. La lección 07 mide una pila con
carga y sin carga, con este mismo multímetro.
:::
