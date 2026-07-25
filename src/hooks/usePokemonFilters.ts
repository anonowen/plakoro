import { useMemo, useState } from "react";
import type { Pokemon } from "@/types/pokemon";
import {
  EMPTY_FILTERS,
  filterPokemons,
  type PokemonFilters,
} from "@/utils/pokemonFilters";

export function usePokemonFilters(pokemons: Pokemon[]) {
  const [filters, setFilters] = useState<PokemonFilters>(EMPTY_FILTERS);

  const filtered = useMemo(
    () => filterPokemons(pokemons, filters),
    [pokemons, filters]
  );

  function setSearch(search: string) {
    setFilters((f) => ({ ...f, search }));
  }
  function setExpansion(expansion: string | null) {
    setFilters((f) => ({ ...f, expansion }));
  }
  function setType(type: string | null) {
    setFilters((f) => ({ ...f, type }));
  }
  function reset() {
    setFilters(EMPTY_FILTERS);
  }

  return { filters, filtered, setSearch, setExpansion, setType, reset };
}
