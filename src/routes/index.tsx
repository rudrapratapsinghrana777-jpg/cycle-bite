import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarHeart, ChefHat, Activity, AlertTriangle, Candy, HelpCircle, Lock, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { calcPhase, clearCycle, loadCycle, loadPain, PAIN_LEVELS, PHASES, saveCycle, savePain, type PainLevel, type PhaseName } from "@/lib/cycle";
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
  {
    name: "Chocolate", emoji: "🍫",
    why: "Cycle-related changes in appetite and mood may increase chocolate cravings. A craving alone does not indicate low magnesium.",
    swap: "70%+ dark chocolate with roasted pumpkin seeds or almond butter",
    nutrients: "Magnesium & zinc",
    benefit: "Support normal muscle and nerve function; symptom relief is not guaranteed.",
  },
  {
    name: "Salty & Crunchy", emoji: "🍿",
    why: "Hormonal changes can affect fluid balance around your period, while stress and food preferences may influence salty cravings.",
    swap: "Lightly salted roasted chickpeas or air-popped popcorn with nutritional yeast",
    nutrients: "Potassium & protein",
    benefit: "Chickpeas provide protein and potassium. Nutrient amounts depend on your ingredients and portion.",
  },
  {
    name: "Fried & Fatty", emoji: "🍟",
    why: "Appetite can increase in the luteal phase. Craving fatty foods does not establish an essential fatty acid deficiency.",
    swap: "Baked sweet potato wedges tossed in olive oil or mashed avocado toast",
    nutrients: "Healthy fats & vitamin B6",
    benefit: "Provide unsaturated fats and B6 for everyday nourishment, rather than a proven boost to progesterone.",
  },
  {
    name: "Carbs / Pastries", emoji: "🍰",
    why: "Premenstrual changes in mood and appetite may contribute to sweet or carbohydrate cravings; serotonin is only one possible factor.",
    swap: "Warm oatmeal with cinnamon, chia seeds, and sliced banana",
    nutrients: "Complex carbs & tryptophan",
    benefit: "Oats and chia add fiber for a more filling snack; this is not a guaranteed serotonin or blood-sugar treatment.",
  },
];

const FAQS = [
  {
    q: "How does CycleBite protect my private health data?",
    a: "CycleBite uses a zero-cloud, local-first architecture. All your cycle dates, pain logs, and craving choices are stored strictly in your browser's localStorage. No personal tracking history or health logs are ever saved on an external server.",
  },
  {
    q: "How do the meal recommendations change when I have severe pain?",
    a: "When you log severe pain or cramping, CycleBite instantly adapts your meal plan\u2014shifting away from heavy, solid foods toward warm, comforting, and easily digestible choices rich in natural antispasmodics and magnesium to help soothe discomfort.",
  },
  {
    q: "Can I use CycleBite if my cycle length varies?",
    a: "Yes! CycleBite operates on a flexible, day-by-day phase selector rather than assuming a rigid 28-day calendar. Simply select your current phase and symptom severity, and the app adapts in real time.",
  },
  {
    q: "How do PMS Craving Swaps work?",
    a: "Premenstrual cravings often signal underlying micronutrient needs, like a drop in magnesium or potassium. Our craving tool translates these cravings into delicious, satisfying culinary alternatives that curb the impulse while keeping your energy stable.",
  },
  {
    q: "Is CycleBite a replacement for professional medical advice?",
    a: "No. CycleBite is designed as a nutritional and lifestyle companion to help you navigate hormonal shifts. Always consult a healthcare professional for medical conditions or severe health concerns.",
  },
];

