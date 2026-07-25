import type { EnergyTypeId } from "./energy";

/**
 * Energy Die (Enekoro) — 6 faces grouped into 3 fixed axes:
 *   - A ↔ B  : one fixed "peg" face (A) and one fixed "hole" face (B)
 *   - C ↔ C  : two faces using dual-option chips (player picks which
 *              of the chip's 2 diagonal symbols faces up)
 *   - D ↔ D  : two faces using single-option chips (fixed once placed)
 *
 * Sockets are universal across every Pokémon's Energy Die — any chip can
 * be placed in any socket of the matching slot type (A/B/C/D), regardless
 * of which Starter Set it originally came from. Color is cosmetic only.
 */
export type FaceSlot = "A" | "B" | "C1" | "C2" | "D1" | "D2";

export const ALL_FACE_SLOTS: FaceSlot[] = ["A", "B", "C1", "C2", "D1", "D2"];

/** Which slots are governed by which physical socket type. */
export function slotSocketType(slot: FaceSlot): "A" | "B" | "C" | "D" {
  if (slot === "A") return "A";
  if (slot === "B") return "B";
  if (slot === "C1" || slot === "C2") return "C";
  return "D";
}

/** A single face's assigned energy type. */
export interface EnergyDieFace {
  slot: FaceSlot;
  energyTypeId: EnergyTypeId;
}

/**
 * A full build ("loadout") of one Energy Die: exactly one entry per
 * FaceSlot. Three of these together make up a player's Energy Dice set
 * for a given Pokémon.
 */
export interface EnergyDieConfig {
  faces: EnergyDieFace[]; // length === 6, one per FaceSlot
}

/** Default starter config: A/B left unset, C/D chips left unset. */
export function createEmptyEnergyDieConfig(): EnergyDieConfig {
  return {
    faces: ALL_FACE_SLOTS.map((slot) => ({ slot, energyTypeId: "" })),
  };
}

/**
 * A player's full Energy Dice loadout for one Pokémon: 3 Energy Dice,
 * customized independently ("tuned like a car"), saved per-Pokémon.
 */
export interface DiceLoadout {
  pokemonId: string;
  dice: [EnergyDieConfig, EnergyDieConfig, EnergyDieConfig];
}

/**
 * Character Die (Charakoro) — the Pokémon figure itself acts as a 6-sided
 * die. The face it lands on is one of these 6 poses.
 */
export type CharacterDiePose =
  | "stand"
  | "upsideDown"
  | "faceUp"
  | "faceDown"
  | "lieLeft"
  | "lieRight";

export const ALL_CHARACTER_DIE_POSES: CharacterDiePose[] = [
  "stand",
  "upsideDown",
  "faceUp",
  "faceDown",
  "lieLeft",
  "lieRight",
];

export const CHARACTER_DIE_POSE_LABELS: Record<CharacterDiePose, string> = {
  stand: "Stand",
  upsideDown: "Upside down",
  faceUp: "Face up",
  faceDown: "Face down",
  lieLeft: "Lie on left side",
  lieRight: "Lie on right side",
};
