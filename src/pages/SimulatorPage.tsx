import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Dices } from "lucide-react";
import { usePokemon } from "@/hooks/usePokemonData";
import { useDiceLoadout } from "@/hooks/useDiceLoadout";
import { useDiceCalculator } from "@/hooks/useDiceCalculator";
import { useDiceRoll } from "@/hooks/useDiceRoll";
import { DiceRollAnimation } from "@/components/dice/DiceRollAnimation";
import { RollOutcomeBanner } from "@/components/dice/RollOutcomeBanner";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SimulatorPage() {
  const { id } = useParams<{ id: string }>();
  const pokemon = usePokemon(id);
  const { loadout } = useDiceLoadout(id ?? "");
  const [attackId, setAttackId] = useState<string>(pokemon?.attacks[0]?.id ?? "");

  const selectedAttack = pokemon?.attacks.find((a) => a.id === attackId) ?? pokemon?.attacks[0];
  const report = useDiceCalculator(loadout.dice, selectedAttack);
  const { roll, isRolling, result } = useDiceRoll(loadout.dice, selectedAttack);

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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <Link
        to={`/pokemon/${pokemon.id}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {pokemon.name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Roll Simulator — {pokemon.name}</h1>
        <p className="text-muted-foreground">
          Roll all 4 dice (3 Energy Dice + the Character Die) and see if the
          attack lands.
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

          {report && (
            <p className="mt-3 text-sm text-muted-foreground">
              Chance to succeed:{" "}
              <span className="font-semibold text-foreground">
                {Math.round(report.energy.successProbability * 1000) / 10}%
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-4">
          <DiceRollAnimation
            isRolling={isRolling}
            energyRolled={result?.energyRolled ?? null}
            pose={result?.pose ?? null}
          />
          <Button size="lg" onClick={roll} disabled={isRolling || !selectedAttack}>
            <Dices className="h-5 w-5" /> Roll
          </Button>
        </CardContent>
      </Card>

      {result && !isRolling && <RollOutcomeBanner outcome={result} />}
    </div>
  );
}
