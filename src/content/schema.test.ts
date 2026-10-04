import {
  credentialSchema, demoSchema, profileSchema, projectSchema, projectsSchema, serviceSchema,
} from "./schema";

const validProject = {
  slug: "task-board",
  title: "Task board",
  summary: "A small kanban board.",
  role: "Full-stack developer",
  stack: ["Next.js"],
  problem: "Teams lost track of work.",
  solution: "Built a simple board.",
  results: ["Cut status meetings by half"],
  demo: { type: "component", id: "task-board" },
};

const validProfile = {
  name: "Ada Example",
  headline: "I build fast web apps for startups.",
  summary: "Ten years building web products for small teams.",
  bio: ["Short story."],
  photo: { src: "/images/me.jpg", alt: "Ada", width: 800, height: 800 },
  location: "Lima, Peru",
  timezone: "UTC-5",
  availability: "Available now",
  responseTime: "Within 24 hours",
  links: { upwork: "https://www.upwork.com/freelancers/~abc", email: "ada@example.com" },
};

describe("projectSchema", () => {
  it("accepts a project with no screenshots and no poster", () => {
    const parsed = projectSchema.parse(validProject);
    expect(parsed.screenshots).toEqual([]);
  });
  it.each([
    ["javascript: url", "javascript:alert(1)"],
    ["plain http url", "http://example.com"],
    ["not a url", "example"],
  ])("rejects an embed with %s", (_name, url) => {
    const result = projectSchema.safeParse({ ...validProject, demo: { type: "embed", url } });
    expect(result.success).toBe(false);
  });
  it("accepts an https embed", () => {
    const result = projectSchema.safeParse({ ...validProject, demo: { type: "embed", url: "https://example.com/app" } });
    expect(result.success).toBe(true);
  });
  it.each(["Bad Slug", "UPPER", "-lead", "trail-", "a--b"])("rejects slug %s", (slug) => {
    expect(projectSchema.safeParse({ ...validProject, slug }).success).toBe(false);
  });
  it("rejects duplicate slugs in a list", () => {
    expect(projectsSchema.safeParse([validProject, validProject]).success).toBe(false);
  });
  it("rejects a project with no results", () => {
    expect(projectSchema.safeParse({ ...validProject, results: [] }).success).toBe(false);
  });
});

describe("demoSchema", () => {
  it("rejects an unknown demo type", () => {
    expect(demoSchema.safeParse({ type: "flash" }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepts a valid profile", () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });
  it("rejects a non-https Upwork link", () => {
    const bad = { ...validProfile, links: { ...validProfile.links, upwork: "http://upwork.com/x" } };
    expect(profileSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a photo path that is not a site path", () => {
    const bad = { ...validProfile, photo: { ...validProfile.photo, src: "https://evil.example/x.jpg" } };
    expect(profileSchema.safeParse(bad).success).toBe(false);
  });
});

describe("credentialSchema", () => {
  const base = { type: "job", title: "Developer", org: "Acme", start: "2021-03" };
  it("accepts 'present' as an end date", () => {
    expect(credentialSchema.safeParse({ ...base, end: "present" }).success).toBe(true);
  });
  it("rejects a malformed date", () => {
    expect(credentialSchema.safeParse({ ...base, start: "21" }).success).toBe(false);
  });
});

describe("serviceSchema", () => {
  const base = {
    name: "Landing page", forWho: "Startups", deliverables: ["Design", "Code"],
    timeline: "1 week", priceFrom: 500,
  };
  it("accepts a valid service", () => {
    expect(serviceSchema.safeParse(base).success).toBe(true);
  });
  it("rejects empty deliverables and non-positive price", () => {
    expect(serviceSchema.safeParse({ ...base, deliverables: [] }).success).toBe(false);
    expect(serviceSchema.safeParse({ ...base, priceFrom: 0 }).success).toBe(false);
  });
});
