import { visibleProjects } from "@/lib/projects";
import { projectsSchema } from "./schema";

const allProjects = projectsSchema.parse([
  {
    slug: "fintech-dash-demo",
    title: "Fintech Dash",
    summary: "A personal finance app for tracking daily income and expenses.",
    role: "Frontend developer (solo creator)",
    stack: ["React", "Vite", "CSS"],
    problem: "Tracking daily income and expenses by hand makes it hard to tell whether you're actually saving money.",
    solution: "I designed and built Fintech Dash end-to-end — a React + Vite app for logging daily income and expenses and seeing your savings trend at a glance.",
    results: ["Built solo, front-to-back, as a personal project", "Demonstrates React state management and component architecture"],
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
    demo: { type: "embed", url: "http://localhost:5173/" },
  },
]);

export const projects = visibleProjects(allProjects, process.env.NODE_ENV);
