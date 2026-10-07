import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarHeart, ChefHat, Candy, Cookie, Soup, Coffee, IceCream, Lock, Loader2, Sparkles, Trash2 } from "lucide-react";
import { calcPhase, clearCycle, loadCycle, PHASES, saveCycle, type PhaseName } from "@/lib/cycle";
import { getRecipes, getSwaps, type Suggestion } from "@/lib/nebius.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CycleBite — Cycle-synced nutrition" },
      { name: "description", content: "Privacy-first recipes and PMS craving swaps matched to your menstrual cycle phase." },
      { property: "og:title", content: "CycleBite — Cycle-synced nutrition" },
      { property: "og:description", content: "Privacy-first recipes and PMS craving swaps matched to your cycle phase." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const CRAVINGS = [
  { name: "Sugar", icon: Candy },
  { name: "Salt", icon: Soup },
  { name: "Chocolate", icon: Cookie },
  { name: "Carbs", icon: IceCream },
  { name: "Caffeine", icon: Coffee },
];

function Index() {
  const [start, setStart] = useState("");
  const [length, setLength] = useState(28);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const c = loadCycle();
    if (c) { setStart(c.start); setLength(c.length); setSaved(true); }
  }, []);
  const info = start ? calcPhase(start, length) : null;
  const phase: PhaseName | null = info?.phase ?? null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="font-display text-5xl text-foreground">Cycle<span className="text-accent-foreground italic">Bite</span></h1>
          <p className="text-muted-foreground">Nourishment that moves with your rhythm.</p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Your dates stay on this device only.</p>
        </header>

        <section className="card-soft space-y-4">
          <h2 className="section-title"><CalendarHeart className="h-5 w-5 text-primary" /> Your cycle</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Last period start</span>
              <input type="date" className="field" value={start} max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => { setStart(e.target.value); setSaved(false); }} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Average cycle length (days)</span>
              <input type="number" min={21} max={40} className="field" value={length}
                onChange={(e) => { setLength(Math.min(40, Math.max(21, Number(e.target.value) || 28))); setSaved(false); }} />
            </label>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={!start} onClick={() => { saveCycle({ start, length }); setSaved(true); }}>
              {saved ? "Saved on device" : "Save on this device"}
            </button>
            {saved && <button className="btn-ghost" onClick={() => { clearCycle(); setStart(""); setLength(28); setSaved(false); }}><Trash2 className="h-4 w-4" /> Clear</button>}
          </div>
          {info && phase && (
            <div className="phase-banner">
              <div className="text-4xl">{PHASES[phase].emoji}</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Day {info.day} of {info.length}</p>
                <p className="font-display text-2xl">{phase} phase</p>
                <p className="text-sm text-muted-foreground">{PHASES[phase].blurb}</p>
              </div>
            </div>
          )}
        </section>

        <RecipeEngine phase={phase} />
        <CravingSwaps phase={phase} />

        <footer className="text-center text-xs text-muted-foreground pb-6">General wellness guidance, not medical advice.</footer>
      </div>
    </main>
  );
}

function Results({ items }: { items: Suggestion[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.slice(0, 3).map((s, i) => (
        <article key={i} className="result-card">
          <h3 className="font-display text-lg leading-tight">{s.title}</h3>
          <p className="text-sm text-muted-foreground">{s.description}</p>
          <ul className="mt-2 space-y-1 text-sm list-disc pl-4">{s.details.map((d, j) => <li key={j}>{d}</li>)}</ul>
        </article>
      ))}
    </div>
  );
}

function useAsk() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const run = async (fn: () => Promise<Suggestion[]>) => {
    setLoading(true); setError(""); setItems([]);
    try { setItems((await fn()).slice(0, 3)); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  };
  return { items, loading, error, run };
}

function RecipeEngine({ phase }: { phase: PhaseName | null }) {
  const [ing, setIng] = useState("");
  const fetchRecipes = useServerFn(getRecipes);
  const { items, loading, error, run } = useAsk();
  return (
    <section className="card-soft space-y-4">
      <h2 className="section-title"><ChefHat className="h-5 w-5 text-primary" /> Fridge-to-plate</h2>
      <textarea className="field min-h-24" placeholder="eggs, spinach, sweet potato…" value={ing} onChange={(e) => setIng(e.target.value)} />
      <button className="btn-primary" disabled={!phase || !ing.trim() || loading}
        onClick={() => phase && run(() => fetchRecipes({ data: { phase, focus: PHASES[phase].focus, ingredients: ing.trim() } }))}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Cook up 3 ideas
      </button>
      {!phase && <p className="text-sm text-muted-foreground">Add your cycle above to unlock phase-matched recipes.</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Results items={items} />
    </section>
  );
}

function CravingSwaps({ phase }: { phase: PhaseName | null }) {
  const [sel, setSel] = useState<string | null>(null);
  const fetchSwaps = useServerFn(getSwaps);
  const { items, loading, error, run } = useAsk();
  return (
    <section className="card-soft space-y-4">
      <h2 className="section-title"><Candy className="h-5 w-5 text-primary" /> PMS craving swaps</h2>
      <div className="flex flex-wrap gap-2">
        {CRAVINGS.map(({ name, icon: Icon }) => (
          <button key={name} className={sel === name ? "chip chip-active" : "chip"} disabled={!phase || loading}
            onClick={() => { setSel(name); phase && run(() => fetchSwaps({ data: { phase, craving: name } })); }}>
            <Icon className="h-4 w-4" /> {name}
          </button>
        ))}
      </div>
      {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Finding gentle swaps…</p>}
      {!phase && <p className="text-sm text-muted-foreground">Add your cycle above to get swaps for your phase.</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Results items={items} />
    </section>
  );
}
