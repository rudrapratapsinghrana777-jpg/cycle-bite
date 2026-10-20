import { calcPhase } from "@/lib/cycle";

const HISTORY_KEY = "cycle_history";
const DAY = 86400000;

export function localToday(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function validCycleDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

export function normalizeHistory(values: unknown, today = localToday()): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter(validCycleDate).filter(date => date <= today))].sort();
}

export function predictHistory(values: string[], fallback = 28, today = localToday()) {
  const history = normalizeHistory(values, today);
  const latest = history.at(-1);
  if (!latest) return null;
  const intervals = history.slice(1).map((date, index) => (Date.parse(date) - Date.parse(history[index] ?? date)) / DAY);
  const average = intervals.length ? Math.round(intervals.reduce((sum, days) => sum + days, 0) / intervals.length) : fallback;
  const next = new Date(Date.parse(`${latest}T00:00:00Z`) + average * DAY).toISOString().slice(0, 10);
  return { latest, average, next, count: history.length, overdue: next < today, variable: intervals.some(days => days < 21 || days > 40), info: calcPhase(latest, average) };
}

export function loadHistory() {
  try { return normalizeHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]")); } catch { return []; }
}

export function saveHistory(history: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}