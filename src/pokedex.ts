import type { PokemonRecord, PokemonResponse, TypeElement } from "./interfaces.js";

export class Pokedex {
    async catchPokemon(nameOrId: string): Promise<PokemonRecord | undefined>{
        let pokemon: PokemonRecord | undefined = await  catchPokemonAPI(nameOrId);
        return pokemon;
    }
}



export async function catchPokemonAPI(nameOrId: string) {
  try {
    const pokemonRes: PokemonResponse = await getJson<PokemonResponse>(
      `https://pokeapi.co/api/v2/pokemon/${nameOrId}`,
    );
    const pokemonRecord: PokemonRecord = await toRecord(pokemonRes);
    return pokemonRecord;
  } catch (error) {
    console.error("Error de red o servidor inaccesible:", error);
  }
}

export async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as Promise<T>;
}

export async function toRecord(
  pokemonResponse: PokemonResponse,
): Promise<PokemonRecord> {
  const pokemon: PokemonRecord = {
    id: pokemonResponse.id,
    name: pokemonResponse.name,
    height: pokemonResponse.height,
    weight: pokemonResponse.weight,
    types: arrayTypesString(pokemonResponse.types),
    firstMove:
      pokemonResponse.moves[0]?.move.name || "No tiene movimientos registrados",
    sprite: pokemonResponse.sprites.front_default,
    savedAt: String(new Date()),
  };
  return pokemon;
}

export function arrayTypesString(types: TypeElement[]): string[] {
  return types.map((element) => element.type.name);
}

