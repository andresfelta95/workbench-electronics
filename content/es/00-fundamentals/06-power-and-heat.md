---
slug: potencia-y-calor
title: Potencia, calor y resistencia térmica
summary: Calcula cuánto se calienta un resistor, por qué una pieza en su potencia nominal todavía puede quemarte y por qué esa potencia se reduce con aire caliente.
minutes: 13
references:
  - id: stackpole-cf
    note: "CF14 con potencia nominal de 0,25 W y CF1 de 1 W a 70 °C (p. 1). Cuerpos de 6,00 mm por 2,30 mm y de 11,00 mm por 4,50 mm (p. 2). Reducción de la potencia nominal desde el 100 % a 70 °C hasta el 0 % a 155 °C, el tope del rango de funcionamiento (p. 3). Aumento de la temperatura superficial a plena potencia nominal, medido en el centro del cuerpo: unos 32 °C en el CF14 y unos 85 °C en el CF1, leídos de la curva de la p. 9. La hoja de datos no imprime θ; 128 °C/W y 85 °C/W se deducen de esa curva (valores típicos)."
  - id: yageo-cfr
    note: "La misma reducción de la potencia nominal según un segundo fabricante: 100 % hasta 70 °C, 0 % a 155 °C (p. 3). El CFR-25 de la lección 01 tiene una potencia nominal de 1/4 W a 70 °C (tabla 1)."
  - id: vishay-mbx-sma
    note: "La curva de otro fabricante da números parecidos: unos 140 °C/W en su tamaño 0207 y unos 85 °C/W en su tamaño 0414, deducidos de la curva de aumento de temperatura (p. 8). El aumento de temperatura depende de cuánto calor pasa a la placa de circuito (Application Information, p. 2)."
  - id: ti-spra953
    note: "La resistencia térmica es la diferencia de temperatura dividida por la potencia, en °C/W, y vale solo para el montaje y la placa de prueba indicados (sección 1, p. 2, y tabla 1-1)."
  - id: cenelec-guide-29
    note: "Umbrales de quemadura de la piel al tocar una superficie lisa caliente. Metal desnudo: unos 65–70 °C en 1 s y unos 55–59 °C en 10 s, leídos de las curvas de la figura A.2 (p. 17); 51 °C en 1 min. Cualquier material: 48 °C en 10 min y 43 °C en 8 h (tabla A.1, p. 20)."
  - id: usb-if-usb2
    note: "Un puerto USB da 5 V."
  - id: kuphaldt-liec
    note: "Volumen I, capítulo 2: P = I²R y P = E²/R, y la potencia nominal de un resistor es más o menos proporcional a su tamaño. Gratis en línea, en inglés."
  - id: horowitz-hill-2015
    note: "Referencia general; no se cita una página."
  - id: openstax-fisica-u2-es
    note: "Sección 9.5: P = IV = I²R = V²/R, y un resistor convierte esa potencia en calor."
  - id: hyperphysics-es
    note: "Página «Potencia Eléctrica»: P = VI y la potencia que un resistor convierte en calor."
---

Supón que un resistor de 100 Ω está conectado a los 5 V de un puerto USB. Es
un resistor de 1/4 W de un kit de iniciación. La comprobación de la lección 01 da
`P = V² / R = 5² / 100 = 0,25 W`, que es justo su potencia nominal. La
comprobación pasa. ¿Está el resistor lo bastante frío como para tocarlo?

Para responder, necesitas un número más de la pieza, además de su potencia
nominal: cuántos grados se calienta por cada vatio.

## De la potencia a la temperatura

Un resistor convierte en calor toda la potencia que recibe (lección 01). El
multímetro de la lección 05 te da los dos números que necesitas. Entre los
extremos de este resistor medirías 5 V, y a través de él 50 mA, así que
`P = V · I = 5 V · 50 mA = 250 mW`. El divisor de la lección 03 hace lo mismo:
convierte su corriente en calor todo el tiempo.

