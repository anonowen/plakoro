import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "plakoro:hp:";

function loadHp(pokemonId: string, maxHp: number): number {
  const raw = localStorage.getItem(STORAGE_PREFIX + pokemonId);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), maxHp) : maxHp;
}

/** Tracks a Pokémon's current HP (mirroring the physical 0–120 damage
 *  dial), persisted per-Pokémon in localStorage. */
export function useHpTracker(pokemonId: string, maxHp: number) {
  const [hp, setHp] = useState<number>(() => loadHp(pokemonId, maxHp));

  useEffect(() => {
    setHp(loadHp(pokemonId, maxHp));
  }, [pokemonId, maxHp]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + pokemonId, String(hp));
  }, [pokemonId, hp]);

  const applyDamage = useCallback(
    (amount: number) => {
      setHp((prev) => Math.max(0, Math.min(maxHp, prev - amount)));
    },
    [maxHp]
  );

  const heal = useCallback(
    (amount: number) => {
      setHp((prev) => Math.max(0, Math.min(maxHp, prev + amount)));
    },
    [maxHp]
  );

  const reset = useCallback(() => setHp(maxHp), [maxHp]);

  return { hp, applyDamage, heal, reset };
}
