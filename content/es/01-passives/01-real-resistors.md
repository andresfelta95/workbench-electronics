---
slug: resistores-reales
title: "Resistores reales: tolerancia, valores normalizados y temperatura"
summary: Por qué un resistor nunca vale exactamente lo que tiene marcado, cómo se eligieron los valores normalizados, cuánto puede apartarse un divisor hecho con piezas reales y cuánto se aparta normalmente.
minutes: 14
references:
  - id: tt-tn004
    note: "Código de colores, «reference IEC60062»: tolerancia dorado 5 % (J), marrón 1 % (F), rojo 2 % (G), plateado 10 % (K); multiplicadores desde negro × 1 en adelante; la banda de tolerancia es más ancha que las otras o está más separada; cinco bandas para valores de tres cifras (p. 1). En los resistores de chip, «Tolerance is not marked» (la tolerancia no se marca) (p. 2)."
  - id: hyperphysics-es
    note: "Página «Resistencias de Carbón»: en el código de cuatro bandas, la cuarta es la tolerancia, 5 % oro y 10 % plata; los códigos impresos usan R como coma decimal y una letra de tolerancia (1 % F, 2 % G, 5 % J, 10 % K), por ejemplo 8R2K = 8,2 Ω ± 10 %."
  - id: openstax-fisica-u2-es
    note: "Sección 9.3: el cuarto color es la tolerancia del resistor; R = R0(1 + αΔT), con α del carbono −0,0005 por °C (−500 ppm/K) en la Tabla 9.1, un valor del material, no una especificación de resistor."
  - id: iec-60063-2015
    note: "La norma que define las listas E. Se cita solo para eso; los valores y las combinaciones con tolerancias vienen de los fabricantes."
  - id: vishay-std-ohmic-values
    note: "Una década de las listas E12, E24, E48 y E96 (pp. 1–2), con una combinación que pone ±2 % con la E48. Varios valores de la E24 no están en la E96: 220 no está, la E96 tiene 221."
  - id: vishay-decade-table
    note: "E12 para ±10 %, E24 para ±2 % y ±5 %, E96 para ±1 %; valores vecinos relacionados aproximadamente por la raíz 12, 24 o 96 de 10; «Use of standard values is encouraged because stocking programs are designed around them» (se recomienda usar valores normalizados porque los programas de existencias se diseñan en torno a ellos) (p. 335)."
  - id: yageo-cfr
    note: "Película de carbono: solo tolerancias G (±2 %) y J (±5 %) (p. 2). Coeficiente de temperatura de −500 a +350 ppm/°C por debajo de 100 kΩ (Tabla 2, p. 4). Resistencia a la carga, 1000 h a la potencia nominal y 70 °C: ±3,0 % + 0,05 Ω (p. 4)."
  - id: stackpole-cf
    note: "Película de carbono: solo 2 % y 5 % (p. 11). Coeficiente de temperatura de 0 a −500 ppm/°C entre 10 kΩ y 99 kΩ (p. 1). Resistencia a la carga a 70 °C: típicamente menos de ±1 % (p. 3)."
  - id: yageo-mfr
    note: "Película metálica: tolerancias de ±0,5 % a ±5 % (p. 1); coeficiente de temperatura ±50 ppm/°C (código E) o ±100 ppm/°C (p. 2); código de cinco bandas para ±0,5 % y ±1 % (p. 15). Resistencia a la carga, 1000 h a la potencia nominal y 70 °C: ±1,5 % + 0,05 Ω (p. 4)."
  - id: vishay-mbx-sma
    note: "Película metálica: coeficiente de temperatura ±50 ppm/K (p. 1); piezas de 1 % en valores de la E24 y de la E96 (nota 1, p. 3); un láser corta un surco en espiral en la capa resistiva hasta llegar al valor buscado, y «an extensive testing procedure performed on 100 % of the individual resistors» (una prueba exhaustiva del 100 % de los resistores) (p. 7)."
  - id: yageo-rc-l
    note: "Chip de película gruesa RC0603: coeficiente de temperatura ±100 ppm/°C de 10 Ω a 10 MΩ (Tabla 2, p. 5); «the resistor is laser trimmed to the rated resistance value» (el resistor se ajusta por láser a su valor nominal) (p. 4)."
  - id: vishay-tnpw-e3
    note: "Chip de película delgada: coeficiente de temperatura de hasta ±10 ppm/K en el mejor grado (p. 1); como máximo 0,05 % de cambio tras 1000 h a la potencia nominal (p. 2); ajustado por láser (p. 5)."
  - id: ti-snva112
    note: "El peor caso toma todas las tolerancias en sus extremos a la vez y da límites «excessively conservative» (excesivamente conservadores) (§1, §3). Los fabricantes «may be reluctant to release this data» (pueden no querer publicar estos datos), así que la nota supone un reparto gaussiano (§6), con la tolerancia tomada como ±6σ (pp. 5, 8). Fig. 6, un histograma medido de resistores de chip 0805 de 1 %: un solo pico, todas las barras dentro de aproximadamente ±0,8 %, leído del gráfico (p. 5)."
  - id: knudtsen-2022
    note: "Simulación de Monte Carlo en LTspice frente al análisis del peor caso: «worst-case limits are statistically improbable» (los límites del peor caso son estadísticamente improbables); «both worst-case and statistical analysis provide valuable insights»."
  - id: johnson-2010
    note: "Una anécdota, no una medición: en 1983 el autor no encontró ninguno de 300 resistores de composición de carbono de 10 % dentro de ±1 %, y su mentor le dijo que las mejores piezas se habían vendido como de 5 %. No da valores ni histograma."
  - id: fluke-80v-manual
    note: "Nunca pongas las puntas entre los extremos de un circuito o una pieza con los cables en los bornes de corriente (p. 24); ahí el multímetro se comporta como un cortocircuito (p. 13). Fusible de 440 mA en el borne mA (p. 43)."
