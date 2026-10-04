import { projectSchema } from "./schema";

const project = {
  slug: "p", title: "P", summary: "s", role: "r", stack: ["x"], problem: "p", solution: "s", results: ["r"],
};

describe("mini-demo ids", () => {
  it("accepts a registered mini-demo id", () => {
    const result = projectSchema.safeParse({ ...project, demo: { type: "component", id: "task-board" } });
    expect(result.success).toBe(true);
  });
  it("rejects an id with no registered mini-demo, so a typo fails the build", () => {
    const result = projectSchema.safeParse({ ...project, demo: { type: "component", id: "task-bord" } });
    expect(result.success).toBe(false);
  });
});
