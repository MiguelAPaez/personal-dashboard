import { pickCover } from "./projects";
import type { Project } from "@/content/schema";

const base: Project = {
  slug: "p", title: "P", summary: "s", role: "r", stack: ["x"], problem: "p", solution: "s",
  results: ["r"], screenshots: [], demo: { type: "component", id: "task-board" }, links: {},
};

describe("pickCover", () => {
  it("prefers the first screenshot", () => {
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
});
