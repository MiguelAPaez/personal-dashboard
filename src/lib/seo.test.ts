import { buildPersonJsonLd, buildSitemap, serializeJsonLd } from "./seo";
import { profile, projects } from "@/content";

describe("buildPersonJsonLd", () => {
  it("describes the person and links to their profiles", () => {
    const data = buildPersonJsonLd(
      { ...profile, links: { ...profile.links, github: "https://github.com/ada", linkedin: "https://www.linkedin.com/in/ada" } },
      "https://site.test",
    );
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe(profile.name);
    expect(data.image).toBe(`https://site.test${profile.photo.src}`);
    expect(data.sameAs).toEqual([profile.links.upwork, "https://www.linkedin.com/in/ada", "https://github.com/ada"]);
  });
  it("omits GitHub and LinkedIn when not set", () => {
    const data = buildPersonJsonLd(
      { ...profile, links: { ...profile.links, github: undefined, linkedin: undefined } },
      "https://site.test",
    );
    expect(data.sameAs).toEqual([profile.links.upwork]);
  });
  it("omits LinkedIn when not set", () => {
    const data = buildPersonJsonLd(
      { ...profile, links: { ...profile.links, github: "https://github.com/ada", linkedin: undefined } },
      "https://site.test",
    );
    expect(data.sameAs).toEqual([profile.links.upwork, "https://github.com/ada"]);
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so injected text cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("buildSitemap", () => {
  it("lists the home page and every project", () => {
    const urls = buildSitemap("https://site.test", projects).map((e) => e.url);
    expect(urls[0]).toBe("https://site.test");
    for (const p of projects) expect(urls).toContain(`https://site.test/projects/${p.slug}`);
  });
});
