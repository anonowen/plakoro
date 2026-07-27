import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Sparkles, Upload, Link as LinkIcon } from "lucide-react";
import { usePokemon } from "@/hooks/usePokemonData";
import { useDiceLoadout } from "@/hooks/useDiceLoadout";
import { useDiceCalculator } from "@/hooks/useDiceCalculator";
import { DiceConfigForm } from "@/components/dice/DiceConfigForm";
import { ProbabilityResultPanel } from "@/components/dice/ProbabilityResultPanel";
import { AttackComparisonTable } from "@/components/dice/AttackComparisonTable";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildShareUrl,
  decodeLoadout,
  parseLoadoutFile,
} from "@/utils/loadoutIO";
import { suggestLoadoutForAttack } from "@/utils/optimizeLoadout";

export default function CalculatorPage() {
  const { id } = useParams<{ id: string }>();
  const pokemon = usePokemon(id);
  const { loadout, setFaceOption, setAllDice, resetLoadout } = useDiceLoadout(
    id ?? ""
  );
  const [attackId, setAttackId] = useState<string>(pokemon?.attacks[0]?.id ?? "");
  const [searchParams, setSearchParams] = useSearchParams();
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appliedShareRef = useRef(false);

  // Load a shared loadout from the `share` URL param, once, on first visit.
  useEffect(() => {
    const shared = searchParams.get("share");
    if (!shared || appliedShareRef.current) return;
    const decoded = decodeLoadout(shared);
    if (decoded) {
      setAllDice(decoded);
      setShareStatus("Loaded loadout from shared link.");
    } else {
      setShareStatus("That share link looks invalid — ignored.");
    }
    appliedShareRef.current = true;
    searchParams.delete("share");
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAttack = pokemon?.attacks.find((a) => a.id === attackId) ?? pokemon?.attacks[0];
  const report = useDiceCalculator(loadout.dice, selectedAttack);

  if (!pokemon) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold">Pokémon not found</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Back to Pokédex
        </Link>
      </div>
    );
  }

  const currentPokemon = pokemon; // stable non-undefined reference for closures below

  async function handleShare() {
    const url = buildShareUrl(loadout.dice);
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("Share link copied to clipboard!");
    } catch {
      setShareStatus(url); // fall back to showing the raw URL
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(loadout.dice, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentPokemon.id}-loadout.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const parsed = parseLoadoutFile(text);
      if (parsed) {
        setAllDice(parsed);
        setShareStatus("Loadout imported successfully.");
      } else {
        setShareStatus("That file isn't a valid loadout — import cancelled.");
      }
    });
    e.target.value = "";
  }

  function handleSuggest() {
    if (!selectedAttack) return;
    setAllDice(suggestLoadoutForAttack(selectedAttack, loadout.dice));
    setShareStatus(`Suggested a loadout tuned for "${selectedAttack.name}".`);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <Link
        to={`/pokemon/${pokemon.id}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {pokemon.name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Dice Calculator — {pokemon.name}</h1>
        <p className="text-muted-foreground">
          Build your Energy Dice loadout, pick an attack, and see the exact
          probabilities before you roll.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Attack</span>
            <Select value={attackId} onChange={(e) => setAttackId(e.target.value)}>
              {pokemon.attacks.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSuggest}>
              <Sparkles className="h-4 w-4" /> Suggest loadout
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <LinkIcon className="h-4 w-4" /> Copy share link
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportClick}>
              <Upload className="h-4 w-4" /> Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>

          {shareStatus && (
            <p className="break-all text-xs text-muted-foreground">{shareStatus}</p>
          )}
        </CardContent>
      </Card>

      <DiceConfigForm
        dice={loadout.dice}
        onFaceOptionChange={setFaceOption}
        onReset={resetLoadout}
      />

      {report && <ProbabilityResultPanel report={report} />}

      <AttackComparisonTable
        attacks={pokemon.attacks}
        dice={loadout.dice}
        selectedAttackId={attackId}
        onSelectAttack={setAttackId}
      />
    </div>
  );
}
