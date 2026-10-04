import { render, screen } from "@testing-library/react";
import { Credentials } from "./Credentials";
import type { Credential } from "@/content/schema";

const items: Credential[] = [
  { type: "job", title: "Developer", org: "Acme", start: "2022-01", end: "present", description: "Built things" },
  { type: "certification", title: "Cloud Cert", org: "Issuer", start: "2023-05", verifyUrl: "https://example.com/v" },
];

describe("Credentials", () => {
  it("shows the summary and the groups that have items", () => {
    render(<Credentials summary="A short summary of my background." credentials={items} />);
    expect(screen.getByText("A short summary of my background.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Certifications" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Education" })).not.toBeInTheDocument();
    expect(screen.getByText("2022-01 – Present")).toBeInTheDocument();
  });
  it("links to verification only when a URL exists", () => {
    render(<Credentials summary="A short summary of my background." credentials={items} />);
    const links = screen.getAllByRole("link", { name: /verify/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://example.com/v");
  });
});
