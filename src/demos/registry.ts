import type { ComponentType } from "react";
import type { DemoId } from "./ids";
import TaskBoard from "./TaskBoard";

export const demoRegistry: Record<DemoId, ComponentType> = {
  "task-board": TaskBoard,
};
