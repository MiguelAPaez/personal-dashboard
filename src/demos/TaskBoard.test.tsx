import { fireEvent, render, screen, within } from "@testing-library/react";
import TaskBoard from "./TaskBoard";

describe("TaskBoard", () => {
  it("adds a task and moves it across columns", () => {
    render(<TaskBoard />);
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Ship it" } });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(within(screen.getByRole("region", { name: "To do" })).getByText("Ship it")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Move Ship it right" }));
    expect(within(screen.getByRole("region", { name: "In progress" })).getByText("Ship it")).toBeInTheDocument();
  });
  it("ignores empty titles and disables moves at the edges", () => {
    render(<TaskBoard />);
    const before = screen.getAllByRole("listitem").length;
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(screen.getAllByRole("listitem")).toHaveLength(before);
    expect(screen.getByRole("button", { name: "Move Write brief left" })).toBeDisabled();
  });
});
