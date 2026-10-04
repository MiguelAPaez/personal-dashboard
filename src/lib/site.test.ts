import { resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
  it("uses the configured URL", () => {
    expect(resolveSiteUrl({ siteUrl: "https://ada.dev", vercelEnv: "production" })).toBe("https://ada.dev");
  });
  it("falls back to a placeholder outside production", () => {
    expect(resolveSiteUrl({ siteUrl: undefined, vercelEnv: undefined })).toBe("https://example.com");
    expect(resolveSiteUrl({ siteUrl: undefined, vercelEnv: "preview" })).toBe("https://example.com");
  });
  it("refuses to build production without a configured URL, so sitemap and OG never point at example.com", () => {
    expect(() => resolveSiteUrl({ siteUrl: undefined, vercelEnv: "production" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
