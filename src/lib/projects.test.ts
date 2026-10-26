import { pickCover, visibleProjects } from "./projects";
import type { Project } from "@/content/schema";

const base: Project = {
  slug: "p", title: "P", summary: "s", role: "r", stack: ["x"], problem: "p", solution: "s",
  results: ["r"], screenshots: [], demo: { type: "component", id: "task-board" }, links: {}, draft: false,
};

describe("pickCover", () => {
  it("prefers the designed cover over screenshots and poster", () => {
    const p = {
      ...base,
      cover: { src: "/c.svg", alt: "" },
      screenshots: [{ src: "/a.png", alt: "A" }],
      demo: { type: "embed" as const, url: "https://e.com", poster: "/p.png" },
    };
    expect(pickCover(p)).toEqual({ src: "/c.svg", alt: "" });
  });
  it("prefers the first screenshot when there is no cover", () => {
    const p = { ...base, screenshots: [{ src: "/a.png", alt: "A" }], demo: { type: "embed" as const, url: "https://e.com", poster: "/p.png" } };
    expect(pickCover(p)).toEqual({ src: "/a.png", alt: "A" });
  });
  it("falls back to the demo poster as decorative", () => {
    const p = { ...base, demo: { type: "component" as const, id: "x", poster: "/p.png" } };
    expect(pickCover(p)).toEqual({ src: "/p.png", alt: "" });
  });
  it("returns undefined when there is no media", () => {
    expect(pickCover(base)).toBeUndefined();
  });
  it("returns undefined for a draft with no demo and no media", () => {
    expect(pickCover({ ...base, demo: undefined, draft: true })).toBeUndefined();
  });
});

describe("visibleProjects", () => {
  const list = [base, { ...base, slug: "d", draft: true }];
  it.each(["production", "test", undefined])("hides drafts when NODE_ENV is %s", (env) => {
    expect(visibleProjects(list, env).map((p) => p.slug)).toEqual(["p"]);
  });
  it("shows drafts in development so they can be previewed", () => {
    expect(visibleProjects(list, "development").map((p) => p.slug)).toEqual(["p", "d"]);
  });
});
