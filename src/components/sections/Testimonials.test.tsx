import { render, screen } from "@testing-library/react";
import { Testimonials } from "./Testimonials";

describe("Testimonials", () => {
  it("renders nothing, not even a heading, when empty", () => {
    const { container } = render(<Testimonials testimonials={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("shows quote and author, and links the source only when given", () => {
    render(<Testimonials testimonials={[
      { quote: "Great work.", author: "Sam", sourceUrl: "https://www.upwork.com/review/1" },
      { quote: "Fast delivery.", author: "Lee" },
    ]} />);
    expect(screen.getByRole("heading", { name: /client feedback/i })).toBeInTheDocument();
    expect(screen.getByText(/Great work\./)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /view on upwork/i })).toHaveLength(1);
  });
});
