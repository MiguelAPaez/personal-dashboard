import { expect, test } from "@playwright/test";

test("the header brand link returns from a case study to the home page", async ({ page }) => {
  await page.goto("/projects/task-board-demo");
  await page.getByRole("banner").getByRole("link").first().click();
  await expect(page).toHaveURL(/\/#top$/);
  await expect(page.getByRole("heading", { level: 1, name: /web apps for startups/i })).toBeVisible();
});

test("a client can use the mini-demo from the project page", async ({ page }) => {
  await page.goto("/projects/task-board-demo");
  await page.getByRole("button", { name: /try it live/i }).click();
  await page.getByLabel(/new task/i).fill("Ship it");
  await page.getByRole("button", { name: /add task/i }).click();
  await page.getByRole("button", { name: "Move Ship it right" }).click();
  await expect(page.getByRole("region", { name: "In progress" }).getByText("Ship it")).toBeVisible();
});

test("a project card on the home page opens its case study", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /task board/i }).first().click();
  await expect(page).toHaveURL(/\/projects\/task-board-demo$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("an embed that never loads falls back to an open-in-new-tab link", async ({ page }) => {
  test.setTimeout(40_000);
  await page.route("http://localhost:5173/**", () => {
    /* never respond: simulates an embed that hangs or is blocked */
  });
  await page.goto("/projects/fintech-dash-demo");
  await page.getByRole("button", { name: /try it live/i }).click();
  await expect(page.getByText(/can't be shown here/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: /open it in a new tab/i })).toHaveAttribute("href", "http://localhost:5173/");
});
