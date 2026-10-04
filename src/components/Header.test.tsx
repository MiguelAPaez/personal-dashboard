import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
  it("shows the name and an Upwork invite link that opens safely in a new tab", () => {
    render(<Header name="Ada Example" upworkUrl="https://www.upwork.com/freelancers/~abc" />);
    const cta = screen.getByRole("link", { name: /invite me on upwork/i });
    expect(cta).toHaveAttribute("href", "https://www.upwork.com/freelancers/~abc");
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByRole("link", { name: "Ada Example" })).toHaveAttribute("href", "/#top");
  });
});
