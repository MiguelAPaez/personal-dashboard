import { render, screen } from "@testing-library/react";
import { Process } from "./Process";
import { processSteps } from "@/content";

describe("Process", () => {
  it("lists the steps in order", () => {
    render(<Process steps={processSteps} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(processSteps.length);
    expect(items[0]).toHaveTextContent(processSteps[0].title);
  });
});
