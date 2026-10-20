import { describe, expect, it, beforeEach } from "vitest";
import { loadHistory, normalizeHistory, predictHistory, saveHistory } from "@/lib/cycle-history";

describe("Local cycle history", () => {
  beforeEach(() => localStorage.clear());
  it("averages historical intervals and predicts the next start", () => {
    const result = predictHistory(["2026-02-01", "2026-03-01"], 28, "2026-03-05");
    expect(result?.average).toBe(28);
    expect(result?.next).toBe("2026-03-29");
  });
  it("defaults to 28 days with one entry", () => {
    expect(predictHistory(["2026-03-01"], 28, "2026-03-05")?.average).toBe(28);
  });
  it("rejects duplicates, invalid dates and future entries", () => {
    expect(normalizeHistory(["2026-02-30", "2026-03-01", "2026-03-01", "2027-01-01"], "2026-10-20")).toEqual(["2026-03-01"]);
  });
  it("starts without invented history and persists entries only locally", () => {
    expect(loadHistory()).toEqual([]);
    saveHistory(["2026-02-01", "2026-03-01"]);
    expect(loadHistory()).toEqual(["2026-02-01", "2026-03-01"]);
  });
  it("does not claim a past estimate is an upcoming period", () => {
    expect(predictHistory(["2026-03-01"], 28, "2026-10-20")?.overdue).toBe(true);
  });
  it("returns no estimate after all entries are removed", () => {
    expect(predictHistory([], 28, "2026-10-20")).toBeNull();
  });
});