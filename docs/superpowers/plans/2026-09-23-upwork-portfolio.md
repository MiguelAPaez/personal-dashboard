# Upwork Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, plain-CSS portfolio site for a web/software freelancer, where prospective Upwork clients can read about the developer, see credentials, try projects live, and see services with deliverables.

**Architecture:** Next.js App Router site, statically generated. All content is typed data validated with `zod` when imported, so bad content fails the build. Sections are small components that take their data as props. Every visual value comes from CSS custom properties in `src/styles/tokens.css`. Interactive projects render through a `DemoFrame` component (embed / mini-demo component / video) that loads only after a tap.

**Tech Stack:** Next.js (App Router) + TypeScript, plain CSS + CSS Modules, zod, Vitest + Testing Library (unit), Playwright (e2e), `@vercel/analytics`, Vercel hosting.

**Spec:** `docs/superpowers/specs/2026-09-23-portfolio-design.md`

## Global Constraints
- No styling library of any kind (no Tailwind, shadcn, Bootstrap, MUI, styled-components, emotion, Sass). Plain CSS and CSS Modules (built into Next.js) only.
- Every color, font, spacing, radius, shadow and motion value comes from `src/styles/tokens.css`. No hex/rgb/hsl colors in any other `.css` file.
- Mobile-first: base styles target about 360px wide; `@media (min-width: ...)` adds larger layouts. Must work from 320px to desktop with no horizontal scroll.
- Tap targets are at least `--tap-min` (2.75rem = 44px). No hover-only interactions.
- English-only copy. Content is typed data in `src/content/`, validated by zod at import time.
- No invented statistics or testimonials. Optional sections (trust strip, testimonials) render nothing when their data is empty.
- Lighthouse 95 or higher for performance, accessibility, best practices and SEO.
- Package manager is npm. Shell examples work in Git Bash or PowerShell.
- Every commit message ends with the trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` (pass it as a second `-m`).

## Review Focus
Inputs and conditions the spec implies but the happy path does not exercise, most likely first:
1. **Missing optional media:** a project with no screenshots and no poster must still render its card, its case-study page and its demo frame. Pinned in Task 7 and Task 8.
2. **Unsafe or invalid content:** an embed URL that is `javascript:` or plain `http:`, an unsafe or duplicate slug, or a malformed date must fail the build, not ship. Pinned in Task 2.
3. **Embed that never loads or is blocked:** the visitor must see a clear fallback with an "Open in new tab" link, never an empty box. Pinned in Task 7 and Task 11.
4. **Narrow screens with long unbroken text** (long URLs, stack names) must not cause horizontal scroll at 320px. Pinned in Task 3 (CSS rule) and Task 11 (Playwright at 320px).
5. **Empty optional data:** empty stats or testimonials must remove the section entirely, with no blank heading. Pinned in Task 6 and Task 9.

---

## File Structure
```
package.json, vitest.config.ts, vitest.setup.ts, playwright.config.ts
public/images/profile-placeholder.svg
e2e/                          Playwright specs
src/
  app/ layout.tsx, page.tsx, sitemap.ts, robots.ts, opengraph-image.tsx
  app/projects/[slug]/page.tsx
  content/ schema.ts, profile.ts, credentials.ts, projects.ts, services.ts,
           stats.ts, testimonials.ts, faq.ts, process.ts, visibility.ts, index.ts
  lib/ format.ts, credentials.ts, projects.ts, seo.ts, site.ts
  styles/ tokens.css, base.css
  components/ Header, Footer, DemoFrame (+ demo-state.ts), ProjectCard, ProjectCaseStudy,
              sections/ Hero, About, TrustStrip, Credentials, Projects, Services,
                        Process, Testimonials, Faq, FinalCta
  demos/ registry.ts, TaskBoard.tsx
  guards/ no-style-libs.test.ts, css-tokens.test.ts
