import type { Pokemon } from "@/types/pokemon";
import type { Attack, CharacterDieOutcome } from "@/types/attack";
import type { CharacterDiePose } from "@/types/dice";
import type { EnergyCost } from "@/types/energy";

/** Turns a display name into a URL/id-safe slug, e.g. "Mr. Mime" -> "mr-mime". */
export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Editable form-state shapes. These mirror the real `Pokemon`/`Attack`
 *  types but use arrays instead of Records (easier to edit as form rows)
 *  and keep every number/text field as a plain editable primitive. */

export interface EnergyCostRow {
  energyTypeId: string;
  amount: number;
}

export interface CharacterDieOutcomeDraft {
  poses: CharacterDiePose[];
  damageBonus: number;
  effectText: string;
}

export interface AttackDraft {
  id: string;
  name: string;
  damage: number;
  description: string;
  energyCost: EnergyCostRow[];
  specialEffect: string;
  characterDieOutcomes: CharacterDieOutcomeDraft[];
}

export interface PokemonDraft {
  id: string;
  name: string;
  image: string;
  expansion: string;
  type: string;
  weakness: string;
  hp: number;
  diceCount: number;
  attacks: AttackDraft[];
}

export function createEmptyOutcomeDraft(): CharacterDieOutcomeDraft {
  return { poses: [], damageBonus: 0, effectText: "" };
}

export function createEmptyAttackDraft(): AttackDraft {
  return {
    id: "",
    name: "",
    damage: 0,
    description: "",
    energyCost: [],
    specialEffect: "",
    characterDieOutcomes: [],
  };
}

export function createEmptyPokemonDraft(): PokemonDraft {
  return {
    id: "",
    name: "",
    image: "",
    expansion: "",
    type: "",
    weakness: "",
    hp: 120,
    diceCount: 3,
    attacks: [],
  };
}

/** Converts a real Pokémon (e.g. one already in the database) into an
 *  editable draft, so admins can load-and-edit existing entries. */
export function pokemonToDraft(pokemon: Pokemon): PokemonDraft {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.image,
    expansion: pokemon.expansion,
    type: pokemon.type,
    weakness: pokemon.weakness,
    hp: pokemon.hp,
    diceCount: pokemon.diceCount,
    attacks: pokemon.attacks.map(attackToDraft),
  };
}

function attackToDraft(attack: Attack): AttackDraft {
  return {
    id: attack.id,
    name: attack.name,
    damage: attack.damage,
    description: attack.description,
    energyCost: Object.entries(attack.energyCost).map(([energyTypeId, amount]) => ({
      energyTypeId,
      amount,
    })),
    specialEffect: attack.specialEffect ?? "",
    characterDieOutcomes: (attack.characterDieOutcomes ?? []).map((o) => ({
      poses: o.poses,
      damageBonus: o.damageBonus ?? 0,
      effectText: o.effectText ?? "",
    })),
  };
}

/** Converts a draft back into the real `Pokemon` shape used by the app. */
export function draftToPokemon(draft: PokemonDraft): Pokemon {
  return {
    id: draft.id.trim(),
    name: draft.name.trim(),
    image: draft.image.trim(),
    expansion: draft.expansion.trim(),
    type: draft.type,
    weakness: draft.weakness,
    hp: draft.hp,
    diceCount: draft.diceCount,
    attacks: draft.attacks.map(draftToAttack),
  };
}

function draftToAttack(draft: AttackDraft): Attack {
  const energyCost: EnergyCost = {};
  for (const row of draft.energyCost) {
    if (row.energyTypeId && row.amount > 0) {
      energyCost[row.energyTypeId] = row.amount;
    }
  }

  const characterDieOutcomes: CharacterDieOutcome[] = draft.characterDieOutcomes
    .filter((o) => o.poses.length > 0)
    .map((o) => ({
      poses: o.poses,
      damageBonus: o.damageBonus || undefined,
      effectText: o.effectText.trim() || undefined,
    }));

  return {
    id: draft.id.trim(),
    name: draft.name.trim(),
    damage: draft.damage,
    description: draft.description.trim(),
    energyCost,
    specialEffect: draft.specialEffect.trim() || undefined,
    characterDieOutcomes: characterDieOutcomes.length > 0 ? characterDieOutcomes : undefined,
  };
}

/** Validates a draft, returning a list of human-readable error messages.
 *  An empty array means the draft is ready to export. */
export function validatePokemonDraft(draft: PokemonDraft): string[] {
  const errors: string[] = [];

  if (!draft.id.trim()) errors.push("Pokémon id is required.");
  else if (!/^[a-z0-9-]+$/.test(draft.id.trim())) {
    errors.push("Id should only contain lowercase letters, numbers, and hyphens.");
  }
  if (!draft.name.trim()) errors.push("Name is required.");
  if (!draft.type) errors.push("Type is required.");
  if (!draft.weakness) errors.push("Weakness is required.");
  if (draft.hp <= 0) errors.push("HP must be greater than 0.");
  if (draft.diceCount <= 0) errors.push("Dice count must be greater than 0.");
  if (draft.attacks.length === 0) errors.push("Add at least one attack.");

  const attackIds = new Set<string>();
  draft.attacks.forEach((attack, i) => {
    const label = `Attack #${i + 1}${attack.name ? ` (${attack.name})` : ""}`;
    if (!attack.id.trim()) errors.push(`${label}: id is required.`);
    else if (attackIds.has(attack.id.trim())) {
      errors.push(`${label}: duplicate attack id "${attack.id.trim()}".`);
    } else {
      attackIds.add(attack.id.trim());
    }
    if (!attack.name.trim()) errors.push(`${label}: name is required.`);
    if (attack.energyCost.length === 0) {
      errors.push(`${label}: add at least one energy cost entry.`);
    }
  });

  return errors;
}

/** Pretty-printed JSON matching the exact shape saved under
 *  `data/pokemons/*.json`. */
export function pokemonDraftToJson(draft: PokemonDraft): string {
  return JSON.stringify(draftToPokemon(draft), null, 2);
}
