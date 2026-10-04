import { projectsSchema } from "./schema";

export const projects = projectsSchema.parse([
  {
    slug: "fintech-dash-demo",
    title: "Fintech Dash",
    summary: "A personal finance app for tracking daily income and expenses.",
    role: "Frontend developer (solo creator)",
    stack: ["React", "Vite", "CSS"],
    problem: "Tracking daily income and expenses by hand makes it hard to tell whether you're actually saving money.",
    solution: "I designed and built Fintech Dash end-to-end — a React + Vite app for logging daily income and expenses and seeing your savings trend at a glance.",
    results: ["Built solo, front-to-back, as a personal project", "Demonstrates React state management and component architecture"],
    demo: { type: "embed", url: "https://miguelapaez.github.io/fintech-app/" },
  },
]);
