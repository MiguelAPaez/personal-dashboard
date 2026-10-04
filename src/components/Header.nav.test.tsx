import { render, screen, within } from "@testing-library/react";
import { Header } from "./Header";

describe("Header navigation", () => {
  it("points every section link at the home page so it works from case-study pages too", () => {
    render(<Header name="Ada Example" upworkUrl="https://www.upwork.com/freelancers/~abc" />);
    const navs = screen.getAllByRole("navigation", { name: "Sections" });
    expect(navs.length).toBeGreaterThan(0);
    for (const nav of navs) {
      const links = within(nav).getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) expect(link.getAttribute("href")).toMatch(/^\/#[a-z]+$/);
    }
  });
});
