import type { AttackProbabilityReport } from "@/types/probability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { summarizeEnergyCost } from "@/utils/energy";

interface ProbabilityResultPanelProps {
  report: AttackProbabilityReport;
}

function ProbabilityBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 1000) / 10;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ProbabilityResultPanel({ report }: ProbabilityResultPanelProps) {
  const { energy, characterDieOutcomes, combined } = report;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Energy Payment</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <p className="text-xs text-muted-foreground">
            Required: {summarizeEnergyCost(energy.requiredEnergySummary)}
          </p>
          <ProbabilityBar
            label="Success (roll ≥ required)"
            value={energy.successProbability}
            color="hsl(var(--secondary))"
          />
          <ProbabilityBar
            label="Failure"
            value={energy.failureProbability}
            color="hsl(var(--destructive))"
          />
          <p className="text-sm text-muted-foreground">
            Expected successful energy:{" "}
            <span className="font-semibold text-foreground">
              {energy.expectedUsefulEnergy.toFixed(2)}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Character Die Outcomes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          {characterDieOutcomes.map((o, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span>
                  {o.poses.length} pose{o.poses.length > 1 ? "s" : ""} → {o.totalDamage} dmg
                </span>
                <span className="font-semibold">
                  {Math.round(o.probability * 1000) / 10}%
                </span>
              </div>
              {o.effectText && (
                <p className="text-xs text-muted-foreground">{o.effectText}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Combined Damage Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          {combined
            .slice()
            .sort((a, b) => b.probability - a.probability)
            .map((row, i) => (
              <ProbabilityBar
                key={i}
                label={row.succeeded ? `${row.totalDamage} damage` : "Attack fails"}
                value={row.probability}
                color={row.succeeded ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
