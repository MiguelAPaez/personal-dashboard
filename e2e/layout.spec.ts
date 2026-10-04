import { expect, test } from "@playwright/test";

for (const path of ["/", "/projects/task-board-demo", "/projects/fintech-dash-demo"]) {
  test(`no horizontal scroll on ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test(`buttons and summaries are at least 44px tall on ${path}`, async ({ page }) => {
    await page.goto(path);
    const heights = await page.$$eval(".btn, summary", (els) =>
      els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => Math.round(e.getBoundingClientRect().height)),
    );
    expect(heights.length).toBeGreaterThan(0);
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
  });
}
