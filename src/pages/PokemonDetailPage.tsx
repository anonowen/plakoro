import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calculator, Dices, Heart } from "lucide-react";
import { usePokemon } from "@/hooks/usePokemonData";
import { AttackList } from "@/components/pokemon/AttackList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEnergyType } from "@/utils/energyRegistry";

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pokemon = usePokemon(id);

  if (!pokemon) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold">Pokémon not found</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Back to Pokédex
        </Link>
      </div>
    );
  }

  const typeDef = getEnergyType(pokemon.type);
  const weaknessDef = getEnergyType(pokemon.weakness);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <Link
        to="/"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Pokédex
      </Link>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          className="flex aspect-square w-48 shrink-0 items-center justify-center rounded-3xl"
          style={{ backgroundColor: `${typeDef.color}18` }}
        >
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="h-3/4 w-3/4 object-contain drop-shadow"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
          <h1 className="text-3xl font-bold">{pokemon.name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge style={{ backgroundColor: `${typeDef.color}22`, color: typeDef.color }}>
              {typeDef.icon} {typeDef.name}
            </Badge>
            <Badge variant="muted">{pokemon.expansion}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> HP {pokemon.hp}
            </Badge>
            <Badge variant="outline">
              Weak to {weaknessDef.icon} {weaknessDef.name}
            </Badge>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button asChild>
              <Link to={`/pokemon/${pokemon.id}/calculator`}>
                <Calculator className="h-4 w-4" /> Dice Calculator
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to={`/pokemon/${pokemon.id}/simulator`}>
                <Dices className="h-4 w-4" /> Roll Simulator
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Attacks</h2>
        <AttackList attacks={pokemon.attacks} />
      </div>
    </div>
  );
}