```
Each component has `Name.tsx`, `Name.module.css` and `Name.test.tsx` side by side.

---

### Task 1: Project scaffold and test tooling

**Files:**
- Create: everything from `create-next-app`, `vitest.config.ts`, `vitest.setup.ts`, `src/guards/no-style-libs.test.ts`
- Modify: `package.json`, `tsconfig.json`, `.gitignore`, `src/app/page.tsx`, `src/app/layout.tsx`

**Interfaces:**
- Produces: `npm run test` (Vitest, jsdom, globals, `@` alias to `src`), `npm run build`, `npm run lint`. Task 3 onward relies on the `@/` import alias.

- [ ] **Step 1: Initialise git and ignore local tooling files**

```bash
git init
printf ".claude/\nplaywright-report/\ntest-results/\n" >> .gitignore
```
(In PowerShell use `Add-Content .gitignore ".claude/","playwright-report/","test-results/"`.)

- [ ] **Step 2: Scaffold Next.js without any CSS framework**

```bash
npx create-next-app@latest . --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*" --use-npm
```
If the CLI prompts, answer: TypeScript yes, ESLint yes, Tailwind **no**, `src/` directory yes, App Router yes, import alias `@/*`. If it refuses because the folder is not empty, temporarily move `docs/` out, run it, and move `docs/` back.

- [ ] **Step 3: Strip the boilerplate**

Delete `src/app/page.module.css`, `src/app/globals.css` and any default `public/*.svg`. Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return <main>Portfolio</main>;
}
```
In `src/app/layout.tsx` remove the `import "./globals.css";` line and any font imports. Keep the rest for now (Task 4 rewrites it).

- [ ] **Step 4: Install dependencies**

```bash
npm install zod @vercel/analytics
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

- [ ] **Step 5: Configure Vitest**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```
`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```
In `tsconfig.json` add to `compilerOptions`: `"types": ["vitest/globals", "@testing-library/jest-dom"]`.
In `package.json` `scripts` add: `"test": "vitest run"`, `"test:e2e": "playwright test"`.

- [ ] **Step 6: Write the "no styling library" guard test**

`src/guards/no-style-libs.test.ts`:
```ts
import { readFileSync } from "node:fs";
import path from "node:path";

const banned = [
  "tailwindcss", "@tailwindcss", "bootstrap", "@mui", "styled-components",
  "@emotion", "@chakra-ui", "sass", "shadcn", "class-variance-authority",
];

describe("dependencies", () => {
  it("contain no styling library", () => {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const found = names.filter((n) => banned.some((b) => n === b || n.startsWith(`${b}/`)));
    expect(found).toEqual([]);
  });
});
```

- [ ] **Step 7: Run tests and build**

Run: `npm run test` → Expected: 1 test passes.
Run: `npm run build` → Expected: build succeeds.
Run: `npm run lint` → Expected: no errors.

- [ ] **Step 8: Commit (includes the spec and this plan)**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Vitest and styling-library guard" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Content schema, placeholder content and visibility rules

**Files:**
- Create: `src/content/schema.ts`, `src/content/{profile,credentials,projects,services,stats,testimonials,faq,process}.ts`, `src/content/visibility.ts`, `src/content/index.ts`, `public/images/profile-placeholder.svg`
- Test: `src/content/schema.test.ts`, `src/content/visibility.test.ts`

**Interfaces:**
- Produces from `@/content/schema`: zod schemas `profileSchema`, `credentialSchema`, `demoSchema`, `projectSchema`, `projectsSchema`, `serviceSchema`, `statsSchema`, `testimonialSchema`, `faqItemSchema`, `processStepSchema`, and inferred types `Profile`, `Credential`, `Demo`, `Project`, `Service`, `Stats`, `Testimonial`, `FaqItem`, `ProcessStep`.
- Produces from `@/content`: `profile: Profile`, `credentials: Credential[]`, `projects: Project[]`, `services: Service[]`, `stats: Stats`, `testimonials: Testimonial[]`, `faq: FaqItem[]`, `processSteps: ProcessStep[]`.
- Produces from `@/content/visibility`: `hasStats(stats: Stats): boolean`.
- `Demo` is `{ type: "embed"; url: string; title?: string; poster?: string } | { type: "component"; id: string; poster?: string } | { type: "video"; src: string; poster?: string }`.

- [ ] **Step 1: Write the failing schema tests** (covers Review Focus 2)

`src/content/schema.test.ts`:
```ts
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
```
`src/content/visibility.test.ts`:
```ts
import { hasStats } from "./visibility";

describe("hasStats", () => {
  it("is false for empty stats", () => {
    expect(hasStats({})).toBe(false);
  });
  it("is true when any value is present", () => {
    expect(hasStats({ jobSuccessScore: 100 })).toBe(true);
    expect(hasStats({ badge: "Rising Talent" })).toBe(true);
  });
  it("treats zero as a real value", () => {
    expect(hasStats({ clients: 0 })).toBe(true);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/content`
Expected: FAIL, cannot find `./schema` and `./visibility`.

- [ ] **Step 3: Write the schema**

`src/content/schema.ts`:
```ts
import { z } from "zod";

const httpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), "must be an https URL");
const sitePath = z.string().regex(/^\/[A-Za-z0-9/_\-.]+$/, "must be a site path starting with /");
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase letters, digits and single dashes only");
const yearMonth = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, "use YYYY or YYYY-MM");
const text = z.string().min(1);

export const profileSchema = z.object({
  name: text,
  headline: z.string().min(10).max(120),
  summary: z.string().min(20),
  bio: z.array(text).min(1),
  photo: z.object({
    src: sitePath,
    alt: text,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  location: text,
  timezone: text,
  availability: text,
  responseTime: text,
  links: z.object({
    upwork: httpsUrl,
    github: httpsUrl.optional(),
    email: z.string().email(),
  }),
  cvPath: sitePath.optional(),
});

export const credentialSchema = z.object({
  type: z.enum(["job", "study", "certification"]),
  title: text,
  org: text,
  start: yearMonth,
  end: z.union([yearMonth, z.literal("present")]).optional(),
  description: text.optional(),
  verifyUrl: httpsUrl.optional(),
});

export const demoSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("embed"), url: httpsUrl, title: text.optional(), poster: sitePath.optional() }),
  z.object({ type: z.literal("component"), id: text, poster: sitePath.optional() }),
  z.object({ type: z.literal("video"), src: sitePath, poster: sitePath.optional() }),
]);

export const projectSchema = z.object({
  slug,
  title: text,
  summary: text,
  role: text,
  stack: z.array(text).min(1),
  problem: text,
  solution: text,
  results: z.array(text).min(1),
  screenshots: z.array(z.object({ src: sitePath, alt: text })).default([]),
  demo: demoSchema,
  links: z.object({ live: httpsUrl.optional(), repo: httpsUrl.optional() }).default({}),
});

export const projectsSchema = z.array(projectSchema).superRefine((items, ctx) => {
  const seen = new Set<string>();
  items.forEach((p, i) => {
    if (seen.has(p.slug)) {
      ctx.addIssue({ code: "custom", message: `duplicate slug "${p.slug}"`, path: [i, "slug"] });
    }
    seen.add(p.slug);
  });
});

export const serviceSchema = z.object({
  name: text,
  forWho: text,
  deliverables: z.array(text).min(1),
  timeline: text,
  priceFrom: z.number().positive(),
});

export const statsSchema = z.object({
  jobSuccessScore: z.number().min(0).max(100).optional(),
  badge: text.optional(),
  hoursWorked: z.number().nonnegative().optional(),
  clients: z.number().int().nonnegative().optional(),
});

export const testimonialSchema = z.object({
  quote: text,
  author: text,
  project: text.optional(),
  sourceUrl: httpsUrl.optional(),
});

export const faqItemSchema = z.object({ question: text, answer: text });
export const processStepSchema = z.object({ title: text, description: text });

export type Profile = z.infer<typeof profileSchema>;
export type Credential = z.infer<typeof credentialSchema>;
export type Demo = z.infer<typeof demoSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Stats = z.infer<typeof statsSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type ProcessStep = z.infer<typeof processStepSchema>;
```
`src/content/visibility.ts`:
```ts
import type { Stats } from "./schema";

export function hasStats(stats: Stats): boolean {
  return Object.values(stats).some((v) => v !== undefined);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/content`
Expected: all PASS.

- [ ] **Step 5: Add placeholder content (each file parses itself, so bad content throws at import)**

`public/images/profile-placeholder.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="Placeholder portrait"><rect width="800" height="800" fill="#ddd5c7"/><circle cx="400" cy="320" r="130" fill="#9a9080"/><path d="M120 800c0-170 120-280 280-280s280 110 280 280z" fill="#9a9080"/></svg>
```
`src/content/profile.ts`:
```ts
import { profileSchema } from "./schema";

export const profile = profileSchema.parse({
  name: "Your Name",
  headline: "I build fast, reliable web apps for startups that need to ship.",
  summary:
    "Placeholder: two or three sentences about your experience, the clients you help and the results you deliver.",
  bio: [
    "Placeholder: tell your story in a short paragraph. Who you are and what you enjoy building.",
    "Placeholder: what clients can expect from working with you (communication, delivery, support after launch).",
  ],
  photo: { src: "/images/profile-placeholder.svg", alt: "Portrait of Your Name", width: 800, height: 800 },
  location: "Your City, Country",
  timezone: "UTC-5, overlaps US and EU business hours",
  availability: "Available for new projects",
  responseTime: "Replies within 24 hours",
  links: { upwork: "https://www.upwork.com/freelancers/~your-profile-id", email: "you@example.com" },
});
```
`src/content/credentials.ts`:
```ts
import { credentialSchema } from "./schema";
import { z } from "zod";

export const credentials = z.array(credentialSchema).parse([
  { type: "job", title: "Placeholder: Software Developer", org: "Company name", start: "2022-01", end: "present", description: "What you did and achieved." },
  { type: "study", title: "Placeholder: Degree or course", org: "University or school", start: "2017", end: "2021" },
  { type: "certification", title: "Placeholder: Certification", org: "Issuer", start: "2023-05", verifyUrl: "https://example.com/verify" },
]);
```
`src/content/projects.ts`:
```ts
import { projectsSchema } from "./schema";

export const projects = projectsSchema.parse([
  {
    slug: "task-board-demo",
    title: "Placeholder: Task board",
    summary: "A small kanban board you can use right here in the page.",
    role: "Full-stack developer",
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
    problem: "Placeholder: the client's problem in one or two sentences.",
    solution: "Placeholder: what you built and why you built it that way.",
    results: ["Placeholder: a measurable result, for example 'cut reporting time from 2 hours to 5 minutes'."],
    demo: { type: "component", id: "task-board" },
  },
  {
    slug: "embedded-app-demo",
    title: "Placeholder: Embedded live app",
    summary: "A deployed project shown inside the portfolio.",
    role: "Front-end developer",
    stack: ["React", "Node.js"],
    problem: "Placeholder: the client's problem.",
    solution: "Placeholder: your solution.",
    results: ["Placeholder: a measurable result."],
    demo: { type: "embed", url: "https://example.com/" },
    links: { live: "https://example.com/" },
  },
]);
```
`src/content/services.ts`:
```ts
import { z } from "zod";
import { serviceSchema } from "./schema";

export const services = z.array(serviceSchema).parse([
  {
    name: "Placeholder: Landing page",
    forWho: "Founders who need a fast, clear page that converts",
    deliverables: ["Responsive design", "Production-ready code", "SEO basics", "Deployment and handoff"],
    timeline: "1 week",
    priceFrom: 500,
  },
  {
    name: "Placeholder: Web app MVP",
    forWho: "Teams validating a product idea",
    deliverables: ["Scoped feature list", "Working app with auth", "Tests for core flows", "Documentation"],
    timeline: "4 to 6 weeks",
    priceFrom: 3000,
  },
]);
```
`src/content/stats.ts`:
```ts
import { statsSchema } from "./schema";

// Leave empty until the Upwork account has real numbers. The trust strip stays hidden.
export const stats = statsSchema.parse({});
```
`src/content/testimonials.ts`:
```ts
import { z } from "zod";
import { testimonialSchema } from "./schema";

// Add real Upwork reviews here once you have them. The section stays hidden while this is empty.
export const testimonials = z.array(testimonialSchema).parse([]);
```
`src/content/faq.ts`:
```ts
import { z } from "zod";
import { faqItemSchema } from "./schema";

export const faq = z.array(faqItemSchema).parse([
  { question: "How do we start?", answer: "Send me an invite on Upwork with a short description of the project. I reply within a day with questions and a plan." },
  { question: "What happens after launch?", answer: "Placeholder: describe your support window and how changes are handled." },
  { question: "Do I own the code?", answer: "Placeholder: describe ownership and handoff." },
]);
```
`src/content/process.ts`:
```ts
import { z } from "zod";
import { processStepSchema } from "./schema";

export const processSteps = z.array(processStepSchema).parse([
  { title: "Brief", description: "We agree on goals, scope and what done looks like." },
  { title: "Plan", description: "You get a short plan with milestones and a clear timeline." },
  { title: "Build", description: "I build in small steps and share working previews." },
  { title: "Review", description: "You review, I refine, and we test the important flows." },
  { title: "Handoff", description: "Deployment, documentation and support after launch." },
]);
```
`src/content/index.ts`:
```ts
export { profile } from "./profile";
export { credentials } from "./credentials";
export { projects } from "./projects";
export { services } from "./services";
export { stats } from "./stats";
export { testimonials } from "./testimonials";
export { faq } from "./faq";
export { processSteps } from "./process";
```

- [ ] **Step 6: Add a content import test**

`src/content/content.test.ts`:
```ts
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
```
Run: `npx vitest run src/content` → Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/content public/images
git commit -m "feat: add validated content schema and placeholder content" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Design direction, tokens, base CSS and CSS guard

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`
- Test: `src/guards/css-tokens.test.ts`

**Interfaces:**
- Produces: the CSS custom property names below (values may be revised by the design step, **names must not change**), and global classes `.container`, `.section`, `.eyebrow`, `.btn`, `.btn--primary`, `.btn--ghost`, `.visually-hidden`.
- Font variables `--font-fraunces` and `--font-instrument` are provided by `next/font` in Task 4.

- [ ] **Step 1: Run the frontend-design skill for visual direction**

Invoke `frontend-design:frontend-design`. Brief it with: audience (prospective Upwork clients, on phones first), niche (web/software developer), tone (credible, warm, confident, not template-like), constraint (plain CSS, tokens only). Default direction to start from: warm paper background, deep ink text, one saturated vermilion accent, a serif display face (Fraunces) with a clean sans body (Instrument Sans). The skill may change the values below and the fonts, but must keep every token name. If the fonts change, update the font imports in Task 4 and the two `--font-*` lines here.

- [ ] **Step 2: Write the CSS guard test (fails until the CSS exists)**

`src/guards/css-tokens.test.ts`:
```ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const srcDir = path.join(process.cwd(), "src");

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith(".css") ? [full] : [];
  });
}

const tokensPath = path.join(srcDir, "styles", "tokens.css");
const others = () => cssFiles(srcDir).filter((f) => f !== tokensPath);

describe("css tokens", () => {
  it("tokens.css exists and defines custom properties", () => {
    expect(readFileSync(tokensPath, "utf8")).toMatch(/--color-bg\s*:/);
  });

  it("no raw colors outside tokens.css", () => {
    const offenders = others().filter((f) =>
      /#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla)\(/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("every var(--x) used is defined in tokens.css", () => {
    const tokens = readFileSync(tokensPath, "utf8");
    const defined = new Set([...tokens.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
    const missing: string[] = [];
    for (const file of others()) {
      const css = readFileSync(file, "utf8");
      for (const m of css.matchAll(/var\((--[a-z0-9-]+)/g)) {
        if (!defined.has(m[1])) missing.push(`${path.relative(srcDir, file)}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
```
Run: `npx vitest run src/guards/css-tokens.test.ts` → Expected: FAIL (`tokens.css` missing).

- [ ] **Step 3: Write `src/styles/tokens.css`**

```css
/* All design decisions live here. Breakpoints cannot be custom properties, so component CSS
   uses these literal values: tablet 40rem, desktop 64rem. */
:root {
  color-scheme: light dark;

  /* Color */
  --color-bg: #f6f1e9;
  --color-surface: #fffdf8;
  --color-ink: #1c1a17;
  --color-ink-soft: #57524a;
  --color-line: #ddd5c7;
  --color-accent: #c23b12;
  --color-accent-strong: #9e2f0d;
  --color-accent-ink: #ffffff;
  --color-focus: #1a4fd6;

  /* Type */
  --font-display: var(--font-fraunces), Georgia, "Times New Roman", serif;
  --font-body: var(--font-instrument), system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --text-xs: 0.8125rem;
  --text-sm: 0.9375rem;
  --text-md: 1.0625rem;
  --text-lg: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
  --text-xl: clamp(1.625rem, 1.2rem + 1.6vw, 2.5rem);
  --text-3xl: clamp(2.25rem, 1.4rem + 4.5vw, 4.5rem);
  --leading-tight: 1.15;
  --leading-body: 1.6;

  /* Space */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: clamp(3rem, 8vw, 6rem);

  /* Shape */
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-pill: 999px;
  --shadow-card: 0 1px 2px color-mix(in srgb, var(--color-ink) 8%, transparent),
    0 8px 24px color-mix(in srgb, var(--color-ink) 8%, transparent);

  /* Layout */
  --content-max: 72rem;
  --gutter: clamp(1rem, 5vw, 2.5rem);
  --tap-min: 2.75rem;
  --header-h: 3.75rem;

  /* Motion */
  --dur-fast: 150ms;
  --dur-base: 250ms;
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #16140f;
    --color-surface: #1f1c16;
    --color-ink: #f3ede2;
    --color-ink-soft: #b5ada0;
    --color-line: #3a352b;
    --color-accent: #ff7a4d;
    --color-accent-strong: #ff9670;
    --color-accent-ink: #1c1a17;
    --color-focus: #8fb0ff;
  }
}
```

- [ ] **Step 4: Write `src/styles/base.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
  scroll-padding-top: calc(var(--header-h) + var(--space-4));
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-md);
  line-height: var(--leading-body);
  overflow-wrap: anywhere; /* long URLs and stack names must never cause horizontal scroll */
  -webkit-font-smoothing: antialiased;
}

