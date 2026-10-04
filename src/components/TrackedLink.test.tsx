import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { TrackedLink } from "./TrackedLink";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

import { track } from "@vercel/analytics";

describe("TrackedLink", () => {
  it("fires a track event on click and still navigates like a normal link", async () => {
    render(
      <TrackedLink event="upwork_cta_click" data={{ location: "hero" }} href="https://example.com">
        Invite me on Upwork
      </TrackedLink>,
    );
    const link = screen.getByRole("link", { name: /invite me on upwork/i });
    expect(link).toHaveAttribute("href", "https://example.com");
    await userEvent.click(link);
    expect(track).toHaveBeenCalledWith("upwork_cta_click", { location: "hero" });
  });
});
