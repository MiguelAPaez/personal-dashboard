export function formatRange(start: string, end?: string): string {
  const to = end === undefined || end === "present" ? "Present" : end;
  return `${start} – ${to}`;
}

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
