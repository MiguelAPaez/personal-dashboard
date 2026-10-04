import { render, screen } from "@testing-library/react";
import { Projects } from "./Projects";
import { projects } from "@/content";

describe("Projects", () => {
  it("renders one card link per project under the Selected work heading", () => {
    render(<Projects projects={projects} />);
    expect(screen.getByRole("heading", { level: 2, name: /selected work/i })).toBeInTheDocument();
    for (const p of projects) {
      expect(screen.getByRole("link", { name: new RegExp(p.title) })).toHaveAttribute("href", `/projects/${p.slug}`);
    }
  });
});
