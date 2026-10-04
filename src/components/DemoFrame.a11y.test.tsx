import { fireEvent, render, screen } from "@testing-library/react";
import { DemoFrame } from "./DemoFrame";

const embed = { type: "embed", url: "https://example.com/app" } as const;

describe("DemoFrame accessibility and blocked embeds", () => {
  it("moves focus into the demo area after Try it live, so keyboard users keep their place", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    expect(screen.getByRole("group", { name: "My app" })).toHaveFocus();
  });

  it("always offers a way out for embeds that load an error page, whatever the state", () => {
    render(<DemoFrame demo={embed} title="My app" />);
    fireEvent.click(screen.getByRole("button", { name: /try it live/i }));
    fireEvent.load(document.querySelector("iframe")!);
    expect(screen.getByText(/not loading\?/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open in new tab/i })).toHaveAttribute("href", embed.url);
  });
});
