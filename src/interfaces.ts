export interface PokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: TypeElement[];
  moves: MoveElement[];
  sprites: Sprites;
}
export interface PokemonRecord {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  firstMove: string;
  sprite: string;
  savedAt: string;
}
export interface Sprites {
  front_default: string;
}

export interface TypeElement {
  slot: number;
  type: TypeType;
}

export interface TypeType {
  name: string;
  url: string;
}

export interface MoveElement {
  move: MoveLearnMethodClass;
  version_group_details: VersionGroupDetail[];
}
export interface MoveLearnMethodClass {
  name: string;
  url: string;
}

export interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: MoveLearnMethodClass;
  order: null;
  version_group: MoveLearnMethodClass;
}