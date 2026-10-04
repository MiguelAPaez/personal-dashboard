import { projectsSchema } from "./schema";

export const projects = projectsSchema.parse([
  {
    slug: "task-board-demo",
    title: "Task board demo",
    summary: "A small kanban board you can use right here in the page.",
    role: "Full-stack developer",
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
    problem: "A resume can't show how you handle interactive UI state — only working code can.",
    solution: "A fully interactive kanban board, built right into this page: drag-and-drop columns, persisted state, no sign-up needed to try it.",
    results: ["Try it live above — no account required", "Demonstrates drag-and-drop state management and clean component architecture"],
    demo: { type: "component", id: "task-board" },
  },
  {
    slug: "fintech-dash-demo",
    title: "Fintech Dash",
    summary: "A personal finance app for tracking daily income and expenses.",
    role: "Frontend developer (solo creator)",
    stack: ["React", "Vite", "CSS"],
    problem: "Tracking daily income and expenses by hand makes it hard to tell whether you're actually saving money.",
    solution: "I designed and built Fintech Dash end-to-end — a React + Vite app for logging daily income and expenses and seeing your savings trend at a glance.",
    results: ["Built solo, front-to-back, as a personal project", "Demonstrates React state management and component architecture"],
    demo: { type: "embed", url: "http://localhost:5173/" },
  },
]);
