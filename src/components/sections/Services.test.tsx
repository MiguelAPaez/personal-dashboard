import { render, screen, within } from "@testing-library/react";
import { Services } from "./Services";
import { services } from "@/content";

describe("Services", () => {
  it("shows each service with deliverables, timeline, starting price and a CTA", () => {
    render(<Services services={services} upworkUrl="https://www.upwork.com/freelancers/~abc" />);
    expect(screen.getByRole("heading", { level: 2, name: /services & deliverables/i })).toBeInTheDocument();
    const first = services[0];
    const card = screen.getByRole("article", { name: first.name });
    expect(within(card).getAllByRole("listitem")).toHaveLength(first.deliverables.length);
    expect(within(card).getByText(first.timeline)).toBeInTheDocument();
    expect(within(card).getByText(/^from \$/i)).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: /discuss this on upwork/i })).toHaveAttribute("href", "https://www.upwork.com/freelancers/~abc");
  });
});
