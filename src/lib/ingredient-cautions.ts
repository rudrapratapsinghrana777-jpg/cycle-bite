import type { PainLevel, PhaseName } from "./cycle";

export type IngredientCaution = { id: string; ingredient: string; reason: string; swap: string };
export type Suggestion = { title: string; description: string; details: string[]; adaptations?: IngredientCaution[] };

// Comfort guidance, not food prohibitions or a diagnosis. No dates or storage.
export function ingredientCautions(ingredients: string, phase: PhaseName | null, pain: PainLevel): IngredientCaution[] {
  if (!phase || (phase !== "Menstrual" && phase !== "Luteal" && pain !== "Severe")) return [];
  const rules = [
    { id: "caffeine", ingredient: "Caffeine", match: /\b(coffee|espresso|caffeine|energy drinks?)\b/i, reason: "Caffeine can disrupt sleep or increase jitteriness in sensitive people, which may make discomfort harder to manage. It is not forbidden in this phase.", swap: "Decaf coffee or a caffeine-free ginger drink" },
    { id: "salt", ingredient: "High-salt foods", match: /\b(excess salt|high[- ]sodium|salty chips|potato chips|instant noodles|processed meats?|bacon)\b/i, reason: "High sodium intake can contribute to fluid retention and bloating, especially if you already notice these symptoms around your period.", swap: "A lower-sodium version, or lightly seasoned potatoes or chickpeas" },
    { id: "fried", ingredient: "Deep-fried foods", match: /\b(deep[- ]fried|fried (chicken|food|foods|potatoes)|french fries)\b/i, reason: "Rich, fatty meals can worsen nausea or digestive discomfort for some people. A lighter preparation may be more comfortable when symptoms are strong.", swap: "Bake or steam the ingredients with a little olive oil" },
    { id: "alcohol", ingredient: "Alcohol", match: /\b(alcohol|wine|beer|vodka|rum|whisky|whiskey)\b/i, reason: "Alcohol can disrupt sleep and may worsen dehydration. Avoid it if it aggravates your symptoms or conflicts with your medicines.", swap: "Alcohol-free broth or water for cooking" },
  ];
  return rules.filter(rule => rule.match.test(ingredients)).map(({ match: _match, ...caution }) => caution);
}

export function normalizeSuggestions(value: unknown, cautions: IngredientCaution[] = []): Suggestion[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 3).filter((item): item is Record<string, unknown> => !!item && typeof item === "object").map(item => ({
    title: String(item["title"] ?? ""), description: String(item["description"] ?? ""),
    details: Array.isArray(item["details"]) ? item["details"].map(String).slice(0, 8) : [],
    adaptations: cautions.filter(caution => Array.isArray(item["adaptedIngredientIds"]) && item["adaptedIngredientIds"].includes(caution.id)),
  }));
}