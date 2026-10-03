# Practica retadora - Clase 5 (Ahora con SOLID)

## Pokedex Offline

**Tiempo estimado:** 2 a 3 horas, repartidas en varios dias (no lo hagas de una sentada)
**Dificultad:** alta a proposito. Vas a tener que buscar cosas que NO vimos en clase.

---

## El problema que vas a resolver

Cada vez que tu programa quiere saber algo de un Pokemon, le pide los datos a un servidor
que esta en otro pais. Eso tarda. Y si el servidor se cae, o te quedas sin internet,
tu programa se queda sin nada.

Los backends de verdad resuelven esto asi: **piden el dato una vez, lo guardan en disco, y
las siguientes veces lo leen de disco.** A eso se le llama cache.

Tu mision: construir una **Pokedex** que:

1. Pide datos a una API publica (internet).
2. Los guarda en un archivo `.json` dentro de tu proyecto (disco).
3. Puede leer y consultar ese archivo **sin volver a pedir nada a internet**.

---

## Reglas del juego

- **Esto es un programa de consola. Punto.** Nada de navegador, nada de HTML, nada de
  Express ni de servidores. Se corre con `npx tsx index.ts` y todo lo que produce sale
  por la terminal o queda escrito en un archivo. Si en algun momento te ves abriendo un
  `.html`, te desviaste.
- **No instales librerias para pedir datos.** Nada de `axios`, nada de `node-fetch`.
  Node 22 ya trae `fetch` adentro, igual que el navegador. Eso es nuevo y es a proposito:
  quiero que veas que el `fetch` que aprendiste en clase es el mismo aqui.
- Lo unico que instalas es `typescript` y `tsx` (para correr TS sin compilar a mano).
- Todo en **TypeScript**, con tipos explicitos. Nada de `any` suelto.
- Todas las respuestas HTTP van tipadas con una `interface`.
- Todo lo que tarde (red, disco) va con `async` / `await`.
- Todo lo que pueda fallar va dentro de `try` / `catch`.
- Nombres de variables y funciones **en ingles**. Comentarios en el idioma que quieras.
- Si copias codigo de internet y no sabes explicarlo linea por linea, **no cuenta**.

---

## Lo nuevo que NO vimos en clase

Esta parte es el reto. En clase 5 tu programa solo leia datos de internet.
Ahora tambien va a **escribir y leer archivos** en tu computadora.

Node trae un modulo para eso: `fs` (file system). Su version con promesas se importa asi:

```ts
import { readFile, writeFile, mkdir } from "node:fs/promises";
```

Tres cosas que necesitas saber, y nada mas:

```ts
// Escribir un archivo (lo crea, o lo pisa si ya existia)
await writeFile("data/archivo.json", "texto que quiero guardar", "utf-8");

// Leer un archivo (te devuelve TEXTO, no un objeto)
const texto: string = await readFile("data/archivo.json", "utf-8");

// Crear una carpeta (recursive: true = no truena si ya existe)
await mkdir("data", { recursive: true });
```

Fijate en los `await`. Leer y escribir en disco **tambien tarda**. Es exactamente
la misma idea del vale que vimos en clase, solo que ahora el mesero es tu disco duro.

### El puente entre texto y objeto

Un archivo guarda **texto**. Tu programa trabaja con **objetos**. El traductor es `JSON`:

```ts
const objeto = { name: "pikachu", type: "electric" };

const texto = JSON.stringify(objeto, null, 2); // objeto -> texto
const otraVez = JSON.parse(texto); // texto -> objeto
```

- `JSON.stringify(objeto, null, 2)` -> el `2` es la sangria, para que el archivo se lea bonito.
- `JSON.parse(texto)` -> te devuelve **`any`**. Igualito que `res.json()` de la clase.
  Ya sabes lo que toca hacer ahi.

**Pregunta para pensar antes de seguir:** si `JSON.parse` devuelve `any`, y en la clase
dijimos que `any` es "quitarse el cinturon de seguridad", que tienes que hacer para
volver a ponertelo?

