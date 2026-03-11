function setBackgroundVariable(element, variableName, value) {
  if (!element) {
    return;
  }

  if (value) {
    element.style.setProperty(variableName, value);
    return;
  }

  element.style.removeProperty(variableName);
}

export function applyDeckBackBackground(element, background = {}) {
  if (!element) {
    return;
  }

  setBackgroundVariable(element, "--deck-back-bg-dark", background.dark);
  setBackgroundVariable(element, "--deck-back-bg-light", background.light);
}
