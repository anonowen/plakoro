/**
 * Energy type system
 * ----------------------------------------------------------------------------
 * Energy types are DATA, not code. New elements (added in future Plakoro
 * expansions) are introduced by editing `data/energyTypes.json` only.
 * We intentionally avoid a TypeScript string-literal union (e.g.
 * `'fire' | 'water' | ...`) because that would require a code change +
 * redeploy every time a new energy type is released.
 *
 * Instead, `EnergyTypeId` is a plain string, validated at RUNTIME against
 * the registry loaded from JSON (see `utils/energyRegistry.ts`).
 */

/** Which physical socket(s) on the Energy Die a given energy type can occupy. */
export type SocketGroup =
  | "A" // fixed "peg" face group (fire, water, grass, steel, electric, ...)
  | "B" // fixed "hole" face group (psychic, fighting, dark, flying, ...)
  | "chip"; // freely assignable via C (dual-option) / D (single-option) chips

/** A single energy type definition, as stored in `data/energyTypes.json`. */
export interface EnergyTypeDefinition {
  /** Stable unique id used everywhere as a dictionary key, e.g. "fire". */
  id: string;
  /** Human-readable display name, e.g. "Fire". */
  name: string;
  /** Emoji or icon glyph/key used in the UI. */
  icon: string;
  /** Hex color used for badges/charts. */
  color: string;
  /** Where this energy type is legally allowed to appear. */
  socketGroup: SocketGroup;
  /**
   * True for the single "wild" energy type (Colorless) that can substitute
   * for ANY specific energy requirement when paying a cost.
   */
  isWild?: boolean;
}

/** Alias kept intentionally loose (validated at runtime, not compile time). */
export type EnergyTypeId = string;

/**
 * A cost/requirement/roll-result expressed as counts per energy type id.
 * Example: { fire: 2, colorless: 1 }
 */
export type EnergyCost = Record<EnergyTypeId, number>;
