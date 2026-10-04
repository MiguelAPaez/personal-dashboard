import { render, screen } from "@testing-library/react";
import { About } from "./About";
import { profile } from "@/content";

describe("About", () => {
  it("shows the photo with alt text, the bio and the facts", () => {
    render(<About profile={profile} />);
    expect(screen.getByRole("heading", { level: 2, name: /about me/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: profile.photo.alt })).toBeInTheDocument();
    expect(screen.getByText(profile.bio[0])).toBeInTheDocument();
    expect(screen.getByText(profile.timezone)).toBeInTheDocument();
    expect(screen.getByText(profile.responseTime)).toBeInTheDocument();
  });
  it("shows the CV button only when a CV path is set", () => {
    const { rerender } = render(<About profile={{ ...profile, cvPath: undefined }} />);
    expect(screen.queryByRole("link", { name: /download cv/i })).not.toBeInTheDocument();
    rerender(<About profile={{ ...profile, cvPath: "/cv.pdf" }} />);
    expect(screen.getByRole("link", { name: /download cv/i })).toHaveAttribute("href", "/cv.pdf");
  });
});
