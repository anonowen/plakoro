import { Dices } from "lucide-react";
import { cn } from "@/utils/cn";
import { getEnergyType } from "@/utils/energyRegistry";
import type { EnergyCost } from "@/types/energy";
import type { CharacterDiePose } from "@/types/dice";
import { CHARACTER_DIE_POSE_LABELS } from "@/types/dice";

interface DiceRollAnimationProps {
  isRolling: boolean;
  energyRolled: EnergyCost | null;
  pose: CharacterDiePose | null;
}

/** Renders one face-icon per rolled energy unit, plus the Character Die's
 *  landed pose. While rolling, shows a spinning placeholder animation. */
export function DiceRollAnimation({ isRolling, energyRolled, pose }: DiceRollAnimationProps) {
  const energyFaces = energyRolled
    ? Object.entries(energyRolled).flatMap(([id, count]) =>
        Array.from({ length: count }, () => id)
      )
    : [];

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {isRolling
          ? Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="flex h-14 w-14 animate-dice-roll items-center justify-center rounded-xl border-2 border-primary/40 bg-muted"
              >
                <Dices className="h-6 w-6 text-primary" />
              </div>
            ))
          : energyFaces.map((id, i) => {
              const def = getEnergyType(id);
              return (
                <div
                  key={i}
                  className="flex h-14 w-14 animate-fade-in items-center justify-center rounded-xl border-2 text-2xl"
                  style={{ borderColor: def.color, backgroundColor: `${def.color}18` }}
                  title={def.name}
                >
                  {def.icon}
                </div>
              );
            })}
      </div>

      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground",
          isRolling && "animate-dice-roll",
          !isRolling && pose && "animate-fade-in border-solid border-accent bg-accent/10 text-accent-foreground"
        )}
      >
        {isRolling ? <Dices className="h-6 w-6" /> : pose ? CHARACTER_DIE_POSE_LABELS[pose] : "—"}
      </div>
    </div>
  );
}