El calor sale de la pieza hacia el aire que la rodea. Cuando conectas la
fuente, el resistor se calienta hasta que entrega calor al aire tan rápido
como lo produce. Ahí su temperatura deja de subir. Eso lleva un rato, y la
pieza sigue caliente un rato después de que apagas la fuente.

Cuatro nombres describen dónde se estabiliza:

- La **temperatura ambiente** (Ta) es la temperatura del aire que rodea la
  pieza. Una habitación puede estar a 25 °C. El aire dentro de un auto
  estacionado al sol, o dentro de una caja cerrada con una pieza tibia
  adentro, está mucho más caliente.
- El **aumento de temperatura** es cuánto por encima de la temperatura
  ambiente se estabiliza la pieza.
- La **resistencia térmica**, escrita θ (la letra griega theta), es cuántos
  grados sube la superficie de una pieza por cada vatio que convierte en
  calor, para un montaje indicado. Su unidad es el °C/W. Las hojas de datos
  también la escriben en K/W (kelvin por vatio). Un paso de un kelvin tiene el
  mismo tamaño que un paso de un grado Celsius, así que el número es el mismo.
- La **temperatura superficial** es la temperatura del exterior de la pieza,
  en el centro de su cuerpo, donde la mide el fabricante.

El aumento es la potencia por θ, y la superficie queda esa cantidad por encima
del aire:

`T = Ta + P · θ`

El instrumento escribe esta fórmula arriba, con `P · θ`, el aumento, resaltado.

Los resistores de esta lección son de película de carbono. En un **resistor de
película de carbono**, la resistencia es una capa delgada de carbono, la
película, aplicada sobre una varilla pequeña de cerámica, debajo de la
pintura. Los fabricantes casi nunca imprimen θ para estas piezas. La hoja de
datos de la familia CF de película de carbono de Stackpole da en cambio una
curva: el aumento de la temperatura superficial según la potencia. A plena
potencia nominal, la curva marca unos 32 °C en la pieza de 1/4 W y unos 85 °C
en la de 1 W. Divide por la potencia y obtienes θ: `32 / 0,25 = 128 °C/W` y
`85 / 1 = 85 °C/W`. Estos valores de θ son típicos, deducidos de la curva de
aumento de temperatura del fabricante. La curva de otro fabricante, Vishay, da
números parecidos.

El instrumento simplifica tres cosas, así que lee sus temperaturas como
valores «aproximados»:

- Traza una línea recta desde cero hasta ese punto de la curva del fabricante.
  La curva real puede doblarse un poco por debajo de la plena potencia.
- Supone que θ no cambia con la temperatura del aire, así que la misma
  potencia da el mismo aumento a 25 °C que a 85 °C.
- Su temperatura es la de la superficie en el centro del cuerpo, con el
  montaje de prueba del fabricante. El **montaje** es cómo está sujeta la
  pieza: el largo de sus patas, la placa a la que está soldada, las piezas que
  tiene alrededor y la caja en la que está, si la hay. En tu placa el número
  cambia, porque el aumento depende de cuánto calor pasa a la placa. La
  película de adentro, donde se produce el calor, está al menos tan caliente
  como la superficie.

:::safety Un resistor en su potencia nominal puede quemarte
En su potencia nominal, con aire a 25 °C, la superficie de un resistor de
película de carbono de 1/4 W llega a unos 57 °C, y la de uno de 1 W a unos
110 °C (valores típicos, de la curva del fabricante). El metal desnudo quema la
piel a 51 °C en un minuto y a unos 65–70 °C en cerca de un segundo, y las patas
de un resistor son de metal. No toques un resistor alimentado, ni uno que
acabas de apagar: sigue caliente un rato. Apaga la fuente y deja que se enfríe
antes de tomarlo. Monta las piezas calientes donde nada se apoye contra ellas.
Calcula la temperatura con `T = Ta + P · θ`, no al tacto.
:::

::widget{type="power-dissipation" rating="1/4" vin="5" r="100" ambient="25"}

