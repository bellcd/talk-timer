export function checkIsElement(input: unknown) {
  if (input instanceof HTMLElement) {
    return input;
  } else {
    throw new Error(
      `Expected typeof input=${typeof input} to be an HTMLElement.`
    );
  }
}

export function checkIsInputElement(input: unknown) {
  if (input instanceof HTMLInputElement) {
    return input;
  } else {
    throw new Error(
      `Expected typeof input=${typeof input} to be an HTMLInputElement.`
    );
  }
}

export function checkExhaustivelyHandled(input: never): never {
  throw new Error(
    `checkExhaustivelyHandled called with typeof input=${typeof input}. There's a type issue somewhere.`
  );
}
