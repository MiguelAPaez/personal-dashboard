import { expect, test } from "@playwright/test";

test("home page renders every section and hides empty optional ones", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const name of [/about me/i, /background/i, /selected work/i, /services & deliverables/i, /how we'll work together/i, /questions clients ask/i, /ready to start/i]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: /client feedback/i })).toHaveCount(0);
  await expect(page.getByLabel(/upwork track record/i)).toHaveCount(0);
});

test("header keeps the Upwork call to action visible after scrolling", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 2500));
  await expect(page.getByRole("banner").getByRole("link", { name: /invite me on upwork/i })).toBeInViewport();
});

test("FAQ opens with the keyboard", async ({ page }) => {
  await page.goto("/");
  const summary = page.locator("#faq summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(summary.locator("xpath=..")).toHaveAttribute("open", "");
});

test("sitemap, robots and the OG image are served", async ({ request }) => {
  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  const og = await request.get("/opengraph-image");
  expect(og.ok()).toBe(true);
  expect(og.headers()["content-type"]).toContain("image/png");
});