img,
video,
iframe {
  display: block;
  max-width: 100%;
}

h1,
h2,
h3 {
  margin: 0 0 var(--space-4);
  font-family: var(--font-display);
  font-weight: 600;
  line-height: var(--leading-tight);
  text-wrap: balance;
}
h1 { font-size: var(--text-3xl); }
h2 { font-size: var(--text-xl); }
h3 { font-size: var(--text-lg); }

p { margin: 0 0 var(--space-4); }
ul, ol { margin: 0; padding-left: 1.25rem; }
a { color: inherit; text-underline-offset: 0.2em; }

:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

.container {
  width: min(100% - 2 * var(--gutter), var(--content-max));
  margin-inline: auto;
}

.section { padding-block: var(--space-8); }

.eyebrow {
  margin: 0 0 var(--space-3);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--tap-min);
  padding: 0 var(--space-5);
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  font: inherit;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
.btn:active { transform: translateY(1px); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--primary:hover { background: var(--color-accent-strong); }
.btn--ghost { border-color: var(--color-ink); background: transparent; color: var(--color-ink); }
.btn--ghost:hover { background: var(--color-surface); }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Run the guard test**

Run: `npx vitest run src/guards` → Expected: all PASS (the `base.css` file only uses defined tokens and has no raw colors).

- [ ] **Step 6: Commit**

```bash
git add src/styles src/guards
git commit -m "feat: add design tokens, base CSS and CSS guard tests" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: App shell (layout, header, footer)

**Files:**
- Create: `src/components/Header.tsx`, `Header.module.css`, `Header.test.tsx`, `Footer.tsx`, `Footer.module.css`, `Footer.test.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `profile` from `@/content`, `Profile` type, global classes from Task 3.
- Produces: `Header({ name, upworkUrl }: { name: string; upworkUrl: string })` and `Footer({ profile }: { profile: Profile })`. Section anchors used by the header: `#about`, `#work`, `#services`, `#contact`; `#top` is the hero.

- [ ] **Step 1: Write the failing tests**

`src/components/Header.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
  it("shows the name and an Upwork invite link that opens safely in a new tab", () => {
    render(<Header name="Ada Example" upworkUrl="https://www.upwork.com/freelancers/~abc" />);
    const cta = screen.getByRole("link", { name: /invite me on upwork/i });
    expect(cta).toHaveAttribute("href", "https://www.upwork.com/freelancers/~abc");
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByRole("link", { name: "Ada Example" })).toHaveAttribute("href", "#top");
  });
});
```
`src/components/Footer.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";
import { profile } from "@/content";

describe("Footer", () => {
  it("links to email and Upwork, and to GitHub only when set", () => {
    const { rerender } = render(<Footer profile={{ ...profile, links: { ...profile.links, github: undefined } }} />);
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute("href", `mailto:${profile.links.email}`);
    expect(screen.getByRole("link", { name: /upwork/i })).toHaveAttribute("href", profile.links.upwork);
    expect(screen.queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
    rerender(<Footer profile={{ ...profile, links: { ...profile.links, github: "https://github.com/ada" } }} />);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", "https://github.com/ada");
  });
});
```
Run: `npx vitest run src/components/Header.test.tsx src/components/Footer.test.tsx` → Expected: FAIL (modules missing).

- [ ] **Step 2: Implement Header and Footer**

`src/components/Header.tsx`:
```tsx
import styles from "./Header.module.css";

type Props = { name: string; upworkUrl: string };

export function Header({ name, upworkUrl }: Props) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.brand}>{name}</a>
        <nav aria-label="Sections" className={styles.nav}>
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className={`btn btn--primary ${styles.cta}`} href={upworkUrl} target="_blank" rel="noopener noreferrer">
          Invite me on Upwork
        </a>
      </div>
    </header>
  );
}
```
`src/components/Header.module.css` (mobile: brand + CTA only; nav appears from tablet up, so no hamburger JS is needed):
```css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding-top: env(safe-area-inset-top, 0px);
  background: color-mix(in srgb, var(--color-bg) 92%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-line);
}
.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: var(--header-h);
}
.brand {
  min-width: 0;
  overflow: hidden;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav { display: none; }
.cta { flex-shrink: 0; padding-inline: var(--space-4); font-size: var(--text-sm); }

@media (min-width: 40rem) {
  .nav { display: flex; gap: var(--space-5); margin-left: auto; margin-right: var(--space-4); }
  .nav a { text-decoration: none; }
  .nav a:hover { text-decoration: underline; }
}
```
`src/components/Footer.tsx`:
```tsx
import type { Profile } from "@/content/schema";
import styles from "./Footer.module.css";

export function Footer({ profile }: { profile: Profile }) {
  const { links } = profile;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <ul className={styles.links}>
          <li><a href={`mailto:${links.email}`}>Email</a></li>
          <li><a href={links.upwork} target="_blank" rel="noopener noreferrer">Upwork</a></li>
          {links.github && (
            <li><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
          )}
        </ul>
      </div>
    </footer>
  );
}
```
`src/components/Footer.module.css`:
```css
.footer { padding-block: var(--space-6); border-top: 1px solid var(--color-line); color: var(--color-ink-soft); font-size: var(--text-sm); }
.inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3); }
.inner p { margin: 0; }
.links { display: flex; flex-wrap: wrap; gap: var(--space-4); margin: 0; padding: 0; list-style: none; }
.links a { display: inline-flex; align-items: center; min-height: var(--tap-min); }
```

- [ ] **Step 3: Rewrite the root layout**

`src/app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/base.css";
import { profile } from "@/content";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${profile.name} | Web developer`, template: `%s | ${profile.name}` },
  description: profile.headline,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable}`}>
      <body>
        <Header name={profile.name} upworkUrl={profile.links.upwork} />
        {children}
        <Footer profile={profile} />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run tests and build**

Run: `npx vitest run` → Expected: all PASS.
Run: `npm run build` → Expected: succeeds (fonts download at build time, so the machine needs internet).

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: add app shell with sticky header CTA and footer" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Hero and About sections

**Files:**
- Create: `src/components/sections/{Hero,About}.tsx`, `{Hero,About}.module.css`, `{Hero,About}.test.tsx`

**Interfaces:**
- Consumes: `Profile` from `@/content/schema`.
- Produces: `Hero({ profile })` (section `id="top"`) and `About({ profile })` (section `id="about"`, heading "About me", shows photo, bio, facts, optional CV button).

- [ ] **Step 1: Write the failing tests**

`src/components/sections/Hero.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import { profile } from "@/content";

describe("Hero", () => {
  it("shows the headline as the page's h1 and two calls to action", () => {
    render(<Hero profile={profile} />);
    expect(screen.getByRole("heading", { level: 1, name: profile.headline })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /invite me on upwork/i })).toHaveAttribute("href", profile.links.upwork);
    expect(screen.getByRole("link", { name: /live projects/i })).toHaveAttribute("href", "#work");
    expect(screen.getByText(profile.availability)).toBeInTheDocument();
  });
});
```
`src/components/sections/About.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { About } from "./About";
import { profile } from "@/content";

describe("About", () => {
  it("shows the photo with alt text, the bio and the facts", () => {
    render(<About profile={profile} />);
    expect(screen.getByRole("heading", { level: 2, name: /about me/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: profile.photo.alt })).toBeInTheDocument();
    expect(screen.getByText(profile.bio[0])).toBeInTheDocument();
    expect(screen.getByText(profile.timezone)).toBeInTheDocument();
    expect(screen.getByText(profile.responseTime)).toBeInTheDocument();
  });
  it("shows the CV button only when a CV path is set", () => {
    const { rerender } = render(<About profile={{ ...profile, cvPath: undefined }} />);
    expect(screen.queryByRole("link", { name: /download cv/i })).not.toBeInTheDocument();
    rerender(<About profile={{ ...profile, cvPath: "/cv.pdf" }} />);
    expect(screen.getByRole("link", { name: /download cv/i })).toHaveAttribute("href", "/cv.pdf");
  });
});
```
Run: `npx vitest run src/components/sections` → Expected: FAIL (modules missing).

- [ ] **Step 2: Implement**

`src/components/sections/Hero.tsx`:
```tsx
import type { Profile } from "@/content/schema";
import styles from "./Hero.module.css";

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section id="top" className={`section ${styles.hero}`}>
      <div className="container">
        <p className="eyebrow">{profile.availability}</p>
        <h1 className={styles.title}>{profile.headline}</h1>
        <p className={styles.lede}>{profile.name} · {profile.location}</p>
        <div className={styles.actions}>
          <a className="btn btn--primary" href={profile.links.upwork} target="_blank" rel="noopener noreferrer">
            Invite me on Upwork
          </a>
          <a className="btn btn--ghost" href="#work">Try my live projects</a>
        </div>
      </div>
    </section>
  );
}
```
`src/components/sections/Hero.module.css`:
```css
.hero { padding-block: var(--space-7) var(--space-8); }
.title { max-width: 18ch; }
.lede { max-width: 40rem; color: var(--color-ink-soft); font-size: var(--text-lg); }
.actions { display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-5); }

@media (min-width: 40rem) {
  .actions { flex-direction: row; }
}
```
`src/components/sections/About.tsx`:
```tsx
import Image from "next/image";
import type { Profile } from "@/content/schema";
import styles from "./About.module.css";

export function About({ profile }: { profile: Profile }) {
  const { photo } = profile;
  return (
    <section id="about" className="section">
      <div className={`container ${styles.grid}`}>
        <Image className={styles.photo} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
        <div>
          <h2>About me</h2>
          {profile.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <dl className={styles.facts}>
            <div><dt>Based in</dt><dd>{profile.location}</dd></div>
            <div><dt>Timezone</dt><dd>{profile.timezone}</dd></div>
            <div><dt>Response time</dt><dd>{profile.responseTime}</dd></div>
          </dl>
          {profile.cvPath && (
            <a className="btn btn--ghost" href={profile.cvPath} download>Download CV</a>
          )}
        </div>
      </div>
    </section>
  );
}
```
`src/components/sections/About.module.css`:
```css
.grid { display: grid; gap: var(--space-6); }
.photo { width: min(100%, 20rem); height: auto; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-md); box-shadow: var(--shadow-card); }
.facts { display: grid; gap: var(--space-3); margin: var(--space-5) 0; }
.facts div { display: grid; gap: var(--space-1); padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-line); }
.facts dt { color: var(--color-ink-soft); font-size: var(--text-sm); }
.facts dd { margin: 0; font-weight: 600; }

