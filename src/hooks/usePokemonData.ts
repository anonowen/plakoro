import { useMemo } from "react";
import { POKEMONS, getPokemonById } from "@/data";
import type { Pokemon } from "@/types/pokemon";

/** Returns the full static Pokémon list (memoized reference). */
export function usePokemonData(): Pokemon[] {
  return useMemo(() => POKEMONS, []);
}

/** Returns a single Pokémon by id, or undefined if not found. */
export function usePokemon(id: string | undefined): Pokemon | undefined {
  return useMemo(() => (id ? getPokemonById(id) : undefined), [id]);
}
