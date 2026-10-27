import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CycleHistory } from "@/components/CycleHistory";
import { loadHistory, saveHistory } from "@/lib/cycle-history";
import { loadCycle, saveCycle } from "@/lib/cycle";

beforeEach(() => { localStorage.clear(); saveHistory(["2026-02-01", "2026-03-01"]); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("does not delete history when confirmation is cancelled", () => {
  const confirmation = vi.spyOn(window, "confirm").mockReturnValue(false);
  render(<CycleHistory onCycleChange={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Clear history" }));
  expect(confirmation).toHaveBeenCalledOnce();
  expect(loadHistory()).toEqual(["2026-02-01", "2026-03-01"]);
});

it("deletes all confirmed cycle history without changing the current cycle", () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  const onChange = vi.fn();
  saveCycle({ start: "2026-03-01", length: 28 });
  render(<CycleHistory onCycleChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Clear history" }));
  expect(loadHistory()).toEqual([]);
  expect(loadCycle()).toEqual({ start: "2026-03-01", length: 28 });
  expect(onChange).not.toHaveBeenCalled();
});