import type { EnergyCost, EnergyTypeId } from "@/types/energy";
import type { EnergyDieConfig, CharacterDiePose } from "@/types/dice";
import { ALL_CHARACTER_DIE_POSES } from "@/types/dice";

/** Picks one random element from a non-empty array. */
function randomOf<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Rolls a single Energy Die, returning the energy type id of the face
 *  that lands face-up (or "" if that face was left unconfigured). */
export function rollEnergyDie(die: EnergyDieConfig): EnergyTypeId {
  return randomOf(die.faces).energyTypeId;
}

/** Rolls all 3 Energy Dice and returns the combined counts per type. */
export function rollEnergyDice(dice: EnergyDieConfig[]): EnergyCost {
  const counts: EnergyCost = {};
  for (const die of dice) {
    const result = rollEnergyDie(die);
    if (result) counts[result] = (counts[result] ?? 0) + 1;
  }
  return counts;
}

/** Rolls the Character Die (the Pokémon figure), returning the landed pose. */
export function rollCharacterDie(): CharacterDiePose {
  return randomOf(ALL_CHARACTER_DIE_POSES);
}
