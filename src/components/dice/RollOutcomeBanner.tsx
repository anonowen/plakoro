import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import type { RollOutcome } from "@/hooks/useDiceRoll";

interface RollOutcomeBannerProps {
  outcome: RollOutcome;
}

export function RollOutcomeBanner({ outcome }: RollOutcomeBannerProps) {
  return (
    <div
      className={cn(
        "flex animate-fade-in items-center gap-3 rounded-2xl border-2 p-4",
        outcome.succeeded
          ? "border-secondary/40 bg-secondary/10"
          : "border-destructive/40 bg-destructive/10"
      )}
    >
      {outcome.succeeded ? (
        <CheckCircle2 className="h-8 w-8 shrink-0 text-secondary" />
      ) : (
        <XCircle className="h-8 w-8 shrink-0 text-destructive" />
      )}
      <div>
        <p className="font-semibold">
          {outcome.succeeded ? "Attack can be used!" : "Not enough energy — attack fails."}
        </p>
        {outcome.succeeded && (
          <p className="text-sm text-muted-foreground">
            Deals {outcome.totalDamage} damage
            {outcome.effectText ? ` — ${outcome.effectText}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
