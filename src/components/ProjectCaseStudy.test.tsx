import { render, screen } from "@testing-library/react";
import { ProjectCaseStudy } from "./ProjectCaseStudy";
import { projects } from "@/content";

const upwork = "https://www.upwork.com/freelancers/~abc";

describe("ProjectCaseStudy", () => {
  it("shows problem, solution, results, the demo button and an Upwork CTA, even with no media", () => {
    const project = { ...projects[0], screenshots: [], links: {} };
    render(<ProjectCaseStudy project={project} upworkUrl={upwork} />);
    expect(screen.getByRole("heading", { level: 1, name: project.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /the problem/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what i built/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /results/i })).toBeInTheDocument();
    expect(screen.getByText(project.results[0])).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try it live/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /invite me on upwork/i })).toHaveAttribute("href", upwork);
    expect(screen.getByRole("link", { name: /all projects/i })).toHaveAttribute("href", "/#work");
  });
  it("shows repo and live links only when present", () => {
    const project = { ...projects[0], links: { repo: "https://github.com/a/b" } };
    render(<ProjectCaseStudy project={project} upworkUrl={upwork} />);
    expect(screen.getByRole("link", { name: /source code/i })).toHaveAttribute("href", "https://github.com/a/b");
    expect(screen.queryByRole("link", { name: /live site/i })).toBeNull();
  });
});