---

## La API que vas a usar

**PokeAPI** - publica, gratis, sin registro, sin llave de acceso:

```
https://pokeapi.co/api/v2/pokemon/pikachu
https://pokeapi.co/api/v2/pokemon/25
```

Abre esa URL en tu navegador **antes de escribir una sola linea de codigo**.
Vas a ver un objeto gigante y anidado. No te asustes: no necesitas todo, solo unos campos.

Los que te interesan (busca en el navegador donde esta cada uno):

| Dato          | Donde vive en la respuesta                 |
| ------------- | ------------------------------------------ |
| id            | `id`                                       |
| nombre        | `name`                                     |
| altura        | `height`                                   |
| peso          | `weight`                                   |
| tipos         | `types[0].type.name`, `types[1].type.name` |
| primer ataque | `moves[0].move.name`                       |
| sprite        | `sprites.front_default`                    |

Mira bien la fila de `types`. Es un **arreglo de objetos**, y adentro de cada objeto
hay **otro objeto**. Eso es tres niveles de profundidad. Ahi es donde esta el reto real
de esta practica, y es justo lo que necesitas reforzar.

---

## Nivel 1 - Traer un Pokemon y tiparlo

1. Crea el proyecto (puedes reusar `ts-repaso/` o hacer uno nuevo, `pokedex/`).
2. Escribe las `interface` necesarias para la respuesta. Vas a necesitar **mas de una**,
   porque hay objetos dentro de objetos. Empieza por las de adentro:

```ts
interface TypeInfo {
  name: string;
}

interface PokemonType {
  slot: number;
  type: TypeInfo; // una interface DENTRO de otra
}

interface PokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[]; // un ARREGLO de objetos tipados
  // te faltan moves y sprites: eso lo escribes tu
}
```

3. Usa el `getJson<T>` que te pase en clase para traer a `pikachu`.
4. Imprime en consola: nombre, altura, peso, **el primer tipo** y **el primer ataque**.

**Checkpoint:** si borras la `interface` y dejas `any`, el programa sigue funcionando igual.
Entonces, para que sirvio escribirla? Escribe tu respuesta en un comentario dentro del codigo.

---

## Nivel 2 - Guardarlo en disco

1. Crea una carpeta `data/` (con `mkdir`, desde el codigo, no a mano).
2. Guarda el Pokemon en `data/pokedex.json`.
3. **No guardes la respuesta completa de la API.** Es enorme y el 95 por ciento no lo usas.
   Guarda solo un objeto limpio, con la forma que TU decidas:

```ts
interface PokemonRecord {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[]; // ojo: aqui ya NO es un arreglo de objetos, es de strings
  firstMove: string;
  sprite: string;
  savedAt: string; // fecha en que lo guardaste
}
```

4. Escribe una funcion que convierta una `PokemonResponse` en un `PokemonRecord`:

```ts
function toRecord(response: PokemonResponse): PokemonRecord {
  // aqui es donde aplastas los objetos anidados
  // pista para types: mira el metodo .map() de los arreglos
}
```

**Checkpoint:** abre `data/pokedex.json` con el editor. Se ve legible? Si esta todo en
una sola linea, te falto el `2` del `stringify`.

---

## Nivel 3 - Leer sin internet

1. Escribe una funcion que **lea** `data/pokedex.json` y devuelva los datos tipados.
2. Apaga el wifi. Corre el programa en modo lectura. Tiene que funcionar igual.
3. Imprime los datos con un formato bonito, algo asi:

```
#25 PIKACHU
  Tipos:   electric
  Altura:  4
  Peso:    60
  Ataque:  mega-punch
  Guardado: 2026-07-18
```

**Checkpoint:** si el archivo `data/pokedex.json` no existe todavia y tu programa
intenta leerlo, que pasa? Pruebalo (borra el archivo y corre). Ahora atrapalo con
`try/catch` y muestra un mensaje amable en vez de que el programa reviente.

