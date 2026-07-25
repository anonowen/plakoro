import type { EnergyCost } from "./energy";
import type { CharacterDiePose } from "./dice";

/**
 * A bonus effect that triggers when the Character Die lands on one of the
 * listed poses. Admins define this per attack in JSON — the app does not
 * hard-code which poses matter for which move.
 *
 * Example (Eevee's "はねまわる" card): three damage tiers, each keyed to a
 * different subset of poses:
 *   [{ poses: ["stand"], damageBonus: 40, ... },       // 70 total
 *    { poses: ["lieLeft","lieRight"], damageBonus: 10, ... }, // 40 total
 *    { poses: ["faceUp","faceDown","upsideDown"], damageBonus: -10 }] // 20 total
 * (baseDamage + damageBonus = the tier's displayed total; see docs on Attack.damage)
 */
export interface CharacterDieOutcome {
  /** Which Character Die poses trigger this outcome. */
  poses: CharacterDiePose[];
  /** Damage added to (or subtracted from) the attack's base damage. */
  damageBonus?: number;
  /** Free-text description of any additional special effect. */
  effectText?: string;
}

export interface Attack {
  id: string;
  name: string;
  /** Base damage dealt on a successful energy payment, before any bonuses. */
  damage: number;
  description: string;
  /** Energy required to use this attack. Paying is successful if the rolled
   *  amount for every listed energy type is >= the required amount
   *  (Colorless dice may substitute for any specific type shortfall). */
  energyCost: EnergyCost;
  /** Free-text special rule not otherwise modeled (shown as-is in the UI). */
  specialEffect?: string;
  /** Optional per-pose bonuses/effects from the Character Die roll. */
  characterDieOutcomes?: CharacterDieOutcome[];
}
