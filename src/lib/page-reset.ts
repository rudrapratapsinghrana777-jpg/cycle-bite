import { clearCycle, savePain } from "@/lib/cycle";

/** Reset current settings only; historical logs and unrelated storage stay intact. */
export function resetCurrentPage() {
  clearCycle();
  savePain("Mild");
}