---

## Nivel 4 - La Pokedex acumulativa

Hasta ahora tu archivo guarda **un** Pokemon. Ahora tiene que guardar **muchos**,
y sin perder los que ya estaban.

1. Cambia el archivo para que guarde un **arreglo** de `PokemonRecord`.
2. Escribe la operacion completa, que es el patron mas usado en todo el backend:

   **leer lo que hay -> modificarlo en memoria -> escribirlo completo de vuelta**

3. Si el Pokemon ya estaba guardado, **no lo dupliques**: actualizalo.
   (Pista: `.find()` y `.findIndex()` sobre arreglos.)
4. Trae al menos 5 Pokemon distintos, en corridas separadas del programa,
   y comprueba que el archivo los tiene todos.

**Pregunta trampa:** por que hay que leer el archivo ANTES de escribirlo?
Que pasaria si solo escribes? Pruebalo y mira el desastre. Ese error tiene nombre
en el mundo real, y lo vas a cometer alguna vez en produccion si no lo entiendes ahora.

---

## Nivel 5 - Envolver todo en una clase

Recuerda la Clase 4: clases, metodos, `this`, `private`. Ahora los metodos van a ser `async`.

Construye esta clase. La firma te la doy; el cuerpo lo escribes tu:

```ts
class Pokedex {
  constructor(private readonly filePath: string) {}

  // trae de la API y lo guarda en el archivo
  async catchPokemon(nameOrId: string): Promise<PokemonRecord> {}

  // lee el archivo completo
  async readAll(): Promise<PokemonRecord[]> {}

  // busca uno por nombre en el archivo. undefined si no esta
  async findByName(name: string): Promise<PokemonRecord | undefined> {}

  // cuantos llevas guardados
  async count(): Promise<number> {}

  // todos los que sean de un tipo dado (ej: 'fire')
  async filterByType(type: string): Promise<PokemonRecord[]> {}

  // metodo privado de apoyo: escribe el arreglo completo al disco
  private async save(records: PokemonRecord[]): Promise<void> {}
}
```

Y usala asi:

```ts
async function main(): Promise<void> {
  const pokedex = new Pokedex("data/pokedex.json");

  await pokedex.catchPokemon("charmander");
  await pokedex.catchPokemon("squirtle");

  console.log("Llevas", await pokedex.count(), "pokemon");
  console.log(await pokedex.filterByType("fire"));
}

main();
```

**Preguntas para pensar:**

- Por que `catchPokemon` devuelve `Promise<PokemonRecord>` y no `PokemonRecord`?
- Por que `save` es `private`? Que pasaria si alguien de afuera pudiera llamarlo?
- `findByName` devuelve `Promise<PokemonRecord | undefined>`. Por que el `undefined`?
  Que te esta obligando a hacer TypeScript cuando usas el resultado?

---

## Nivel 6 - Convertirlo en un CLI de verdad

Hasta ahora, para pedir otro Pokemon tienes que **editar el codigo** y volver a correr.
Eso no es un programa: es un experimento. Un programa de verdad recibe lo que tiene
que hacer **desde afuera**, sin que nadie lo modifique.

En Node, lo que escribes en la terminal despues del nombre del archivo te llega en un
arreglo llamado `process.argv`. Imprimelo antes que nada y mira que trae:

```ts
console.log(process.argv);
```

Corre `npx tsx index.ts catch pikachu` y observa. Vas a ver **cuatro** elementos, no dos.
Los dos primeros son ruido de Node (donde esta node y donde esta tu archivo).
Los tuyos empiezan en la posicion 2.

**Pregunta antes de programar:** por que crees que `process.argv` es un arreglo de
`string[]` y no de otra cosa? Si escribo `npx tsx index.ts catch 25`, que tipo tiene
ese `25`? Compruebalo con `typeof`.

Tu Pokedex tiene que responder a estos comandos:

