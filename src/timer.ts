import {
  checkExhaustivelyHandled,
  checkIsElement,
  checkIsInputElement,
} from "./assertions";
import {
  checkIsInputDigitId,
  getDigitInputElements,
  getRemainingMsFromInputs,
  getTargetId,
} from "./digitInputs";

const TEN_HOURS_IN_MILLISECONDS = 1000 * 60 * 60 * 10;
const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
const TEN_MINUTES_IN_MILLISECONDS = 1000 * 60 * 10;
const ONE_MINUTE_IN_MILLISECONDS = 1000 * 60;
const TEN_SECONDS_IN_MILLISECONDS = 1000 * 10;
const ONE_SECOND_IN_MILLISECONDS = 1000;

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

type TimerState =
  | {
      type: "running";
      remainingMs: number;
    }
  | {
      type: "not_running_with_time_remaining";
      remainingMs: number;
    }
  | {
      type: "not_running_no_time_remaining";
    };

function getRemainingMs(timerState: TimerState, ms: number): number {
  switch (timerState.type) {
    case "running":
    case "not_running_with_time_remaining":
      return timerState.remainingMs - ms;
    case "not_running_no_time_remaining":
      // TODO: Narrower state to avoid this case?
      throw new Error(
        "We should not be getting the remaining milliseconds when there's no time remaining"
      );
    default:
      return checkExhaustivelyHandled(timerState);
  }
}

export class Timer {
  constructor() {
    this.getStartTimerButton().addEventListener("click", () => {
      const timeout = Math.floor(
        Math.random() * (this.MAX_TIMEOUT_MS - this.MIN_TIMEOUT_MS + 1) +
          this.MIN_TIMEOUT_MS
      );
      this.startTimer(timeout);
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
    this.timerState = {
      type: "not_running_no_time_remaining",
    };
  }

  private readonly MAX_TIMEOUT_MS = 50;
  private readonly MIN_TIMEOUT_MS = 10;
  private interval: undefined | number = undefined;
  private timerState: TimerState;

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
      const remainingMs = getRemainingMs(this.timerState, ms);

      if (remainingMs <= 0) {
        this.timerState = {
          type: "not_running_no_time_remaining",
        };
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
        this.disableControlButtons();
        console.log("Time's up!");
      } else {
        this.timerState = {
          type: "running",
          remainingMs,
        };
        const timeDigits = createTimeDigits(remainingMs);
        this.updateTimerDisplay(timeDigits);
      }
    }, ms);
  }

  pauseTimer() {
    switch (this.timerState.type) {
      case "running":
        this.timerState = {
          type: "not_running_with_time_remaining",
          remainingMs: this.timerState.remainingMs,
        };
        clearInterval(this.interval);
        this.enableStartTimerButton();
        this.disablePauseTimerButton();
        break;
      case "not_running_with_time_remaining":
      case "not_running_no_time_remaining":
        // TODO: Is this enforceable at compile time?
        throw new Error("Cannot pause timer in state: " + this.timerState.type);
      default:
        checkExhaustivelyHandled(this.timerState);
    }
  }

  resetTimer() {
    switch (this.timerState.type) {
      case "running":
      case "not_running_with_time_remaining":
        clearInterval(this.interval);
        this.interval = undefined;
        this.timerState = {
          type: "not_running_no_time_remaining",
        };
        const timeDigits = createTimeDigits(0);
        this.updateTimerDisplay(timeDigits);
        this.enableTimerInputs();
        break;
      case "not_running_no_time_remaining":
        // TODO: Is this enforceable at compile time?
        throw new Error("Cannot reset timer in state: " + this.timerState.type);
      default:
        checkExhaustivelyHandled(this.timerState);
        break;
    }
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
    console.debug("Updating timer display", getDisplayedDuration(timeDigits));
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
    const inputElement = checkIsInputElement(event.target);

    if ("1234567890".includes(inputElement.value) === false) {
      // input was not a digit, ignore
      return;
    }

    switch (this.timerState.type) {
      case "running":
        return;
      case "not_running_with_time_remaining":
      case "not_running_no_time_remaining":
        this.timerState = {
          type: "not_running_with_time_remaining",
          remainingMs: getRemainingMsFromInputs(),
        };
        break;
      default:
        checkExhaustivelyHandled(this.timerState);
    }

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

function getDisplayedDuration(timeDigits: TimeDigits) {
  const {
    hourDigitTens,
    hourDigitOnes,
    minuteDigitTens,
    minuteDigitOnes,
    secondDigitTens,
    secondDigitOnes,
    millisecondDigitHundreds,
    millisecondDigitTens,
    millisecondDigitOnes,
  } = timeDigits;

  return `${hourDigitTens}${hourDigitOnes}:${minuteDigitTens}${minuteDigitOnes}:${secondDigitTens}${secondDigitOnes}:${millisecondDigitHundreds}${millisecondDigitTens}${millisecondDigitOnes}`;
}
