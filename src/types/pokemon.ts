import type { EnergyTypeId } from "./energy";
import type { Attack } from "./attack";

export interface Pokemon {
  id: string;
  name: string;
  image: string;
  expansion: string;
  /** Primary elemental type shown on the character card (e.g. "electric"). */
  type: EnergyTypeId;
  /** Type this Pokémon is weak against; matching attacks deal +20 damage. */
  weakness: EnergyTypeId;
  hp: number;
  /** Number of Energy Dice used (always 3 per official rules, kept
   *  configurable in case future expansions change this). */
  diceCount: number;
  attacks: Attack[];
}