```
npx tsx index.ts catch pikachu      -> lo trae de la API y lo guarda
npx tsx index.ts list               -> muestra todos los guardados
npx tsx index.ts show charmander    -> muestra uno solo, con detalle
npx tsx index.ts type fire          -> muestra los de ese tipo
npx tsx index.ts count              -> cuantos llevas
```

Y tiene que portarse bien cuando el usuario se equivoca:

- `npx tsx index.ts` (sin nada) -> muestra la ayuda con los comandos disponibles.
- `npx tsx index.ts volar` -> "comando desconocido" + la ayuda. **No** un error feo.
- `npx tsx index.ts catch` (sin nombre) -> "te falto decirme cual Pokemon".
- `npx tsx index.ts catch pikachuuu` -> el Pokemon no existe. La API responde 404.
  Mensaje amable, y el programa termina sin reventar.

**Checkpoint:** dale tu programa a alguien que no sepa programar, sin explicarle nada,
y dile que consiga un Charizard. Si lo logra solo leyendo lo que sale en pantalla,
tu CLI esta bien hecho. Si te tiene que preguntar, te falto ayuda.

**Cuidado con esto:** cuando encadenes los comandos vas a querer usar `switch`.
Tu funcion `main` sigue siendo `async`, y adentro de cada caso vas a usar `await`.
Si algo no te compila ahi, lee bien el error: casi seguro se te escapo un `await`
o pusiste `await` fuera de una funcion `async`.

---

## Nivel 7 - Reto final (opcional, pero hazlo)

Elige **uno** de estos dos. Si haces los dos, mejor.

**A. Traer varios a la vez.**
Que `catch` acepte varios nombres: `npx tsx index.ts catch pikachu bulbasaur eevee`.
Hazlo primero **uno por uno** con un `for`, y mide con `console.time()` y
`console.timeEnd()`. Despues busca `Promise.all` y hazlo **todos al mismo tiempo**.
Mide otra vez. Escribe los dos numeros en un comentario y explicate a ti mismo
por que cambio tanto.

**B. Cache de verdad.**
Antes de llamar a la API, revisa si ese Pokemon **ya esta** en el archivo.
Si ya esta, no llames a internet: devuelvelo del disco y avisa `(desde cache)`.
Si no esta, llamalo, guardalo y avisa `(desde la API)`.
Esto es literalmente lo que hace Redis en un backend real.

---

## Que me tienes que entregar

1. El proyecto corriendo, para compartir pantalla
2. El archivo `data/pokedex.json` con **al menos 5 Pokemon**, todos capturados
   desde la terminal, sin haber tocado el codigo entre uno y otro.
3. Un archivo `RESPUESTAS.md` en la raiz del proyecto con estas cinco preguntas contestadas
   **con tus palabras** (no busques en internet, contesta lo que entendiste):
   1. Por que `readFile` necesita `await`? Que hace tu programa mientras lee el disco?
   2. Cual es la diferencia entre lo que devuelve `fetch` y lo que devuelve `res.json()`?
   3. Que tienen en comun `res.json()` y `JSON.parse()`? Por que los dos son peligrosos?
   4. En `types[0].type.name`, explica que hay en cada paso: que es `types`, que es `types[0]`,
      que es `types[0].type`, y que es `types[0].type.name`.
   5. Si un backend real guardara sus datos en un archivo JSON como el tuyo, que problema
      crees que tendria cuando lo usen 1000 personas al mismo tiempo?

4. **Una confusion.** Algo que no te haya cerrado del todo. Con eso arrancamos la Clase 6.

---

## Si te trabas

En ese orden:

1. Lee el error completo. No la primera linea: el error completo.
2. Imprime con `console.log` lo que crees que tienes, y compruebalo. Casi siempre no es lo
   que creias.
3. Si el problema es un objeto anidado, revisa el cheatsheet de objetos que te pase.
4. Escribeme. Pero mandame **que intentaste** y **que error te sale**, no solo "no me sale".

No busques la solucion completa en internet antes de haberte peleado 20 minutos con el
problema. La pelea es la clase.
