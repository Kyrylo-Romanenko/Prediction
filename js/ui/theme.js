const THEME_STORAGE_KEY = "theme";

export function applyTheme(toggleButton, theme) {
  document.body.dataset.theme = theme === "light" ? "light" : "dark";

  if (toggleButton) {
    toggleButton.innerHTML = `<span aria-hidden="true">${document.body.dataset.theme === "light" ? "◑" : "◐"}</span>`;
    const nextLabel = document.body.dataset.theme === "light" ? "Увімкнути темну тему" : "Увімкнути світлу тему";
    toggleButton.setAttribute("aria-label", nextLabel);
    toggleButton.setAttribute("title", nextLabel);
  }
}

export function loadTheme(toggleButton) {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  applyTheme(toggleButton, savedTheme);
}

export function toggleTheme(toggleButton) {
  const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(toggleButton, nextTheme);
}