---

Armas el divisor de tensión de la lección 00-03 con una pila de 9 V y dos
resistores de 10 kΩ de tu kit. Según la fórmula, la salida es
`9 V · 10 kΩ / 20 kΩ = 4,5 V`. Tu multímetro marca unos 4,37 V. ¿Está mal el
circuito?

No. La lección 00-05 dijo que un resistor casi nunca marca exactamente su
valor impreso, y que el módulo 01 explica cuánto puede apartarse. Esta lección
lo hace, primero para un resistor y después para un divisor de dos. Mucha
gente espera que un divisor hecho con resistores de 5 % se aparte más o menos
un 5 %. Puede apartarse más que eso, y normalmente se aparta mucho menos.

## La tolerancia y cómo se marca

El valor impreso en un resistor es su **valor nominal**: el valor que busca el
fabricante. Su **tolerancia** es cuánto puede apartarse el valor real del
valor nominal, como porcentaje de este. Un resistor de 10 kΩ y 5 % vale algo
entre 9,5 kΩ y 10,5 kΩ. Cualquier valor dentro de esa banda es una pieza
buena.

Casi todos los kits de iniciación traen resistores de película de carbono
(lección 00-06) marcados con bandas de colores. El **código de colores** dice
qué cifra representa cada color. Un resistor de cuatro bandas lleva dos
cifras, luego un multiplicador (cuántos ceros agregar) y luego la tolerancia.
Una pieza de 10 kΩ y 5 % se lee marrón o café (1), negro (0), naranja (tres
ceros), dorado. La banda de tolerancia es más ancha que las otras o está un
poco separada de ellas, así sabes desde qué extremo leer. Los colores de
tolerancia más comunes son:

- dorado: 5 %
- rojo: 2 %
- marrón: 1 %
- plateado: 10 %

Las piezas de 1 % suelen llevar cinco bandas: tres cifras, el multiplicador y
la tolerancia. Cuando el valor está impreso con caracteres en lugar de
colores, una **letra de tolerancia** indica la tolerancia: J es 5 %, G es 2 %,
F es 1 % y K es 10 %. La letra R marca la coma decimal, así que `8R2K` es
8,2 Ω y 10 %.

