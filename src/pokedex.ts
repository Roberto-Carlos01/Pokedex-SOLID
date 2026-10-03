import type { PokemonRecord, PokemonResponse, pokemonStorage, TypeElement } from "./interfaces.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";

export class Pokedex {

  // metodo que atrapa un pokemon de la API y lo guarda en disco (JSON)
  // Ahora primero buscaremos el pokemon en el JSON y luego en la API , aplicando DIP: Dependency Inversion Principle
  private storage: pokemonStorage;  
  constructor(storage: pokemonStorage){
    this.storage = storage;
  }
  async catchPokemon(nameOrId: string): Promise<PokemonRecord | undefined> {
    const pokemones: PokemonRecord[] = await this.storage.read();
    //validamos el directorio
    let pokemon : PokemonRecord | undefined = pokemones.find((p)=> {
      return (p.id === parseInt(nameOrId) || p.name.toLocaleLowerCase() === nameOrId.toLocaleLowerCase());
    })
    if (!pokemon) {
      pokemon = await this.catchPokemonAPI(nameOrId);
    }
    if (!pokemon) {
      console.log(`El Pokemon : ${nameOrId} No existe`);
    }
    return pokemon;
  }

      async catchPokemonAPI(nameOrId: string): Promise<PokemonRecord | undefined> {
      const pokemon = await this.getJson<PokemonResponse>(
        `https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`,
      );
      if (!pokemon) {
        return undefined;
      }
      const pokemonR: PokemonRecord = this.toRecord(pokemon);

      const pokemones = await this.storage.read();

      const pokemonRepetido = pokemones.find(
        (p) => p.id === pokemonR.id,
      );
      if (pokemonRepetido) {
        console.log(`El pokemon : ${pokemonRepetido.name} existe en la data`);
        return pokemonR;
      }
      pokemones.push(pokemonR);

      await this.save(pokemones);
      return pokemonR;
    }
    async readAll(): Promise<PokemonRecord[]> {
    console.log("================== FILE POKEDEX.JSON =====================");
    return this.storage.read();
  }

  async findByName(name: string): Promise<PokemonRecord | undefined> {
    const pokemones = await this.storage.read();
    const pokemon = pokemones.find((pok) => {
      return pok.name.toLowerCase() === name.toLowerCase();
    });
    return pokemon;
  }
    async getJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    return res.json() as Promise<T>;
  }
  toRecord(
    pokemonResponse: PokemonResponse,
  ): PokemonRecord {
    const pokemon: PokemonRecord = {
      id: pokemonResponse.id,
      name: pokemonResponse.name,
      height: pokemonResponse.height,
      weight: pokemonResponse.weight,
      types: this.arrayTypesString(pokemonResponse.types),
      firstMove:
        pokemonResponse.moves[0]?.move.name || "No tiene movimientos registrados",
      sprite: pokemonResponse.sprites.front_default,
      savedAt: String(new Date()),
    };
    return pokemon;
  }
  async save(records: PokemonRecord[]): Promise<void> {
    await writeFile(
      "src/data/pokedex.json",
      JSON.stringify(records, null, 2),
      "utf-8",
    );
  }
  arrayTypesString(types: TypeElement[]): string[] {
    return types.map((element) => element.type.name);
  }
}






