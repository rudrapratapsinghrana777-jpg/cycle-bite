import { useEffect, useState } from "react";
import { Smile, Trash2 } from "lucide-react";
import type { PhaseName } from "@/lib/cycle";
import { addMood, estimateMood, loadMoods, MOODS, saveMoods, type Mood, type MoodEntry } from "@/lib/mood";

const emojiOf = (m: Mood) => MOODS.find((x) => x.mood === m)?.emoji ?? "";

export function MoodTracker({ phase }: { phase: PhaseName | null }) {
  const [list, setList] = useState<MoodEntry[]>([]);
  const est = estimateMood(phase);
  const [pick, setPick] = useState<Mood | null>(null);
  useEffect(() => setList(loadMoods()), []);
  useEffect(() => { if (est) setPick(est.mood); }, [est?.mood]);

  const update = (next: MoodEntry[]) => { setList(next); saveMoods(next); };

  return (
    <section className="card-soft space-y-4">
      <h2 className="section-title"><Smile className="h-5 w-5 text-primary" /> Mood check</h2>
      {est ? (
        <div className="phase-banner">
          <div className="text-4xl" aria-hidden="true">{emojiOf(est.mood)}</div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Likely mood · {phase} phase</p>
            <p className="font-display text-2xl">{est.mood}</p>
            <p className="text-sm text-muted-foreground">{est.note}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Add your cycle above to see your likely mood for this phase.</p>
      )}
      <div>
        <p className="mb-2 text-sm text-muted-foreground">How do you actually feel today?</p>
        <div role="radiogroup" aria-label="Today's mood" className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
          {MOODS.map(({ mood, emoji }) => (
            <button key={mood} role="radio" aria-checked={pick === mood} onClick={() => setPick(mood)}
              className={`rounded-full px-3 py-2 text-sm transition ${pick === mood ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              <span aria-hidden="true">{emoji}</span> {mood}
            </button>
          ))}
        </div>
      </div>
      <button className="btn-primary" disabled={!pick} onClick={() => pick && update(addMood(list, pick, phase))}>Save today's mood</button>
      {list.length > 0 && (
        <ul className="space-y-1 text-sm">
          {list.slice(0, 7).map((e) => (
            <li key={e.date} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
              <span>{e.date} · {emojiOf(e.mood)} {e.mood}{e.phase ? ` · ${e.phase}` : ""}</span>
              <button aria-label={`Remove mood for ${e.date}`} className="text-muted-foreground hover:text-foreground" onClick={() => update(list.filter((x) => x.date !== e.date))}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">An estimate from typical cycle patterns, not a reading of your feelings. Saved on this device only.</p>
    </section>
  );
}