Un **resistor de chip** es un resistor de montaje superficial (lección 00-01):
un bloque diminuto sin patas, como casi todos los resistores de un teléfono.
La guía de marcado de TT Electronics dice que en los resistores de chip «la
tolerancia no se marca». La encuentras en la hoja de datos, como una letra
dentro del código de la pieza.

Cada tipo de resistor viene en sus propias tolerancias. Yageo y Stackpole
fabrican película de carbono solo en 2 % y 5 %. Para 1 % necesitas un
**resistor de película metálica**, que tiene una capa delgada de metal donde
el de película de carbono tiene carbono. La línea de película metálica de
Yageo va de 0,5 % a 5 %.

La tolerancia es también la razón por la que la resistencia interna de la
lección 00-07 salía solo «aproximada»: un resistor de carga de 5 % puede
meterle hasta un 5 % de error.

:::safety Medir resistores con seguridad
Para medir resistencia, el multímetro hace pasar por la pieza una pequeña
corriente propia. En un circuito alimentado, la tensión del circuito se suma a
la del multímetro y la lectura sale mal. Con el cable rojo en el borne mA o A,
el multímetro es casi un simple cable entre sus puntas (lección 00-05). Si lo
tocas entre los terminales de la pila de 9 V, eso es un cortocircuito: funde
el fusible del multímetro y calienta la pila y los cables. Desconecta la pila
y saca un extremo del resistor del circuito antes de medirlo. Deja los cables
en los bornes COM y V/Ω. Nunca conectes nada directamente entre los dos
terminales de la pila, que en una pila de 9 V están uno al lado del otro
(lección 00-07).
:::

Ahora pon el multímetro en ohmios y mide algunos de tus resistores de 10 kΩ.
Cada uno debería marcar entre 9,5 kΩ y 10,5 kΩ, y es raro que todos marquen
lo mismo. Tu multímetro suma un pequeño error propio; su manual
dice cuánto.

## Valores normalizados: por qué 10, 11, 12, 13

Los resistores se venden en unas pocas listas de valores normalizados, fijadas
por la norma IEC 60063. La lista E12 de la lección 00-02 tiene 12 valores por
cada factor de diez: 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68 y 82. La
**lista E24** tiene 24: los de la E12 más 11, 13, 16, 20, 24, 30, 36, 43, 51,
62, 75 y 91. La **lista E96** tiene 96 valores de tres cifras cada uno: 100,
102, 105, 107, 110 y así sucesivamente. Cada lista se repite en cada factor de
diez, así que la E24 da 1,1 kΩ, 11 kΩ y 110 kΩ.

Cada valor está más o menos en la misma proporción por encima del anterior:
alrededor de 10 % en la E24, 21 % en la E12 y 2,4 % en la E96. (Cada paso
multiplica por la raíz 24, 12 o 96 de diez.) Esa separación encaja con las
tolerancias. Una pieza de 10 kΩ y 5 % cubre de 9,5 kΩ a 10,5 kΩ, y el valor
siguiente de la E24, 11 kΩ, cubre de 10,45 kΩ a 11,55 kΩ. La E12 hace lo mismo
con 10 %: 10 kΩ cubre de 9 kΩ a 11 kΩ, y 12 kΩ cubre de 10,8 kΩ a 13,2 kΩ. Las
bandas casi cubren cada factor de diez, pero algunas vecinas dejan un pequeño
hueco. Con 5 %, 13 kΩ llega hasta 13,65 kΩ y 15 kΩ baja hasta 14,25 kΩ, así
que ningún valor de la E24 cubre el 4,4 % que hay entre ellos. Un valor que
calculas en unos 14 kΩ queda a más o menos un 7 % del valor de la E24 más
cercano, un poco más allá de la tolerancia.

La combinación habitual es la E12 para piezas de 10 %, la E24 para 5 % y 2 %,
y la E96 para 1 %. Es una costumbre, no una ley: otra tabla de Vishay pone el
2 % con una lista de 48 valores. Vishay también da la razón para quedarse en
las listas: «stocking programs are designed around them» (los programas de
existencias se diseñan en torno a ellas). También puedes comprar piezas de 1 % con valores de la E24,
aunque algunos valores de la E24, como 220, no están en la E96 (que tiene
221).

