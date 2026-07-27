import type { EnergyDieConfig } from "@/types/dice";
import { ALL_FACE_SLOTS } from "@/types/dice";

type ThreeDice = [EnergyDieConfig, EnergyDieConfig, EnergyDieConfig];

/** Loosely validates that a parsed value looks like a well-formed
 *  3-die Energy Dice loadout before trusting it (from a URL or file,
 *  both of which are untrusted input). */
function isValidDiceArray(value: unknown): value is ThreeDice {
  if (!Array.isArray(value) || value.length !== 3) return false;
  return value.every((die) => {
    if (typeof die !== "object" || die === null) return false;
    const faces = (die as { faces?: unknown }).faces;
    if (!Array.isArray(faces) || faces.length !== 6) return false;
    return faces.every(
      (f) =>
        typeof f === "object" &&
        f !== null &&
        typeof (f as { slot?: unknown }).slot === "string" &&
        (ALL_FACE_SLOTS as string[]).includes((f as { slot: string }).slot) &&
        typeof (f as { energyTypeId?: unknown }).energyTypeId === "string"
    );
  });
}

/** Encodes a 3-die loadout into a URL-safe base64 string. */
export function encodeLoadout(dice: ThreeDice): string {
  const json = JSON.stringify(dice);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decodes a loadout produced by `encodeLoadout`. Returns null on any
 *  malformed input instead of throwing, since this always comes from
 *  untrusted sources (a shared URL or an imported file). */
export function decodeLoadout(encoded: string): ThreeDice | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json);
    return isValidDiceArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Parses an imported JSON file's text content into a validated loadout. */
export function parseLoadoutFile(text: string): ThreeDice | null {
  try {
    const parsed = JSON.parse(text);
    return isValidDiceArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Builds a shareable URL for the current page with the loadout embedded
 *  in the `share` query parameter. */
export function buildShareUrl(dice: ThreeDice): string {
  const url = new URL(window.location.href);
  url.searchParams.set("share", encodeLoadout(dice));
  return url.toString();
}
