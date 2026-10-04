import { formatPrice, formatRange } from "./format";

describe("formatRange", () => {
  it("treats a missing or 'present' end as Present", () => {
    expect(formatRange("2021")).toBe("2021 – Present");
    expect(formatRange("2020-03", "present")).toBe("2020-03 – Present");
  });
  it("shows both ends when given", () => {
    expect(formatRange("2019-03", "2021")).toBe("2019-03 – 2021");
  });
});

describe("formatPrice", () => {
  it("formats dollars with thousands separators", () => {
    expect(formatPrice(500)).toBe("$500");
    expect(formatPrice(3000)).toBe("$3,000");
  });
});
