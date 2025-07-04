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

  return `${hourDigitTens}${hourDigitOnes}:${minuteDigitTens}${minuteDigitOnes}:${secondDigitTens}${secondDigitOnes}.${millisecondDigitHundreds}${millisecondDigitTens}${millisecondDigitOnes}`;
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

// FIXME: Flaky test.
test.skip("supports starting a timer", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  await page.locator("#second-digit-ones").fill("2");
  await startButton.click();
  await page.clock.runFor(2000);
  const displayedDuration = await getDisplayedDuration(page);
  expect(displayedDuration).toBe("00:00:00.000");
});

test("disables the start button when a timer is running", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  await page.locator("#second-digit-ones").fill("2");
  await startButton.click();
  await page.clock.pauseAt(new Date("2023-10-01T00:00:01.000Z"));
  await expect(startButton).toBeDisabled();
});

// FIXME: Flaky test.
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

// FIXME: Flaky test.
test.skip("supports restarting a paused timer", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  const pauseButton = page.locator("#pause-timer");
  await page.locator("#second-digit-ones").fill("2");
  await startButton.click();
  page.waitForTimeout(300); // Mimic human interaction time. Otherwise the click(s) below can fail. TODO: Maybe a helper asserting that each button is enabled/disabled would be better?
  await pauseButton.click();
  await startButton.click();
  await page.clock.runFor(2000);
  const displayedDuration = await getDisplayedDuration(page);
  expect(displayedDuration).toBe("00:00:00.000");
});

test("supports changing digits", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  await page.locator("#second-digit-ones").fill("5");
  await page.locator("#second-digit-ones").fill("6");
  await startButton.click();
  await page.clock.runFor(100);
  const displayedDuration = await getDisplayedDuration(page);
  // Allow for millisecond imprecision in JS timers.
  // The seconds digit has to be 5, not e.g. 4 or 1 from 5+6=11
  const regex = /^00:00:05.\d{3}$/;
  expect(displayedDuration).toMatch(regex);
});

test("disables the start, pause, and reset buttons when the timer ends", async ({
  page,
}) => {
  await page.locator("#second-digit-ones").fill("2");
  const startButton = page.locator("#start-timer");
  const pauseButton = page.locator("#pause-timer");
  const resetButton = page.locator("#reset-timer");

  await startButton.click();
  await page.clock.runFor(2000);

  await expect(startButton).toBeDisabled();
  await expect(pauseButton).toBeDisabled();
  await expect(resetButton).toBeDisabled();
});

test("supports tabbing and shift-tabbing through the digit inputs", async ({
  page,
}) => {
  const digitSelectors = [
    "#hour-digit-tens",
    "#hour-digit-ones",
    "#minute-digit-tens",
    "#minute-digit-ones",
    "#second-digit-tens",
    "#second-digit-ones",
    "#millisecond-digit-hundreds",
    "#millisecond-digit-tens",
    "#millisecond-digit-ones",
  ];

  await page.locator(digitSelectors[0]).focus();
  for (let i = 1; i < digitSelectors.length; i++) {
    await page.keyboard.press("Tab");
    await expect(page.locator(digitSelectors[i])).toBeFocused();
  }

  for (let i = digitSelectors.length - 2; i >= 0; i--) {
    await page.keyboard.down("Shift");
    await page.keyboard.press("Tab");
    await page.keyboard.up("Shift");
    await expect(page.locator(digitSelectors[i])).toBeFocused();
  }
});

test("moves focus to the next digit input when the numbers 0 through 9 are pressed", async ({
  page,
}) => {
  const digitSelectors = [
    "#hour-digit-tens",
    "#hour-digit-ones",
    "#minute-digit-tens",
    "#minute-digit-ones",
    "#second-digit-tens",
    "#second-digit-ones",
    "#millisecond-digit-hundreds",
    "#millisecond-digit-tens",
    "#millisecond-digit-ones",
  ];

  function getRandomDigit() {
    return Math.floor(Math.random() * 10).toString();
  }

  for (let i = 0; i < digitSelectors.length - 1; i++) {
    await page.locator(digitSelectors[i]).focus();
    await page.keyboard.type(getRandomDigit());
    await expect(page.locator(digitSelectors[i + 1])).toBeFocused();
  }
});

