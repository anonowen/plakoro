import type { EnergyCost, EnergyTypeId } from "@/types/energy";
import type {
  EnergyDieConfig,
  CharacterDiePose,
} from "@/types/dice";
import { ALL_CHARACTER_DIE_POSES } from "@/types/dice";
import type { CharacterDieOutcome, Attack } from "@/types/attack";
import type {
  EnergyPaymentResult,
  CharacterDieOutcomeProbability,
  CombinedOutcome,
  AttackProbabilityReport,
} from "@/types/probability";
import { getWildEnergyType } from "@/utils/energyRegistry";

/**
 * -----------------------------------------------------------------------
 * ENERGY DICE PROBABILITY MODEL
 * -----------------------------------------------------------------------
 * Each Energy Die has 6 faces (see types/dice.ts: A, B, C1, C2, D1, D2),
 * each showing one energy type with equal 1/6 probability.
 *
 * Rolling 3 Energy Dice at once produces a joint outcome: a count of how
 * many faces of each energy type came up in total. Because a Plakoro
 * match always uses exactly 3 dice (small, fixed), we enumerate every
 * possible combination of face outcomes DIRECTLY (6 * 6 * 6 = 216 cases)
 * rather than using the general multinomial formula. This is:
 *   - Exact (no simulation/rounding error)
 *   - Trivially fast (216 cases, instant on any device)
 *   - Simple to reason about and unit-test
 *
 * We then aggregate outcomes that produce the identical energy count
 * vector (e.g. "2 fire, 1 colorless") by summing their probabilities,
 * since only the resulting counts matter for paying a cost — not which
 * physical die produced which face.
 * -----------------------------------------------------------------------
 */

interface EnumeratedOutcome {
  counts: EnergyCost;
  probability: number;
}

/** Builds a canonical string key for an energy-count vector, so identical
 *  outcomes from different dice combinations can be merged. */
function countsKey(counts: EnergyCost): string {
  return Object.keys(counts)
    .filter((k) => counts[k] > 0)
    .sort()
    .map((k) => `${k}:${counts[k]}`)
    .join(",");
}

function addCount(counts: EnergyCost, energyTypeId: EnergyTypeId): EnergyCost {
  if (!energyTypeId) return counts; // unset face, contributes nothing
  return { ...counts, [energyTypeId]: (counts[energyTypeId] ?? 0) + 1 };
}

/**
 * Enumerates every possible energy-count outcome from rolling the given
 * Energy Dice together, with exact probabilities. Outcomes with identical
 * count vectors are merged (probabilities summed).
 */
export function enumerateEnergyRollOutcomes(
  dice: EnergyDieConfig[]
): EnumeratedOutcome[] {
  const merged = new Map<string, EnumeratedOutcome>();

  function recurse(
    dieIndex: number,
    countsSoFar: EnergyCost,
    probSoFar: number
  ) {
    if (dieIndex === dice.length) {
      const key = countsKey(countsSoFar);
      const existing = merged.get(key);
      if (existing) {
        existing.probability += probSoFar;
      } else {
        merged.set(key, { counts: countsSoFar, probability: probSoFar });
      }
      return;
    }
    const faces = dice[dieIndex].faces;
    const faceProb = 1 / faces.length; // always 1/6 for a well-formed die
    for (const face of faces) {
      recurse(
        dieIndex + 1,
        addCount(countsSoFar, face.energyTypeId),
        probSoFar * faceProb
      );
    }
  }

  recurse(0, {}, 1);
  return Array.from(merged.values());
}

/**
 * Determines whether a rolled energy count vector is enough to pay a
 * given cost, following standard TCG-style rules:
 *   1. Each SPECIFIC required type (e.g. "2 Grass") must be met by rolled
 *      energy of that exact type; any shortfall may be topped up by
 *      Colorless/wild dice (which substitute for any specific type).
 *   2. The "Colorless" portion of a cost (if any) is NOT restricted to
 *      wild dice — it can be paid with ANY leftover energy of ANY type,
 *      once every specific requirement above has been satisfied. This
 *      matches how Colorless costs work in the physical game: excess
 *      Fire, Water, etc. left over after paying specific costs is just
 *      as good as excess Colorless for paying a Colorless requirement.
 */
export function canPayCost(rolled: EnergyCost, cost: EnergyCost): boolean {
  const wildId = getWildEnergyType().id;
  const remaining: EnergyCost = { ...rolled };

  // Step 1 — satisfy every specific (non-Colorless) requirement using its
  // own type first, then top up any shortfall using wild dice only.
  for (const [type, needed] of Object.entries(cost)) {
    if (type === wildId) continue;
    const have = remaining[type] ?? 0;
    const used = Math.min(have, needed);
    remaining[type] = have - used;

    const shortfall = needed - used;
    if (shortfall > 0) {
      const wildHave = remaining[wildId] ?? 0;
      const wildUsed = Math.min(wildHave, shortfall);
      remaining[wildId] = wildHave - wildUsed;
      if (wildUsed < shortfall) return false; // can't cover this specific type
    }
  }

  // Step 2 — the Colorless portion of the cost can be paid with ANY
  // leftover energy of ANY type (not just leftover wild dice).
  const colorlessNeeded = cost[wildId] ?? 0;
  if (colorlessNeeded > 0) {
    const totalLeftover = Object.values(remaining).reduce((a, b) => a + b, 0);
    if (totalLeftover < colorlessNeeded) return false;
  }

  return true;
}

