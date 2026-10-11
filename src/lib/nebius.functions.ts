import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const NEBIUS_BASE = "https://api.tokenfactory.nebius.com/v1/";
const MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct";

export type Suggestion = { title: string; description: string; details: string[] };

async function callNebius(system: string, user: string): Promise<Suggestion[]> {
  const key = process.env["NEBIUS_API_KEY"];
  if (!key) throw new Error("The AI service isn't connected yet. Add your Nebius API key to enable suggestions.");
  const res = await fetch(`${NEBIUS_BASE}chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      messages: [
        { role: "system", content: system + ' Respond ONLY with JSON: {"items":[{"title":string,"description":string,"details":string[]}]} with at most 3 items.' },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI request failed (${res.status}). Please try again shortly.`);
  const json = await res.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("The AI returned an unexpected answer. Please try again.");
  const parsed = JSON.parse(match[0]);
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  // Hard 3-suggestion cap
  return items.slice(0, 3).map((i: any) => ({
    title: String(i.title ?? ""),
    description: String(i.description ?? ""),
    details: Array.isArray(i.details) ? i.details.map(String).slice(0, 8) : [],
  }));
}

const phaseSchema = z.enum(["Menstrual", "Follicular", "Ovulatory", "Luteal"]);

// Only the phase name is sent — never cycle dates.
export const getRecipes = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ phase: phaseSchema, focus: z.string().max(200), ingredients: z.string().min(1).max(500), painLevel: z.enum(["Mild", "Moderate", "Severe"]).default("Mild") }).parse(d))
  .handler(({ data }) =>
    callNebius(
      "You are a smart clinical nutritionist creating cycle-synced recipes. Adapt to the user's pain & cramp level (painLevel): " +
        "Mild = standard phase-synced ingredients with gentle anti-inflammatory herbs (e.g. chamomile, a little ginger). " +
        "Moderate = boost natural antispasmodics and vasodilators (magnesium-rich pumpkin seeds, dark chocolate, omega-3s) and favour warm cooked meals to ease uterine contractions. " +
        "Severe = prioritise soothing, ultra-digestible, warm liquid-heavy meals (turmeric-ginger broths, golden milk teas, iron-rich pureed soups). " +
        "Ingredient judgment: if a listed ingredient is counter-productive for the current phase or pain level (e.g. cold/raw foods, caffeine, excess salt, refined sugar, fried or heavily processed items during menstrual or severe-pain phases), do NOT feature it — intelligently minimize it, substitute a phase-appropriate alternative, or omit it. " +
        "Whenever you adapt, minimize, or substitute an ingredient this way, explicitly explain the biological reason (hormonal, inflammatory, digestive, or fluid-balance mechanism) in that recipe's description.",
      `Phase: ${data.phase} (focus: ${data.focus}). painLevel: ${data.painLevel}. Ingredients on hand: ${data.ingredients}. Suggest up to 3 simple recipes. details = short ingredient + step list. description = include the biological rationale for any adapted or substituted ingredient.`,
    ),
  );

export const getSwaps = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ phase: phaseSchema, craving: z.string().max(40) }).parse(d))
  .handler(({ data }) =>
    callNebius(
      "You are a kind nutritionist offering functional, satisfying PMS craving swaps.",
      `Phase: ${data.phase}. Craving: ${data.craving}. Suggest up to 3 healthy swaps. details = why it helps (nutrients) and how to prep.`,
    ),
  );