@media (min-width: 40rem) {
  .grid { grid-template-columns: minmax(0, 20rem) minmax(0, 1fr); align-items: start; gap: var(--space-7); }
}
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/components/sections src/guards` → Expected: all PASS.

- [ ] **Step 4: Look at it on a phone-sized viewport**

Run `npm run dev`, open the page in Chrome DevTools device mode at 360px and 1280px. Wire the sections in temporarily if `page.tsx` still shows only "Portfolio" (Task 9 does the final composition). Check: no horizontal scroll, buttons are easy to tap, text reads well.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections
git commit -m "feat: add hero and about sections" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Trust strip and Credentials sections (with formatting helpers)

**Files:**
- Create: `src/lib/format.ts`, `src/lib/credentials.ts`, `src/components/sections/{TrustStrip,Credentials}.tsx`, matching `.module.css`
- Test: `src/lib/format.test.ts`, `src/lib/credentials.test.ts`, `src/components/sections/{TrustStrip,Credentials}.test.tsx`

**Interfaces:**
- Consumes: `Stats`, `Credential` types, `hasStats` from `@/content/visibility`.
- Produces: `formatRange(start: string, end?: string): string`, `formatPrice(amount: number): string`, `groupCredentials(items: Credential[]): Record<Credential["type"], Credential[]>` (each list newest first), `TrustStrip({ stats })` (renders `null` when no stats), `Credentials({ summary, credentials })` (section `id="credentials"`, heading "Background").

- [ ] **Step 1: Write the failing tests**

`src/lib/format.test.ts`:
```ts
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
```
`src/lib/credentials.test.ts`:
```ts
import { groupCredentials } from "./credentials";
import type { Credential } from "@/content/schema";

const c = (type: Credential["type"], title: string, start: string): Credential => ({ type, title, org: "Org", start });

describe("groupCredentials", () => {
  it("groups by type and sorts newest first, mixing YYYY and YYYY-MM", () => {
    const groups = groupCredentials([
      c("job", "old", "2018"),
      c("job", "new", "2022-06"),
      c("job", "mid", "2022-01"),
      c("study", "degree", "2015"),
    ]);
    expect(groups.job.map((j) => j.title)).toEqual(["new", "mid", "old"]);
    expect(groups.study).toHaveLength(1);
    expect(groups.certification).toEqual([]);
  });
});
```
`src/components/sections/TrustStrip.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { TrustStrip } from "./TrustStrip";

