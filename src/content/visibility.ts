import type { Stats } from "./schema";

export function hasStats(stats: Stats): boolean {
  return Object.values(stats).some((v) => v !== undefined);
}
