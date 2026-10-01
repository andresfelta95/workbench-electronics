---
slug: serie-y-paralelo
title: Serie y paralelo
summary: Dos reglas que reducen cualquier red de resistencias a un número — y la razón de que el comportamiento de tu circuito cambie al conectarle algo.
minutes: 8
---

Los circuitos reales tienen más de una resistencia. Dos reglas reducen cualquier
combinación a un valor equivalente único, y una vez que la red es un solo valor,
la ley de Ohm se le aplica directamente.

## Serie: un solo camino

Dos componentes están **en serie** cuando comparten un único camino: toda la
corriente que pasa por uno tiene que pasar por el siguiente, porque no tiene otro
sitio al que ir.

`R_total = R₁ + R₂ + R₃ + …`

Las resistencias se suman. La consecuencia importa más que la fórmula: **la
corriente es idéntica en todos los puntos de una cadena en serie**, y la tensión
de la fuente se reparte entre los componentes en proporción a su resistencia.
Una de 1 kΩ y otra de 9 kΩ en serie sobre 10 V te dan 1 V y 9 V respectivamente,
que es justo la idea de la lección siguiente.

## Paralelo: varios caminos

Están **en paralelo** cuando comparten los dos puntos de conexión, así que la
corriente se reparte entre ellos.

`1 / R_total = 1 / R₁ + 1 / R₂ + …`

Para exactamente dos resistencias, el atajo es más cómodo:

`R_total = (R₁ × R₂) / (R₁ + R₂)`

Aquí **la tensión es idéntica en todas las ramas**, y la corriente se reparte de
forma inversamente proporcional a la resistencia: la rama de menor resistencia se
lleva la porción mayor.

Las dos reglas salen de otras dos más profundas, las **leyes de Kirchhoff**. La
ley de corrientes: las corrientes que entran en un nodo suman lo mismo que las
que salen, porque la carga no se acumula ni desaparece en una unión. La ley de
tensiones: las tensiones alrededor de cualquier lazo cerrado suman cero. Que la
corriente sea idéntica en toda una cadena en serie es la ley de corrientes en
acción; que la tensión sea idéntica en todas las ramas en paralelo es la ley de
tensiones. Las leyes de Kirchhoff tienen su propia lección más adelante en este
módulo, para las redes que la serie y el paralelo no pueden reducir.

Monta una red abajo y observa el valor equivalente, la corriente de cada rama y
la potencia en cada componente.

::widget{type="resistor-network" supply="9"}

## Las dos comprobaciones de sentido común

Nunca deberías tener que fiarte de una cuenta que puedes verificar de un vistazo:

- **El total en serie es siempre mayor que la mayor de las resistencias.** Has
  añadido un estrechamiento al camino.
- **El total en paralelo es siempre menor que la menor de ellas.** Has añadido
  otro camino, así que pasa más corriente con el mismo empuje.

Si tu resultado rompe cualquiera de las dos, la cuenta está mal. Dos resistencias
iguales en paralelo dan exactamente la mitad del valor — el caso más frecuente de
todos, y conviene reconocerlo al instante.

:::key
Diez resistencias de 1 kΩ en paralelo son 100 Ω. Cien de ellas son 10 Ω. Añadir
caminos añade conductancia, y es la conductancia —no la resistencia— lo que se
suma linealmente en paralelo. Pensar en conductancia (`G = 1/R`, en siemens)
vuelve triviales las redes en paralelo y merece los diez minutos que cuesta
acostumbrarse.
:::

## Por qué esto no es un ejercicio

Dos situaciones en las que estas reglas dejan de ser académicas:

**Conseguir un valor que no tienes.** Las resistencias vienen en series
normalizadas —E12, E24—, no en cualquier valor que se te ocurra. ¿Necesitas 15 kΩ
y tienes un cajón de 10 kΩ y 33 kΩ? Dos de 10 kΩ en paralelo dan 5 kΩ, y una
tercera de 10 kΩ en serie con esa pareja te deja en 15 kΩ exactos: las dos
reglas de esta lección, y nada que no esté en el cajón.

**Repartir corriente.** Dos resistencias de 1 Ω en paralelo son 0,5 Ω, y además
parten la corriente por la mitad. Como `P = I² × R`, cada una disipa
`(I/2)² × 1 Ω = I²/4`, mientras que una sola pieza de 0,5 Ω con toda la
corriente disiparía `I² × 0,5 Ω = I²/2`. Así que cada resistencia aguanta la
*mitad* de la potencia de la pieza única a la que sustituye (y una cuarta parte
de lo que aguantaría una sola de 1 Ω con toda la corriente). Poner piezas
iguales en paralelo para repartir calor es práctica habitual en circuitos de
potencia: la potencia total no cambia, pero cada pieza solo tiene que soportar
su parte.

## Todo está en paralelo con algo

La regla que cambia cómo lees un esquemático: cada vez que conectas algo entre
dos nodos existentes has creado una combinación en paralelo, lo pretendieras o
no.

Conecta un multímetro sobre una resistencia y habrás puesto la impedancia de
entrada del aparato —típicamente 10 MΩ— en paralelo con ella. Frente a una
resistencia de 1 kΩ, esos 10 MΩ cambian el valor un 0,01 %, que es invisible.
Frente a una de 1 MΩ lo cambian un 9 %, y tu medida ha pasado a medir tu
multímetro. El multímetro tiene su propia lección más adelante en este módulo,
incluido lo que le hace al circuito que mide.

Ese efecto —el hecho de conectar algo altera aquello a lo que lo conectas— se
llama **carga** (*loading*), y la lección siguiente trata del circuito donde más
duele.
