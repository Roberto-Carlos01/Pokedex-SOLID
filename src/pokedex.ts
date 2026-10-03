import type { PokemonRecord, PokemonResponse, TypeElement } from "./interfaces.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";

export class Pokedex {
  // metodo que atrapa un pokemon de la API y lo guarda en disco (JSON)
  async catchPokemon(nameOrId: string): Promise<PokemonRecord | undefined> {
    let pokemon: PokemonRecord | undefined = await catchPokemonAPI(nameOrId);
    //validamos el directorio
    await mkdir('src/data', { recursive: true });
    let pokemons: PokemonRecord[];
    try {
      let texto: string = await readFile("src/data/pokedex.json", 'utf-8');
      pokemons = texto.trim() === "" ? [] : JSON.parse(texto);
    } catch (error) {
      pokemons = [];
      //creamos el archivo
      await writeFile("src/data/pokedex.json", "[]", "utf-8");
    }
    // validamos que el pokemo que queremos ingresar no exista aun en el pokedex.json
    const pokemonRepeat: PokemonRecord | undefined = pokemons.find((p) => p.id === pokemon?.id)
    if (!pokemonRepeat && pokemon) {
      pokemons.push(pokemon);
      save(pokemons);
    }
    return pokemon;
  }
}


export async function save(records: PokemonRecord[]): Promise<void> {
  await writeFile(
    "src/data/pokedex.json",
    JSON.stringify(records, null, 2),
    "utf-8",
  );
}

export async function catchPokemonAPI(nameOrId: string): Promise<PokemonRecord | undefined> {
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

