import type { PokemonRecord } from "./interfaces.js";
import { Pokedex } from "./pokedex.js";

const pokedex1: Pokedex = new Pokedex();
const pokemon1: PokemonRecord | undefined = await pokedex1.catchPokemon("Pikachu");
console.log(pokemon1);