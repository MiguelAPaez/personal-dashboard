import { z } from "zod";
import { demoIds } from "@/demos/ids";

const httpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), "must be an https URL");
// Temporary: allows http://localhost during development so an embed demo can point at
// a project's own dev server before it's deployed. Must be a real https URL before shipping.
const demoEmbedUrl = z
  .string()
  .url()
  .refine(
    (u) => u.startsWith("https://") || /^http:\/\/localhost(:\d+)?\//.test(u),
    "must be an https URL (or http://localhost for local dev previews)",
  );
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
    linkedin: httpsUrl.optional(),
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
  z.object({ type: z.literal("embed"), url: demoEmbedUrl, title: text.optional(), poster: sitePath.optional() }),
  z.object({
    type: z.literal("component"),
    id: text.refine((id) => (demoIds as readonly string[]).includes(id), `unknown mini-demo id (registered: ${demoIds.join(", ")})`),
    poster: sitePath.optional(),
  }),
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
