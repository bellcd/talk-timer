import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
});

test("disables the start, pause, and reset buttons on page load", async ({
  page,
}) => {
  await expect(page.locator("#start-timer")).toBeDisabled();
  await expect(page.locator("#pause-timer")).toBeDisabled();
  await expect(page.locator("#reset-timer")).toBeDisabled();
});
