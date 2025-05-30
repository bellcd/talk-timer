import { test, expect, Page } from "@playwright/test";

async function getDisplayedDuration(page: Page) {
  const hourDigitTens = await page.locator("#hour-digit-tens").inputValue();
  const hourDigitOnes = await page.locator("#hour-digit-ones").inputValue();
  const minuteDigitTens = await page.locator("#minute-digit-tens").inputValue();
  const minuteDigitOnes = await page.locator("#minute-digit-ones").inputValue();
  const secondDigitTens = await page.locator("#second-digit-tens").inputValue();
  const secondDigitOnes = await page.locator("#second-digit-ones").inputValue();
  const millisecondDigitHundreds = await page
    .locator("#millisecond-digit-hundreds")
    .inputValue();
  const millisecondDigitTens = await page
    .locator("#millisecond-digit-tens")
    .inputValue();
  const millisecondDigitOnes = await page
    .locator("#millisecond-digit-ones")
    .inputValue();

  return `${hourDigitTens}${hourDigitOnes}:${minuteDigitTens}${minuteDigitOnes}:${secondDigitTens}${secondDigitOnes}:${millisecondDigitHundreds}${millisecondDigitTens}${millisecondDigitOnes}`;
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2023-10-01T00:00:00.000Z") });
  await page.goto("http://localhost:5173");
});

test("disables the start, pause, and reset buttons on page load", async ({
  page,
}) => {
  await expect(page.locator("#start-timer")).toBeDisabled();
  await expect(page.locator("#pause-timer")).toBeDisabled();
  await expect(page.locator("#reset-timer")).toBeDisabled();
});

test("enables the start button when at least one digit is non-zero", async ({
  page,
}) => {
  const startButton = page.locator("#start-timer");
  await page.locator("#minute-digit-tens").fill("5");
  await expect(startButton).toBeEnabled();
  await page.locator("#minute-digit-ones").fill("9");
  await expect(startButton).toBeEnabled();
});

test("disables the start button when every digit is zero", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  await page.locator("#minute-digit-tens").fill("1");
  await page.locator("#minute-digit-ones").fill("2");
  await page.locator("#minute-digit-ones").fill("0");
  await expect(startButton).toBeEnabled();
  await page.locator("#minute-digit-tens").fill("0");
  await expect(startButton).toBeDisabled();
});

test("supports starting a timer", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  await page.locator("#second-digit-ones").fill("2");
  await startButton.click();
  await page.clock.runFor(2000);
  const displayedDuration = await getDisplayedDuration(page);
  expect(displayedDuration).toBe("00:00:00:000");
});

test("disables the start button when a timer is running", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  await page.locator("#second-digit-ones").fill("2");
  await startButton.click();
  await page.clock.pauseAt(new Date("2023-10-01T00:00:01.000Z"));
  await expect(startButton).toBeDisabled();
});

test("supports pausing a timer", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  const pauseButton = page.locator("#pause-timer");
  await page.locator("#second-digit-ones").fill("2");
  await startButton.click();
  await pauseButton.click();
  const beforeDisplayedDuration = await getDisplayedDuration(page);
  await page.clock.runFor(2000);
  const afterDisplayedDuration = await getDisplayedDuration(page);
  expect(beforeDisplayedDuration).toBe(afterDisplayedDuration);
});

test("supports restarting a paused timer", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  const pauseButton = page.locator("#pause-timer");
  await page.locator("#second-digit-ones").fill("2");
  await startButton.click();
  await pauseButton.click();
  await startButton.click();
  await page.clock.runFor(2000);
  const displayedDuration = await getDisplayedDuration(page);
  expect(displayedDuration).toBe("00:00:00:000");
});
