import type { Pokemon } from "@/types/pokemon";

// -----------------------------------------------------------------------
// Pokémon data registry
// -----------------------------------------------------------------------
// To add a new Pokémon in the future:
//   1. Create `data/pokemons/<id>-<name>.json` following the `Pokemon`
//      interface shape (see types/pokemon.ts and types/attack.ts).
//   2. Add one import line + one entry to the array below.
// No other application code needs to change — pages, components, and the
// probability engine all consume this single exported array.
// -----------------------------------------------------------------------

import bulbasaur from "./pokemons/001-bulbasaur.json";
import charmander from "./pokemons/002-charmander.json";
import squirtle from "./pokemons/003-squirtle.json";
import pikachu from "./pokemons/004-pikachu.json";
import eevee from "./pokemons/005-eevee.json";
import mew from "./pokemons/006-mew.json";

export const POKEMONS: Pokemon[] = [
  bulbasaur,
  charmander,
  squirtle,
  pikachu,
  eevee,
  mew,
] as Pokemon[];

export function getPokemonById(id: string): Pokemon | undefined {
  return POKEMONS.find((p) => p.id === id);
}

export function getAllExpansions(): string[] {
  return Array.from(new Set(POKEMONS.map((p) => p.expansion))).sort();
}

export function getAllTypes(): string[] {
  return Array.from(new Set(POKEMONS.map((p) => p.type))).sort();
}
