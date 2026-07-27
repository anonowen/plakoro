import { useCallback, useEffect, useState } from "react";
import type { DiceLoadout, EnergyDieConfig, FaceSlot } from "@/types/dice";
import { createEmptyEnergyDieConfig } from "@/types/dice";

const STORAGE_PREFIX = "plakoro:loadout:";

function createDefaultLoadout(pokemonId: string): DiceLoadout {
  return {
    pokemonId,
    dice: [
      createEmptyEnergyDieConfig(),
      createEmptyEnergyDieConfig(),
      createEmptyEnergyDieConfig(),
    ],
  };
}

function loadFromStorage(pokemonId: string): DiceLoadout {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + pokemonId);
    if (!raw) return createDefaultLoadout(pokemonId);
    const parsed = JSON.parse(raw) as DiceLoadout;
    if (parsed.dice?.length === 3) return parsed;
    return createDefaultLoadout(pokemonId);
  } catch {
    return createDefaultLoadout(pokemonId);
  }
}

/**
 * Manages a player's custom Energy Dice loadout for one specific Pokémon
 * ("tuned like a car" — every Pokémon a player owns keeps its own
 * independent build). Persisted to localStorage since this app has no
 * backend.
 */
export function useDiceLoadout(pokemonId: string) {
  const [loadout, setLoadout] = useState<DiceLoadout>(() =>
    loadFromStorage(pokemonId)
  );

  // Re-load whenever the selected Pokémon changes.
  useEffect(() => {
    setLoadout(loadFromStorage(pokemonId));
  }, [pokemonId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + pokemonId, JSON.stringify(loadout));
  }, [pokemonId, loadout]);

  const setFaceOption = useCallback(
    (
      dieIndex: 0 | 1 | 2,
      slot: FaceSlot,
      field: "energyTypeId" | "secondaryEnergyTypeId",
      energyTypeId: string
    ) => {
      setLoadout((prev) => {
        const dice = prev.dice.map((die, i) =>
          i === dieIndex ? updateFaceField(die, slot, field, energyTypeId) : die
        ) as [EnergyDieConfig, EnergyDieConfig, EnergyDieConfig];
        return { ...prev, dice };
      });
    },
    []
  );

  /** Replaces all 3 dice at once — used by Import, Share-link loading, and
   *  the auto-optimize suggestion feature. */
  const setAllDice = useCallback(
    (dice: [EnergyDieConfig, EnergyDieConfig, EnergyDieConfig]) => {
      setLoadout((prev) => ({ ...prev, dice }));
    },
    []
  );

  const resetLoadout = useCallback(() => {
    setLoadout(createDefaultLoadout(pokemonId));
  }, [pokemonId]);

  return { loadout, setFaceOption, setAllDice, resetLoadout };
}

function updateFaceField(
  die: EnergyDieConfig,
  slot: FaceSlot,
  field: "energyTypeId" | "secondaryEnergyTypeId",
  energyTypeId: string
): EnergyDieConfig {
  return {
    faces: die.faces.map((f) =>
      f.slot === slot ? { ...f, [field]: energyTypeId } : f
    ),
  };
}
