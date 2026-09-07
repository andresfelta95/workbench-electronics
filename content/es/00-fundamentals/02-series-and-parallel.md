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
y tienes un cajón de 10 kΩ y 33 kΩ? Una de 10 kΩ en serie con una de 4,7 kΩ te
deja en 14,7 kΩ, dentro de la banda de tolerancia de casi cualquier trabajo.

**Repartir corriente.** Dos resistencias de 1 Ω en paralelo son 0,5 Ω, pero
además parten la corriente por la mitad, así que cada una disipa una *cuarta*
parte de la potencia que tendría que aguantar una sola pieza de 0,5 Ω, porque
`P = I² × R` y la corriente por cada una es la mitad. Poner piezas en paralelo
para repartir calor es práctica habitual en circuitos de potencia, y funciona
precisamente por ese cuadrado.

## Todo está en paralelo con algo

La regla que cambia cómo lees un esquemático: cada vez que conectas algo entre
dos nodos existentes has creado una combinación en paralelo, lo pretendieras o
no.

Conecta un multímetro sobre una resistencia y habrás puesto la impedancia de
entrada del aparato —típicamente 10 MΩ— en paralelo con ella. Frente a una
resistencia de 1 kΩ, esos 10 MΩ cambian el valor un 0,01 %, que es invisible.
Frente a una de 1 MΩ lo cambian un 9 %, y tu medida ha pasado a medir tu
multímetro.

Ese efecto —el hecho de conectar algo altera aquello a lo que lo conectas— se
llama **carga** (*loading*), y la lección siguiente trata del circuito donde más
duele.
