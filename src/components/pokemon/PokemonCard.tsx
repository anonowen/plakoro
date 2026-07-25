import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Pokemon } from "@/types/pokemon";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnergyType } from "@/utils/energyRegistry";

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const typeDef = getEnergyType(pokemon.type);

  return (
    <Link to={`/pokemon/${pokemon.id}`} className="block h-full">
      <Card className="flex h-full flex-col overflow-hidden">
        <div
          className="flex aspect-square items-center justify-center"
          style={{ backgroundColor: `${typeDef.color}18` }}
        >
          <img
            src={pokemon.image}
            alt={pokemon.name}
            loading="lazy"
            className="h-3/4 w-3/4 object-contain drop-shadow-sm transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{pokemon.name}</h3>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5" /> {pokemon.hp}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge style={{ backgroundColor: `${typeDef.color}22`, color: typeDef.color }}>
              {typeDef.icon} {typeDef.name}
            </Badge>
            <Badge variant="muted">{pokemon.expansion}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
