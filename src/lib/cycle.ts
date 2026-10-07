export type PhaseName = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export const PHASES: Record<PhaseName, { focus: string; blurb: string; emoji: string }> = {
  Menstrual: { focus: "warm, iron-rich, comforting foods", blurb: "Rest and replenish. Warm, iron-rich meals help.", emoji: "🌙" },
  Follicular: { focus: "light, fresh, probiotic-rich foods", blurb: "Energy rising. Go light, fresh and fermented.", emoji: "🌱" },
  Ovulatory: { focus: "high-energy, anti-inflammatory foods", blurb: "Peak energy. Fuel with colourful anti-inflammatory foods.", emoji: "☀️" },
  Luteal: { focus: "complex carbs, B-vitamins and magnesium-rich foods", blurb: "Wind down. Complex carbs and magnesium steady mood.", emoji: "🍂" },
};

export function calcPhase(start: string, length: number) {
  const s = new Date(start + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - s.getTime()) / 86400000);
  if (isNaN(diff) || diff < 0) return null;
  const day = (diff % length) + 1;
  // Scale ovulation window relative to cycle length (luteal ~ last 11 days)
  const ovStart = Math.max(14, length - 14);
  let phase: PhaseName = "Luteal";
  if (day <= 5) phase = "Menstrual";
  else if (day < ovStart) phase = "Follicular";
  else if (day <= ovStart + 3) phase = "Ovulatory";
  return { day, phase, length };
}

const KEY = "cyclebite:cycle";
export const loadCycle = (): { start: string; length: number } | null => {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
};
export const saveCycle = (v: { start: string; length: number }) => localStorage.setItem(KEY, JSON.stringify(v));
export const clearCycle = () => localStorage.removeItem(KEY);

export type PainLevel = "Mild" | "Moderate" | "Severe";
export const PAIN_LEVELS: { level: PainLevel; dot: string; tags: string[] }[] = [
  { level: "Mild", dot: "🟢", tags: ["Anti-Inflammatory"] },
  { level: "Moderate", dot: "🟡", tags: ["Cramp Relief", "Magnesium Boost"] },
  { level: "Severe", dot: "🔴", tags: ["Soothing & Easy-Digest", "High-Antispasmodic"] },
];
const PAIN_KEY = "cyclebite:pain";
export const loadPain = (): PainLevel => {
  try { const v = localStorage.getItem(PAIN_KEY); return v === "Moderate" || v === "Severe" ? v : "Mild"; } catch { return "Mild"; }
};
export const savePain = (v: PainLevel) => localStorage.setItem(PAIN_KEY, v);
