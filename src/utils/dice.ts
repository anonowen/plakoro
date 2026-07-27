import type { EnergyCost, EnergyTypeId } from "@/types/energy";
import type { EnergyDieConfig, CharacterDiePose } from "@/types/dice";
import { ALL_CHARACTER_DIE_POSES, isDualSlot } from "@/types/dice";

/** Picks one random element from a non-empty array. */
function randomOf<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Rolls a single Energy Die, returning the energy type id(s) granted by
 *  the face that lands face-up. A C-slot face grants both of its energies
 *  at once (2 units); every other face grants just its one energy. Empty
 *  faces contribute nothing. */
export function rollEnergyDie(die: EnergyDieConfig): EnergyTypeId[] {
  const face = randomOf(die.faces);
  const ids: EnergyTypeId[] = [];
  if (face.energyTypeId) ids.push(face.energyTypeId);
  if (isDualSlot(face.slot) && face.secondaryEnergyTypeId) {
    ids.push(face.secondaryEnergyTypeId);
  }
  return ids;
}

/** Rolls all 3 Energy Dice and returns the combined counts per type. */
export function rollEnergyDice(dice: EnergyDieConfig[]): EnergyCost {
  const counts: EnergyCost = {};
  for (const die of dice) {
    for (const id of rollEnergyDie(die)) {
      counts[id] = (counts[id] ?? 0) + 1;
    }
  }
  return counts;
}

/** Rolls the Character Die (the Pokémon figure), returning the landed pose. */
export function rollCharacterDie(): CharacterDiePose {
  return randomOf(ALL_CHARACTER_DIE_POSES);
}
