import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import { projects } from "@/content";

describe("ProjectCard", () => {
  it("links to the case study and lists the stack, with no image when there is no media", () => {
    const project = projects[0];
    render(<ProjectCard project={{ ...project, screenshots: [], demo: { type: "component", id: "task-board" } }} />);
    expect(screen.getByRole("link", { name: new RegExp(project.title) })).toHaveAttribute("href", `/projects/${project.slug}`);
    expect(screen.getByText(project.stack[0])).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
