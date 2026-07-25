import { Select } from "@/components/ui/select";
import { getEnergyType } from "@/utils/energyRegistry";

interface FilterBarProps {
  expansions: string[];
  types: string[];
  selectedExpansion: string | null;
  selectedType: string | null;
  onExpansionChange: (value: string | null) => void;
  onTypeChange: (value: string | null) => void;
}

export function FilterBar({
  expansions,
  types,
  selectedExpansion,
  selectedType,
  onExpansionChange,
  onTypeChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select
        aria-label="Filter by expansion"
        value={selectedExpansion ?? ""}
        onChange={(e) => onExpansionChange(e.target.value || null)}
      >
        <option value="">All expansions</option>
        {expansions.map((exp) => (
          <option key={exp} value={exp}>
            {exp}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by type"
        value={selectedType ?? ""}
        onChange={(e) => onTypeChange(e.target.value || null)}
      >
        <option value="">All types</option>
        {types.map((typeId) => {
          const def = getEnergyType(typeId);
          return (
            <option key={typeId} value={typeId}>
              {def.icon} {def.name}
            </option>
          );
        })}
      </Select>
    </div>
  );
}
