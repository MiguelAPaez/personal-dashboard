# Upwork Portfolio Site: Design Spec

Date: 2026-09-23
Status: awaiting user review

## Purpose
A public portfolio a web/software developer sends to prospective Upwork clients so they invite or hire the developer. Success means a client can, within a couple of minutes on a phone or in a web-site, understand who the developer is, see credentials, **try real projects**, and see what services and deliverables are offered, with an obvious way to start on Upwork.

## Requirements
**Functional**
- About-me section with personal info and a photo.
- Credentials: a short intro plus jobs, studies and certifications.
- Projects the client can interact with, not only read about.
- Services, each with deliverables, timeline and a starting price.
- Clear calls to action toward the Upwork profile, email and a CV download.

**Constraints (from the user)**
- Styling is hand-written plain CSS. No Tailwind, shadcn, Bootstrap or other styling library, so it stays easy to change later.
- Mobile is a first-class target. Designed phone-first.
- Interactive projects use a mix of embedded live demos and mini-demos built into the site.
- The Upwork account is new. No invented stats. Sections needing real data (trust strip, testimonials) stay hidden until data exists.

**Assumptions (change on request)**
- Niche: web/software development. English-only copy.
- Content is edited as typed data files in the repo and redeployed (no admin or CMS).
- Hosting on Vercel, static generation.

## Architecture
Next.js (App Router) + TypeScript, statically generated. Next.js is only the page framework. Content is typed data validated with `zod` at build time. No runtime backend.

### Units and interfaces
| Unit | Purpose | Depends on |
|---|---|---|
| `src/content/*.ts` + `schema.ts` | Typed content: profile, credentials, projects, services, testimonials, stats | zod |
| `src/styles/tokens.css` | Every design decision as CSS custom properties | none |
| `src/styles/base.css` | Reset, typography, focus, reduced-motion, theme handling | tokens |
| `src/components/sections/*` | One section each (hero, trust strip, about, credentials, projects, services, process, testimonials, FAQ, CTA), each with its own CSS Module | content, tokens |
| `src/components/DemoFrame` | Renders a project's `demo` (embed / component / video) | content, tokens |
| `src/demos/registry.ts` + `src/demos/*` | Self-contained mini-demos by id | none |
| `src/app/page.tsx`, `src/app/projects/[slug]/page.tsx` | Compose sections and case-study pages | all above |

### Content model
- `profile`: name, headline, photo, bio, location, timezone, availability, links (Upwork, GitHub, email), CV path.
- `credential`: type (job | study | certification), title, org, dates, description, verifyUrl?.
- `project`: slug, title, summary, role, stack, problem, solution, results, screenshots, demo, links.
- `demo` (union): `embed { url, poster }` | `component { id }` | `video { src, poster }`.
- `service`: name, forWho, deliverables[], timeline, priceFrom, cta.
- `stats` and `testimonial`: optional. A section renders only when its data is non-empty.

## Page structure
Single scrolling page plus one page per project: hero, trust strip (optional), about, credentials, projects, services, how I work, testimonials (optional), FAQ, final CTA. Sticky header with a persistent "Invite me on Upwork" button.

## Interactive projects
`DemoFrame` shows a poster and a "Try it live" button. The iframe or mini-demo loads only after a tap, so the page stays fast and no third-party code runs unasked.
- Embed: restrictive `sandbox`, an "Open in new tab" link, and a screenshot fallback with a message if the frame fails or is blocked.
- Known constraint: sites may block framing (`X-Frame-Options` / `frame-ancestors`). The developer's own deployments must allow the portfolio origin. Projects that cannot be embedded use a mini-demo or video.
- Mini-demos are self-contained and stateless and never use real client data.
- Touch-friendly: full-width on phones, tap targets of at least 44px, no hover-only interactions.

## Styling
- All values come from `tokens.css` (colors, fonts, spacing scale, radii, shadows, breakpoints, motion). No magic numbers in component CSS.
- Mobile-first: base styles at about 360px, `min-width` media queries for larger screens. CSS Grid and Flexbox, `clamp()` for fluid type and spacing.
- `100dvh` for full-height sections, safe-area insets, `prefers-reduced-motion` respected.
- Fonts self-hosted through `next/font`.
- Visual direction (aesthetic, type pairing, palette) is decided with the `frontend-design` skill before UI code is written, then encoded in `tokens.css`.

## Conversion standards
Specific niche and outcome in the hero. Proof before claims (problem, solution, result, role, stack per project). Only real, verifiable social proof. Productized services with deliverables, timeline and "from" price. A visible CTA at all times. Lighthouse 95+ on performance, accessibility, best practices and SEO. Page titles, Open Graph images, `Person` structured data and sitemap. Privacy-friendly analytics.

## Error handling
- Content validated at build time, so invalid or missing fields fail the build.
- Blocked or failed embeds fall back to the screenshot with an "Open in new tab" link.
- Optional sections with empty data are omitted, never shown as blanks.

## Testing and verification
- Unit tests: content schema (valid and invalid cases), optional-section visibility rules, `DemoFrame` states (idle, loading, loaded, failed).
- Playwright: all sections render, project page opens, "Try it live" loads embed and mini-demo, fallback shown when an embed is blocked.
- Viewports: 360x740, 390x844, tablet, desktop. No horizontal scroll, tap targets at least 44px.
- Lighthouse thresholds above. `package.json` has no CSS framework, and all colors and spacing come from `tokens.css`.
- Manual: real phone, keyboard-only navigation, reduced-motion.

## Out of scope
Admin or CMS, contact-form backend, blog, multiple languages, user accounts.

## Content needed from the user (not blocking the build)
Photo, headline, bio, Upwork URL, jobs/studies/certifications, 2 to 4 projects (deployed URLs or screenshots, results), services with prices. Stats and testimonials once they exist.
