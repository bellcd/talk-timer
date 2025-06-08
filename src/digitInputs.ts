import { checkExhaustivelyHandled, checkIsInputElement } from "./assertions";

export function getDigitInputElements() {
  const elements = document.querySelectorAll(
    `#timer-display > input[id*="digit"]`
  );
  const inputElements = [...elements].map((element) =>
    checkIsInputElement(element)
  );
  return inputElements;
}

export function setDigitInputsReadOnly(readonly: boolean) {
  getDigitInputElements().forEach((input) => {
    input.readOnly = readonly;
  });
}

export function getRemainingMsFromInputs(): number {
  let sum = 0;
  for (const inputElement of getDigitInputElements()) {
    const digit = Number(inputElement.value);
    const multiplier = Number(inputElement.dataset.multiplier);
    sum = sum + digit * multiplier;
  }
  return sum;
}

type InputDigitId =
  | "hour-digit-tens"
  | "hour-digit-ones"
  | "minute-digit-tens"
  | "minute-digit-ones"
  | "second-digit-tens"
  | "second-digit-ones"
  | "millisecond-digit-hundreds"
  | "millisecond-digit-tens"
  | "millisecond-digit-ones";

export function checkIsInputDigitId(input: unknown): InputDigitId {
  switch (input) {
    case "hour-digit-tens":
    case "hour-digit-ones":
    case "minute-digit-tens":
    case "minute-digit-ones":
    case "second-digit-tens":
    case "second-digit-ones":
    case "millisecond-digit-hundreds":
    case "millisecond-digit-tens":
    case "millisecond-digit-ones":
      return input;
    default:
      throw new Error(
        `Expected input to be a valid InputDigitId, but got ${input}`
      );
  }
}

export function getTargetId(sourceId: InputDigitId) {
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
      checkExhaustivelyHandled(sourceId);
  }
}
