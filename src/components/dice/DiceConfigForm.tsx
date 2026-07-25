import { RotateCw } from "lucide-react";
import type { EnergyDieConfig, FaceSlot } from "@/types/dice";
import { ALL_FACE_SLOTS, isDualSlot, slotSocketType } from "@/types/dice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getFaceAEnergyTypes,
  getFaceBEnergyTypes,
  getChipEnergyTypes,
} from "@/utils/energyRegistry";

const SLOT_LABELS: Record<FaceSlot, string> = {
  A: "Face A (peg)",
  B: "Face B (hole)",
  C1: "Face C · chip 1",
  C2: "Face C · chip 2",
  D1: "Face D · chip 1",
  D2: "Face D · chip 2",
};

/** Energy types legally installable in a given face slot's socket. */
function optionsForSlot(slot: FaceSlot) {
  const socket = slotSocketType(slot);
  if (socket === "A") return getFaceAEnergyTypes();
  if (socket === "B") return getFaceBEnergyTypes();
  return getChipEnergyTypes(); // C and D sockets accept any energy type
}

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
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Build your 3 Energy Dice — sockets are universal, so any chip fits any
          matching face type (A / B / C / D). Face C chips are dual-option: set
          both sides, then flip to choose which one faces up.
        </p>
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {dice.map((die, dieIndex) => (
          <Card key={dieIndex}>
            <CardHeader>
              <CardTitle className="text-sm">Energy Die {dieIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              {ALL_FACE_SLOTS.map((slot) => {
                const face = die.faces.find((f) => f.slot === slot);
                const options = optionsForSlot(slot);

                if (!isDualSlot(slot)) {
                  // Face A, B, or D — a single fixed symbol.
                  return (
                    <label key={slot} className="flex flex-col gap-1 text-xs">
                      <span className="text-muted-foreground">{SLOT_LABELS[slot]}</span>
                      <Select
                        value={face?.energyTypeId ?? ""}
                        onChange={(e) =>
                          onFaceOptionChange(
                            dieIndex as 0 | 1 | 2,
                            slot,
                            "energyTypeId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Empty</option>
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.icon} {opt.name}
                          </option>
                        ))}
                      </Select>
                    </label>
                  );
                }

                // Face C — dual-option chip: 2 symbols, one facing up.
                return (
                  <div key={slot} className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{SLOT_LABELS[slot]}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title="Flip chip"
                        onClick={() => onFlipChip(dieIndex as 0 | 1 | 2, slot)}
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <label className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Facing up (active)
                      </span>
                      <Select
                        value={face?.energyTypeId ?? ""}
                        onChange={(e) =>
                          onFaceOptionChange(
                            dieIndex as 0 | 1 | 2,
                            slot,
                            "energyTypeId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Empty</option>
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.icon} {opt.name}
                          </option>
                        ))}
                      </Select>
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Other side</span>
                      <Select
                        value={face?.alternateEnergyTypeId ?? ""}
                        onChange={(e) =>
                          onFaceOptionChange(
                            dieIndex as 0 | 1 | 2,
                            slot,
                            "alternateEnergyTypeId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Empty</option>
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.icon} {opt.name}
                          </option>
                        ))}
                      </Select>
                    </label>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
