import { useMemo } from "react";
import type { Attack } from "@/types/attack";
import type { EnergyDieConfig } from "@/types/dice";
import { calculateAttackProbability } from "@/utils/probability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface AttackComparisonTableProps {
  attacks: Attack[];
  dice: EnergyDieConfig[];
  selectedAttackId: string;
  onSelectAttack: (attackId: string) => void;
}

/** Expected damage across every combined outcome (0 counted for failure). */
function expectedDamage(report: ReturnType<typeof calculateAttackProbability>) {
  return report.combined.reduce((sum, row) => sum + row.totalDamage * row.probability, 0);
}

export function AttackComparisonTable({
  attacks,
  dice,
  selectedAttackId,
  onSelectAttack,
}: AttackComparisonTableProps) {
  const rows = useMemo(
    () =>
      attacks.map((attack) => {
        const report = calculateAttackProbability(dice, attack);
        return {
          attack,
          successPct: report.energy.successProbability * 100,
          expectedDmg: expectedDamage(report),
        };
      }),
    [attacks, dice]
  );

  const best = rows.reduce(
    (max, r) => (r.successPct > max ? r.successPct : max),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare All Attacks</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        <p className="text-xs text-muted-foreground">
          Based on your current Energy Dice loadout — tap a row to select it.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-2 font-medium">Attack</th>
                <th className="py-2 pr-2 font-medium">Success</th>
                <th className="py-2 font-medium">Expected dmg</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ attack, successPct, expectedDmg }) => (
                <tr
                  key={attack.id}
                  onClick={() => onSelectAttack(attack.id)}
                  className={cn(
                    "cursor-pointer border-t border-border hover:bg-muted",
                    attack.id === selectedAttackId && "bg-primary/10"
                  )}
                >
                  <td className="py-2 pr-2 font-medium">{attack.name}</td>
                  <td className="py-2 pr-2">
                    <span
                      className={cn(
                        "font-semibold",
                        successPct === best && best > 0 && "text-secondary"
                      )}
                    >
                      {successPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2">{expectedDmg.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
