import type { PokemonRecord, pokemonStorage } from "./interfaces.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";

export class JsonPokemonStorage implements pokemonStorage{
    private readonly filePath: string;
    constructor(filePath: string){
        this.filePath = filePath;
    }
    
    async read(): Promise<PokemonRecord[]>{
        try {
            let texto : string = await readFile(this.filePath, 'utf-8');
            return texto.trim() === '' ? [] : JSON.parse(texto);
        } catch (error) {
            console.log("El archivo no existe aún, se retornará un arreglo vacío.");
            return [];
        }
    }
    async save(records : PokemonRecord[]): Promise<void>{
        try {
            const lastSlash = this.filePath.lastIndexOf("/");
            if (lastSlash !== -1) {
                const dir = this.filePath.substring(0, lastSlash);
                await mkdir(dir, { recursive: true });
            }
            await writeFile(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
        } catch (error) {
            throw error;
        }
    }
}