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
});
