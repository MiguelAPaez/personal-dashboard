import { render, screen } from "@testing-library/react";
import { FinalCta } from "./FinalCta";
import { profile } from "@/content";

describe("FinalCta", () => {
  it("offers Upwork and email, and the CV only when set", () => {
    const { rerender } = render(<FinalCta profile={{ ...profile, cvPath: undefined }} />);
    expect(screen.getByRole("heading", { name: /ready to start/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /invite me on upwork/i })).toHaveAttribute("href", profile.links.upwork);
    expect(screen.getByRole("link", { name: /email me/i })).toHaveAttribute("href", `mailto:${profile.links.email}`);
    expect(screen.queryByRole("link", { name: /cv/i })).toBeNull();
    rerender(<FinalCta profile={{ ...profile, cvPath: "/cv.pdf" }} />);
    expect(screen.getByRole("link", { name: /cv/i })).toHaveAttribute("href", "/cv.pdf");
  });
});
