import { Trash2 } from "lucide-react";
import type { AttackDraft } from "@/utils/pokemonDraft";
import { slugify } from "@/utils/pokemonDraft";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EnergyCostEditor } from "./EnergyCostEditor";
import { CharacterDieOutcomeEditor } from "./CharacterDieOutcomeEditor";

interface AttackEditorProps {
  index: number;
  attack: AttackDraft;
  onChange: (attack: AttackDraft) => void;
  onRemove: () => void;
}

export function AttackEditor({ index, attack, onChange, onRemove }: AttackEditorProps) {
  function patch(fields: Partial<AttackDraft>) {
    onChange({ ...attack, ...fields });
  }

  function handleNameChange(name: string) {
    // Auto-derive the attack's internal id from its name — admins never
    // have to think about ids directly.
    patch({ name, id: slugify(name) });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Attack #{index + 1}</span>
          <Button variant="ghost" size="icon" onClick={onRemove} title="Remove attack">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Attack name</span>
          <Input
            value={attack.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Vine Whip"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Damage</span>
          <Input
            type="number"
            min={0}
            value={attack.damage}
            onChange={(e) => patch({ damage: Number(e.target.value) || 0 })}
            className="w-28"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Description</span>
          <Input
            value={attack.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Flavor text shown to players"
          />
        </label>

        <EnergyCostEditor
          rows={attack.energyCost}
          onChange={(energyCost) => patch({ energyCost })}
        />

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Special effect (optional)</span>
          <Input
            value={attack.specialEffect}
            onChange={(e) => patch({ specialEffect: e.target.value })}
            placeholder="e.g. This Pokémon also takes 30 damage."
          />
        </label>

        <CharacterDieOutcomeEditor
          outcomes={attack.characterDieOutcomes}
          onChange={(characterDieOutcomes) => patch({ characterDieOutcomes })}
        />
      </CardContent>
    </Card>
  );
}
