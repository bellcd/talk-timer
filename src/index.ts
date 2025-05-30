import { Timer } from "./timer";

window.addEventListener("DOMContentLoaded", () => {
  const timer = new Timer();

  // // TODO: Bundle state? timer running vs not-running, remaining time vs no-time
  // // running, hasTime
  // // not running, hasTime
  // // not running, no time

  // type TimerState =
  //   | {
  //       type: "running";
  //       remainingMs: number;
  //     }
  //   | {
  //       type: "not_running_with_time_remaining";
  //       remainingMs: number;
  //     }
  //   | {
  //       type: "not_running_no_time_remaining";
  //     };

  // let timerState: TimerState = {
  //   type: "not_running_no_time_remaining",
  // };

  // // TODO: When the inputs are disabled,
  // // make the input text non selectable,
  // // and make the cursor not appear when clicking on the inputs.
  // function disableTimerInputs() {
  //   const digitInputs = [
  //     ...document.querySelectorAll('#timer-display input[type="number"]'),
  //   ];
  //   for (const input of digitInputs) {
  //     input.setAttribute("disabled", "true");
  //   }
  // }
});