test("supports resetting a running timer", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  const resetButton = page.locator("#reset-timer");
  const secondOnes = page.locator("#second-digit-ones");

  await secondOnes.fill("5");
  await startButton.click();
  await resetButton.click();

  const displayedDuration = await getDisplayedDuration(page);
  expect(displayedDuration).toBe("00:00:00.000");
});

test("resetting a timer disables the start, pause, and reset buttons", async ({
  page,
}) => {
  const startButton = page.locator("#start-timer");
  const pauseButton = page.locator("#pause-timer");
  const resetButton = page.locator("#reset-timer");

  await page.locator("#second-digit-ones").fill("2");
  await startButton.click();
  await resetButton.click();

  await expect(startButton).toBeDisabled();
  await expect(pauseButton).toBeDisabled();
  await expect(resetButton).toBeDisabled();
});

test("supports resetting a non-running timer", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  const pauseButton = page.locator("#pause-timer");
  const resetButton = page.locator("#reset-timer");
  const secondOnes = page.locator("#second-digit-ones");

  await secondOnes.fill("5");
  await startButton.click();
  await page.clock.runFor(2000);
  await pauseButton.click();
  await resetButton.click();

  const displayedDuration = await getDisplayedDuration(page);
  expect(displayedDuration).toBe("00:00:00.000");
});

test("ignores letters, symbols, spacebar, enter, backspace, and delete keypress input to timer digits", async ({
  page,
}) => {
  const input = page.locator("#minute-digit-ones");

  await input.fill("5");
  await expect(input).toHaveValue("5");

  await input.focus();
  await page.keyboard.type("a");
  await expect(input).toHaveValue("5");

  await input.focus();
  await page.keyboard.type(".");
  await expect(input).toHaveValue("5");

  await input.focus();
  await page.keyboard.press("Space");
  await expect(input).toHaveValue("5");

  await input.focus();
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("5");

  await input.focus();
  await page.keyboard.press("Backspace");
  await expect(input).toHaveValue("5");

  await input.focus();
  await page.keyboard.press("Delete");
  await expect(input).toHaveValue("5");
});

test("enables the reset button when changing digit inputs on a non-running timer", async ({
  page,
}) => {
  const resetButton = page.locator("#reset-timer");

  await expect(resetButton).toBeDisabled();
  await page.locator("#minute-digit-ones").fill("3");
  await expect(resetButton).toBeEnabled();
});

test("prevents changing digit inputs on a running timer", async ({ page }) => {
  const startButton = page.locator("#start-timer");
  const digitInput = page.locator("#minute-digit-ones");

  await digitInput.focus();
  await page.keyboard.type("2");
  await startButton.click();
  await digitInput.focus();
  await page.keyboard.type("7");
  await expect(digitInput).toHaveValue("1"); // 1 not 2 because the digit changed from the timer starting.
});

test("allows changing digit inputs when a timer reaches zero", async ({
  page,
}) => {
  const startButton = page.locator("#start-timer");
  const digitInput = page.locator("#second-digit-ones");

  await digitInput.fill("2");
  await startButton.click();

  await page.clock.runFor(3000);

  const displayedDuration = await getDisplayedDuration(page);
  expect(displayedDuration).toMatch("00:00:00.000");

  await digitInput.fill("7");
  await expect(digitInput).toHaveValue("7");

  await digitInput.focus();
  await page.keyboard.type("3");
  await expect(digitInput).toHaveValue("3");
});

test("shows the time's up overlay when the timer finishes", async ({
  page,
}) => {
  await page.locator("#second-digit-ones").fill("1");
  await page.locator("#start-timer").click();
  await page.clock.runFor(2000);

  const overlay = page.locator(".times-up-overlay");
  await expect(overlay).toBeVisible();

  await expect(overlay.locator(".times-up-overlay-message")).toHaveText(
    /TIME'S UP/i
  );
});

test("hides the time's up overlay when the user presses OK", async ({
  page,
}) => {
  await page.locator("#second-digit-ones").fill("1");
  await page.locator("#start-timer").click();
  await page.clock.runFor(2000);

  await page.locator(".times-up-overlay-ok-button").click();
  const overlay = page.locator(".times-up-overlay");
  await expect(overlay).toBeHidden();
});
