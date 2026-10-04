// Single source of truth for mini-demo ids. The content schema validates against this list at build
// time, and the registry is typed so every id here must have a component (and no extras).
export const demoIds = ["task-board"] as const;
export type DemoId = (typeof demoIds)[number];
