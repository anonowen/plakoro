import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Plus } from "lucide-react";
import { usePokemonData } from "@/hooks/usePokemonData";
import {
  createEmptyAttackDraft,
  createEmptyPokemonDraft,
  pokemonDraftToJson,
  pokemonToDraft,
  slugify,
  validatePokemonDraft,
  type PokemonDraft,
} from "@/utils/pokemonDraft";
import { getAllEnergyTypes } from "@/utils/energyRegistry";
import { AttackEditor } from "@/components/admin/AttackEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const pokemons = usePokemonData();
  const energyTypes = getAllEnergyTypes();

  const [draft, setDraft] = useState<PokemonDraft>(createEmptyPokemonDraft);
  const [loadedExistingId, setLoadedExistingId] = useState<string>("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Auto-derive the id from the name for brand-new Pokémon. When editing
  // an existing one, the id stays fixed to what was loaded (so the file
  // you re-download still matches its original filename).
  useEffect(() => {
    if (loadedExistingId) return;
    setDraft((d) => ({ ...d, id: slugify(d.name) }));
  }, [draft.name, loadedExistingId]);

  const errors = useMemo(() => validatePokemonDraft(draft), [draft]);
  const json = useMemo(() => pokemonDraftToJson(draft), [draft]);

  function patch(fields: Partial<PokemonDraft>) {
    setDraft((d) => ({ ...d, ...fields }));
  }

  function handleLoadExisting(id: string) {
    if (!id) {
      setDraft(createEmptyPokemonDraft());
      setLoadedExistingId("");
      return;
    }
    const found = pokemons.find((p) => p.id === id);
    if (found) {
      setDraft(pokemonToDraft(found));
      setLoadedExistingId(id);
    }
  }

  function addAttack() {
    patch({ attacks: [...draft.attacks, createEmptyAttackDraft()] });
  }

  function updateAttack(index: number, attack: PokemonDraft["attacks"][number]) {
    patch({ attacks: draft.attacks.map((a, i) => (i === index ? attack : a)) });
  }

  function removeAttack(index: number) {
    patch({ attacks: draft.attacks.filter((_, i) => i !== index) });
  }

  function handleDownload() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.id || "pokemon"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(json);
      setCopyStatus("Copied to clipboard!");
    } catch {
      setCopyStatus("Couldn't copy automatically — select the text below manually.");
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Admin — Add / Edit Pokémon</h1>
        <p className="text-muted-foreground">
          Fill in the form, then download the JSON file and place it in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            src/data/pokemons/
          </code>{" "}
          (plus one import line in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">data/index.ts</code>
          ). No changes save automatically — this app has no backend.
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Load an existing Pokémon to edit</span>
            <Select
              value={loadedExistingId}
              onChange={(e) => handleLoadExisting(e.target.value)}
            >
              <option value="">— Create new Pokémon —</option>
              {pokemons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pokémon</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Name</span>
                <Input
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="e.g. Bulbasaur"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Type</span>
                <Select value={draft.type} onChange={(e) => patch({ type: e.target.value })}>
                  <option value="">Select a type</option>
                  {energyTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Weakness</span>
                <Select
                  value={draft.weakness}
                  onChange={(e) => patch({ weakness: e.target.value })}
                >
                  <option value="">Select a type</option>
                  {energyTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">HP</span>
                <Input
                  type="number"
                  min={1}
                  value={draft.hp}
                  onChange={(e) => patch({ hp: Number(e.target.value) || 0 })}
                  className="w-28"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Expansion</span>
                <Input
                  value={draft.expansion}
                  onChange={(e) => patch({ expansion: e.target.value })}
                  placeholder="e.g. Starter Set"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Image path</span>
                <Input
                  value={draft.image}
                  onChange={(e) => patch({ image: e.target.value })}
                  placeholder="/images/pokemon/your-file.svg"
                />
              </label>

              <p className="text-xs text-muted-foreground">
                File will be saved as{" "}
                <code className="rounded bg-muted px-1 py-0.5">
                  {draft.id || "…"}.json
                </code>
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            {draft.attacks.map((attack, i) => (
              <AttackEditor
                key={i}
                index={i}
                attack={attack}
                onChange={(a) => updateAttack(i, a)}
                onRemove={() => removeAttack(i)}
              />
            ))}
            <Button variant="outline" onClick={addAttack} className="w-fit">
              <Plus className="h-4 w-4" /> Add attack
            </Button>
          </div>
        </div>

        {/* JSON preview */}
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>JSON Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              {errors.length > 0 && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                  <p className="mb-1 text-sm font-medium text-destructive">
                    Fix before exporting:
                  </p>
                  <ul className="list-inside list-disc text-sm text-destructive">
                    {errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleDownload} disabled={errors.length > 0}>
                  <Download className="h-4 w-4" /> Download JSON
                </Button>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4" /> Copy JSON
                </Button>
              </div>
              {copyStatus && <p className="text-xs text-muted-foreground">{copyStatus}</p>}

              <pre className="max-h-[32rem] overflow-auto rounded-lg bg-muted p-3 text-xs">
                {json}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