El instrumento empieza con el resistor del principio: 1/4 W en «Resistor», 5 V
en «Fuente», 100 Ω en R y 25 °C en «Temperatura ambiente».

- Corriente: `I = 5 V / 100 Ω = 50 mA`
- Potencia: `P = 5 V · 50 mA = 250 mW`, toda la potencia nominal de 1/4 W
- Aumento de temperatura: `0,25 W · 128 °C/W = 32 °C`
- Temperatura superficial: `25 °C + 32 °C = 57 °C`

El instrumento muestra una «Potencia» de 250 mW con «50 mA en R», un «Aumento
de temperatura» de 32 °C con θ = 128 °C/W y una «Temperatura superficial» de
57 °C con el aviso «puede quemar la piel». «Potencia nominal usada» marca
100 % «de 250 mW a 25 °C». Esa es la respuesta a la pregunta del principio: el
resistor está dentro de su potencia nominal y demasiado caliente para tocarlo.

Ahora elige 1 W en «Resistor». La potencia sigue siendo 250 mW, pero θ ahora es
85 °C/W:

- Aumento de temperatura: `0,25 W · 85 °C/W = 21,25 °C`, que se muestra como
  21 °C
- Temperatura superficial: `25 °C + 21,25 °C = 46,25 °C`, que se muestra como
  46 °C

«Potencia nominal usada» baja a 25 % «de 1 W a 25 °C», y el aviso de la
superficie dice solo «centro del cuerpo». La pieza de 1 W es más grande,
11,00 mm por 4,50 mm frente a 6,00 mm por 2,30 mm, así que tiene más superficie
para pasarle calor al aire. Por eso sube menos grados por vatio, y por eso los
fabricantes dan más potencia nominal a los resistores más grandes.

:::key
La superficie de un resistor se estabiliza `P · θ` por encima del aire que lo
rodea: el aumento de temperatura es la potencia por la resistencia térmica.
:::

## Dentro de su potencia nominal, y aun así demasiado caliente

Cuánto es demasiado caliente depende de qué tocas y durante cuánto tiempo.
CENELEC, el organismo europeo de normas eléctricas, publica una guía sobre
superficies calientes. Da el **umbral de quemadura**: la temperatura de una
superficie a la que la piel empieza a quemarse, para un material y un tiempo de
contacto dados. Para el metal desnudo, que es el que quema más rápido de los
materiales que trata:

- unos 65–70 °C en 1 segundo, y unos 55–59 °C en 10 segundos (leídos de las
  curvas de la guía);
- 51 °C en 1 minuto.

Para cualquier material da 48 °C en 10 minutos y 43 °C en 8 horas. El aviso
«puede quemar la piel» del instrumento aparece desde 51 °C, el valor de
1 minuto para el metal. Por debajo, solo dice dónde se mide la temperatura. Los
46 °C de la pieza de 1 W están por debajo del valor de 1 minuto, pero no son
inofensivos: superan el valor de 8 horas.

La pieza de 1/4 W a 57 °C está dentro de su potencia nominal y por encima de
51 °C. La potencia nominal te dice cuánto calor aguanta la pieza sin dañarse.
No te dice si está lo bastante fría como para tocarla.

Ahora lleva la pieza de 1 W a su propia potencia nominal. Deja 1 W en
«Resistor» y escribe `10` en «Fuente»:

- Potencia: `P = 10² / 100 = 1 W`, con `I = 10 V / 100 Ω = 100 mA`
- Aumento de temperatura: `1 W · 85 °C/W = 85 °C`
- Temperatura superficial: `25 °C + 85 °C = 110 °C`

El instrumento muestra 1 W con «100 mA en R», un aumento de 85 °C, una
superficie de 110 °C con «puede quemar la piel» y «Potencia nominal usada» en
100 % «de 1 W a 25 °C». Compáralo con los 57 °C de la pieza de 1/4 W en su
potencia nominal. Por vatio, la pieza de 1 W se calienta menos (85 °C/W frente
a 128 °C/W), pero en su potencia nominal recibe cuatro veces más potencia, así
que queda más caliente. 110 °C supera con creces el valor de 1 segundo para el
metal.