El instrumento de abajo funciona igual. Escribe un valor en R1 o R2 y pasa a
un valor de la E24, así que cada divisor que muestra es uno que podrías
comprar.

## El peor caso

El **peor caso** es la salida que obtienes cuando cada pieza está en el
extremo de su banda que más empuja la salida, todas a la vez. La salida del
divisor es mínima cuando R1 está lo más alto posible y R2 lo más bajo, y
máxima al revés:

- R1 = 10,5 kΩ, R2 = 9,5 kΩ: `9 V · 9,5 / 20 = 4,275 V`
- R1 = 9,5 kΩ, R2 = 10,5 kΩ: `9 V · 10,5 / 20 = 4,725 V`

El total sigue siendo 20 kΩ en los dos casos, así que la salida se mueve el
mismo 5 % que R2. Con dos resistores iguales siempre pasa esto: el peor caso
es igual a la tolerancia de las piezas.

::widget{type="tolerance-spread" vin="9" r1="10k" r2="10k"}

El instrumento dibuja el divisor de la lección 00-03 con los dos resistores
marcados ±5 %. «Peor caso» marca ±5 %, de 4,275 V a 4,725 V. Las dos líneas
cortadas del gráfico que está bajo el dibujo marcan esas mismas dos tensiones.
Las barras que hay entre ellas son para la sección siguiente.

Cuánto mueve la tolerancia la salida depende del circuito. Escribe `1k` en R2.
La salida es ahora 818,2 mV, una parte pequeña de 9 V, y «Peor caso» marca
±9,5 % (de 746,7 mV a 895,7 mV): casi el doble de la tolerancia de las piezas.
Con un R2 tan pequeño, R1 por sí solo fija la corriente. Un R1 alto da menos
corriente, y un R2 bajo da menos tensión para esa corriente, así que los dos
errores se suman.

Ahora escribe `1k` en R1 y `10k` en R2. La salida es 8,182 V, casi todos los
9 V, y «Peor caso» marca ±0,9 % (de 8,104 V a 8,253 V). La salida queda cerca
de Vin hagan lo que hagan las piezas, así que solo pueden moverla un poco.

Ya conoces el caso sensible. El divisor de la lección 00-03 para leer una
batería de 12 V con un microcontrolador usa R1 = 10 kΩ y R2 = 2,7 kΩ. Escribe
`12` en Vin, `10k` en R1 y `2,7k` en R2: la salida es 2,551 V, y «Peor caso»
marca ±8,1 % (de 2,356 V a 2,758 V). Solo por los resistores, la lectura de la
batería podría apartarse un 8 %, más o menos. Presiona `1 %` y marca ±1,6 %.

Un diseño que tiene que funcionar siempre se comprueba con el peor caso. La
nota de Texas Instruments sobre este cálculo también dice que los límites del
peor caso son «excesivamente conservadores»: que todas las piezas estén en su
extremo, en la peor dirección y al mismo tiempo, pasa muy pocas veces. Antes
de seguir, presiona `5 %` y vuelve a poner Vin en 9, y R1 y R2 en 10k.

## Lo que pasa normalmente

Para ver lo que pasa normalmente, podrías armar el divisor mil veces con mil
pares distintos de resistores y medir cada uno. Una **simulación de Monte
Carlo** hace eso en una computadora: arma el circuito muchas veces, elige al
azar el valor de cada pieza dentro de su banda y junta los resultados. Un
artículo de Analog Devices muestra cómo hacerla en LTspice, un simulador de
circuitos gratuito.

El instrumento arma el divisor 1000 veces; cada uno es un montaje. El gráfico
que está bajo el dibujo es un **histograma** de las salidas: un gráfico de
barras en el que cada barra cuenta cuántas de las 1000 salidas cayeron en un
intervalo estrecho de tensiones. Donde las barras son altas, cayeron muchos
montajes.

Para elegir valores al azar, la computadora necesita una regla sobre cómo se
reparten dentro de la banda. Los fabricantes no la publican: la nota de TI
dice que pueden no querer dar estos datos. Por eso el instrumento ofrece dos
formas, y las teclas de «Forma supuesta» dicen que son suposiciones:

