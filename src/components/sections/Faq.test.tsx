import { render, screen } from "@testing-library/react";
import { Faq } from "./Faq";

describe("Faq", () => {
  it("renders each question as an expandable summary with its answer", () => {
    render(<Faq items={[{ question: "How do we start?", answer: "Send an invite." }]} />);
    expect(screen.getByRole("heading", { name: /questions clients ask/i })).toBeInTheDocument();
    expect(screen.getByText("How do we start?").closest("summary")).not.toBeNull();
    expect(screen.getByText("Send an invite.")).toBeInTheDocument();
  });
});
