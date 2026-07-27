import { useState } from "react";
import { Heart, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHpTracker } from "@/hooks/useHpTracker";

interface HpTrackerProps {
  pokemonId: string;
  maxHp: number;
}

export function HpTracker({ pokemonId, maxHp }: HpTrackerProps) {
  const { hp, applyDamage, heal, reset } = useHpTracker(pokemonId, maxHp);
  const [amount, setAmount] = useState("20");

  const pct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const parsedAmount = Math.max(0, Number(amount) || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" /> HP Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">{hp}</span>
          <span className="text-sm text-muted-foreground">/ {maxHp} HP</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-20"
            aria-label="Amount"
          />
          <Button variant="destructive" size="sm" onClick={() => applyDamage(parsedAmount)}>
            − Damage
          </Button>
          <Button variant="secondary" size="sm" onClick={() => heal(parsedAmount)}>
            + Heal
          </Button>
          <Button variant="ghost" size="icon" title="Reset to full HP" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
