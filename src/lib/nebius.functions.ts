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
  .inputValidator((d) => z.object({ phase: phaseSchema, focus: z.string().max(200), ingredients: z.string().min(1).max(500) }).parse(d))
  .handler(({ data }) =>
    callNebius(
      "You are a warm, practical nutritionist creating cycle-synced recipes.",
      `Phase: ${data.phase} (focus: ${data.focus}). Ingredients on hand: ${data.ingredients}. Suggest up to 3 simple recipes. details = short ingredient + step list.`,
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
