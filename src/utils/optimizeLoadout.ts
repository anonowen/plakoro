import type { EnergyDieConfig, FaceSlot } from "@/types/dice";
import { ALL_FACE_SLOTS, isDualSlot } from "@/types/dice";
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
 * space (9 possible energy types across 18 face slots) is far too large
 * to brute-force. The heuristic is simple: every free face is set to
 * whichever specifically-required energy type is most needed by the
 * attack's cost (Colorless in the cost is skipped here — since it can
 * never be rolled on a die, it's paid from leftover energy of any type
 * instead, which more copies of the needed types also helps with).
 *
 *  - Face A / B (restricted groups): set to the required type that
 *    belongs to that group, if any.
 *  - Face C (dual chip — grants BOTH energies at once when rolled): both
 *    of its two energies are filled from the required-type list, so a
 *    single C roll can cover as much of the cost as possible in one hit.
 *  - Face D (single chip): filled from the required-type list too.
 *
 * Required types are repeated (cycled) across all free faces so that if
 * an attack only needs one type, every free face reinforces that type —
 * there's never a downside to rolling more of a type you actually need.
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

  // Cycles through the required types in order, repeating once exhausted,
  // so every free (C/D) face gets filled with something useful.
  let cursor = 0;
  function nextRequiredType(fallback: string): string {
    if (requiredTypes.length === 0) return fallback;
    const type = requiredTypes[cursor % requiredTypes.length];
    cursor += 1;
    return type;
  }

  function buildSuggestedFace(slot: FaceSlot, fallback: string) {
    if (slot === "A") {
      return { slot, energyTypeId: bestFaceAType ?? fallback };
    }
    if (slot === "B") {
      return { slot, energyTypeId: bestFaceBType ?? fallback };
    }
    if (isDualSlot(slot)) {
      return {
        slot,
        energyTypeId: nextRequiredType(fallback),
        secondaryEnergyTypeId: nextRequiredType(fallback),
      };
    }
    // D slot
    return { slot, energyTypeId: nextRequiredType(fallback) };
  }

  return currentDice.map((die) => ({
    faces: ALL_FACE_SLOTS.map((slot) => {
      const existing = die.faces.find((f) => f.slot === slot);
      return buildSuggestedFace(slot, existing?.energyTypeId ?? "");
    }),
  })) as ThreeDice;
}
