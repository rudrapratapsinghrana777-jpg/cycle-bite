import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { HeartPulse, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWellnessTips, type Suggestion } from "@/lib/nebius.functions";
import type { PainLevel, PhaseName } from "@/lib/cycle";

const EVERYDAY: Suggestion[] = [
  { title: "A nourishing pause", description: "Choose a satisfying meal and drink water regularly.", details: ["Try warm oats, a bean soup, or a meal with vegetables and protein."] },
  { title: "Move gently, or rest", description: "Let your comfort guide you; movement is optional.", details: ["If comfortable, try a short walk or gentle stretching. Stop if symptoms worsen."] },
  { title: "Make room to unwind", description: "A quiet break and regular sleep may support wellbeing.", details: ["Relax your shoulders and take a few slow, comfortable breaths."] },
];

export function WellnessTips({ phase, pain }: { phase: PhaseName | null; pain: PainLevel }) {
  const [symptoms, setSymptoms] = useState("");
  const [consent, setConsent] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(getWellnessTips);
  async function submit() {
    if (!consent || loading) return;
    if (/\d{4}-\d{2}-\d{2}/.test(symptoms)) { setError("Leave dates out of your symptom note."); return; }
    setLoading(true); setError(""); setItems([]);
    try {
      const result = await ask({ data: { phase, painLevel: pain, symptoms: symptoms.trim() } });
      setItems(result.items.slice(0, 3)); setError(result.error ?? "");
    } catch { setError("Personalised tips are unavailable right now. Your everyday guidance below is still available."); }
    finally { setLoading(false); }
  }
  return <section className="card-soft space-y-4">
    <h2 className="section-title"><HeartPulse className="h-5 w-5 text-primary" /> Symptom &amp; wellness tips</h2>
    <label className="block space-y-1 text-sm"><span className="text-muted-foreground">How are you feeling? (optional)</span><textarea className="field min-h-24" maxLength={500} placeholder="Mild cramps, bloating, or fatigue…" value={symptoms} onChange={event => setSymptoms(event.target.value)} /></label>
    <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" className="mt-0.5 accent-primary" checked={consent} onChange={event => setConsent(event.target.checked)} /><span>I agree to send this symptom note, pain level, and estimated phase to the AI service for personalised tips. No cycle dates are sent. Leave out dates and identifying details.</span></label>
    <Button disabled={!consent || loading} onClick={submit}>{loading ? <Loader2 className="animate-spin" /> : <Sparkles />} {loading ? "Finding tips…" : "Get personalised tips"}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div aria-live="polite" className="space-y-3 border-t pt-4">
      <h3 className="text-sm font-medium">{items.length ? "Your personalised tips" : "Everyday guidance"}</h3>
      <div className="grid gap-3 sm:grid-cols-3">{(items.length ? items : EVERYDAY).map(item => <article key={item.title} className="result-card"><h4 className="font-display text-lg">{item.title}</h4><p className="mt-1 text-sm text-muted-foreground">{item.description}</p><ul className="mt-2 list-disc space-y-1 pl-4 text-sm">{item.details.map(detail => <li key={detail}>{detail}</li>)}</ul></article>)}</div>
    </div>
    <p className="text-xs text-muted-foreground">General wellbeing support, not crisis prevention or medical treatment. For severe or worsening pain, seek medical care.</p>
  </section>;
}