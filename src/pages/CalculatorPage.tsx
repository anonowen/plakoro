import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePokemon } from "@/hooks/usePokemonData";
import { useDiceLoadout } from "@/hooks/useDiceLoadout";
import { useDiceCalculator } from "@/hooks/useDiceCalculator";
import { DiceConfigForm } from "@/components/dice/DiceConfigForm";
import { ProbabilityResultPanel } from "@/components/dice/ProbabilityResultPanel";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function CalculatorPage() {
  const { id } = useParams<{ id: string }>();
  const pokemon = usePokemon(id);
  const { loadout, setFaceEnergy, resetLoadout } = useDiceLoadout(id ?? "");
  const [attackId, setAttackId] = useState<string>(pokemon?.attacks[0]?.id ?? "");

  const selectedAttack = pokemon?.attacks.find((a) => a.id === attackId) ?? pokemon?.attacks[0];
  const report = useDiceCalculator(loadout.dice, selectedAttack);

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

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <Link
        to={`/pokemon/${pokemon.id}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {pokemon.name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Dice Calculator — {pokemon.name}</h1>
        <p className="text-muted-foreground">
          Build your Energy Dice loadout, pick an attack, and see the exact
          probabilities before you roll.
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Attack</span>
            <Select value={attackId} onChange={(e) => setAttackId(e.target.value)}>
              {pokemon.attacks.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>

      <DiceConfigForm dice={loadout.dice} onFaceChange={setFaceEnergy} onReset={resetLoadout} />

      {report && <ProbabilityResultPanel report={report} />}
    </div>
  );
}