/**
 * Computes how many "energy units" of the cost a given roll actually
 * satisfies (specific matches + wild substitutions + any-leftover for
 * Colorless), capped at the total cost. Used to compute the "expected
 * successful energy" metric even for partial/failed rolls.
 */
function usefulEnergyUnits(rolled: EnergyCost, cost: EnergyCost): number {
  const wildId = getWildEnergyType().id;
  const remaining: EnergyCost = { ...rolled };
  let satisfied = 0;

  for (const [type, needed] of Object.entries(cost)) {
    if (type === wildId) continue;
    const have = remaining[type] ?? 0;
    const direct = Math.min(have, needed);
    satisfied += direct;
    remaining[type] = have - direct;

    const shortfall = needed - direct;
    if (shortfall > 0) {
      const wildHave = remaining[wildId] ?? 0;
      const used = Math.min(wildHave, shortfall);
      satisfied += used;
      remaining[wildId] = wildHave - used;
    }
  }

  const colorlessNeeded = cost[wildId] ?? 0;
  if (colorlessNeeded > 0) {
    const totalLeftover = Object.values(remaining).reduce((a, b) => a + b, 0);
    satisfied += Math.min(totalLeftover, colorlessNeeded);
  }

  return satisfied;
}

/** Full probability report for paying a given energy cost with 3 Energy Dice. */
export function calculateEnergyPayment(
  dice: EnergyDieConfig[],
  cost: EnergyCost
): EnergyPaymentResult {
  const outcomes = enumerateEnergyRollOutcomes(dice);

  let successProbability = 0;
  let expectedUsefulEnergy = 0;

  for (const outcome of outcomes) {
    if (canPayCost(outcome.counts, cost)) {
      successProbability += outcome.probability;
    }
    expectedUsefulEnergy +=
      outcome.probability * usefulEnergyUnits(outcome.counts, cost);
  }

  return {
    successProbability,
    failureProbability: 1 - successProbability,
    expectedUsefulEnergy,
    requiredEnergySummary: cost,
  };
}

/**
 * -----------------------------------------------------------------------
 * CHARACTER DIE PROBABILITY MODEL
 * -----------------------------------------------------------------------
 * The Character Die (the Pokémon figure) lands on one of 6 poses with
 * equal probability (1/6 each). An attack's `characterDieOutcomes` field
 * (admin-authored, from the move card) groups poses into bonus tiers.
 * Any pose not covered by an explicit outcome falls back to a "no bonus"
 * default (damageBonus 0), so partial/incomplete data never breaks the
 * calculation.
 * -----------------------------------------------------------------------
 */
export function calculateCharacterDieOutcomes(
  attack: Attack
): CharacterDieOutcomeProbability[] {
  const definedOutcomes: CharacterDieOutcome[] =
    attack.characterDieOutcomes ?? [];

  const coveredPoses = new Set<CharacterDiePose>(
    definedOutcomes.flatMap((o) => o.poses)
  );

  const results: CharacterDieOutcomeProbability[] = definedOutcomes.map(
    (o) => ({
      poses: o.poses,
      probability: o.poses.length / 6,
      damageBonus: o.damageBonus ?? 0,
      effectText: o.effectText,
      totalDamage: attack.damage + (o.damageBonus ?? 0),
    })
  );

  const uncoveredPoses = ALL_CHARACTER_DIE_POSES.filter(
    (p) => !coveredPoses.has(p)
  );
  if (uncoveredPoses.length > 0) {
    results.push({
      poses: uncoveredPoses,
      probability: uncoveredPoses.length / 6,
      damageBonus: 0,
      totalDamage: attack.damage,
    });
  }

  return results;
}

/**
 * -----------------------------------------------------------------------
 * COMBINED REPORT
 * -----------------------------------------------------------------------
 * The Energy Dice roll and the Character Die roll are physically
 * independent events, so their probabilities multiply directly:
 *   P(success AND pose-group X) = P(success) * P(pose-group X)
 * If the energy payment fails, damage is 0 regardless of pose — that
 * entire branch is collapsed into a single "failed" row.
 * -----------------------------------------------------------------------
 */
export function calculateAttackProbability(
  dice: EnergyDieConfig[],
  attack: Attack
): AttackProbabilityReport {
  const energy = calculateEnergyPayment(dice, attack.energyCost);
  const characterDieOutcomes = calculateCharacterDieOutcomes(attack);

  const combined: CombinedOutcome[] = characterDieOutcomes.map((o) => ({
    totalDamage: o.totalDamage,
    probability: energy.successProbability * o.probability,
    succeeded: true,
    effectText: o.effectText,
  }));

  if (energy.failureProbability > 0) {
    combined.push({
      totalDamage: 0,
      probability: energy.failureProbability,
      succeeded: false,
    });
  }

  return { energy, characterDieOutcomes, combined };
}
