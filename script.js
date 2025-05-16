const timerDisplay = document.querySelector("#timer-display");
const startTimerButton = document.querySelector("#start-timer");
const timerInputInMinutes = document.querySelector("#timer-input-in-minutes");

const INITIAL_MS = 10_000;
const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
const ONE_MINUTE_IN_MILLISECONDS = 1000 * 60;
const ONE_SECOND_IN_MILLISECONDS = 1000;

function formatTime(millis) {
  let remaining = millis;
  let hours = 0;
  if (remaining >= ONE_HOUR_IN_MILLISECONDS) {
    hours = Math.floor(remaining / ONE_HOUR_IN_MILLISECONDS);
    // TODO: Replace with mod operator?
    remaining -= hours * ONE_HOUR_IN_MILLISECONDS;
  }

  let minutes = 0;
  if (remaining >= ONE_MINUTE_IN_MILLISECONDS) {
    minutes = Math.floor(remaining / ONE_MINUTE_IN_MILLISECONDS);
    remaining -= minutes * ONE_MINUTE_IN_MILLISECONDS;
  }

  let seconds = 0;
  if (remaining >= ONE_SECOND_IN_MILLISECONDS) {
    seconds = Math.floor(remaining / ONE_SECOND_IN_MILLISECONDS);
    remaining -= seconds * ONE_SECOND_IN_MILLISECONDS;
  }

  let milliseconds = 0;
  if (remaining >= 1) {
    milliseconds = remaining;
  }

  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");
  const ms = String(milliseconds).padStart(3, "0");
  const formattedTime = `${h}:${m}:${s}:${ms}`;

  return formattedTime;
}

function updateTimerDisplay(ms) {
  const formattedTime = formatTime(ms);
  timerDisplay.textContent = formattedTime;
}

let remainingMs = INITIAL_MS;

function setUserInputtedTimeMs() {
  const userInputtedTime = timerInputInMinutes.value;
  if (userInputtedTime !== null) {
    remainingMs = userInputtedTime * ONE_MINUTE_IN_MILLISECONDS;
  } else {
    remainingMs = INITIAL_MS;
  }
}

setUserInputtedTimeMs();
updateTimerDisplay(remainingMs);

timerInputInMinutes.addEventListener("change", () => {
  setUserInputtedTimeMs();
  updateTimerDisplay(remainingMs);
});

function startTimer(ms) {
  const interval = setInterval(() => {
    const formattedTime = formatTime(remainingMs);
    remainingMs -= ms;

    if (remainingMs <= 0) {
      clearInterval(interval);
      timerDisplay.textContent = "00:00:00:000";
      console.log("Time's up!");
    } else {
      timerDisplay.textContent = formattedTime;
    }
  }, ms);
}

startTimerButton.addEventListener("click", () => {
  // TODO: Randomize?
  startTimer(50);
});
