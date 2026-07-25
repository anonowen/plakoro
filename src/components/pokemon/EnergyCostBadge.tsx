import type { EnergyCost } from "@/types/energy";
import { formatEnergyCost } from "@/utils/energy";
import { cn } from "@/utils/cn";

interface EnergyCostBadgeProps {
  cost: EnergyCost;
  size?: "sm" | "md";
}

export function EnergyCostBadge({ cost, size = "md" }: EnergyCostBadgeProps) {
  const entries = formatEnergyCost(cost);
  const dimension = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm";

  if (entries.length === 0) {
    return <span className="text-xs text-muted-foreground">Free</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {entries.flatMap((entry) =>
        Array.from({ length: entry.amount }, (_, i) => (
          <span
            key={`${entry.energyTypeId}-${i}`}
            title={entry.name}
            className={cn(
              "flex items-center justify-center rounded-full font-semibold",
              dimension
            )}
            style={{
              backgroundColor: `${entry.color}22`,
              color: entry.color,
            }}
          >
            {entry.icon}
          </span>
        ))
      )}
    </div>
  );
}
