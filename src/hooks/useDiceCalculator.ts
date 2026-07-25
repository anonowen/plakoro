import { useMemo } from "react";
import type { EnergyDieConfig } from "@/types/dice";
import type { Attack } from "@/types/attack";
import { calculateAttackProbability } from "@/utils/probability";
import type { AttackProbabilityReport } from "@/types/probability";

/**
 * Computes the full probability report for using `attack` with the given
 * Energy Dice configuration. Pure derivation from inputs — no internal
 * state — so it recalculates whenever the loadout or selected attack
 * changes.
 */
export function useDiceCalculator(
  dice: EnergyDieConfig[],
  attack: Attack | undefined
): AttackProbabilityReport | undefined {
  return useMemo(() => {
    if (!attack) return undefined;
    return calculateAttackProbability(dice, attack);
  }, [dice, attack]);
}