describe("TrustStrip", () => {
  it("renders nothing when there are no stats", () => {
    const { container } = render(<TrustStrip stats={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("shows only the stats that exist", () => {
    render(<TrustStrip stats={{ jobSuccessScore: 98, hoursWorked: 1200 }} />);
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.queryByText(/clients/i)).not.toBeInTheDocument();
  });
});
```
`src/components/sections/Credentials.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Credentials } from "./Credentials";
import type { Credential } from "@/content/schema";

const items: Credential[] = [
  { type: "job", title: "Developer", org: "Acme", start: "2022-01", end: "present", description: "Built things" },
  { type: "certification", title: "Cloud Cert", org: "Issuer", start: "2023-05", verifyUrl: "https://example.com/v" },
];

describe("Credentials", () => {
  it("shows the summary and the groups that have items", () => {
    render(<Credentials summary="A short summary of my background." credentials={items} />);
    expect(screen.getByText("A short summary of my background.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Certifications" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Education" })).not.toBeInTheDocument();
    expect(screen.getByText("2022-01 – Present")).toBeInTheDocument();
  });
  it("links to verification only when a URL exists", () => {
    render(<Credentials summary="A short summary of my background." credentials={items} />);
    const links = screen.getAllByRole("link", { name: /verify/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://example.com/v");
  });
});
```
Run: `npx vitest run src/lib src/components/sections` → Expected: FAIL (modules missing).

- [ ] **Step 2: Implement helpers**

`src/lib/format.ts`:
```ts
export function formatRange(start: string, end?: string): string {
  const to = end === undefined || end === "present" ? "Present" : end;
  return `${start} – ${to}`;
}

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
```
`src/lib/credentials.ts`:
```ts
import type { Credential } from "@/content/schema";

export function groupCredentials(items: Credential[]): Record<Credential["type"], Credential[]> {
  const groups: Record<Credential["type"], Credential[]> = { job: [], study: [], certification: [] };
  for (const item of items) groups[item.type].push(item);
  for (const list of Object.values(groups)) list.sort((a, b) => b.start.localeCompare(a.start));
  return groups;
}
```

- [ ] **Step 3: Implement the sections**

`src/components/sections/TrustStrip.tsx`:
```tsx
import type { Stats } from "@/content/schema";
import { hasStats } from "@/content/visibility";
import styles from "./TrustStrip.module.css";

export function TrustStrip({ stats }: { stats: Stats }) {
  if (!hasStats(stats)) return null;
  const items: { label: string; value: string }[] = [];
  if (stats.jobSuccessScore !== undefined) items.push({ label: "Job Success Score", value: `${stats.jobSuccessScore}%` });
  if (stats.badge) items.push({ label: "Upwork badge", value: stats.badge });
  if (stats.hoursWorked !== undefined) items.push({ label: "Hours worked", value: stats.hoursWorked.toLocaleString("en-US") });
  if (stats.clients !== undefined) items.push({ label: "Clients", value: String(stats.clients) });
  return (
    <section aria-label="Upwork track record" className={styles.strip}>
      <dl className={`container ${styles.list}`}>
        {items.map((item) => (
          <div key={item.label} className={styles.item}>
            <dd className={styles.value}>{item.value}</dd>
            <dt className={styles.label}>{item.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
```
`src/components/sections/TrustStrip.module.css`:
```css
.strip { border-block: 1px solid var(--color-line); background: var(--color-surface); }
.list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); margin-block: 0; padding-block: var(--space-5); }
.item { display: flex; flex-direction: column-reverse; }
.value { margin: 0; font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; }
.label { color: var(--color-ink-soft); font-size: var(--text-sm); }

@media (min-width: 40rem) {
  .list { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
```
`src/components/sections/Credentials.tsx`:
```tsx
import type { Credential } from "@/content/schema";
import { formatRange } from "@/lib/format";
import { groupCredentials } from "@/lib/credentials";
import styles from "./Credentials.module.css";

const groupTitles: Record<Credential["type"], string> = {
  job: "Experience",
  study: "Education",
  certification: "Certifications",
};

type Props = { summary: string; credentials: Credential[] };

export function Credentials({ summary, credentials }: Props) {
  const groups = groupCredentials(credentials);
  return (
    <section id="credentials" className="section">
      <div className="container">
        <h2>Background</h2>
        <p className={styles.summary}>{summary}</p>
        <div className={styles.groups}>
          {(Object.keys(groupTitles) as Credential["type"][]).map((type) =>
            groups[type].length === 0 ? null : (
              <div key={type}>
                <h3>{groupTitles[type]}</h3>
                <ul className={styles.list}>
                  {groups[type].map((item) => (
                    <li key={`${item.title}-${item.start}`} className={styles.item}>
                      <p className={styles.dates}>{formatRange(item.start, item.end)}</p>
                      <p className={styles.title}>{item.title}</p>
                      <p className={styles.org}>{item.org}</p>
                      {item.description && <p>{item.description}</p>}
                      {item.verifyUrl && (
                        <a href={item.verifyUrl} target="_blank" rel="noopener noreferrer" className={styles.verify}>
                          Verify
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
```
`src/components/sections/Credentials.module.css`:
```css
.summary { max-width: 42rem; font-size: var(--text-lg); }
.groups { display: grid; gap: var(--space-6); margin-top: var(--space-6); }
.list { display: grid; gap: var(--space-4); padding: 0; list-style: none; }
.item { padding: var(--space-4); border: 1px solid var(--color-line); border-radius: var(--radius-md); background: var(--color-surface); }
.item p { margin: 0 0 var(--space-2); }
.dates { color: var(--color-accent); font-size: var(--text-sm); font-weight: 600; }
.title { font-weight: 600; }
.org { color: var(--color-ink-soft); }
.verify { display: inline-flex; align-items: center; min-height: var(--tap-min); font-weight: 600; }

@media (min-width: 64rem) {
  .groups { grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run` → Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib src/components/sections
git commit -m "feat: add trust strip and credentials sections" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: DemoFrame, demo state machine and first mini-demo

**Files:**
- Create: `src/components/demo-state.ts`, `src/components/DemoFrame.tsx`, `DemoFrame.module.css`, `src/demos/registry.ts`, `src/demos/TaskBoard.tsx`, `TaskBoard.module.css`
- Test: `src/components/demo-state.test.ts`, `src/components/DemoFrame.test.tsx`, `src/demos/TaskBoard.test.tsx`, `src/demos/registry.test.ts`

**Interfaces:**
- Consumes: `Demo` type.
- Produces:
  - `demo-state.ts`: `type DemoState = "idle" | "loading" | "loaded" | "failed"`, `type DemoAction = { type: "start" } | { type: "loaded" } | { type: "timeout" }`, `initialDemoState: DemoState`, `demoReducer(state, action): DemoState`, `EMBED_TIMEOUT_MS = 8000`.
  - `DemoFrame({ demo, title }: { demo: Demo; title: string })`. The button is named "Try it live"; a link named "Open in new tab" is always visible for embeds.
  - `demoRegistry: Record<string, React.ComponentType>` with key `"task-board"`.

Note on detection: browsers do not tell a page when an iframe was blocked by `X-Frame-Options`. The timeout catches embeds that never finish loading; the always-visible "Open in new tab" link covers the rest.

- [ ] **Step 1: Write the failing tests** (covers Review Focus 1 and 3)

`src/components/demo-state.test.ts`:
```ts
import { demoReducer, initialDemoState } from "./demo-state";

describe("demoReducer", () => {
  it("moves idle -> loading -> loaded", () => {
    let s = demoReducer(initialDemoState, { type: "start" });
    expect(s).toBe("loading");
    s = demoReducer(s, { type: "loaded" });
    expect(s).toBe("loaded");
  });
  it("fails on timeout only while loading", () => {
    expect(demoReducer("loading", { type: "timeout" })).toBe("failed");
    expect(demoReducer("loaded", { type: "timeout" })).toBe("loaded");
    expect(demoReducer("idle", { type: "timeout" })).toBe("idle");
  });
  it("allows retrying from failed", () => {
    expect(demoReducer("failed", { type: "start" })).toBe("loading");
  });
  it("ignores loaded when not loading", () => {
    expect(demoReducer("idle", { type: "loaded" })).toBe("idle");
  });
});
```
`src/components/DemoFrame.test.tsx`:
```tsx
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DemoFrame } from "./DemoFrame";
import { EMBED_TIMEOUT_MS } from "./demo-state";

const embed = { type: "embed", url: "https://example.com/app" } as const;

describe("DemoFrame", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not load the embed until asked, even with no poster", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("button", { name: /try it live/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open in new tab/i })).toHaveAttribute("href", embed.url);
  });

  it("loads a sandboxed, titled iframe after the click", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    const frame = document.querySelector("iframe")!;
    expect(frame).toHaveAttribute("src", embed.url);
    expect(frame).toHaveAttribute("title", "My app");
    expect(frame.getAttribute("sandbox")).toContain("allow-scripts");
    expect(frame.getAttribute("sandbox")).not.toContain("allow-top-navigation");
  });

  it("stays loaded when the frame reports load before the timeout", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    fireEvent.load(document.querySelector("iframe")!);
    act(() => { vi.advanceTimersByTime(EMBED_TIMEOUT_MS + 1000); });
    expect(document.querySelector("iframe")).not.toBeNull();
    expect(screen.queryByText(/can't be shown here/i)).toBeNull();
  });

  it("shows a fallback with an open-in-new-tab link when the frame never loads", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    act(() => { vi.advanceTimersByTime(EMBED_TIMEOUT_MS + 1); });
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.getByText(/can't be shown here/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /open .*new tab/i }).length).toBeGreaterThan(0);
  });

  it("renders a registered mini-demo after the click", () => {
    render(<DemoFrame demo={{ type: "component", id: "task-board" }} title="Board" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    expect(screen.getByRole("button", { name: /add task/i })).toBeInTheDocument();
  });

  it("shows a message instead of crashing for an unknown mini-demo id", () => {
    render(<DemoFrame demo={{ type: "component", id: "nope" }} title="Missing" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    expect(screen.getByText(/demo is not available/i)).toBeInTheDocument();
  });

  it("renders a video without needing a click", () => {
    render(<DemoFrame demo={{ type: "video", src: "/demo.mp4" }} title="Walkthrough" />);
    expect(document.querySelector("video")).toHaveAttribute("src", "/demo.mp4");
  });
});
```
`src/demos/TaskBoard.test.tsx`:
```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import TaskBoard from "./TaskBoard";

describe("TaskBoard", () => {
  it("adds a task and moves it across columns", () => {
    render(<TaskBoard />);
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Ship it" } });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(within(screen.getByRole("region", { name: "To do" })).getByText("Ship it")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Move Ship it right" }));
    expect(within(screen.getByRole("region", { name: "In progress" })).getByText("Ship it")).toBeInTheDocument();
  });
  it("ignores empty titles and disables moves at the edges", () => {
    render(<TaskBoard />);
    const before = screen.getAllByRole("listitem").length;
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(screen.getAllByRole("listitem")).toHaveLength(before);
    expect(screen.getByRole("button", { name: "Move Write brief left" })).toBeDisabled();
  });
});
```
`src/demos/registry.test.ts` (keeps content and registry in sync):
```ts
import { demoRegistry } from "./registry";
import { projects } from "@/content";

describe("demoRegistry", () => {
  it("has a component for every mini-demo used by a project", () => {
    const ids = projects.flatMap((p) => (p.demo.type === "component" ? [p.demo.id] : []));
    for (const id of ids) expect(demoRegistry[id], `missing demo "${id}"`).toBeDefined();
  });
});
```
Run: `npx vitest run src/components src/demos` → Expected: FAIL (modules missing).

- [ ] **Step 2: Implement the state machine**

`src/components/demo-state.ts`:
```ts
export type DemoState = "idle" | "loading" | "loaded" | "failed";
export type DemoAction = { type: "start" } | { type: "loaded" } | { type: "timeout" };

export const initialDemoState: DemoState = "idle";
export const EMBED_TIMEOUT_MS = 8000;

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "start":
      return state === "idle" || state === "failed" ? "loading" : state;
    case "loaded":
      return state === "loading" ? "loaded" : state;
    case "timeout":
      return state === "loading" ? "failed" : state;
  }
}
```

- [ ] **Step 3: Implement the mini-demo and registry**

`src/demos/TaskBoard.tsx`:
```tsx
"use client";

import { useState } from "react";
import styles from "./TaskBoard.module.css";

type ColumnId = "todo" | "doing" | "done";
type Task = { id: number; title: string; column: ColumnId };

const columns: { id: ColumnId; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([{ id: 1, title: "Write brief", column: "todo" }]);
  const [draft, setDraft] = useState("");
  const [nextId, setNextId] = useState(2);

  function add(event: React.FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setTasks((all) => [...all, { id: nextId, title, column: "todo" }]);
    setNextId((n) => n + 1);
    setDraft("");
  }

  function move(id: number, direction: 1 | -1) {
    setTasks((all) =>
      all.map((task) => {
        if (task.id !== id) return task;
        const target = columns[columns.findIndex((c) => c.id === task.column) + direction];
        return target ? { ...task, column: target.id } : task;
      }),
    );
  }

  return (
    <div className={styles.board}>
      <form onSubmit={add} className={styles.form}>
        <label htmlFor="new-task" className="visually-hidden">New task</label>
        <input id="new-task" className={styles.input} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="New task" />
        <button type="submit" className="btn btn--primary">Add task</button>
      </form>
      <div className={styles.columns}>
        {columns.map((column, index) => (
          <section key={column.id} aria-label={column.label} className={styles.column}>
            <h3 className={styles.heading} aria-hidden="true">{column.label}</h3>
            <ul className={styles.list}>
              {tasks.filter((t) => t.column === column.id).map((task) => (
                <li key={task.id} className={styles.card}>
                  <span>{task.title}</span>
                  <span className={styles.moves}>
                    <button type="button" className={styles.move} aria-label={`Move ${task.title} left`} disabled={index === 0} onClick={() => move(task.id, -1)}>←</button>
                    <button type="button" className={styles.move} aria-label={`Move ${task.title} right`} disabled={index === columns.length - 1} onClick={() => move(task.id, 1)}>→</button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
```
Note: the "Write brief" task starts in "To do", so its "left" button is disabled (asserted in the test).

`src/demos/TaskBoard.module.css`:
```css
.board { display: grid; gap: var(--space-4); padding: var(--space-4); background: var(--color-surface); }
.form { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.input { flex: 1 1 10rem; min-height: var(--tap-min); padding: 0 var(--space-3); border: 1px solid var(--color-line); border-radius: var(--radius-sm); background: var(--color-bg); color: var(--color-ink); font: inherit; }
.columns { display: grid; gap: var(--space-3); }
.column { padding: var(--space-3); border: 1px solid var(--color-line); border-radius: var(--radius-md); }
.heading { margin: 0 0 var(--space-3); font-size: var(--text-md); }
.list { display: grid; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
.card { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); background: var(--color-bg); box-shadow: var(--shadow-card); }
.moves { display: inline-flex; gap: var(--space-1); }
.move { min-width: var(--tap-min); min-height: var(--tap-min); border: 1px solid var(--color-line); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-ink); font: inherit; cursor: pointer; }
.move:disabled { opacity: 0.35; cursor: not-allowed; }

@media (min-width: 40rem) {
  .columns { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```
`src/demos/registry.ts`:
```ts
import type { ComponentType } from "react";
import TaskBoard from "./TaskBoard";

export const demoRegistry: Record<string, ComponentType> = {
  "task-board": TaskBoard,
};
```

- [ ] **Step 4: Implement DemoFrame**

`src/components/DemoFrame.tsx`:
```tsx
"use client";

import { useEffect, useReducer } from "react";
import Image from "next/image";
import type { Demo } from "@/content/schema";
import { demoRegistry } from "@/demos/registry";
import { demoReducer, EMBED_TIMEOUT_MS, initialDemoState } from "./demo-state";
import styles from "./DemoFrame.module.css";

type Props = { demo: Demo; title: string };

const SANDBOX = "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox";

export function DemoFrame({ demo, title }: Props) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);

  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => dispatch({ type: "timeout" }), EMBED_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const openUrl = demo.type === "embed" ? demo.url : undefined;
  const address =
    demo.type === "embed" ? new URL(demo.url).host : demo.type === "video" ? "video walkthrough" : "live demo";

  function start() {
    dispatch({ type: "start" });
    if (demo.type === "component") dispatch({ type: "loaded" });
  }

  let body: React.ReactNode;
  if (demo.type === "video") {
    body = <video className={styles.media} src={demo.src} poster={demo.poster} controls playsInline preload="none" aria-label={title} />;
  } else if (state === "idle") {
    body = (
      <div className={styles.idle}>
        {demo.poster && <Image className={styles.poster} src={demo.poster} alt="" fill sizes="(min-width: 64rem) 72rem, 100vw" />}
        <button type="button" className="btn btn--primary" onClick={start}>Try it live</button>
      </div>
    );
  } else if (state === "failed") {
    body = (
      <div className={styles.idle} role="alert">
        <p className={styles.message}>This demo can&apos;t be shown here.</p>
        {openUrl && <a className="btn btn--primary" href={openUrl} target="_blank" rel="noopener noreferrer">Open it in a new tab</a>}
      </div>
    );
  } else if (demo.type === "embed") {
    body = (
      <>
        <iframe className={styles.media} src={demo.url} title={demo.title ?? title} sandbox={SANDBOX} loading="lazy" onLoad={() => dispatch({ type: "loaded" })} />
        {state === "loading" && <p className={styles.loading} role="status">Loading demo…</p>}
      </>
    );
  } else {
    const Component = demoRegistry[demo.id];
    body = Component ? <Component /> : <p className={styles.message}>This demo is not available right now.</p>;
  }

  return (
    <figure className={styles.frame}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots} />
        <span className={styles.address}>{address}</span>
      </div>
      <div className={styles.viewport}>{body}</div>
      {openUrl && (
        <figcaption className={styles.caption}>
          <a href={openUrl} target="_blank" rel="noopener noreferrer">Open in new tab</a>
        </figcaption>
      )}
    </figure>
  );
}
```
`src/components/DemoFrame.module.css`:
```css
.frame { margin: var(--space-5) 0; overflow: hidden; border: 1px solid var(--color-line); border-radius: var(--radius-md); background: var(--color-surface); box-shadow: var(--shadow-card); }
.bar { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-line); }
.dots { width: 0.5rem; height: 0.5rem; border-radius: var(--radius-pill); background: var(--color-line); box-shadow: 0.875rem 0 var(--color-line), 1.75rem 0 var(--color-line); margin-right: 1.75rem; }
.address { overflow: hidden; color: var(--color-ink-soft); font-family: var(--font-mono); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.viewport { position: relative; min-height: 20rem; }
.media { width: 100%; height: 70vh; min-height: 20rem; border: 0; }
.idle { position: relative; display: grid; place-content: center; justify-items: center; gap: var(--space-4); min-height: 20rem; padding: var(--space-5); text-align: center; }
.poster { object-fit: cover; opacity: 0.35; }
.idle > :not(.poster) { position: relative; }
.message { margin: 0; font-weight: 600; }
.loading { position: absolute; inset: auto var(--space-3) var(--space-3) auto; margin: 0; padding: var(--space-1) var(--space-3); border-radius: var(--radius-pill); background: var(--color-bg); font-size: var(--text-xs); }
.caption { padding: var(--space-1) var(--space-3); border-top: 1px solid var(--color-line); font-size: var(--text-sm); }
.caption a { display: inline-flex; align-items: center; min-height: var(--tap-min); }
```

- [ ] **Step 5: Run tests and the guard**

Run: `npx vitest run` → Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components src/demos
git commit -m "feat: add DemoFrame with load-on-tap, timeout fallback and a task-board mini-demo" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Projects section and case-study pages

**Files:**
- Create: `src/lib/projects.ts`, `src/components/ProjectCard.tsx`, `ProjectCard.module.css`, `src/components/ProjectCaseStudy.tsx`, `ProjectCaseStudy.module.css`, `src/components/sections/Projects.tsx`, `Projects.module.css`, `src/app/projects/[slug]/page.tsx`
- Test: `src/lib/projects.test.ts`, `src/components/ProjectCard.test.tsx`, `src/components/ProjectCaseStudy.test.tsx`, `src/components/sections/Projects.test.tsx`

**Interfaces:**
- Consumes: `Project` type, `DemoFrame`, `projects` from `@/content`.
- Produces: `pickCover(project: Project): { src: string; alt: string } | undefined` (first screenshot, else demo poster with empty alt, else `undefined`), `ProjectCard({ project })`, `ProjectCaseStudy({ project, upworkUrl })`, `Projects({ projects })` (section `id="work"`, heading "Selected work"). Route: `/projects/[slug]`.

- [ ] **Step 1: Write the failing tests** (Review Focus 1)

`src/lib/projects.test.ts`:
```ts
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
```
`src/components/ProjectCard.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import { projects } from "@/content";

describe("ProjectCard", () => {
  it("links to the case study and lists the stack, with no image when there is no media", () => {
    const project = projects[0];
    render(<ProjectCard project={{ ...project, screenshots: [], demo: { type: "component", id: "task-board" } }} />);
    expect(screen.getByRole("link", { name: new RegExp(project.title) })).toHaveAttribute("href", `/projects/${project.slug}`);
    expect(screen.getByText(project.stack[0])).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
```
`src/components/ProjectCaseStudy.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { ProjectCaseStudy } from "./ProjectCaseStudy";
import { projects } from "@/content";

const upwork = "https://www.upwork.com/freelancers/~abc";

describe("ProjectCaseStudy", () => {
  it("shows problem, solution, results, the demo button and an Upwork CTA, even with no media", () => {
    const project = { ...projects[0], screenshots: [], links: {} };
    render(<ProjectCaseStudy project={project} upworkUrl={upwork} />);
    expect(screen.getByRole("heading", { level: 1, name: project.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /the problem/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what i built/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /results/i })).toBeInTheDocument();
    expect(screen.getByText(project.results[0])).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try it live/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /invite me on upwork/i })).toHaveAttribute("href", upwork);
    expect(screen.getByRole("link", { name: /all projects/i })).toHaveAttribute("href", "/#work");
  });
  it("shows repo and live links only when present", () => {
    const project = { ...projects[0], links: { repo: "https://github.com/a/b" } };
    render(<ProjectCaseStudy project={project} upworkUrl={upwork} />);
    expect(screen.getByRole("link", { name: /source code/i })).toHaveAttribute("href", "https://github.com/a/b");
    expect(screen.queryByRole("link", { name: /live site/i })).toBeNull();
  });
});
```
`src/components/sections/Projects.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Projects } from "./Projects";
import { projects } from "@/content";

describe("Projects", () => {
  it("renders one card link per project under the Selected work heading", () => {
    render(<Projects projects={projects} />);
    expect(screen.getByRole("heading", { level: 2, name: /selected work/i })).toBeInTheDocument();
    for (const p of projects) {
      expect(screen.getByRole("link", { name: new RegExp(p.title) })).toHaveAttribute("href", `/projects/${p.slug}`);
    }
  });
});
```
Run: `npx vitest run src/lib src/components` → Expected: FAIL (modules missing).

- [ ] **Step 2: Implement**

`src/lib/projects.ts`:
```ts
import type { Project } from "@/content/schema";

export function pickCover(project: Project): { src: string; alt: string } | undefined {
  if (project.screenshots[0]) return project.screenshots[0];
  if (project.demo.poster) return { src: project.demo.poster, alt: "" };
  return undefined;
}
```
`src/components/ProjectCard.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/schema";
import { pickCover } from "@/lib/projects";
import styles from "./ProjectCard.module.css";

export function ProjectCard({ project }: { project: Project }) {
  const cover = pickCover(project);
  return (
    <article className={styles.card}>
      {cover && (
        <div className={styles.cover}>
          <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 64rem) 24rem, 100vw" className={styles.image} />
        </div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={`/projects/${project.slug}`} className={styles.link}>{project.title}</Link>
        </h3>
        <p>{project.summary}</p>
        <ul className={styles.stack} aria-label="Tech stack">
          {project.stack.map((tech) => <li key={tech}>{tech}</li>)}
        </ul>
        <p className={styles.hint}>Try it live →</p>
      </div>
    </article>
  );
}
```
`src/components/ProjectCard.module.css`:
```css
.card { position: relative; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--color-line); border-radius: var(--radius-md); background: var(--color-surface); box-shadow: var(--shadow-card); transition: transform var(--dur-base) var(--ease-out); }
.card:hover { transform: translateY(-2px); }
.cover { position: relative; aspect-ratio: 16 / 9; background: var(--color-line); }
.image { object-fit: cover; }
.body { display: flex; flex: 1; flex-direction: column; padding: var(--space-5); }
.title { margin-bottom: var(--space-2); }
.link { text-decoration: none; }
.link::after { content: ""; position: absolute; inset: 0; } /* whole card is the tap target */
.stack { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: 0 0 var(--space-4); padding: 0; list-style: none; }
.stack li { padding: var(--space-1) var(--space-3); border: 1px solid var(--color-line); border-radius: var(--radius-pill); font-family: var(--font-mono); font-size: var(--text-xs); }
.hint { margin: auto 0 0; color: var(--color-accent); font-weight: 600; }
```
`src/components/sections/Projects.tsx`:
```tsx
import type { Project } from "@/content/schema";
import { ProjectCard } from "../ProjectCard";
import styles from "./Projects.module.css";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="section">
      <div className="container">
        <h2>Selected work</h2>
        <p className={styles.lede}>Every project below is something you can open and use, not just read about.</p>
        <div className={styles.grid}>
          {projects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>
      </div>
    </section>
  );
}
```
`src/components/sections/Projects.module.css`:
```css
.lede { max-width: 40rem; color: var(--color-ink-soft); }
.grid { display: grid; gap: var(--space-5); margin-top: var(--space-5); }

@media (min-width: 40rem) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 64rem) {
  .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```
`src/components/ProjectCaseStudy.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/schema";
import { DemoFrame } from "./DemoFrame";
import styles from "./ProjectCaseStudy.module.css";

type Props = { project: Project; upworkUrl: string };

export function ProjectCaseStudy({ project, upworkUrl }: Props) {
  return (
    <article className="section">
      <div className={`container ${styles.wrap}`}>
        <Link href="/#work" className={styles.back}>← All projects</Link>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.role}>{project.role}</p>
        <ul className={styles.stack} aria-label="Tech stack">
          {project.stack.map((tech) => <li key={tech}>{tech}</li>)}
        </ul>

        <DemoFrame demo={project.demo} title={`${project.title} live demo`} />

        <h2>The problem</h2>
        <p>{project.problem}</p>
        <h2>What I built</h2>
        <p>{project.solution}</p>
        <h2>Results</h2>
        <ul className={styles.results}>
          {project.results.map((result) => <li key={result}>{result}</li>)}
        </ul>

        {project.screenshots.length > 0 && (
          <div className={styles.shots}>
            {project.screenshots.map((shot) => (
              <Image key={shot.src} src={shot.src} alt={shot.alt} width={1200} height={750} className={styles.shot} />
            ))}
          </div>
        )}

        <p className={styles.links}>
          {project.links.live && <a href={project.links.live} target="_blank" rel="noopener noreferrer">Live site</a>}
          {project.links.repo && <a href={project.links.repo} target="_blank" rel="noopener noreferrer">Source code</a>}
        </p>

        <a className="btn btn--primary" href={upworkUrl} target="_blank" rel="noopener noreferrer">
          Want something like this? Invite me on Upwork
        </a>
      </div>
    </article>
  );
}
```
`src/components/ProjectCaseStudy.module.css`:
```css
.wrap { max-width: 56rem; }
.back { display: inline-flex; align-items: center; min-height: var(--tap-min); margin-bottom: var(--space-3); }
.title { font-size: var(--text-xl); }
.role { color: var(--color-ink-soft); font-size: var(--text-lg); }
.stack { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: 0 0 var(--space-4); padding: 0; list-style: none; }
.stack li { padding: var(--space-1) var(--space-3); border: 1px solid var(--color-line); border-radius: var(--radius-pill); font-family: var(--font-mono); font-size: var(--text-xs); }
.results { display: grid; gap: var(--space-2); margin-bottom: var(--space-5); }
.shots { display: grid; gap: var(--space-4); margin-bottom: var(--space-5); }
.shot { width: 100%; height: auto; border: 1px solid var(--color-line); border-radius: var(--radius-md); }
.links { display: flex; flex-wrap: wrap; gap: var(--space-5); }
.links a { display: inline-flex; align-items: center; min-height: var(--tap-min); font-weight: 600; }

@media (min-width: 40rem) {
  .shots { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
```
`src/app/projects/[slug]/page.tsx` (in Next 15 and later `params` is a Promise; if the installed version is older, use `params.slug` directly):
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { profile, projects } from "@/content";
import { ProjectCaseStudy } from "@/components/ProjectCaseStudy";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <main>
      <ProjectCaseStudy project={project} upworkUrl={profile.links.upwork} />
    </main>
  );
}
```

- [ ] **Step 3: Run tests and build**

Run: `npx vitest run` → Expected: all PASS.
Run: `npm run build` → Expected: succeeds and lists `/projects/task-board-demo` and `/projects/embedded-app-demo` as static pages.

- [ ] **Step 4: Commit**

```bash
git add src
git commit -m "feat: add projects section and static case-study pages" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Services, Process, Testimonials, FAQ, Final CTA and the home page

**Files:**
- Create: `src/components/sections/{Services,Process,Testimonials,Faq,FinalCta}.tsx` with `.module.css` and `.test.tsx` each
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Service`, `ProcessStep`, `Testimonial`, `FaqItem`, `Profile` types; `formatPrice`.
- Produces: `Services({ services, upworkUrl })` (id `services`, heading "Services & deliverables"), `Process({ steps })` (id `process`, heading "How we'll work together"), `Testimonials({ testimonials })` (renders `null` when empty; heading "Client feedback"), `Faq({ items })` (heading "Questions clients ask"), `FinalCta({ profile })` (id `contact`, heading "Ready to start?").

- [ ] **Step 1: Write the failing tests** (Review Focus 5)

`src/components/sections/Services.test.tsx`:
```tsx
import { render, screen, within } from "@testing-library/react";
import { Services } from "./Services";
import { services } from "@/content";

describe("Services", () => {
  it("shows each service with deliverables, timeline, starting price and a CTA", () => {
    render(<Services services={services} upworkUrl="https://www.upwork.com/freelancers/~abc" />);
    expect(screen.getByRole("heading", { level: 2, name: /services & deliverables/i })).toBeInTheDocument();
    const first = services[0];
    const card = screen.getByRole("article", { name: first.name });
    expect(within(card).getAllByRole("listitem")).toHaveLength(first.deliverables.length);
    expect(within(card).getByText(first.timeline)).toBeInTheDocument();
    expect(within(card).getByText(/^from \$/i)).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: /discuss this on upwork/i })).toHaveAttribute("href", "https://www.upwork.com/freelancers/~abc");
  });
});
```
`src/components/sections/Process.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Process } from "./Process";
import { processSteps } from "@/content";

describe("Process", () => {
  it("lists the steps in order", () => {
    render(<Process steps={processSteps} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(processSteps.length);
    expect(items[0]).toHaveTextContent(processSteps[0].title);
  });
});
```
`src/components/sections/Testimonials.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Testimonials } from "./Testimonials";

describe("Testimonials", () => {
  it("renders nothing, not even a heading, when empty", () => {
    const { container } = render(<Testimonials testimonials={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("shows quote and author, and links the source only when given", () => {
    render(<Testimonials testimonials={[
      { quote: "Great work.", author: "Sam", sourceUrl: "https://www.upwork.com/review/1" },
      { quote: "Fast delivery.", author: "Lee" },
    ]} />);
    expect(screen.getByRole("heading", { name: /client feedback/i })).toBeInTheDocument();
    expect(screen.getByText(/Great work\./)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /view on upwork/i })).toHaveLength(1);
  });
});
```
`src/components/sections/Faq.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Faq } from "./Faq";

describe("Faq", () => {
  it("renders each question as an expandable summary with its answer", () => {
    render(<Faq items={[{ question: "How do we start?", answer: "Send an invite." }]} />);
    expect(screen.getByRole("heading", { name: /questions clients ask/i })).toBeInTheDocument();
    expect(screen.getByText("How do we start?").closest("summary")).not.toBeNull();
    expect(screen.getByText("Send an invite.")).toBeInTheDocument();
  });
});
```
`src/components/sections/FinalCta.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { FinalCta } from "./FinalCta";
import { profile } from "@/content";

describe("FinalCta", () => {
  it("offers Upwork and email, and the CV only when set", () => {
    const { rerender } = render(<FinalCta profile={{ ...profile, cvPath: undefined }} />);
    expect(screen.getByRole("heading", { name: /ready to start/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /invite me on upwork/i })).toHaveAttribute("href", profile.links.upwork);
    expect(screen.getByRole("link", { name: /email me/i })).toHaveAttribute("href", `mailto:${profile.links.email}`);
    expect(screen.queryByRole("link", { name: /cv/i })).toBeNull();
    rerender(<FinalCta profile={{ ...profile, cvPath: "/cv.pdf" }} />);
    expect(screen.getByRole("link", { name: /cv/i })).toHaveAttribute("href", "/cv.pdf");
  });
});
```
Run: `npx vitest run src/components/sections` → Expected: FAIL (modules missing).

- [ ] **Step 2: Implement**

`src/components/sections/Services.tsx`:
```tsx
import type { Service } from "@/content/schema";
import { formatPrice } from "@/lib/format";
import styles from "./Services.module.css";

type Props = { services: Service[]; upworkUrl: string };

export function Services({ services, upworkUrl }: Props) {
  return (
    <section id="services" className="section">
      <div className="container">
        <h2>Services &amp; deliverables</h2>
        <div className={styles.grid}>
          {services.map((service, i) => (
            <article key={service.name} className={styles.card} aria-labelledby={`service-${i}`}>
              <h3 id={`service-${i}`}>{service.name}</h3>
              <p className={styles.forWho}>{service.forWho}</p>
              <ul className={styles.deliverables}>
                {service.deliverables.map((d) => <li key={d}>{d}</li>)}
              </ul>
              <p className={styles.timeline}>{service.timeline}</p>
              <p className={styles.price}>From {formatPrice(service.priceFrom)}</p>
              <a className="btn btn--primary" href={upworkUrl} target="_blank" rel="noopener noreferrer">
                Discuss this on Upwork
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```
`src/components/sections/Services.module.css`:
```css
.grid { display: grid; gap: var(--space-5); margin-top: var(--space-5); }
.card { display: flex; flex-direction: column; padding: var(--space-5); border: 1px solid var(--color-line); border-radius: var(--radius-md); background: var(--color-surface); box-shadow: var(--shadow-card); }
.forWho { color: var(--color-ink-soft); }
.deliverables { display: grid; gap: var(--space-2); margin-bottom: var(--space-4); }
.timeline { margin-bottom: var(--space-2); color: var(--color-ink-soft); font-size: var(--text-sm); }
.price { margin-bottom: var(--space-4); font-family: var(--font-display); font-size: var(--text-lg); font-weight: 600; }
.card .btn { margin-top: auto; }

@media (min-width: 40rem) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
```
`src/components/sections/Process.tsx`:
```tsx
import type { ProcessStep } from "@/content/schema";
import styles from "./Process.module.css";

export function Process({ steps }: { steps: ProcessStep[] }) {
  return (
    <section id="process" className="section">
      <div className="container">
        <h2>How we&apos;ll work together</h2>
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.title} className={styles.step}>
              <h3 className={styles.title}>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```
`src/components/sections/Process.module.css`:
```css
.steps { display: grid; gap: var(--space-4); padding: 0; list-style: none; counter-reset: step; }
.step { position: relative; padding: var(--space-4) var(--space-4) var(--space-4) var(--space-7); border-left: 3px solid var(--color-accent); counter-increment: step; }
.step::before { content: counter(step); position: absolute; left: var(--space-4); top: var(--space-4); color: var(--color-accent); font-family: var(--font-display); font-size: var(--text-lg); font-weight: 600; }
.title { margin-bottom: var(--space-1); font-size: var(--text-md); }
.step p { margin: 0; color: var(--color-ink-soft); }

@media (min-width: 64rem) {
  .steps { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
```
`src/components/sections/Testimonials.tsx`:
```tsx
import type { Testimonial } from "@/content/schema";
import styles from "./Testimonials.module.css";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section id="testimonials" className="section">
      <div className="container">
        <h2>Client feedback</h2>
        <div className={styles.grid}>
          {testimonials.map((t) => (
            <figure key={`${t.author}-${t.quote}`} className={styles.card}>
              <blockquote className={styles.quote}>“{t.quote}”</blockquote>
              <figcaption>
                {t.author}{t.project ? `, ${t.project}` : ""}
                {t.sourceUrl && (
                  <>
                    {" · "}
                    <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer">View on Upwork</a>
                  </>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
```
`src/components/sections/Testimonials.module.css`:
```css
.grid { display: grid; gap: var(--space-5); }
.card { margin: 0; padding: var(--space-5); border: 1px solid var(--color-line); border-radius: var(--radius-md); background: var(--color-surface); }
.quote { margin: 0 0 var(--space-3); font-family: var(--font-display); font-size: var(--text-lg); }

@media (min-width: 40rem) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
```
`src/components/sections/Faq.tsx`:
```tsx
import type { FaqItem } from "@/content/schema";
import styles from "./Faq.module.css";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section id="faq" className="section">
      <div className={`container ${styles.wrap}`}>
        <h2>Questions clients ask</h2>
        {items.map((item) => (
          <details key={item.question} className={styles.item}>
            <summary className={styles.question}>{item.question}</summary>
            <p className={styles.answer}>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
```
`src/components/sections/Faq.module.css`:
```css
.wrap { max-width: 48rem; }
.item { border-bottom: 1px solid var(--color-line); }
.question { display: flex; align-items: center; min-height: var(--tap-min); padding-block: var(--space-2); font-weight: 600; cursor: pointer; }
.answer { padding-bottom: var(--space-3); color: var(--color-ink-soft); }
```
`src/components/sections/FinalCta.tsx`:
```tsx
import type { Profile } from "@/content/schema";
import styles from "./FinalCta.module.css";

export function FinalCta({ profile }: { profile: Profile }) {
  return (
    <section id="contact" className={`section ${styles.cta}`}>
      <div className="container">
        <h2>Ready to start?</h2>
        <p className={styles.lede}>Send me an invite with a short description of your project. I reply within a day.</p>
        <div className={styles.actions}>
          <a className="btn btn--primary" href={profile.links.upwork} target="_blank" rel="noopener noreferrer">Invite me on Upwork</a>
          <a className="btn btn--ghost" href={`mailto:${profile.links.email}`}>Email me</a>
          {profile.cvPath && <a className="btn btn--ghost" href={profile.cvPath} download>Download my CV</a>}
        </div>
      </div>
    </section>
  );
}
```
`src/components/sections/FinalCta.module.css`:
```css
.cta { border-top: 1px solid var(--color-line); background: var(--color-surface); }
.lede { max-width: 36rem; color: var(--color-ink-soft); font-size: var(--text-lg); }
.actions { display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-5); }

@media (min-width: 40rem) {
  .actions { flex-direction: row; flex-wrap: wrap; }
}
```

- [ ] **Step 3: Compose the home page**

`src/app/page.tsx`:
```tsx
import { credentials, faq, processSteps, profile, projects, services, stats, testimonials } from "@/content";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { About } from "@/components/sections/About";
import { Credentials } from "@/components/sections/Credentials";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <main>
      <Hero profile={profile} />
      <TrustStrip stats={stats} />
      <About profile={profile} />
      <Credentials summary={profile.summary} credentials={credentials} />
      <Projects projects={projects} />
      <Services services={services} upworkUrl={profile.links.upwork} />
      <Process steps={processSteps} />
      <Testimonials testimonials={testimonials} />
      <Faq items={faq} />
      <FinalCta profile={profile} />
    </main>
  );
}
```

- [ ] **Step 4: Run tests, lint and build**

Run: `npx vitest run` → Expected: all PASS.
Run: `npm run lint` and `npm run build` → Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: add services, process, testimonials, FAQ and final CTA; compose home page" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: SEO, structured data and analytics

**Files:**
- Create: `src/lib/site.ts`, `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/lib/seo.test.ts`

**Interfaces:**
- Consumes: `Profile`, `Project` types.
- Produces: `siteUrl: string` (from `NEXT_PUBLIC_SITE_URL`, default `https://example.com`), `buildPersonJsonLd(profile, siteUrl)`, `serializeJsonLd(data)` (escapes `<`), `buildSitemap(siteUrl, projects)`.

- [ ] **Step 1: Write the failing tests**

`src/lib/seo.test.ts`:
```ts
import { buildPersonJsonLd, buildSitemap, serializeJsonLd } from "./seo";
import { profile, projects } from "@/content";

describe("buildPersonJsonLd", () => {
  it("describes the person and links to their profiles", () => {
    const data = buildPersonJsonLd({ ...profile, links: { ...profile.links, github: "https://github.com/ada" } }, "https://site.test");
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe(profile.name);
    expect(data.image).toBe(`https://site.test${profile.photo.src}`);
    expect(data.sameAs).toEqual([profile.links.upwork, "https://github.com/ada"]);
  });
  it("omits GitHub when not set", () => {
    const data = buildPersonJsonLd({ ...profile, links: { ...profile.links, github: undefined } }, "https://site.test");
    expect(data.sameAs).toEqual([profile.links.upwork]);
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
```
Run: `npx vitest run src/lib/seo.test.ts` → Expected: FAIL (module missing).

- [ ] **Step 2: Implement**

`src/lib/site.ts`:
```ts
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
```
`src/lib/seo.ts`:
```ts
import type { MetadataRoute } from "next";
import type { Profile, Project } from "@/content/schema";

export function buildPersonJsonLd(profile: Profile, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.headline,
    url: siteUrl,
    image: `${siteUrl}${profile.photo.src}`,
    sameAs: [profile.links.upwork, ...(profile.links.github ? [profile.links.github] : [])],
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildSitemap(siteUrl: string, projects: Project[]): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
```
`src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { projects } from "@/content";
import { buildSitemap } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(siteUrl, projects);
}
```
`src/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` };
}
```
`src/app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { profile } from "@/content";

export const alt = `${profile.name} portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", padding: 80, background: "#f6f1e9", color: "#1c1a17" }}>
        <div style={{ fontSize: 40, color: "#c23b12" }}>{profile.name}</div>
        <div style={{ fontSize: 72, marginTop: 24, lineHeight: 1.1 }}>{profile.headline}</div>
      </div>
    ),
    size,
  );
}
```
Modify `src/app/layout.tsx`: add imports and use them.
```tsx
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "@/lib/site";
import { buildPersonJsonLd, serializeJsonLd } from "@/lib/seo";
```
In `metadata` add `metadataBase: new URL(siteUrl),` and `openGraph: { title: profile.name, description: profile.headline, type: "website" },`. Inside `<body>`, after `<Footer profile={profile} />` add:
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildPersonJsonLd(profile, siteUrl)) }} />
<Analytics />
```

- [ ] **Step 3: Run tests and build**

Run: `npx vitest run` → Expected: all PASS.
Run: `npm run build` → Expected: succeeds, output lists `/sitemap.xml`, `/robots.txt` and `/opengraph-image`.

- [ ] **Step 4: Commit**

```bash
git add src
git commit -m "feat: add SEO metadata, structured data, sitemap, OG image and analytics" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: End-to-end, mobile and quality checks

**Files:**
- Create: `playwright.config.ts`, `e2e/home.spec.ts`, `e2e/project.spec.ts`, `e2e/layout.spec.ts`

**Interfaces:**
- Consumes: the built site on port 3100. Selectors used: role names from Tasks 4 to 9, the global `.btn` class, `summary`.

- [ ] **Step 1: Install the browser and write the config**

Run: `npx playwright install chromium`

`playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 240_000,
  },
  use: { baseURL: "http://localhost:3100" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone-390", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "phone-360", use: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true } },
    { name: "phone-320", use: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true } },
  ],
});
```

- [ ] **Step 2: Write the specs**

`e2e/home.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("home page renders every section and hides empty optional ones", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const name of [/about me/i, /background/i, /selected work/i, /services & deliverables/i, /how we'll work together/i, /questions clients ask/i, /ready to start/i]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: /client feedback/i })).toHaveCount(0);
  await expect(page.getByLabel(/upwork track record/i)).toHaveCount(0);
});

test("header keeps the Upwork call to action visible after scrolling", async ({ page }) => {
  await page.goto("/");
  await page.mouse.wheel(0, 2500);
  await expect(page.getByRole("banner").getByRole("link", { name: /invite me on upwork/i })).toBeInViewport();
});

test("FAQ opens with the keyboard", async ({ page }) => {
  await page.goto("/");
  const summary = page.locator("summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(summary.locator("xpath=..")).toHaveAttribute("open", "");
});

test("sitemap, robots and the OG image are served", async ({ request }) => {
  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  const og = await request.get("/opengraph-image");
  expect(og.ok()).toBe(true);
  expect(og.headers()["content-type"]).toContain("image/png");
});
```
`e2e/project.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("a client can use the mini-demo from the project page", async ({ page }) => {
  await page.goto("/projects/task-board-demo");
  await page.getByRole("button", { name: /try it live/i }).click();
  await page.getByLabel(/new task/i).fill("Ship it");
  await page.getByRole("button", { name: /add task/i }).click();
  await page.getByRole("button", { name: "Move Ship it right" }).click();
  await expect(page.getByRole("region", { name: "In progress" }).getByText("Ship it")).toBeVisible();
});

test("a project card on the home page opens its case study", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /task board/i }).first().click();
  await expect(page).toHaveURL(/\/projects\/task-board-demo$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("an embed that never loads falls back to an open-in-new-tab link", async ({ page }) => {
  test.setTimeout(40_000);
  await page.route("https://example.com/**", () => {
    /* never respond: simulates an embed that hangs or is blocked */
  });
  await page.goto("/projects/embedded-app-demo");
  await page.getByRole("button", { name: /try it live/i }).click();
  await expect(page.getByText(/can't be shown here/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: /open it in a new tab/i })).toHaveAttribute("href", "https://example.com/");
});
```
`e2e/layout.spec.ts` (Review Focus 4, plus tap targets):
```ts
import { expect, test } from "@playwright/test";

for (const path of ["/", "/projects/task-board-demo", "/projects/embedded-app-demo"]) {
  test(`no horizontal scroll on ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test(`buttons and summaries are at least 44px tall on ${path}`, async ({ page }) => {
    await page.goto(path);
    const heights = await page.$$eval(".btn, summary", (els) =>
      els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => Math.round(e.getBoundingClientRect().height)),
    );
    expect(heights.length).toBeGreaterThan(0);
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
  });
}
```

- [ ] **Step 3: Run the e2e suite**

Run: `npm run test:e2e` → Expected: all specs pass on all four viewport projects. If a viewport fails, fix the CSS in the responsible component (the failing test names the page), re-run, and commit each fix separately.

- [ ] **Step 4: Lighthouse**

With the site running (`npm run start -- -p 3100`), run:
```bash
npx lighthouse http://localhost:3100 --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless" --output=json --output-path=./lighthouse-mobile.json
npx lighthouse http://localhost:3100 --preset=desktop --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless" --output=json --output-path=./lighthouse-desktop.json
```
Expected: every category score is at least 0.95 in both reports. Fix the reported cause if not (contrast tokens in `tokens.css`, image sizes, missing labels). Do not commit the JSON reports (add `lighthouse-*.json` to `.gitignore`).

- [ ] **Step 5: Manual checks**

Open the site on a real phone (same Wi-Fi, `http://<your-pc-ip>:3100`) and check: header CTA stays reachable, the demo works by touch, text is readable in light and dark mode, and reduced-motion (OS setting) removes animations.

- [ ] **Step 6: Commit**

```bash
printf "lighthouse-*.json\n" >> .gitignore
git add playwright.config.ts e2e .gitignore
git commit -m "test: add Playwright e2e for sections, demos, fallback, overflow and tap targets" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: Real content and launch

**Files:**
- Modify: `src/content/*.ts`, `public/images/` (real photo, screenshots, posters), `public/cv.pdf` (optional)

**Interfaces:**
- Consumes: the content the user provides (see the spec's "Content needed" list).

- [ ] **Step 1: Replace placeholders with real content**

With the user, fill in `profile.ts` (photo path, headline, bio, Upwork URL), `credentials.ts`, `projects.ts` (real deployed URLs; set `poster` and `screenshots` where available), `services.ts` (real prices), `faq.ts`. Leave `stats.ts` as `{}` and `testimonials.ts` as `[]` until the Upwork account has real numbers and reviews. Search for the word "Placeholder" and confirm none remain: `grep -rn "Placeholder" src/content` (PowerShell: `Select-String -Path src\content\*.ts -Pattern Placeholder`) → Expected: no matches.

- [ ] **Step 2: Allow framing on the user's own projects**

For each `embed` project the user controls, set response headers so the portfolio origin may frame it (`Content-Security-Policy: frame-ancestors 'self' https://<portfolio-domain>` and no `X-Frame-Options: DENY`). Projects that cannot be changed should switch to a `component` mini-demo or a `video` demo.

- [ ] **Step 3: Full verification**

Run: `npm run test`, `npm run lint`, `npm run build`, `npm run test:e2e`. Expected: all pass. (Update the e2e project slugs in `e2e/project.spec.ts` if the placeholder slugs were renamed.) Use `superpowers:verification-before-completion` before claiming this is done.

- [ ] **Step 4: Deploy**

Set `NEXT_PUBLIC_SITE_URL` to the final URL. Use the `vercel:deploy` skill (the Vercel CLI must be installed: `npm i -g vercel`) for a preview deploy, then production. Check the live URL on a phone, the Open Graph preview, and the Upwork link.

- [ ] **Step 5: Finish the branch**

Use `superpowers:finishing-a-development-branch`. Then add the portfolio URL to the Upwork profile.

---

## Self-Review (spec coverage)
- About me + photo → Task 5. Credentials summary + jobs/studies/certs → Tasks 2, 6. Projects with live interaction → Tasks 7, 8. Services with deliverables → Task 9. CTAs (sticky header, hero, service, final) → Tasks 4, 5, 9.
- Plain CSS only, tokens only → Tasks 1 (dependency guard), 3 (token and color guard). Mobile-first, 320px to desktop, tap targets → Tasks 3, 11.
- Hidden optional sections → Tasks 2 (`hasStats`), 6, 9, 11. Content validated at build → Task 2.
- Load-on-tap demos, sandbox, fallback, mini-demo registry, video → Task 7. Framing constraint → Task 12 Step 2.
- Conversion standards: hero outcome (Task 5), proof per project (Task 8), productized services (Task 9), SEO/OG/JSON-LD/sitemap/analytics (Task 10), Lighthouse (Task 11).
- Type consistency: `Profile`, `Project`, `Demo`, `Credential`, `Service`, `Stats` from `src/content/schema.ts` are used unchanged everywhere; `formatRange`/`formatPrice` defined in Task 6 and used in Tasks 6 and 9; `EMBED_TIMEOUT_MS` defined in Task 7 and used in its tests.
