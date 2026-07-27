import { Plus, Trash2 } from "lucide-react";
import type { CharacterDieOutcomeDraft } from "@/utils/pokemonDraft";
import { ALL_CHARACTER_DIE_POSES, CHARACTER_DIE_POSE_LABELS } from "@/types/dice";
import type { CharacterDiePose } from "@/types/dice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

interface CharacterDieOutcomeEditorProps {
  outcomes: CharacterDieOutcomeDraft[];
  onChange: (outcomes: CharacterDieOutcomeDraft[]) => void;
}

export function CharacterDieOutcomeEditor({
  outcomes,
  onChange,
}: CharacterDieOutcomeEditorProps) {
  function updateOutcome(index: number, patch: Partial<CharacterDieOutcomeDraft>) {
    onChange(outcomes.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  function togglePose(index: number, pose: CharacterDiePose) {
    const outcome = outcomes[index];
    const poses = outcome.poses.includes(pose)
      ? outcome.poses.filter((p) => p !== pose)
      : [...outcome.poses, pose];
    updateOutcome(index, { poses });
  }

  function removeOutcome(index: number) {
    onChange(outcomes.filter((_, i) => i !== index));
  }

  function addOutcome() {
    onChange([...outcomes, { poses: [], damageBonus: 0, effectText: "" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-muted-foreground">
        Character Die outcomes (optional — poses not covered here deal base damage
        with no bonus)
      </span>
      {outcomes.map((outcome, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-3">
          <div className="flex flex-wrap gap-1.5">
            {ALL_CHARACTER_DIE_POSES.map((pose) => (
              <button
                key={pose}
                type="button"
                onClick={() => togglePose(i, pose)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  outcome.poses.includes(pose)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {CHARACTER_DIE_POSE_LABELS[pose]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              Damage bonus
              <Input
                type="number"
                value={outcome.damageBonus}
                onChange={(e) =>
                  updateOutcome(i, { damageBonus: Number(e.target.value) || 0 })
                }
                className="w-20"
              />
            </label>
            <Input
              value={outcome.effectText}
              onChange={(e) => updateOutcome(i, { effectText: e.target.value })}
              placeholder="Effect text (optional)"
              className="min-w-[10rem] flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeOutcome(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addOutcome} className="w-fit">
        <Plus className="h-4 w-4" /> Add outcome
      </Button>
    </div>
  );
}
