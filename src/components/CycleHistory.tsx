import { useEffect, useState } from "react";
import { CalendarHeart, Plus, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadHistory, localToday, normalizeHistory, predictHistory, saveHistory } from "@/lib/cycle-history";

export function CycleHistory({ onCycleChange }: { onCycleChange: (cycle: { start: string; length: number } | null) => void }) {
  const [history, setHistory] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [today, setToday] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { setHistory(loadHistory()); setToday(localToday()); }, []);
  const prediction = today ? predictHistory(history, 28, today) : null;
  function update(values: string[]) {
    const next = normalizeHistory(values, today);
    try { saveHistory(next); } catch { setError("This browser could not save your history. Please allow device storage and try again."); return; }
    setHistory(next);
    const estimate = predictHistory(next, 28, today);
    onCycleChange(estimate ? { start: estimate.latest, length: estimate.average } : null);
    setError("");
  }
  return <section className="card-soft space-y-4">
    <h2 className="section-title"><CalendarHeart className="h-5 w-5 text-primary" /> Cycle history</h2>
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Dates stay on this device only.</p>
    {prediction && <dl className="grid gap-4 border-y py-4 sm:grid-cols-2">
      <div><dt className="text-sm text-muted-foreground">Average cycle length</dt><dd className="font-display text-2xl">{prediction.average} days</dd><dd className="text-xs text-muted-foreground">{prediction.count > 1 ? `Based on ${prediction.count} logged starts` : "28-day estimate · one logged start"}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Estimated next period</dt><dd className="font-display text-2xl"><time dateTime={prediction.next}>{prediction.next}</time></dd><dd className="text-xs text-muted-foreground">{prediction.overdue ? "This estimate has passed; log a newer start if available." : "An estimate, not a confirmed date."}</dd></div>
    </dl>}
    {prediction?.variable && <p className="text-sm text-muted-foreground">Your logged intervals vary or fall outside 21–40 days. Phase and period estimates may be less reliable.</p>}
    <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
      event.preventDefault();
      if (!date || normalizeHistory([date], today).length === 0) { setError("Choose a valid date that is not in the future."); return; }
      if (history.includes(date)) { setError("That start date is already logged."); return; }
      update([...history, date]); setDate("");
    }}>
      <label className="min-w-0 flex-1 space-y-1 text-sm"><span className="text-muted-foreground">Past period start</span><input type="date" className="field" required max={today || undefined} value={date} onChange={event => setDate(event.target.value)} /></label>
      <Button type="submit" disabled={!date}><Plus /> Add date</Button>
    </form>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {history.length ? <ul className="max-h-48 divide-y overflow-auto">{[...history].reverse().map(value => <li key={value} className="flex items-center justify-between gap-2 py-2"><time dateTime={value} className="text-sm">{value}</time><Button type="button" variant="ghost" size="icon" title={`Remove ${value}`} aria-label={`Remove ${value}`} onClick={() => update(history.filter(item => item !== value))}><Trash2 className="h-4 w-4" /></Button></li>)}</ul> : <p className="text-sm text-muted-foreground">No period starts logged yet.</p>}
  </section>;
}