import { usePokemonData } from "@/hooks/usePokemonData";
import { usePokemonFilters } from "@/hooks/usePokemonFilters";
import { getAllExpansions, getAllTypes } from "@/data";
import { SearchBar } from "@/components/pokemon/SearchBar";
import { FilterBar } from "@/components/pokemon/FilterBar";
import { PokemonGrid } from "@/components/pokemon/PokemonGrid";

export default function HomePage() {
  const pokemons = usePokemonData();
  const { filtered, filters, setSearch, setExpansion, setType } =
    usePokemonFilters(pokemons);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Plakoro Pokédex</h1>
        <p className="text-muted-foreground">
          Browse every Pokémon and jump into the Dice Calculator or Roll Simulator.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={filters.search} onChange={setSearch} />
        <FilterBar
          expansions={getAllExpansions()}
          types={getAllTypes()}
          selectedExpansion={filters.expansion}
          selectedType={filters.type}
          onExpansionChange={setExpansion}
          onTypeChange={setType}
        />
      </div>

      <PokemonGrid pokemons={filtered} />
    </div>
  );
}
