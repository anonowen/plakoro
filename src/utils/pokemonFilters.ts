import type { Pokemon } from "@/types/pokemon";

export interface PokemonFilters {
  search: string;
  expansion: string | null;
  type: string | null;
}

export const EMPTY_FILTERS: PokemonFilters = {
  search: "",
  expansion: null,
  type: null,
};

/** Applies search + expansion + type filters to a Pokémon list. */
export function filterPokemons(
  pokemons: Pokemon[],
  filters: PokemonFilters
): Pokemon[] {
  const search = filters.search.trim().toLowerCase();

  return pokemons.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search)) return false;
    if (filters.expansion && p.expansion !== filters.expansion) return false;
    if (filters.type && p.type !== filters.type) return false;
    return true;
  });
}
