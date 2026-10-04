import { expect, test } from "@playwright/test";

const long = "x".repeat(90);

for (const path of ["/", "/projects/task-board-demo", "/projects/fintech-dash-demo"]) {
  test(`long unbroken text (titles, tags, URLs, hosts) does not overflow on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate((text) => {
      const selector = "header a:first-child, main h1, main h2, main h3, main p, main li, main dd, main figure span, main a, footer p, footer a";
      document.querySelectorAll(selector).forEach((el) => {
        if (el.children.length === 0) el.textContent = text;
      });
    }, long);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
