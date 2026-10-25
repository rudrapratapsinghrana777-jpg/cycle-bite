import { describe, expect, it } from "vitest";
import { addMood, estimateMood } from "@/lib/mood";

describe("mood", () => {
  it("estimates mood from phase", () => {
    expect(estimateMood("Menstrual")?.mood).toBe("Sad");
    expect(estimateMood("Follicular")?.mood).toBe("Happy");
    expect(estimateMood("Ovulatory")?.mood).toBe("Happy");
    expect(estimateMood("Luteal")?.mood).toBe("Angry");
    expect(estimateMood(null)).toBeNull();
  });
  it("keeps one entry per day", () => {
    const a = addMood([], "Sad", "Menstrual", "2026-10-25");
    const b = addMood(a, "Happy", "Menstrual", "2026-10-25");
    expect(b).toEqual([{ date: "2026-10-25", mood: "Happy", phase: "Menstrual" }]);
  });
});