- **Campana** es una **curva de campana**, también llamada distribución normal
  o gaussiana: la mayoría de las piezas cerca del valor nominal, menos cuanto
  más lejos. El instrumento la ajusta para que más o menos dos piezas de cada
  tres queden a menos de un tercio de la tolerancia del valor nominal, y
  ninguna fuera de la banda.
- **Plana** es un **reparto plano** (uniforme): cualquier valor de la banda es
  igual de probable. Es el caso prudente.

La campana es la forma que supone la nota de TI. Pero la campana de TI es más
estrecha: pone el borde de la banda seis veces más lejos que el error de una
pieza típica, y el instrumento lo pone tres veces más lejos, la opción más
prudente. El único histograma medido que trae la nota, de resistores de chip de 1 %, tiene un solo pico, con todas las
barras dentro de aproximadamente ±0,8 %. Además, los fabricantes fijan el
valor de cada pieza en lugar de clasificar un reparto ancho. En el **ajuste
por láser**, un láser corta un surco en la película hasta que la pieza llega a
su valor buscado, y Vishay prueba cada uno de los resistores de su línea
profesional de película metálica. Aun así, ninguna de las dos formas es una
medición de piezas de 5 %.

El instrumento empieza en «Campana» y `5 %`. Las barras forman una sola joroba
centrada en 4,5 V, bien adentro de las líneas cortadas. «95 % de los montajes»
marca ±2,5 %: 95 de cada 100 montajes cayeron entre 4,388 V y 4,605 V. «El
más alejado de 1000» marca +3,7 %, «4,668 V, lote 1»: ni siquiera el más
alejado de los mil llegó al peor caso. Tu divisor de 4,37 V está más o menos
un 2,9 % abajo: es un montaje común.

Presiona `1 %`. Los mismos 1000 montajes, cada error cinco veces más pequeño, se
encogen en un pico estrecho. «Peor caso» marca ±1 % (de 4,455 V a 4,545 V),
«95 % de los montajes» ±0,5 % (de 4,477 V a 4,521 V), y el más alejado está a
+0,7 % (4,534 V). El eje queda donde estaba, así que puedes comparar: todos
estos montajes caen dentro del intervalo que contenía 95 de cada 100 montajes
de 5 %.

Presiona `5 %` otra vez y luego «Plana». Las líneas cortadas no se mueven;
solo cambia la forma que hay entre ellas. La joroba se ensancha: «95 % de los
montajes» marca ±3,9 % (de 4,327 V a 4,671 V), y el más alejado, 4,719 V, se
aparta un 4,9 %, cerca del borde. Ahora unas cuantas decenas de los mil
montajes se apartan más de un 4 %.

Presiona «Campana» y luego «Otro lote» unas cuantas veces. Cada vez se arma un
grupo nuevo de 1000 divisores. «95 % de los montajes» se queda entre ±2,3 % y
±2,5 %. El más alejado se mueve más: entre 3,4 % y 4,3 % en los lotes 1 a 5.
En esos 5000 montajes, ninguno llega al 5 %. El artículo de Analog Devices lo
dice así: los límites del peor caso son «estadísticamente improbables».

Así que un divisor de piezas de 5 % no se aparta «más o menos un 5 %». Su peor
caso es 5 % con resistores iguales y casi 10 % con un R2 pequeño. Con la
suposición de la campana, 95 de cada 100 montajes quedan dentro de más o menos
la mitad de eso.

Quizás leas que las piezas de 1 % se sacan de la producción de 5 %, así que
las de 5 % tienen un hueco en el medio, donde estaban las buenas. Una versión
de esa historia viene de una columna de Howard Johnson en la revista EDN. En
1983 revisó 300 resistores de 10 % y no encontró ninguno a menos de 1 % de su
valor; con los valores repartidos de forma pareja, uno de cada diez debería
haber estado ahí. Su mentor le explicó que el fabricante había sacado las
mejores piezas y las había vendido como de 5 %. Eran resistores de composición
de carbono, un tipo más antiguo que la película de carbono de tu kit, y la
columna no da mediciones. Ninguna medición de resistores de película modernos
muestra ese hueco. Los resistores de 1 % que midió TI tienen un solo pico, el
ajuste por láser fija el valor de cada pieza y la película de carbono no tiene
un grado de 1 % que sacar. El instrumento deja el hueco afuera.

