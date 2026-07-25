import type { EnergyCost } from "@/types/energy";
import { getEnergyType } from "@/utils/energyRegistry";

export interface EnergyCostEntry {
  energyTypeId: string;
  amount: number;
  name: string;
  icon: string;
  color: string;
}

/** Converts an EnergyCost map into a display-ready, ordered list. */
export function formatEnergyCost(cost: EnergyCost): EnergyCostEntry[] {
  return Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([energyTypeId, amount]) => {
      const def = getEnergyType(energyTypeId);
      return {
        energyTypeId,
        amount,
        name: def.name,
        icon: def.icon,
        color: def.color,
      };
    });
}

/** Human-readable one-line summary, e.g. "2x Fire + 1x Colorless". */
export function summarizeEnergyCost(cost: EnergyCost): string {
  const entries = formatEnergyCost(cost);
  if (entries.length === 0) return "No energy required";
  return entries.map((e) => `${e.amount}x ${e.name}`).join(" + ");
}

/** Total number of energy units required across all types. */
export function totalEnergyCost(cost: EnergyCost): number {
  return Object.values(cost).reduce((sum, n) => sum + n, 0);
}
