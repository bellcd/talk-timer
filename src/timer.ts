import { checkIsElement, checkIsInputElement } from "./assertions";
import {
  checkIsInputDigitId,
  getDigitInputElements,
  getTargetId,
} from "./digitInputs";

const TEN_HOURS_IN_MILLISECONDS = 1000 * 60 * 60 * 10;
const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
const TEN_MINUTES_IN_MILLISECONDS = 1000 * 60 * 10;
const ONE_MINUTE_IN_MILLISECONDS = 1000 * 60;
const TEN_SECONDS_IN_MILLISECONDS = 1000 * 10;
const ONE_SECOND_IN_MILLISECONDS = 1000;

const INITIAL_MS = 0;

type TimeDigits = {
  hourDigitTens: number;
  hourDigitOnes: number;
  minuteDigitTens: number;
  minuteDigitOnes: number;
  secondDigitTens: number;
  secondDigitOnes: number;
  millisecondDigitHundreds: number;
  millisecondDigitTens: number;
  millisecondDigitOnes: number;
};

function createTimeDigits(millis: number): TimeDigits {
  let remaining = millis;

  // TODO: There's a bug in the hours and minutes digits
  let hourDigitTens = 0;
  if (remaining >= TEN_HOURS_IN_MILLISECONDS) {
    hourDigitTens = Math.floor(remaining / TEN_HOURS_IN_MILLISECONDS);
    remaining = remaining % TEN_HOURS_IN_MILLISECONDS;
  }

  let hourDigitOnes = 0;
  if (remaining >= ONE_HOUR_IN_MILLISECONDS) {
    hourDigitOnes = Math.floor(remaining / ONE_HOUR_IN_MILLISECONDS);
    remaining = remaining % ONE_HOUR_IN_MILLISECONDS;
  }

  let minuteDigitTens = 0;
  if (remaining >= TEN_MINUTES_IN_MILLISECONDS) {
    minuteDigitTens = Math.floor(remaining / TEN_MINUTES_IN_MILLISECONDS);
    remaining = remaining % TEN_MINUTES_IN_MILLISECONDS;
  }

  let minuteDigitOnes = 0;
  if (remaining >= ONE_MINUTE_IN_MILLISECONDS) {
    minuteDigitOnes = Math.floor(remaining / ONE_MINUTE_IN_MILLISECONDS);
    remaining = remaining % ONE_MINUTE_IN_MILLISECONDS;
  }

  let secondDigitTens = 0;
  if (remaining >= TEN_SECONDS_IN_MILLISECONDS) {
    secondDigitTens = Math.floor(remaining / TEN_SECONDS_IN_MILLISECONDS);
    remaining = remaining % TEN_SECONDS_IN_MILLISECONDS;
  }

  let secondDigitOnes = 0;
  if (remaining >= ONE_SECOND_IN_MILLISECONDS) {
    secondDigitOnes = Math.floor(remaining / ONE_SECOND_IN_MILLISECONDS);
    remaining = remaining % ONE_SECOND_IN_MILLISECONDS;
  }

  let millisecondDigitHundreds = 0;
  if (remaining >= 100) {
    millisecondDigitHundreds = Math.floor(remaining / 100);
    remaining = remaining % 100;
  }

  let millisecondDigitTens = 0;
  if (remaining >= 10) {
    millisecondDigitTens = Math.floor(remaining / 10);
    remaining = remaining % 10;
  }

  let millisecondDigitOnes = 0;
  if (remaining >= 1) {
    millisecondDigitOnes = remaining;
  }

  return {
    hourDigitTens,
    hourDigitOnes,
    minuteDigitTens,
    minuteDigitOnes,
    secondDigitTens,
    secondDigitOnes,
    millisecondDigitHundreds,
    millisecondDigitTens,
    millisecondDigitOnes,
  };
}

const digitKeyToIdMap = new Map([
  ["hourDigitTens", "hour-digit-tens"],
  ["hourDigitOnes", "hour-digit-ones"],
  ["minuteDigitTens", "minute-digit-tens"],
  ["minuteDigitOnes", "minute-digit-ones"],
  ["secondDigitTens", "second-digit-tens"],
  ["secondDigitOnes", "second-digit-ones"],
  ["millisecondDigitHundreds", "millisecond-digit-hundreds"],
  ["millisecondDigitTens", "millisecond-digit-tens"],
  ["millisecondDigitOnes", "millisecond-digit-ones"],
]);

