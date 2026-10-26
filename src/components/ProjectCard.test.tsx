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
  it("shows the designed cover when the project has one", () => {
    const { container } = render(<ProjectCard project={{ ...projects[0], cover: { src: "/images/projects/x.svg", alt: "" } }} />);
    expect(container.querySelector("img")?.getAttribute("src")).toContain("/images/projects/x.svg");
  });
  it("invites trying it live only when there is a demo", () => {
    const { rerender } = render(<ProjectCard project={projects[0]} />);
    expect(screen.getByText(/try it live/i)).toBeInTheDocument();
    rerender(<ProjectCard project={{ ...projects[0], demo: undefined, draft: true }} />);
    expect(screen.queryByText(/try it live/i)).toBeNull();
  });
});
