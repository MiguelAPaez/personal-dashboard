import { render, screen } from "@testing-library/react";
import { TrustStrip } from "./TrustStrip";

describe("TrustStrip", () => {
  it("renders nothing when there are no stats", () => {
    const { container } = render(<TrustStrip stats={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("shows only the stats that exist", () => {
    render(<TrustStrip stats={{ jobSuccessScore: 98, hoursWorked: 1200 }} />);
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.queryByText(/clients/i)).not.toBeInTheDocument();
  });
});
