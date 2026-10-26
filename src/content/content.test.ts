import { existsSync } from "node:fs";
import path from "node:path";
import { credentials, faq, processSteps, profile, projects, services, stats, testimonials } from "@/content";

describe("content", () => {
  it("imports and validates (a bad content file throws here)", () => {
    expect(profile.name.length).toBeGreaterThan(0);
    expect(projects.length).toBeGreaterThan(0);
    expect(services.length).toBeGreaterThan(0);
    expect(credentials.length).toBeGreaterThan(0);
    expect(faq.length).toBeGreaterThan(0);
    expect(processSteps.length).toBeGreaterThan(0);
    expect(stats).toBeDefined();
    expect(Array.isArray(testimonials)).toBe(true);
  });
  it("gives every project a cover whose file exists in public/", () => {
    for (const project of projects) {
      expect(project.cover, project.slug).toBeDefined();
      expect(existsSync(path.join(process.cwd(), "public", project.cover!.src)), project.cover!.src).toBe(true);
    }
  });
});
