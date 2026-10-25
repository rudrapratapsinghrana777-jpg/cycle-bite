import type { PhaseName } from "@/lib/cycle";
import { localToday } from "@/lib/cycle-history";

export type Mood = "Happy" | "Sad" | "Angry";
export const MOODS: { mood: Mood; emoji: string }[] = [
  { mood: "Happy", emoji: "😊" },
  { mood: "Sad", emoji: "😢" },
  { mood: "Angry", emoji: "😠" },
];

// Estimated, common tendencies only — not a measurement of how someone feels.
export const PHASE_MOOD: Record<PhaseName, { mood: Mood; note: string }> = {
  Menstrual: { mood: "Sad", note: "Lower hormone levels can bring tiredness or a low mood for some people." },
  Follicular: { mood: "Happy", note: "Rising estrogen often comes with more energy and a brighter mood." },
  Ovulatory: { mood: "Happy", note: "Estrogen peaks around now, and many people feel confident and social." },
  Luteal: { mood: "Angry", note: "Hormone shifts before a period can bring irritability or a shorter temper." },
};

export const estimateMood = (phase: PhaseName | null) => (phase ? PHASE_MOOD[phase] : null);

export type MoodEntry = { date: string; mood: Mood; phase: PhaseName | null };
const KEY = "cyclebite:moods";
const isMood = (v: unknown): v is Mood => MOODS.some((m) => m.mood === v);

export function normalizeMoods(v: unknown): MoodEntry[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((e) => e && typeof e.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && isMood(e.mood))
    .map((e) => ({ date: e.date, mood: e.mood, phase: e.phase ?? null }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 60);
}

/** One entry per day; saving again today replaces it. */
export function addMood(list: MoodEntry[], mood: Mood, phase: PhaseName | null, today = localToday()): MoodEntry[] {
  return normalizeMoods([{ date: today, mood, phase }, ...list.filter((e) => e.date !== today)]);
}

export function loadMoods(): MoodEntry[] {
  try { return normalizeMoods(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { return []; }
}
export const saveMoods = (list: MoodEntry[]) => localStorage.setItem(KEY, JSON.stringify(list));
