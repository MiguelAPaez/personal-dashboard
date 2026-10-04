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