:::key
Un circuito hecho con piezas con tolerancia puede llegar a su peor caso, así
que comprueba que el diseño siga funcionando ahí. La mayoría de los montajes
cae muy adentro: en este divisor, con la suposición de la campana, 95 de cada
100 quedan dentro de más o menos la mitad del peor caso.
:::

## Temperatura y envejecimiento

El valor de un resistor también cambia con la temperatura. Su **coeficiente de
temperatura** dice cuánto, en ppm/K: partes por millón de su valor por cada
kelvin de cambio de temperatura. Un kelvin es el mismo paso que un grado
Celsius, así que las hojas de datos también escriben ppm/°C, y 100 ppm/K es
0,01 % por grado. Como fórmula, `R = R₀ · (1 + α · ΔT)`, donde R₀ es el valor a
la temperatura de partida, ΔT el cambio de temperatura y α el coeficiente de
temperatura como fracción.

Casi todos los resistores de chip son de **película gruesa**. Los chips de
precisión son de **película delgada**, con una capa resistiva mucho más fina.
Toma un resistor de 10 kΩ que se calienta de 25 °C a 75 °C, 50 K, como podría
pasar dentro de una caja cerrada con una pieza tibia adentro (lección 00-06).
Según los límites de las hojas de datos:

- **Película de carbono:** de 0 a −500 ppm/K entre 10 kΩ y 99 kΩ (Stackpole).
  Hasta −2,5 %, o 9,75 kΩ.
- **Chip de película gruesa** (Yageo RC0603): ±100 ppm/K. ±0,5 %, o 10,05 kΩ.
- **Película metálica:** ±50 ppm/K. ±0,25 %, unos 10,03 kΩ.
- **Chip de película delgada:** ±10 ppm/K en el mejor grado de la línea TNPW de Vishay.
  ±0,05 %, unos 10,01 kΩ.

El carbono como material tiene −500 ppm/K en la tabla de OpenStax: es una
propiedad del material, no una especificación de un resistor.

En un divisor solo importa la diferencia entre lo que cambian los dos. Si los
dos resistores son del mismo tipo y están a la misma temperatura, los dos
cambian en la misma fracción y la proporción no se mueve: 4,5 V siguen siendo
4,5 V. Pero el rango de la película de carbono permite que una pieza se quede
en 10 kΩ mientras la otra baja un 2,5 %. Con R2 abajo,
`9 V · 9,75 / 19,75 = 4,443 V`, un 1,27 % abajo. Dos piezas de película
metálica en extremos opuestos de ±50 ppm/K dan 4,511 V. Por eso los divisores
de precisión usan película metálica o película delgada, con las dos piezas de
la misma familia. Son límites de las hojas de datos. Ninguna fuente dice
cuánto cambia el coeficiente de temperatura de una pieza a otra, así que el
instrumento deja la temperatura afuera.

Los resistores también cambian con los años. La **vida bajo carga** es cuánto
cambia el valor después de usar la pieza mucho tiempo a su potencia nominal:
los fabricantes hacen trabajar las piezas a su potencia nominal durante
1000 horas, unas seis semanas, y dan el cambio máximo del valor. Yageo admite
±3,0 % + 0,05 Ω para su película de carbono a 70 °C y ±1,5 % + 0,05 Ω para su
película metálica. La película de carbono de Stackpole cambia típicamente
menos de ±1 %, y los chips de película delgada de Vishay como máximo 0,05 %.
Así que una pieza de película de carbono de 10 kΩ usada a su potencia nominal
puede terminar en 10,3 kΩ: un cambio de más de la mitad de su tolerancia de
5 %.

:::note Lo que viene ahora
Los condensadores vienen después, en la lección 01-02. También tienen
tolerancia y también cambian, y algunos cambian mucho más: la lección 01-03
muestra un condensador cerámico que pierde la mayor parte de su valor.
:::
