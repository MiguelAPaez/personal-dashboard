import { hasStats } from "./visibility";

describe("hasStats", () => {
  it("is false for empty stats", () => {
    expect(hasStats({})).toBe(false);
  });
  it("is true when any value is present", () => {
    expect(hasStats({ jobSuccessScore: 100 })).toBe(true);
    expect(hasStats({ badge: "Rising Talent" })).toBe(true);
  });
  it("treats zero as a real value", () => {
    expect(hasStats({ clients: 0 })).toBe(true);
  });
});
