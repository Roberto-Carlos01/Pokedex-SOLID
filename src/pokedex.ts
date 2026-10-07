import type { PokemonRecord, PokemonResponse, pokemonStorage, TypeElement } from "./interfaces.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";

export class Pokedex {

  // metodo que atrapa un pokemon de la API y lo guarda en disco (JSON)
  // Ahora primero buscaremos el pokemon en el JSON y luego en la API , aplicando DIP: Dependency Inversion Principle
  private storage : pokemonStorage;
  constructor(storage: pokemonStorage){
    this.storage = storage
  }
  //metodo para atrapar un pokemon primero desde el disco (JSON) y si no hay , desde la API publica
  async catchPokemon(nameOrId: string): Promise<PokemonRecord | undefined>{
    //primero buscar en el disco (JSON)
    const pokemons: PokemonRecord[] = await this.storage.read();
    let pokemon: PokemonRecord | undefined = pokemons.find((p)=>{
      return (p.id === parseInt(nameOrId) || p.name.toLowerCase() === nameOrId.toLowerCase())
    })
    if(pokemon){
      console.log(" +++++ desde cache +++++")
    }
    if (!pokemon){
      console.log(" +++++ desde API +++++")
      pokemon = await this.catchPokemonAPI(nameOrId);
    }
    if(!pokemon){
      console.log(`No se encontro el pokemon: ${nameOrId}`);
    }
    return pokemon;
  }

  async catchPokemonAPI(nameOrId: string): Promise<PokemonRecord | undefined> {
    const pokemon = await this.getJson<PokemonResponse>(
      `https://pokeapi.co/api/v2/pokemon/${nameOrId}`,
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
    await this.storage.save(pokemones);
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
  toRecord(pokemonResponse: PokemonResponse): PokemonRecord {
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
  async filterByType( type:string){
    const pokemones: PokemonRecord[] = await this.storage.read();
    return pokemones.filter((pok)=>{
      return pok.types.includes(type);
    })
  }
  async count(){
    const pokemones = await this.storage.read();
    return pokemones.length;
  }
  async show(pokemon: PokemonRecord) {
    if(!pokemon){
      console.log("No se encontro el pokemon");
      return;
    }
    console.log("==================================");
    console.log(`📖 Pokédex #${pokemon.id}`);
    console.log(`Nombre: ${pokemon.name}`);
    console.log(`Altura: ${pokemon.height}`);
    console.log(`Peso: ${pokemon.weight}`);
    console.log(`Tipos: ${pokemon.types.join(", ")}`);
    console.log(`Primer ataque: ${pokemon.firstMove}`);
    console.log(`Sprite: ${pokemon.sprite}`);
    console.log(`Guardado: ${pokemon.savedAt}`);
    console.log("==================================");
  }
}






