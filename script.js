import { bootstrapApp } from "./js/app.js";

const GITHUB_PAGES_HOST = "kyrylo-romanenko.github.io";
const PROJECT_BASE_PATH = "/Prediction/";

function normalizeGitHubPagesPath() {
  if (window.location.hostname !== GITHUB_PAGES_HOST) {
    return false;
  }

  if (window.location.pathname === "/" || window.location.pathname === "/Prediction") {
    const targetUrl = new URL(PROJECT_BASE_PATH, window.location.origin);
    targetUrl.search = window.location.search;
    targetUrl.hash = window.location.hash;
    window.location.replace(targetUrl.toString());
    return true;
  }

  return false;
}

if (!normalizeGitHubPagesPath()) {
  document.addEventListener("DOMContentLoaded", bootstrapApp);
}
