import { describe, expect, it } from "vitest";
import { ingredientCautions, normalizeSuggestions } from "@/lib/ingredient-cautions";

describe("ingredient cautions", () => {
  it("flags coffee for a menstrual recipe with a replacement", () => {
    expect(ingredientCautions("coffee, oats", "Menstrual", "Mild").map(c => [c.id, c.swap])).toEqual([["caffeine", "Decaf coffee or a caffeine-free ginger drink"]]);
  });
  it("checks severe pain outside the menstrual phase", () => {
    expect(ingredientCautions("french fries", "Follicular", "Severe").map(c => c.id)).toEqual(["fried"]);
  });
  it("flags high sodium during the luteal phase", () => {
    expect(ingredientCautions("instant noodles", "Luteal", "Mild").map(c => c.id)).toEqual(["salt"]);
  });
  it("does not prohibit ordinary foods, cold foods, or unrelated word fragments", () => {
    expect(ingredientCautions("iced spinach smoothie, salt, rumble squash", "Menstrual", "Severe")).toEqual([]);
  });
  it("requires a phase and leaves ordinary follicular recipes alone", () => {
    expect(ingredientCautions("coffee", null, "Severe")).toEqual([]);
    expect(ingredientCautions("coffee", "Follicular", "Mild")).toEqual([]);
  });
  it("only badges a card that reports adapting the flagged ingredient", () => {
    const cautions = ingredientCautions("coffee", "Menstrual", "Mild");
    const cards = normalizeSuggestions([{ adaptedIngredientIds: ["caffeine", "invented"] }, {}], cautions);
    expect(cards[0]?.adaptations?.map(c => c.id)).toEqual(["caffeine"]);
    expect(cards[1]?.adaptations).toEqual([]);
  });
  it("never returns more than three suggestions", () => {
    expect(normalizeSuggestions(Array.from({ length: 5 }, (_, i) => ({ title: String(i) })))).toHaveLength(3);
  });
});