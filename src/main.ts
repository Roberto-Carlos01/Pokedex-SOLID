import type { PokemonRecord } from "./interfaces.js";
import { Pokedex } from "./pokedex.js";
import { JsonPokemonStorage } from "./storage.js";

async function main(): Promise<void> {
  const storage = new JsonPokemonStorage("src/data/pokedex.json");
  const pokedex = new Pokedex(storage);

  const comando: string = process.argv[2] || "";
  const argumento: string = process.argv[3] || "";

  if (!comando) {
    console.log("No ingresaste ningún comando.");
    mostrarAyuda();
    return;
  }

  switch (comando) {
    case "catch": {
      if (!argumento) {
        console.log("Te faltó indicar el nombre del pokemon.");
        console.log("Ejemplo:");
        console.log("npx tsx src/main.ts catch pikachu");
        break;
      }

      const pokemon: PokemonRecord | undefined =
        await pokedex.catchPokemon(argumento);

      if (!pokemon) {
        console.log(`No fue posible capturar al pokemon "${argumento}".`);
        console.log(
          "Verifica que el nombre esté bien escrito o que el Pokémon exista.",
        );
        break;
      }

      console.log("\nPokemon capturado correctamente.\n");
      pokedex.show(pokemon);
      break;
    }

    case "list": {
      const pokemones = await pokedex.readAll();

      if (pokemones.length === 0) {
        console.log("La Pokédex está vacía.");
        break;
      }

      console.log(`Tienes ${pokemones.length} pokemon registrados.\n`);

      pokemones.forEach((pokemon) => {
        pokedex.show(pokemon);
      });

      break;
    }

    case "show": {
      if (!argumento) {
        console.log("Te faltó indicar el nombre del pokemon.");
        break;
      }

      const pokemon = await pokedex.findByName(argumento);

      if (!pokemon) {
        console.log(`No existe un pokemon llamado "${argumento}".`);
        break;
      }

      pokedex.show(pokemon);
      break;
    }

    case "type": {
      if (!argumento) {
        console.log("Debes indicar un tipo.");
        console.log("Ejemplo:");
        console.log("npx tsx src/main.ts type fire");
        break;
      }

      const pokemones = await pokedex.filterByType(argumento);

      if (pokemones.length === 0) {
        console.log(`No existen pokemon registrados del tipo "${argumento}".`);
        break;
      }

      console.log(
        `Se encontraron ${pokemones.length} pokemon(s) del tipo "${argumento}".\n`,
      );

      pokemones.forEach((pokemon) => {
        pokedex.show(pokemon);
      });

      break;
    }

    case "count": {
      const cantidad = await pokedex.count();

      console.log(`Llevas ${cantidad} pokemon registrados.`);
      break;
    }

    default: {
      console.log(`El comando "${comando}" no existe.`);
      mostrarAyuda();
      break;
    }
  }
}

main();

function mostrarAyuda(): void {
  console.log(`
==================== POKEDEX CLI ====================

Comandos disponibles:

  catch <pokemon>    Captura un pokemon desde la API y lo guarda
  list               Muestra todos los pokemon guardados
  show <pokemon>     Muestra un pokemon en detalle
  type <tipo>        Filtra pokemon por tipo
  count              Muestra cuantos pokemon tienes

Ejemplos:

  npx tsx src/main.ts catch pikachu
  npx tsx src/main.ts list
  npx tsx src/main.ts show charmander
  npx tsx src/main.ts type fire
  npx tsx src/main.ts count

=====================================================
`);
}
