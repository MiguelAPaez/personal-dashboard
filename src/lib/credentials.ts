import type { Credential } from "@/content/schema";

export function groupCredentials(items: Credential[]): Record<Credential["type"], Credential[]> {
  const groups: Record<Credential["type"], Credential[]> = { job: [], study: [], certification: [] };
  for (const item of items) groups[item.type].push(item);
  for (const list of Object.values(groups)) list.sort((a, b) => b.start.localeCompare(a.start));
  return groups;
}
