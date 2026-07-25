import { useCallback, useState } from "react";
import type { EnergyDieConfig, CharacterDiePose } from "@/types/dice";
import type { EnergyCost } from "@/types/energy";
import type { Attack } from "@/types/attack";
import { rollEnergyDice, rollCharacterDie } from "@/utils/dice";
import { canPayCost } from "@/utils/probability";

export interface RollOutcome {
  energyRolled: EnergyCost;
  pose: CharacterDiePose;
  succeeded: boolean;
  damageBonus: number;
  totalDamage: number;
  effectText?: string;
}

function resolveDamage(attack: Attack, pose: CharacterDiePose) {
  const match = attack.characterDieOutcomes?.find((o) =>
    o.poses.includes(pose)
  );
  return {
    damageBonus: match?.damageBonus ?? 0,
    effectText: match?.effectText,
  };
}

/** Drives the animated Roll Simulator: rolls all 4 dice and resolves the
 *  result against the currently selected attack. */
export function useDiceRoll(dice: EnergyDieConfig[], attack: Attack | undefined) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<RollOutcome | null>(null);

  const roll = useCallback(() => {
    if (!attack) return;
    setIsRolling(true);
    setResult(null);

    // Small delay so the dice-roll animation has time to play before the
    // outcome is revealed.
    window.setTimeout(() => {
      const energyRolled = rollEnergyDice(dice);
      const pose = rollCharacterDie();
      const succeeded = canPayCost(energyRolled, attack.energyCost);
      const { damageBonus, effectText } = resolveDamage(attack, pose);

      setResult({
        energyRolled,
        pose,
        succeeded,
        damageBonus,
        totalDamage: succeeded ? attack.damage + damageBonus : 0,
        effectText: succeeded ? effectText : undefined,
      });
      setIsRolling(false);
    }, 700);
  }, [dice, attack]);

  return { roll, isRolling, result };
}