export class Timer {
  constructor() {
    this.getStartTimerButton().addEventListener("click", () => {
      console.log("here");
      // TODO: Randomize?
      this.startTimer(50);
    });

    this.getPauseTimerButton().addEventListener("click", () => {
      this.pauseTimer();
    });

    this.getResetTimerButton().addEventListener("click", () => {
      this.resetTimer();
    });

    for (const d of getDigitInputElements()) {
      d.addEventListener("input", this.onDigitInput);
    }

    // Select the input's value when focused.
    [...document.querySelectorAll('#timer-display input[type="number"]')]
      .map((element) => checkIsInputElement(element))
      .forEach((input) => {
        input.addEventListener("focus", function () {
          input.select();
        });
      });

    this.disableControlButtons();
  }

  private remainingMs: number = INITIAL_MS;
  private interval: undefined | number = undefined;

  getStartTimerButton() {
    return checkIsElement(document.querySelector("#start-timer"));
  }
  enableStartTimerButton() {
    this.getStartTimerButton().removeAttribute("disabled");
  }
  disableStartTimerButton() {
    this.getStartTimerButton().setAttribute("disabled", "true");
  }

  getPauseTimerButton() {
    return checkIsElement(document.querySelector("#pause-timer"));
  }
  enablePauseTimerButton() {
    this.getPauseTimerButton().removeAttribute("disabled");
  }
  disablePauseTimerButton() {
    this.getPauseTimerButton().setAttribute("disabled", "true");
  }

  getResetTimerButton() {
    return checkIsElement(document.querySelector("#reset-timer"));
  }
  enableResetTimerButton() {
    this.getResetTimerButton().removeAttribute("disabled");
  }
  disableResetTimerButton() {
    this.getResetTimerButton().setAttribute("disabled", "true");
  }

  disableControlButtons() {
    this.disableStartTimerButton();
    this.disablePauseTimerButton();
    this.disableResetTimerButton();
  }

  startTimer(ms: number) {
    this.disableStartTimerButton();
    this.enablePauseTimerButton();
    this.enableResetTimerButton();
    // disableTimerInputs();

    this.interval = window.setInterval(() => {
      this.remainingMs -= ms;

      if (this.remainingMs <= 0) {
        clearInterval(this.interval);
        this.interval = undefined;
        const timeDigits = {
          hourDigitTens: 0,
          hourDigitOnes: 0,
          minuteDigitTens: 0,
          minuteDigitOnes: 0,
          secondDigitTens: 0,
          secondDigitOnes: 0,
          millisecondDigitHundreds: 0,
          millisecondDigitTens: 0,
          millisecondDigitOnes: 0,
        };

        this.updateTimerDisplay(timeDigits);
        console.log("Time's up!");
      } else {
        const timeDigits = createTimeDigits(this.remainingMs);
        this.updateTimerDisplay(timeDigits);
      }
    }, ms);
  }

  pauseTimer() {
    clearInterval(this.interval);
    this.enableStartTimerButton();
    this.disablePauseTimerButton();
  }

  resetTimer() {
    clearInterval(this.interval);
    this.interval = undefined;
    this.remainingMs = INITIAL_MS;
    const timeDigits = createTimeDigits(this.remainingMs);
    this.updateTimerDisplay(timeDigits);
    this.enableTimerInputs();
  }

  enableTimerInputs() {
    const digitInputs = [
      ...document.querySelectorAll('#timer-display input[type="number"]'),
    ];
    for (const input of digitInputs) {
      input.removeAttribute("disabled");
    }
  }

  updateTimerDisplay(timeDigits: TimeDigits) {
    for (const [key, value] of Object.entries(timeDigits)) {
      const id = digitKeyToIdMap.get(key);
      // TODO: Does it matter that this causes multiple reflows?
      checkIsInputElement(document.querySelector(`#${id}`)).value =
        String(value);
    }
  }

  // TODO: Why do the 'e' and '.' characters appear?
  // TODO: Pressing any key outside of 0123456789 should have no effect.
  // TODO: Ignore delete and backspace keys.
  // TODO: Is this the right place for this method?
  onDigitInput = (event: Event) => {
    // TODO: Early return if there are errors in any of the inputs
    if (this.interval) {
      // no-op
      // there's a timer running, so ignore digit changes
      console.log("Timer is running, ignoring input");
      return;
    }

    const inputElement = checkIsInputElement(event.target);

    if ("1234567890".includes(inputElement.value) === false) {
      // input was not a digit, ignore
      return;
    }

    // BUG: If the digit was non-zero, we need to remove the amount of time that digit contributed
    // 6before adding the new digit's time
    const digit = Number(inputElement.value);
    const multiplier = Number(inputElement.dataset.multiplier);
    this.remainingMs += digit * multiplier;

    const sourceId = inputElement.id;
    const targetId = getTargetId(checkIsInputDigitId(sourceId));
    const target = checkIsElement(document.querySelector(`#${targetId}`));
    target.focus();
    this.enableStartTimerButton();
    if (getDigitInputElements().every((d) => d.value === "0")) {
      this.disableControlButtons();
    }
  };
}
