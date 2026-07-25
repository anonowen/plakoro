import energyTypesData from "@/data/energyTypes.json";
import type { EnergyTypeDefinition, EnergyTypeId } from "@/types/energy";

/**
 * Runtime registry of all known energy types, loaded from
 * `data/energyTypes.json`. This is the single source of truth for what
 * energy types exist in the app — admins add/remove/edit elements by
 * editing that JSON file only, no code changes required.
 */
const REGISTRY: EnergyTypeDefinition[] = energyTypesData as EnergyTypeDefinition[];

const BY_ID: Map<EnergyTypeId, EnergyTypeDefinition> = new Map(
  REGISTRY.map((e) => [e.id, e])
);

/** Returns every registered energy type, in registry (JSON) order. */
export function getAllEnergyTypes(): EnergyTypeDefinition[] {
  return REGISTRY;
}

/**
 * Looks up a single energy type definition by id.
 * Throws if the id is not present in the registry — callers should only
 * ever use ids that came from the registry itself or from validated data.
 */
export function getEnergyType(id: EnergyTypeId): EnergyTypeDefinition {
  const found = BY_ID.get(id);
  if (!found) {
    throw new Error(
      `Unknown energy type id "${id}". Check data/energyTypes.json.`
    );
  }
  return found;
}

/** Safe lookup that returns undefined instead of throwing. */
export function tryGetEnergyType(
  id: EnergyTypeId
): EnergyTypeDefinition | undefined {
  return BY_ID.get(id);
}

/** The single wild/Colorless energy type used to substitute any requirement. */
export function getWildEnergyType(): EnergyTypeDefinition {
  const wild = REGISTRY.find((e) => e.isWild);
  if (!wild) {
    throw new Error(
      "No wild energy type is defined in data/energyTypes.json (expected exactly one entry with isWild: true)."
    );
  }
  return wild;
}

/** All energy types legal for the fixed "peg" (A) face group. */
export function getFaceAEnergyTypes(): EnergyTypeDefinition[] {
  return REGISTRY.filter((e) => e.socketGroup === "A");
}

/** All energy types legal for the fixed "hole" (B) face group. */
export function getFaceBEnergyTypes(): EnergyTypeDefinition[] {
  return REGISTRY.filter((e) => e.socketGroup === "B");
}

/**
 * All energy types that can be freely assigned to a C or D chip socket.
 * Per game rules, chips may hold ANY energy type (including Colorless),
 * not just the ones restricted to face groups A/B.
 */
export function getChipEnergyTypes(): EnergyTypeDefinition[] {
  return REGISTRY;
}
