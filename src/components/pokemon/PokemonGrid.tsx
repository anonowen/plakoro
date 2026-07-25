import type { Pokemon } from "@/types/pokemon";
import { PokemonCard } from "./PokemonCard";

interface PokemonGridProps {
  pokemons: Pokemon[];
}

export function PokemonGrid({ pokemons }: PokemonGridProps) {
  if (pokemons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
        <p className="font-medium">No Pokémon found</p>
        <p className="text-sm">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {pokemons.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  );
}