El hábito que ayuda es dejar **margen**: la parte de la potencia nominal que
no usas. Este curso usa una regla práctica: planifica para más o menos la
mitad de la potencia nominal. La regla es una convención del curso, no un dato
de una hoja de datos. Por eso «Potencia nominal usada» cambia de color por
encima del 50 %, y otra vez por encima del 100 %. Elige 1/4 W en «Resistor» y
escribe `3,5` en «Fuente»:

- Potencia: `P = 3,5² / 100 = 122,5 mW`, que se muestra como 123 mW
- Potencia nominal usada: 49 %, por debajo de la línea del 50 %
- Aumento de temperatura: `0,1225 W · 128 °C/W = 15,68 °C`, que se muestra
  como 16 °C
- Temperatura superficial: 41 °C

El margen también mantiene la pieza más fría: 41 °C en lugar de 57 °C. Y deja
lugar para el siguiente problema: el aire caliente.

## El aire caliente reduce la potencia nominal

La potencia nominal de un resistor vale solo mientras la temperatura ambiente
es de 70 °C o menos. Por encima, baja en línea recta hasta cero a 155 °C. 155 °C
es también el tope del rango de temperatura de funcionamiento de la pieza. Esta
bajada se llama **reducción de la potencia nominal** (en las hojas de datos en
inglés, «derating»), y su gráfico en una hoja de datos es la **curva de
reducción**. Stackpole y Yageo imprimen la misma curva para sus piezas de
película de carbono. Así que el 1/4 W de la lección 01 en realidad significa
1/4 W a 70 °C o menos.

El aire de una habitación está lejos de 70 °C. El aire dentro de una caja
cerrada no tanto: cada pieza tibia de la caja calienta el aire que rodea a las
demás. Escribe `5` en «Fuente» y `85` en «Temperatura ambiente», con la pieza
de 1/4 W todavía elegida:

- Reducción: `(155 − 85) / 85 = 0,8235` de la potencia nominal
- Potencia nominal ahora: `0,25 W · 0,8235 = 205,9 mW`, que se muestra como
  206 mW
- Potencia nominal usada: `250 mW / 205,9 mW = 121,4 %`
- Aumento de temperatura: sigue en 32 °C; temperatura superficial
  `85 °C + 32 °C = 117 °C`

«Potencia nominal usada» marca 121,4 % «de 206 mW a 85 °C», y el resistor del
dibujo toma el color de sobrecalentamiento. La potencia y el aumento no
cambiaron. La temperatura ambiente movió dos cosas: el punto de partida de la
temperatura superficial y la propia potencia nominal.

La pieza de 1 W aguanta más. Elige 1 W y escribe `9` en «Fuente». La potencia
es `9² / 100 = 810 mW`. La potencia nominal a 85 °C es
`1 W · 0,8235 = 823,5 mW`, que se muestra como 824 mW, así que «Potencia
nominal usada» marca 98,4 %. El aumento es `0,81 W · 85 °C/W = 68,85 °C`, que
se muestra como 69 °C, y la superficie queda en
`85 °C + 68,85 °C = 153,85 °C`, que se muestra como 154 °C.

Eso está cerca de 155 °C. Escribe `10` en «Fuente» y `70` en «Temperatura
ambiente». La pieza recibe 1 W, toda su potencia nominal, y sube 85 °C hasta
una superficie de `70 + 85 = 155 °C`, con «Potencia nominal usada» en 100 %.
Ahora escribe `85` en «Temperatura ambiente»: «Potencia nominal usada» pasa a
121,4 % y la superficie marca 170 °C, «sobre el límite de 155 °C de la pieza».
En la pieza de 1 W los números coinciden: con cualquier temperatura ambiente
por encima de 70 °C, su potencia nominal reducida es la potencia que lleva la
superficie estimada a 155 °C.

