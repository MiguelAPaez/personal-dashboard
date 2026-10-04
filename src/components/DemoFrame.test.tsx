import { act, fireEvent, render, screen } from "@testing-library/react";
import { DemoFrame } from "./DemoFrame";
import { EMBED_TIMEOUT_MS } from "./demo-state";

const embed = { type: "embed", url: "https://example.com/app" } as const;

describe("DemoFrame", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not load the embed until asked, even with no poster", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("button", { name: /try it live/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open in new tab/i })).toHaveAttribute("href", embed.url);
  });

  it("loads a sandboxed, titled iframe after the click", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    const frame = document.querySelector("iframe")!;
    expect(frame).toHaveAttribute("src", embed.url);
    expect(frame).toHaveAttribute("title", "My app");
    expect(frame.getAttribute("sandbox")).toContain("allow-scripts");
    expect(frame.getAttribute("sandbox")).not.toContain("allow-top-navigation");
  });

  it("stays loaded when the frame reports load before the timeout", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    fireEvent.load(document.querySelector("iframe")!);
    act(() => { vi.advanceTimersByTime(EMBED_TIMEOUT_MS + 1000); });
    expect(document.querySelector("iframe")).not.toBeNull();
    expect(screen.queryByText(/can't be shown here/i)).toBeNull();
  });

  it("shows a fallback with an open-in-new-tab link when the frame never loads", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    act(() => { vi.advanceTimersByTime(EMBED_TIMEOUT_MS + 1); });
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.getByText(/can't be shown here/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /open .*new tab/i }).length).toBeGreaterThan(0);
  });

  it("renders a registered mini-demo after the click", () => {
    render(<DemoFrame demo={{ type: "component", id: "task-board" }} title="Board" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    expect(screen.getByRole("button", { name: /add task/i })).toBeInTheDocument();
  });

  it("shows a message instead of crashing for an unknown mini-demo id", () => {
    render(<DemoFrame demo={{ type: "component", id: "nope" }} title="Missing" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    expect(screen.getByText(/demo is not available/i)).toBeInTheDocument();
  });

  it("renders a video without needing a click", () => {
    render(<DemoFrame demo={{ type: "video", src: "/demo.mp4" }} title="Walkthrough" />);
    expect(document.querySelector("video")).toHaveAttribute("src", "/demo.mp4");
  });
});
