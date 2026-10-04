import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import { profile } from "@/content";

describe("Hero", () => {
  it("shows the headline as the page's h1 and two calls to action", () => {
    render(<Hero profile={profile} />);
    expect(screen.getByRole("heading", { level: 1, name: profile.headline })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /invite me on upwork/i })).toHaveAttribute("href", profile.links.upwork);
    expect(screen.getByRole("link", { name: /live projects/i })).toHaveAttribute("href", "#work");
    expect(screen.getByText(profile.availability)).toBeInTheDocument();
  });
});
