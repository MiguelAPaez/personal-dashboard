import { visibleProjects } from "@/lib/projects";
import { projectsSchema } from "./schema";

const allProjects = projectsSchema.parse([
  {
    slug: "fintech-dash-demo",
    title: "Fintech Dash",
    summary: "A personal finance app with hand-built D3 charts that shows where your money goes, from first login to savings goals.",
    role: "Frontend developer (solo creator)",
    stack: ["React", "TypeScript", "D3.js", "React Router", "Vite", "CSS Modules"],
    problem: "Most finance apps bury your numbers in spreadsheets and settings. If tracking money feels like a chore, people stop doing it before they ever learn whether they're saving.",
    solution: "I designed and built Fintech Dash end to end. A welcome carousel, a 3-step setup wizard and a guided tour get you started. The dashboard shows KPI tiles, plain-language insights like \"you spent 12% less on food\", and balance, income-versus-expense and category charts drawn with D3. Around it: a transactions table with search, filters that live in the URL and CSV export, plus accounts with transfers, recurring bills, savings goals with progress rings, and dark and light themes.",
    results: [
      "Every chart hand-built with D3, with React owning the SVG, so there's no charting library",
      "Only four runtime dependencies and a fully custom design system in plain CSS",
      "Business logic (balances, insights, filters, CSV) is pure and unit-tested",
      "Responsive from 360px to widescreen, with reduced-motion support and keyboard-friendly dialogs",
      "Runs entirely in the browser. Click \"Try demo\" to load six months of sample data",
    ],
    cover: { src: "/personal-dashboard/images/projects/fintech-dash-demo.svg" },
    demo: { type: "embed", url: "https://miguelapaez.github.io/fintech-app/" },
  },
  {
    slug: "coffee-brand",
    title: "ALTURA coffee",
    summary: "A scroll-driven coffee brand site that flies you from the clouds over Quindío down to a 3D coffee bean.",
    role: "Frontend developer",
    stack: ["React", "TypeScript", "Three.js", "Tailwind CSS", "Vite"],
    problem: "A coffee brand's story, from the mountain farm to the bean in your cup, gets lost on a static page of photos and text.",
    solution: "I built ALTURA as a scroll experience: scrolling scrubs aerial footage down to a coffee cherry, then hands off to a real-time 3D bean you can rotate and split open. Around it sit Origin, Process, Roasts, Visit and Journal pages, plus a demo cart and checkout.",
    results: [
      "Lighthouse on mobile: 98–99 performance and 100 accessibility on every page tested (local build)",
      "First load kept to about 58 KB of JavaScript; the 3D scene and video load only after the visitor starts scrolling",
      "Works with reduced motion and without WebGL: a static bean with the same content, so nobody is left out",
    ],
    cover: { src: "/personal-dashboard/images/projects/coffee-brand.svg" },
    demo: { type: "embed", url: "https://miguelapaez.github.io/coffee-brand/" },
  },
  {
    slug: "encryption",
    title: "Keystone Bank secure API",
    summary: "A mock banking API where every request is encrypted twice, with an app that shows each security step.",
    role: "Full-stack developer",
    stack: ["Java", "Spring Boot", "React", "TypeScript", "OAuth 2.0", "JWE"],
    problem: "Banking APIs need more than HTTPS, but token scopes and encrypted payloads are invisible work: the person evaluating it can't see any of it.",
    solution: "I built a Spring Boot API for mock bank accounts, protected by OAuth 2.0 scopes, TLS 1.3 and JWE encryption of every request and response body. The React app on top lets you open, find and close accounts while a Security inspector shows the token, the sealed request, the sealed response and the decrypted JSON.",
    results: [
      "34 backend tests, including TLS 1.3 enforcement and rejection of tampered payloads and forged tokens",
      "Deny by default: any path or method not explicitly allowed is refused",
      "The Security inspector makes each step of the encryption visible, not just claimed",
    ],
    cover: { src: "/personal-dashboard/images/projects/encryption.svg" },
    demo: { type: "youtube", url: "https://youtu.be/hl08mHqEaws" },
  },
]);

export const projects = visibleProjects(allProjects, process.env.NODE_ENV);
