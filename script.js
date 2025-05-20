const timerDisplay = document.querySelector("#timer-display");
const startTimerButton = document.querySelector("#start-timer");
const pauseTimerButton = document.querySelector("#pause-timer");
const resetTimerButton = document.querySelector("#reset-timer");
const timerInputInMinutes = document.querySelector("#timer-input-in-minutes");
const drawer = document.querySelector("#drawer");

const INITIAL_MS = 0;
const TEN_HOURS_IN_MILLISECONDS = 1000 * 60 * 60 * 10;
const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
const TEN_MINUTES_IN_MILLISECONDS = 1000 * 60 * 10;
const ONE_MINUTE_IN_MILLISECONDS = 1000 * 60;
const TEN_SECONDS_IN_MILLISECONDS = 1000 * 10;
const ONE_SECOND_IN_MILLISECONDS = 1000;

let remainingMs = INITIAL_MS;
let interval = undefined;

const digitShape = {
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

function createTimeDigits(millis) {
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

function updateTimerDisplay(timeDigits) {
  for (const [key, value] of Object.entries(timeDigits)) {
    const id = digitKeyToIdMap.get(key);
    // TODO: Does it matter that this causes multiple reflows?
    document.querySelector(`#${id}`).value = value;
  }
}

function startTimer(ms) {
  disableTimerInputs();

  interval = setInterval(() => {
    remainingMs -= ms;

    if (remainingMs <= 0) {
      clearInterval(interval);
      interval = undefined;
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

      updateTimerDisplay(timeDigits);
      console.log("Time's up!");
    } else {
      const timeDigits = createTimeDigits(remainingMs);
      updateTimerDisplay(timeDigits);
    }
  }, ms);
}

function pauseTimer() {
  clearInterval(interval);
}

function resetTimer() {
  clearInterval(interval);
  interval = undefined;
  remainingMs = INITIAL_MS;
  const timeDigits = createTimeDigits(remainingMs);
  updateTimerDisplay(timeDigits);
  enableTimerInputs();
}

startTimerButton.addEventListener("click", () => {
  // TODO: Randomize?
  startTimer(50);
});

pauseTimerButton.addEventListener("click", () => {
  pauseTimer();
});

resetTimerButton.addEventListener("click", () => {
  resetTimer();
});

function getTargetId(sourceId) {
  switch (sourceId) {
    case "hour-digit-tens":
      return "hour-digit-ones";
    case "hour-digit-ones":
      return "minute-digit-tens";
    case "minute-digit-tens":
      return "minute-digit-ones";
    case "minute-digit-ones":
      return "second-digit-tens";
    case "second-digit-tens":
      return "second-digit-ones";
    case "second-digit-ones":
      return "millisecond-digit-hundreds";
    case "millisecond-digit-hundreds":
      return "millisecond-digit-tens";
    case "millisecond-digit-tens":
      return "millisecond-digit-ones";
    case "millisecond-digit-ones":
      return "start-timer";
    default:
      throw new Error(`Unknown sourceId: ${sourceId}`);
  }
}
// TODO: Why do the 'e' and '.' characters appear?
// TODO: Pressing any key outside of 0123456789 should have no effect.
function onDigitInput(event) {
  // TODO: Early return if there are errors in any of the inputs
  if (interval) {
    // no-op
    // there's a timer running, so ignore digit changes
    console.log("Timer is running, ignoring input");
    return;
  }

  const digit = Number(event.target.value);

  const multiplier = Number(event.target.dataset.multiplier);
  remainingMs += digit * multiplier;

  const sourceId = event.target.id;
  const targetId = getTargetId(sourceId);
  const target = document.querySelector(`#${targetId}`);
  target.focus();
}

const digits = [
  ...document.querySelectorAll(`#timer-display > input[id*="digit"]`),
];
for (const d of digits) {
  d.addEventListener("input", onDigitInput);
}

document
  .querySelectorAll('#timer-display input[type="number"]')
  .forEach((input) => {
    input.addEventListener("focus", function () {
      this.select();
    });
  });

// TODO: When the inputs are disabled,
// make the input text non selectable,
// and make the cursor not appear when clicking on the inputs.
function disableTimerInputs() {
  const digitInputs = [
    ...document.querySelectorAll('#timer-display input[type="number"]'),
  ];
  for (const input of digitInputs) {
    input.setAttribute("disabled", "true");
  }
}

function enableTimerInputs() {
  const digitInputs = [
    ...document.querySelectorAll('#timer-display input[type="number"]'),
  ];
  for (const input of digitInputs) {
    input.removeAttribute("disabled");
  }
}
