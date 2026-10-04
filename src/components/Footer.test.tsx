import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";
import { profile } from "@/content";

describe("Footer", () => {
  it("links to email and Upwork, and to GitHub only when set", () => {
    const { rerender } = render(<Footer profile={{ ...profile, links: { ...profile.links, github: undefined } }} />);
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute("href", `mailto:${profile.links.email}`);
    expect(screen.getByRole("link", { name: /upwork/i })).toHaveAttribute("href", profile.links.upwork);
    expect(screen.queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
    rerender(<Footer profile={{ ...profile, links: { ...profile.links, github: "https://github.com/ada" } }} />);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", "https://github.com/ada");
  });

  it("links to LinkedIn only when set", () => {
    const { rerender } = render(<Footer profile={{ ...profile, links: { ...profile.links, linkedin: undefined } }} />);
    expect(screen.queryByRole("link", { name: /linkedin/i })).not.toBeInTheDocument();
    rerender(<Footer profile={{ ...profile, links: { ...profile.links, linkedin: "https://www.linkedin.com/in/ada" } }} />);
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute("href", "https://www.linkedin.com/in/ada");
  });
});
