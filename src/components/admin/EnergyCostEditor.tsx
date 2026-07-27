import { Plus, Trash2 } from "lucide-react";
import type { EnergyCostRow } from "@/utils/pokemonDraft";
import { getAllEnergyTypes } from "@/utils/energyRegistry";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface EnergyCostEditorProps {
  rows: EnergyCostRow[];
  onChange: (rows: EnergyCostRow[]) => void;
}

export function EnergyCostEditor({ rows, onChange }: EnergyCostEditorProps) {
  const energyTypes = getAllEnergyTypes();

  function updateRow(index: number, patch: Partial<EnergyCostRow>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, { energyTypeId: energyTypes[0]?.id ?? "", amount: 1 }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">Energy cost</span>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Select
            value={row.energyTypeId}
            onChange={(e) => updateRow(i, { energyTypeId: e.target.value })}
            className="flex-1"
          >
            {energyTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.name}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            min={1}
            value={row.amount}
            onChange={(e) => updateRow(i, { amount: Number(e.target.value) || 0 })}
            className="w-20"
          />
          <Button variant="ghost" size="icon" onClick={() => removeRow(i)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow} className="w-fit">
        <Plus className="h-4 w-4" /> Add energy
      </Button>
    </div>
  );
}