La potencia nominal de la pieza de 1/4 W deja más espacio según esta
estimación. En su potencia nominal, con aire a 70 °C, su superficie queda en
unos `70 + 32 = 102 °C` (elige 1/4 W y escribe `5` en «Fuente» y `70` en
«Temperatura ambiente»). Según la estimación, harían falta
`(155 − 70) / 128 = 664 mW` para llegar a 155 °C. Respeta igual la potencia
nominal. La superficie no es el punto más caliente, porque el calor se produce
en la película de adentro. Y tu placa no es el montaje de prueba del
fabricante, así que tu pieza puede quedar más caliente de lo que dice la
curva.

## Por encima de la potencia nominal

:::safety Si sale humo, apaga
Por encima de su potencia nominal, un resistor sigue calentándose. Humo, olor a
quemado o un cuerpo oscurecido indican que se está dañando. Puede cambiar de
valor o abrirse, chamuscar la placa y quemarte. Apaga la fuente o desenchúfala
de inmediato. No toques la pieza; deja que se enfríe. Después vuelve a calcular
la potencia, y usa una pieza con más potencia nominal o cambia el circuito.
Nunca sobrecargues una pieza a propósito.
:::

Supón que un resistor de 220 Ω y 1/4 W quedara conectado a 12 V, más o menos
la tensión del sistema eléctrico de un auto. Pruébalo en el instrumento, no en
la mesa de trabajo. Elige 1/4 W y escribe `12` en «Fuente», `220` en R y `25`
en «Temperatura ambiente»:

- Potencia: `P = 12² / 220 = 654,5 mW`, que se muestra como 655 mW, con
  `I = 12 V / 220 Ω = 54,5 mA`
- Potencia nominal usada: `0,6545 W / 0,25 W = 261,8 %`

«Potencia nominal usada» marca 261,8 % «de 250 mW a 25 °C». «Aumento de
temperatura» y «Temperatura superficial» muestran `—`, con el aviso «sobre su
potencia nominal: sin datos del fabricante». La curva del fabricante termina en
la potencia nominal, así que el instrumento no da ninguna temperatura en lugar
de inventarla.

Aquí la solución es la pieza de 1 W. Elige 1 W: «Potencia nominal usada» baja a
65,5 %, el aumento es `0,6545 W · 85 °C/W = 55,64 °C`, que se muestra como
56 °C, y la superficie queda en 81 °C, «puede quemar la piel». Ahora la pieza
está dentro de su potencia nominal, pero sigue calentándose mucho. Móntala
donde nada la toque.

El último ejemplo de la lección 01 ponía 22 V sobre un resistor de 220 Ω y
1/4 W: `22² / 220 = 2,2 W`. Elige 1/4 W y escribe `22` en «Fuente». El
instrumento muestra 2,2 W y «Potencia nominal usada» en 880 %. Incluso la
pieza de 1 W queda en 220 %. Ninguna de las dos lo aguanta. La respuesta es una
resistencia más grande, una tensión más baja o una pieza con mucha más potencia
nominal.

La lección 02 mostró que dos resistores iguales de 1/4 W en paralelo pueden
repartirse 1/2 W. Para la potencia, eso sigue valiendo. Pero dos piezas tibias
una al lado de la otra calientan el aire que las rodea, así que cada una queda
más caliente que si estuviera sola. Deja espacio entre las piezas calientes.

## Dónde vuelve a aparecer θ

La misma `T = Ta + P · θ` da la temperatura de un regulador (módulo 05) y de un
transistor, una pieza que conmuta o controla la corriente (módulo 03). Sus
hojas de datos dan θ para la pieza. Las pistas de cobre de una placa de
circuito se calientan de la misma forma cuando las atraviesa corriente
(módulo 11).

:::note Lo que viene ahora
La lección 07 estudia la resistencia que hay dentro de una pila, que convierte
potencia en calor dentro de la propia pila. Mide una pila con carga y sin
carga, con el multímetro de la lección 05.
:::
