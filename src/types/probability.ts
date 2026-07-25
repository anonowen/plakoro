import type { EnergyCost } from "./energy";
import type { CharacterDiePose } from "./dice";

/** Result of the energy-payment half of the calculation (3 Energy Dice). */
export interface EnergyPaymentResult {
  /** P(rolled energy is enough to pay the attack's cost), 0..1. */
  successProbability: number;
  /** 1 - successProbability. */
  failureProbability: number;
  /**
   * Expected number of "successful energy units" toward the cost — i.e.
   * the average count of required energy actually satisfied (specific
   * matches plus Colorless substitutions), capped at the total cost.
   * Useful even when a roll only partially pays the cost.
   */
  expectedUsefulEnergy: number;
  /** Echo of the attack's required cost, for display alongside the result. */
  requiredEnergySummary: EnergyCost;
}

/** Probability of one Character Die outcome group (a set of poses). */
export interface CharacterDieOutcomeProbability {
  poses: CharacterDiePose[];
  probability: number;
  damageBonus: number;
  effectText?: string;
  /** attack.damage + damageBonus */
  totalDamage: number;
}

/** A single row in the combined success+damage probability table. */
export interface CombinedOutcome {
  totalDamage: number;
  probability: number;
  /** False only for the single "attack failed" row (totalDamage is 0). */
  succeeded: boolean;
  effectText?: string;
}

/** Full report returned by `calculateAttackProbability`. */
export interface AttackProbabilityReport {
  energy: EnergyPaymentResult;
  characterDieOutcomes: CharacterDieOutcomeProbability[];
  combined: CombinedOutcome[];
}
