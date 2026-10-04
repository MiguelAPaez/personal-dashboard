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