function Index() {
  const [start, setStart] = useState("");
  const [length, setLength] = useState(28);
  const [saved, setSaved] = useState(false);
  const [pain, setPain] = useState<PainLevel>("Mild");
  useEffect(() => {
    setPain(loadPain());
    const c = loadCycle();
    if (c) { setStart(c.start); setLength(c.length); setSaved(true); }
  }, []);
  const info = start ? calcPhase(start, length) : null;
  const phase: PhaseName | null = info?.phase ?? null;

  return (
    <main className="relative min-h-screen overflow-x-clip bg-background">
      <div aria-hidden="true" className="glow glow-sage" />
      <div aria-hidden="true" className="glow glow-rose" />
      <div className="relative mx-auto max-w-3xl px-5 py-10 space-y-6">
        <header className="text-center space-y-2">
          <span className="hero-badge">✦ Zero-cloud · Local-first companion</span>
          <h1 className="font-display text-5xl text-foreground">Cycle<span className="text-accent-foreground italic">Bite</span></h1>
          <p className="text-muted-foreground">Nourishment that moves with your rhythm.</p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Your dates stay on this device only.</p>
          <div className="pt-1"><a href="#faq" className="chip"><HelpCircle className="h-3.5 w-3.5 text-primary" /> Questions &amp; answers</a></div>
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
          <PhaseTimeline phase={phase} day={info?.day ?? null} length={info?.length ?? length} />
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

        <section className="card-soft space-y-4">
          <h2 className="section-title"><Activity className="h-5 w-5 text-primary" /> Pain &amp; cramp level</h2>
          <div role="radiogroup" aria-label="Pain and cramp level" className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
            {PAIN_LEVELS.map(({ level, dot }) => (
              <button key={level} role="radio" aria-checked={pain === level}
                onClick={() => { setPain(level); savePain(level); }}
                className={`rounded-full px-3 py-2 text-sm transition ${pain === level ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                <span aria-hidden="true">{dot}</span> {level}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Saved on this device. Recipes adapt to how you feel.</p>
        </section>

        <RecipeEngine phase={phase} pain={pain} />
        <CravingSwaps phase={phase} />

        <Faq />

        <footer className="flex flex-col items-center gap-2 pb-6 text-center text-xs text-muted-foreground">
          <span>General wellness guidance, not medical advice.</span>
          <a href="#faq" className="inline-flex items-center gap-1.5 transition hover:text-foreground"><HelpCircle className="h-3 w-3" /> Questions &amp; answers</a>
        </footer>
      </div>
    </main>
  );
}

function Results({ items, tags = [] }: { items: Suggestion[]; tags?: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.slice(0, 3).map((s, i) => (
        <article key={i} className="result-card">
          {tags.length > 0 && <div className="mb-2 flex flex-wrap gap-1">{tags.map((t) => <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{t}</span>)}</div>}
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

function RecipeEngine({ phase, pain }: { phase: PhaseName | null; pain: PainLevel }) {
  const [ing, setIng] = useState("");
  const [usedPain, setUsedPain] = useState<PainLevel>(pain);
  const fetchRecipes = useServerFn(getRecipes);
  const { items, loading, error, run } = useAsk();
  return (
    <section className="card-soft space-y-4">
      <h2 className="section-title"><ChefHat className="h-5 w-5 text-primary" /> Fridge-to-plate</h2>
      <textarea className="field min-h-24" placeholder="eggs, spinach, sweet potato…" value={ing} onChange={(e) => setIng(e.target.value)} />
      <button className="btn-primary" disabled={!phase || !ing.trim() || loading}
        onClick={() => { if (!phase) return; setUsedPain(pain); run(() => fetchRecipes({ data: { phase, focus: PHASES[phase].focus, ingredients: ing.trim(), painLevel: pain } })); }}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Cook up 3 ideas
      </button>
      {pain === "Severe" && <div role="alert" className="flex items-start gap-2 rounded-2xl border border-accent-foreground/40 bg-accent p-3 text-sm text-accent-foreground"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> For debilitating pain, consider rest and consulting a healthcare professional.</div>}
      {!phase && <p className="text-sm text-muted-foreground">Add your cycle above to unlock phase-matched recipes.</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Results items={items} tags={PAIN_LEVELS.find((p) => p.level === usedPain)?.tags ?? []} />
    </section>
  );
}

function CravingSwaps({ phase }: { phase: PhaseName | null }) {
  const [sel, setSel] = useState("Chocolate");
  const selected = CRAVINGS.find((craving) => craving.name === sel) ?? CRAVINGS[0];
  const fetchSwaps = useServerFn(getSwaps);
  const { items, loading, error, run } = useAsk();
  return (
    <section className="card-soft space-y-4">
      <h2 className="section-title"><Candy className="h-5 w-5 text-primary" /> PMS craving swaps</h2>
      <div className="flex flex-wrap gap-2">
        {CRAVINGS.map(({ name, emoji }) => (
          <Button key={name} variant="outline" className={sel === name ? "chip chip-active h-auto whitespace-normal text-left" : "chip h-auto whitespace-normal text-left"} disabled={loading}
            aria-pressed={sel === name} onClick={() => setSel(name)}>
            <span aria-hidden="true">{emoji}</span> {name}
          </Button>
        ))}
      </div>
      {selected && <div aria-live="polite" className="space-y-4 border-t pt-4">
        <h3 className="font-display text-xl">{selected.emoji} {selected.name}</h3>
        <dl className="space-y-4 text-sm">
          <div><dt className="font-medium">Biological “why”</dt><dd className="mt-1 text-muted-foreground">{selected.why}</dd></div>
          <div><dt className="font-medium">Hormone-friendly swap</dt><dd className="mt-1 text-foreground">{selected.swap}</dd></div>
          <div><dt className="font-medium">Key nutrients</dt><dd className="mt-1 text-primary">{selected.nutrients}</dd><dd className="mt-1 text-muted-foreground">{selected.benefit}</dd></div>
        </dl>
      </div>}
      <Button disabled={!phase || loading} onClick={() => phase && run(() => fetchSwaps({ data: { phase, craving: sel } }))}>
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} More phase-matched swaps
      </Button>
      {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Finding gentle swaps…</p>}
      {!phase && <p className="text-sm text-muted-foreground">Add your cycle above for additional phase-matched swaps.</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Results items={items} />
    </section>
  );
}

const TIMELINE: { name: PhaseName; icon: string; days: (len: number) => string; chips: string[] }[] = [
  { name: "Menstrual", icon: "🩸", days: () => "Days 1–5", chips: ["Iron", "Warming"] },
  { name: "Follicular", icon: "🌱", days: (l) => `Days 6–${Math.max(14, l - 14) - 1}`, chips: ["Zinc", "Probiotics"] },
  { name: "Ovulatory", icon: "✨", days: (l) => { const o = Math.max(14, l - 14); return `Days ${o}–${o + 3}`; }, chips: ["Antioxidants", "Fiber"] },
  { name: "Luteal", icon: "🍂", days: (l) => `Days ${Math.max(14, l - 14) + 4}–${l}`, chips: ["Magnesium", "Complex carbs"] },
];

function PhaseTimeline({ phase, day, length }: { phase: PhaseName | null; day: number | null; length: number }) {
  const pct = day ? Math.min(100, (day / length) * 100) : 0;
  return (
    <div className="space-y-3">
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={1} aria-valuemax={length} aria-valuenow={day ?? undefined} aria-label="Cycle progress">
        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TIMELINE.map((t) => {
          const active = t.name === phase;
          return (
            <li key={t.name} aria-current={active ? "step" : undefined} className={`phase-step ${active ? "phase-step-active" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-xl" aria-hidden="true">{t.icon}</span>
                {active && day && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">Day {day}</span>}
              </div>
              <p className="font-display text-base leading-tight">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.days(length)}</p>
              {active && <div className="flex flex-wrap gap-1 pt-1">{t.chips.map((c) => <span key={c} className="rounded-full bg-card px-2 py-0.5 text-[10px] text-secondary-foreground">{c}</span>)}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="card-soft scroll-mt-6 space-y-4">
      <h2 className="section-title"><HelpCircle className="h-5 w-5 text-primary" /> Questions &amp; answers</h2>
      <Accordion type="single" collapsible defaultValue="faq-0">
        {FAQS.map((item, i) => (
          <AccordionItem key={item.q} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-display text-lg hover:no-underline">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
