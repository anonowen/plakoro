import type { Attack } from "@/types/attack";
import { Card, CardContent } from "@/components/ui/card";
import { EnergyCostBadge } from "./EnergyCostBadge";

interface AttackListProps {
  attacks: Attack[];
}

export function AttackList({ attacks }: AttackListProps) {
  return (
    <div className="flex flex-col gap-3">
      {attacks.map((attack) => (
        <Card key={attack.id}>
          <CardContent className="flex flex-col gap-2 pt-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-semibold">{attack.name}</h4>
              <span className="whitespace-nowrap text-lg font-bold text-primary">
                {attack.damage > 0 ? attack.damage : "—"}
              </span>
            </div>
            <EnergyCostBadge cost={attack.energyCost} size="sm" />
            <p className="text-sm text-muted-foreground">{attack.description}</p>
            {attack.specialEffect && (
              <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                {attack.specialEffect}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
