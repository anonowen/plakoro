import type { EnergyDieConfig, FaceSlot } from "@/types/dice";
import { ALL_FACE_SLOTS, slotSocketType } from "@/types/dice";
import type { Attack } from "@/types/attack";
import {
  getFaceAEnergyTypes,
  getFaceBEnergyTypes,
  getWildEnergyType,
} from "@/utils/energyRegistry";

type ThreeDice = [EnergyDieConfig, EnergyDieConfig, EnergyDieConfig];

/**
 * Suggests an Energy Dice loadout tuned for a specific attack.
 *
 * This is a fast heuristic, not an exhaustive search — the true search
 * space (10 possible energy types across 18 face slots) is far too large
 * to brute-force. The heuristic follows two simple, provably-good rules:
 *
 *  1. Face C and D sockets (free — any energy type allowed) are all set
 *     to Colorless. Colorless is the single most useful value any free
 *     face can hold: it substitutes for a shortfall of ANY specific
 *     required type, and also directly pays the Colorless portion of a
 *     cost. No specific element ever beats it in general usefulness.
 *  2. Face A and B sockets (restricted to their fixed element groups)
 *     are set to whichever required element from the attack's cost falls
 *     in that group — maximizing direct (non-substituted) hits for the
 *     type that's actually needed. If the cost needs no element from a
 *     given group, that group's faces are left as-is (they can't help
 *     regardless of what they're set to).
 */
export function suggestLoadoutForAttack(
  attack: Attack,
  currentDice: ThreeDice
): ThreeDice {
  const wildId = getWildEnergyType().id;
  const requiredTypes = Object.entries(attack.energyCost)
    .filter(([type, amount]) => type !== wildId && amount > 0)
    .sort((a, b) => b[1] - a[1]) // prioritize the type needed in the largest amount
    .map(([type]) => type);

  const faceATypeIds = new Set(getFaceAEnergyTypes().map((e) => e.id));
  const faceBTypeIds = new Set(getFaceBEnergyTypes().map((e) => e.id));

  const bestFaceAType = requiredTypes.find((t) => faceATypeIds.has(t));
  const bestFaceBType = requiredTypes.find((t) => faceBTypeIds.has(t));

  function suggestedValueFor(slot: FaceSlot, currentValue: string): string {
    const socket = slotSocketType(slot);
    if (socket === "A") return bestFaceAType ?? currentValue;
    if (socket === "B") return bestFaceBType ?? currentValue;
    return wildId; // C and D sockets: always Colorless
  }

  return currentDice.map((die) => ({
    faces: ALL_FACE_SLOTS.map((slot) => {
      const existing = die.faces.find((f) => f.slot === slot);
      const energyTypeId = suggestedValueFor(slot, existing?.energyTypeId ?? "");
      const alternateEnergyTypeId =
        slotSocketType(slot) === "C" ? wildId : existing?.alternateEnergyTypeId;
      return { slot, energyTypeId, alternateEnergyTypeId };
    }),
  })) as ThreeDice;
}
