import { beforeEach, describe, expect, it } from "vitest";
import { resetCurrentPage } from "@/lib/page-reset";
import { loadCycle, loadPain, saveCycle, savePain } from "@/lib/cycle";
import { loadHistory, saveHistory } from "@/lib/cycle-history";
import { loadMoods, saveMoods } from "@/lib/mood";

describe("Start fresh", () => {
  beforeEach(() => localStorage.clear());
  it("clears the current cycle and resets pain to Mild", () => {
    saveCycle({ start: "2026-10-01", length: 30 });
    savePain("Severe");
    resetCurrentPage();
    expect(loadCycle()).toBeNull();
    expect(loadPain()).toBe("Mild");
  });
  it("preserves saved cycle and mood history and unrelated storage", () => {
    saveHistory(["2026-02-01", "2026-03-01"]);
    saveMoods([{ date: "2026-03-01", mood: "Happy", phase: "Menstrual" }]);
    localStorage.setItem("unrelated", "keep");
    resetCurrentPage();
    expect(loadHistory()).toEqual(["2026-02-01", "2026-03-01"]);
    expect(loadMoods()).toEqual([{ date: "2026-03-01", mood: "Happy", phase: "Menstrual" }]);
    expect(localStorage.getItem("unrelated")).toBe("keep");
  });
});