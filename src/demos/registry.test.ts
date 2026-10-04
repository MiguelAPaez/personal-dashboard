import { demoRegistry } from "./registry";
import type { DemoId } from "./ids";
import { projects } from "@/content";

describe("demoRegistry", () => {
  it("has a component for every mini-demo used by a project", () => {
    const ids = projects.flatMap((p) => (p.demo.type === "component" ? [p.demo.id] : []));
    for (const id of ids) expect(demoRegistry[id as DemoId], `missing demo "${id}"`).toBeDefined();
  });
});
