import { useState } from "react";
import { RotateCw, X } from "lucide-react";
import type { EnergyDieConfig, FaceSlot } from "@/types/dice";
import { ALL_FACE_SLOTS, isDualSlot, slotSocketType } from "@/types/dice";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  getFaceAEnergyTypes,
  getFaceBEnergyTypes,
  getChipEnergyTypes,
  tryGetEnergyType,
} from "@/utils/energyRegistry";

const SLOT_LABELS: Record<FaceSlot, string> = {
  A: "Face A (peg)",
  B: "Face B (hole)",
  C1: "Face C · chip 1",
  C2: "Face C · chip 2",
  D1: "Face D · chip 1",
  D2: "Face D · chip 2",
};

/** Radial position of each face slot around the central die graphic,
 *  mirroring the reference "click the die face" layout. */
const SLOT_POSITION: Record<FaceSlot, string> = {
  A: "col-start-2 row-start-1",
  B: "col-start-2 row-start-3",
  C1: "col-start-1 row-start-1",
  C2: "col-start-3 row-start-1",
  D1: "col-start-1 row-start-3",
  D2: "col-start-3 row-start-3",
};

/** Energy types legally installable in a given face slot's socket. */
function optionsForSlot(slot: FaceSlot) {
  const socket = slotSocketType(slot);
  if (socket === "A") return getFaceAEnergyTypes();
  if (socket === "B") return getFaceBEnergyTypes();
  return getChipEnergyTypes(); // C and D sockets accept any energy type
}

type ActiveSide = "energyTypeId" | "alternateEnergyTypeId";

interface DiceConfigFormProps {
  dice: EnergyDieConfig[];
  onFaceOptionChange: (
    dieIndex: 0 | 1 | 2,
    slot: FaceSlot,
    field: "energyTypeId" | "alternateEnergyTypeId",
    energyTypeId: string
  ) => void;
  onFlipChip: (dieIndex: 0 | 1 | 2, slot: FaceSlot) => void;
  onReset: () => void;
}

export function DiceConfigForm({
  dice,
  onFaceOptionChange,
  onFlipChip,
  onReset,
}: DiceConfigFormProps) {
  const [dieIndex, setDieIndex] = useState<0 | 1 | 2>(0);
  const [activeSlot, setActiveSlot] = useState<FaceSlot | null>("A");
  const [activeSide, setActiveSide] = useState<ActiveSide>("energyTypeId");

  const die = dice[dieIndex];
  const options = activeSlot ? optionsForSlot(activeSlot) : [];
  const activeFace = activeSlot ? die.faces.find((f) => f.slot === activeSlot) : undefined;

  function selectFace(slot: FaceSlot, side: ActiveSide = "energyTypeId") {
    setActiveSlot(slot);
    setActiveSide(side);
  }

  function pickElement(energyTypeId: string) {
    if (!activeSlot) return;
    onFaceOptionChange(dieIndex, activeSlot, activeSide, energyTypeId);
  }

  function clearFace(e: React.MouseEvent, slot: FaceSlot) {
    e.stopPropagation();
    onFaceOptionChange(dieIndex, slot, "energyTypeId", "");
    onFaceOptionChange(dieIndex, slot, "alternateEnergyTypeId", "");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Tap a face on the die, then pick its energy from the panel. Face C
          chips are dual-option — tap the small back chip to set the other
          side, or flip to swap which one is active.
        </p>
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="flex gap-2">
        {([0, 1, 2] as const).map((i) => (
          <Button
            key={i}
            variant={dieIndex === i ? "default" : "outline"}
            size="sm"
            onClick={() => setDieIndex(i)}
          >
            Energy Dice {i + 1}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[auto_1fr] sm:p-6">
        {/* Radial die diagram */}
        <div className="grid grid-cols-3 grid-rows-3 place-items-center gap-x-6 gap-y-3 justify-self-center">
          <div className="col-start-2 row-start-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
            🎲
          </div>
          {ALL_FACE_SLOTS.map((slot) => {
            const face = die.faces.find((f) => f.slot === slot);
            const primary = tryGetEnergyType(face?.energyTypeId ?? "");
            const alternate = tryGetEnergyType(face?.alternateEnergyTypeId ?? "");
            const dual = isDualSlot(slot);
            const isActive = activeSlot === slot;

            return (
              <div
                key={slot}
                className={cn("flex flex-col items-center gap-1", SLOT_POSITION[slot])}
              >
                <div className="relative">
                  <button
                    type="button"
                    title={SLOT_LABELS[slot]}
                    onClick={() => selectFace(slot, "energyTypeId")}
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl transition-transform hover:scale-105",
                      isActive && activeSide === "energyTypeId"
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border"
                    )}
                    style={{
                      backgroundColor: primary ? `${primary.color}22` : undefined,
                    }}
                  >
                    {primary ? primary.icon : "＋"}
                  </button>

                  {primary && (
                    <button
                      type="button"
                      title="Clear this face"
                      onClick={(e) => clearFace(e, slot)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <span className="text-[10px] font-medium text-muted-foreground">
                  {slot}
                </span>

                {dual && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Other side of this chip"
                      onClick={() => selectFace(slot, "alternateEnergyTypeId")}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md border text-sm",
                        isActive && activeSide === "alternateEnergyTypeId"
                          ? "border-primary ring-2 ring-primary/40"
                          : "border-border bg-background"
                      )}
                      style={{
                        backgroundColor: alternate ? `${alternate.color}22` : undefined,
                      }}
                    >
                      {alternate ? alternate.icon : "＋"}
                    </button>
                    <button
                      type="button"
                      title="Flip chip"
                      onClick={() => onFlipChip(dieIndex, slot)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background"
                    >
                      <RotateCw className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Element picker panel */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            {activeSlot
              ? `${SLOT_LABELS[activeSlot]} — ${
                  activeSide === "alternateEnergyTypeId" ? "other side" : "facing up"
                }`
              : "Select a face to edit"}
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {options.map((opt) => {
              const selected =
                activeFace &&
                (activeSide === "alternateEnergyTypeId"
                  ? activeFace.alternateEnergyTypeId
                  : activeFace.energyTypeId) === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!activeSlot}
                  onClick={() => pickElement(opt.id)}
                  title={opt.name}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-xl border-2 text-2xl transition-transform hover:scale-105 disabled:opacity-40",
                    selected ? "border-primary ring-2 ring-primary/40" : "border-border"
                  )}
                  style={{ backgroundColor: `${opt.color}18` }}
                >
                  {opt.icon}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
