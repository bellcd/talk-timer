import { checkIsInputElement } from "./assertions";

export function getDigitInputElements() {
  const elements = document.querySelectorAll(
    `#timer-display > input[id*="digit"]`
  );
  const inputElements = [...elements].map((element) =>
    checkIsInputElement(element)
  );
  return inputElements;
}
