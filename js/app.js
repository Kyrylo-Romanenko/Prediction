import { listGalleryDecks } from "./config/decks.js";
import { loadActiveFortunes, loadFortunesByDeckId, pickRandomFortune } from "./services/fortune-store.js";
import {
  addSavedFortune,
  formatSavedDate,
  isFortuneSaved,
  loadSavedFortunes,
  persistSavedFortunes,
  removeSavedFortune
} from "./services/saved-fortunes.js";
import { buildFortuneImageFile } from "./services/share-image.js";
import { applyDeckBackBackground } from "./ui/deck-appearance.js";
import { renderBackDesign } from "./ui/back-design.js";
import { renderDeckGallery } from "./ui/deck-gallery.js";
import { loadTheme, toggleTheme } from "./ui/theme.js";

const CARD_REVEAL_MS = 900;
const CARD_HALF_SPIN_MS = 560;
const DEFAULT_FORTUNE_TEXT = "Торкніться карти, щоб відкрити передбачення.";
const MENU_TOOLTIP_STORAGE_KEY = "prediction.menuTooltipSeen";

function getElements() {
  const tarotCardEl = document.getElementById("tarot-card");

  return {
    fortuneEl: document.getElementById("fortune-text"),
    saveBtn: document.getElementById("save-btn"),
    copyBtn: document.getElementById("copy-btn"),
    shareBtn: document.getElementById("share-btn"),
    downloadBtn: document.getElementById("download-btn"),
    themeToggleBtn: document.getElementById("theme-toggle"),
    homeLinkBtn: document.getElementById("home-link"),
    shareHintEl: document.getElementById("share-hint"),
    tarotCardEl,
    tarotCardInnerEl: tarotCardEl?.querySelector(".tarot-card__inner"),
    tarotCardBackEl: tarotCardEl?.querySelector(".tarot-card__face--back"),
    tarotCardBackIconsEl: document.getElementById("tarot-card-back-icons"),
    tarotCardBackLabelEl: document.getElementById("tarot-card-back-label"),
    deckHintBtn: document.getElementById("deck-hint"),
    magicBurstEl: document.getElementById("magic-burst"),
    menuToggleBtn: document.getElementById("menu-toggle"),
    menuTooltipEl: document.getElementById("menu-tooltip"),
    menuCloseBtn: document.getElementById("menu-close"),
    menuBackdropEl: document.getElementById("menu-backdrop"),
    siteMenuEl: document.getElementById("site-menu"),
    viewButtons: Array.from(document.querySelectorAll("[data-view-target]")),
    viewMainEl: document.getElementById("view-main"),
    viewSavedEl: document.getElementById("view-saved"),
    viewDecksEl: document.getElementById("view-decks"),
    viewInfoEl: document.getElementById("view-info"),
    deckGalleryEl: document.getElementById("deck-gallery"),
    savedShortcutBtn: document.getElementById("saved-shortcut"),
    savedShortcutCountEl: document.getElementById("saved-shortcut-count"),
    savedListEl: document.getElementById("saved-list"),
    savedCountEl: document.getElementById("saved-count"),
    savedEmptyEl: document.getElementById("saved-empty"),
    cardShellEl: document.querySelector(".card-shell")
  };
}

function createBadge(cardShellEl) {
  const badgeEl = document.createElement("div");
  badgeEl.className = "season-badge";
  cardShellEl?.insertBefore(badgeEl, cardShellEl.firstChild);
  return badgeEl;
}

function createAppState() {
  return {
    currentFortune: "",
    currentDeck: null,
    currentDeckId: null,
    selectedDeckId: null,
    savedFortunes: [],
    isRevealed: false,
    cardRotation: 0
  };
}

function applyBadge(badgeEl, badge) {
  if (!badgeEl) {
    return;
  }

  if (badge) {
    badgeEl.textContent = badge;
    badgeEl.style.display = "inline-flex";
    return;
  }

  badgeEl.style.display = "none";
}

function syncDeckGallerySelection(elements, state) {
  if (!elements.deckGalleryEl) {
    return;
  }

  const activeDeckId = state.selectedDeckId || state.currentDeckId;
  elements.deckGalleryEl.querySelectorAll("[data-deck-id]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.deckId === activeDeckId);
  });
}

function applyDeckAppearance(elements, badgeEl, state, deck) {
  applyBadge(badgeEl, deck.badge);
  applyDeckBackBackground(elements.tarotCardBackEl, deck.backDesign?.background);
  renderBackDesign(elements.tarotCardBackIconsEl, elements.tarotCardBackEl, deck.backDesign);

  if (elements.tarotCardBackLabelEl) {
    elements.tarotCardBackLabelEl.textContent = deck.title || "Fortune";
  }

  elements.tarotCardEl?.classList.toggle("tarot-card--emoji-oracle", deck.id === "emojiOracle");
  elements.fortuneEl?.classList.toggle("fortune-text--emoji-oracle", deck.id === "emojiOracle");

  state.currentDeck = deck;
  state.currentDeckId = deck.id;
  syncDeckGallerySelection(elements, state);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderFortuneText(elements, state, text) {
  if (!elements.fortuneEl) {
    return;
  }

  if (state.currentDeck?.id === "emojiOracle") {
    const [topLine = "", emojiLine = "", bottomLine = ""] = text.split("\n");
    elements.fortuneEl.innerHTML = `
      <span class="fortune-line fortune-line--intro">${escapeHtml(topLine)}</span>
      <span class="fortune-line fortune-line--emoji">${escapeHtml(emojiLine)}</span>
      <span class="fortune-line fortune-line--outro">${escapeHtml(bottomLine)}</span>
    `;
    return;
  }

  elements.fortuneEl.textContent = text;
}

function setShareEnabled(elements, enabled) {
  elements.shareBtn.disabled = !enabled;
  elements.downloadBtn.disabled = !enabled;
  elements.saveBtn.disabled = !enabled;
  elements.copyBtn.disabled = !enabled;
}

function updateShareHint(elements, message) {
  if (elements.shareHintEl) {
    elements.shareHintEl.textContent = message;
  }
}

function triggerHaptic(duration = 50) {
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(duration);
  }
}

function triggerMagicBurst(elements) {
  if (!elements.magicBurstEl) {
    return;
  }

  elements.magicBurstEl.classList.remove("is-active");
  void elements.magicBurstEl.offsetWidth;
  elements.magicBurstEl.classList.add("is-active");
  window.setTimeout(() => {
    elements.magicBurstEl.classList.remove("is-active");
  }, 700);
}

function openMenu(elements) {
  elements.siteMenuEl?.removeAttribute("hidden");
  elements.menuBackdropEl?.removeAttribute("hidden");
  elements.menuToggleBtn?.setAttribute("aria-expanded", "true");
  hideMenuTooltip(elements);
}

function closeMenu(elements) {
  elements.siteMenuEl?.setAttribute("hidden", "");
  elements.menuBackdropEl?.setAttribute("hidden", "");
  elements.menuToggleBtn?.setAttribute("aria-expanded", "false");
}

function hideMenuTooltip(elements) {
  if (!elements.menuTooltipEl) {
    return;
  }

  elements.menuTooltipEl.setAttribute("hidden", "");
}

function maybeShowMenuTooltip(elements) {
  if (!elements.menuTooltipEl) {
    return;
  }

  const isNarrowScreen = window.matchMedia?.("(max-width: 640px)")?.matches ?? false;
  if (!isNarrowScreen) {
    hideMenuTooltip(elements);
    return;
  }

  try {
    if (window.localStorage.getItem(MENU_TOOLTIP_STORAGE_KEY) === "1") {
      return;
    }
  } catch {
    return;
  }

  elements.menuTooltipEl.removeAttribute("hidden");
  window.setTimeout(() => {
    hideMenuTooltip(elements);
    try {
      window.localStorage.setItem(MENU_TOOLTIP_STORAGE_KEY, "1");
    } catch {}
  }, 4800);
}

function setActiveView(elements, viewName) {
  const isSaved = viewName === "saved";
  const isDecks = viewName === "decks";
  const isInfo = viewName === "info";
  const isMain = !isSaved && !isDecks && !isInfo;

  elements.viewMainEl?.classList.toggle("is-active", isMain);
  elements.viewSavedEl?.classList.toggle("is-active", isSaved);
  elements.viewDecksEl?.classList.toggle("is-active", isDecks);
  elements.viewInfoEl?.classList.toggle("is-active", isInfo);

  if (isMain) {
    elements.viewMainEl?.removeAttribute("hidden");
  } else {
    elements.viewMainEl?.setAttribute("hidden", "");
  }

  if (isSaved) {
    elements.viewSavedEl?.removeAttribute("hidden");
  } else {
    elements.viewSavedEl?.setAttribute("hidden", "");
  }

  if (isDecks) {
    elements.viewDecksEl?.removeAttribute("hidden");
  } else {
    elements.viewDecksEl?.setAttribute("hidden", "");
  }

  if (isInfo) {
    elements.viewInfoEl?.removeAttribute("hidden");
  } else {
    elements.viewInfoEl?.setAttribute("hidden", "");
  }

  elements.viewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === viewName);
  });
}

function waitForTransformTransition(elements) {
  return new Promise((resolve) => {
    if (!elements.tarotCardInnerEl) {
      resolve();
      return;
    }

    const handleTransitionEnd = (event) => {
      if (event.propertyName !== "transform") {
        return;
      }

      elements.tarotCardInnerEl.removeEventListener("transitionend", handleTransitionEnd);
      resolve();
    };

    elements.tarotCardInnerEl.addEventListener("transitionend", handleTransitionEnd);
  });
}

async function rotateCardTo(elements, state, nextRotation, durationMs) {
  state.cardRotation = nextRotation;

  if (elements.tarotCardInnerEl) {
    elements.tarotCardInnerEl.style.transitionDuration = `${durationMs}ms`;
  }

  requestAnimationFrame(() => {
    elements.tarotCardEl?.style.setProperty("--card-rotation", `${state.cardRotation}deg`);
  });

  await waitForTransformTransition(elements);
}

function buildShareText(text) {
  if (!text) {
    return "";
  }

  return `${text}\n\nПередбачення ✨ ${window.location.href}`;
}

function updateSaveButtonState(elements, state) {
  const active = isFortuneSaved(state.savedFortunes, state.currentFortune);
  elements.saveBtn?.classList.toggle("is-active", active);
  elements.saveBtn?.setAttribute("aria-label", active ? "Передбачення збережено" : "Зберегти передбачення");
  elements.saveBtn?.setAttribute("title", active ? "Передбачення збережено" : "Зберегти передбачення");
}

function renderSavedFortunes(elements, state) {
  if (!elements.savedListEl || !elements.savedCountEl || !elements.savedEmptyEl || !elements.savedShortcutCountEl) {
    return;
  }

  elements.savedCountEl.textContent = String(state.savedFortunes.length);
  elements.savedShortcutCountEl.textContent = String(state.savedFortunes.length);
  elements.savedListEl.innerHTML = "";

  if (!state.savedFortunes.length) {
    elements.savedEmptyEl.hidden = false;
    return;
  }

  elements.savedEmptyEl.hidden = true;

  state.savedFortunes.forEach((item) => {
    const li = document.createElement("li");
    li.className = "saved-item";
    li.dataset.id = item.id;

    const body = document.createElement("div");
    const textEl = document.createElement("p");
    textEl.className = "saved-item__text";
    textEl.textContent = item.text;

    const metaEl = document.createElement("div");
    metaEl.className = "saved-item__meta";
    metaEl.textContent = formatSavedDate(item.savedAt);

    body.append(textEl, metaEl);

    const actions = document.createElement("div");
    actions.className = "saved-item__actions";
    actions.innerHTML = `
      <button type="button" class="icon-btn saved-item__btn" data-saved-action="copy" aria-label="Скопіювати збережене передбачення" title="Скопіювати">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9h10v10H9z"/><path d="M5 5h10v2H7v8H5z"/></svg>
      </button>
      <button type="button" class="icon-btn saved-item__btn" data-saved-action="remove" aria-label="Видалити збережене передбачення" title="Видалити">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l-1 13H8L7 7Zm3-3h4l1 2h4v2H5V6h4l1-2Z"/></svg>
      </button>
    `;

    li.append(body, actions);
    elements.savedListEl.appendChild(li);
  });
}

function persistAndRenderSaved(elements, state) {
  persistSavedFortunes(state.savedFortunes);
  renderSavedFortunes(elements, state);
  updateSaveButtonState(elements, state);
}

async function copyFortune(elements, state, customText = state.currentFortune, successLabel = "Скопійовано!") {
  if (!customText) {
    return false;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(customText);
    } else {
      const ta = document.createElement("textarea");
      ta.value = customText;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }

    elements.copyBtn.disabled = true;
    window.setTimeout(() => {
      elements.copyBtn.disabled = !state.currentFortune;
    }, 1200);
    updateShareHint(elements, successLabel);
    return true;
  } catch {
    updateShareHint(elements, "Помилка копіювання");
    window.setTimeout(() => {
      elements.copyBtn.disabled = !state.currentFortune;
    }, 1200);
    return false;
  }
}

async function downloadImage(elements, state, providedFile = null, announce = true) {
  if (!state.currentFortune) {
    return;
  }

  const imageFile = providedFile || await buildFortuneImageFile({
    text: state.currentFortune,
    deckTitle: state.currentDeck?.title,
    deckId: state.currentDeck?.id,
    badge: state.currentDeck?.badge
  });
  if (!imageFile) {
    updateShareHint(elements, "Не вдалося згенерувати PNG-картку.");
    return;
  }

  const objectUrl = URL.createObjectURL(imageFile);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = imageFile.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

  if (announce) {
    updateShareHint(elements, "PNG-картку завантажено.");
  }
}

async function shareNative(elements, state) {
  if (!state.currentFortune) {
    return;
  }

  const imageFile = await buildFortuneImageFile({
    text: state.currentFortune,
    deckTitle: state.currentDeck?.title,
    deckId: state.currentDeck?.id,
    badge: state.currentDeck?.badge
  });
  const text = state.currentFortune;
  const url = window.location.href;

  if (navigator.share && imageFile && navigator.canShare?.({ files: [imageFile] })) {
    try {
      await navigator.share({
        title: "Передбачення ✨",
        text,
        url,
        files: [imageFile]
      });
      updateShareHint(elements, "Картинку відкрито в системному меню поширення.");
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Передбачення ✨",
        text,
        url
      });
      updateShareHint(elements, "Текст і посилання відкрито в системному меню поширення.");
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  }

  if (imageFile) {
    await downloadImage(elements, state, imageFile, false);
    updateShareHint(elements, "PNG збережено. Тепер можна поділитися ним вручну.");
    return;
  }

  const copied = await copyFortune(elements, state, buildShareText(state.currentFortune), "Текст для поширення скопійовано!");
  if (copied) {
    updateShareHint(elements, "Картинку не вдалося підготувати, тому текст скопійовано.");
  }
}

async function loadCurrentDeckFortunes(state) {
  if (state.selectedDeckId) {
    return loadFortunesByDeckId(state.selectedDeckId);
  }

  return loadActiveFortunes();
}

async function refreshDeckAppearance(elements, state, badgeEl) {
  const { deck } = await loadCurrentDeckFortunes(state);
  applyDeckAppearance(elements, badgeEl, state, deck);
  return deck;
}

function resetFortuneView(elements, state) {
  state.currentFortune = "";
  state.isRevealed = false;
  state.cardRotation = 0;

  if (elements.fortuneEl) {
    elements.fortuneEl.classList.remove("loading");
    elements.fortuneEl.textContent = DEFAULT_FORTUNE_TEXT;
  }

  if (elements.tarotCardInnerEl) {
    elements.tarotCardInnerEl.style.transitionDuration = "";
  }

  elements.tarotCardEl?.style.setProperty("--card-rotation", "0deg");
  elements.tarotCardEl?.removeAttribute("aria-busy");
  setShareEnabled(elements, false);
  updateSaveButtonState(elements, state);
}

async function showFortune(elements, state, badgeEl) {
  elements.fortuneEl.classList.add("loading");
  elements.tarotCardEl?.setAttribute("aria-busy", "true");
  setShareEnabled(elements, false);

  try {
    const { deck, fortunes } = await loadCurrentDeckFortunes(state);
    applyDeckAppearance(elements, badgeEl, state, deck);

    const text = pickRandomFortune(fortunes, deck) || "Немає доступних передбачень.";
    const canShare = Boolean(text) && !text.startsWith("Немає доступних");

    if (!state.isRevealed) {
      state.currentFortune = text;
      renderFortuneText(elements, state, text);
      await rotateCardTo(elements, state, 180, CARD_REVEAL_MS);
      triggerHaptic();
      triggerMagicBurst(elements);
      elements.fortuneEl.classList.remove("loading");
      elements.tarotCardEl?.removeAttribute("aria-busy");
      setShareEnabled(elements, canShare);
      updateSaveButtonState(elements, state);
      updateShareHint(elements, "Карта відкрита. Можна копіювати або поширювати передбачення.");
      state.isRevealed = true;
      return;
    }

    await rotateCardTo(elements, state, state.cardRotation + 180, CARD_HALF_SPIN_MS);
    state.currentFortune = text;
    renderFortuneText(elements, state, text);
    triggerHaptic();
    triggerMagicBurst(elements);
    await rotateCardTo(elements, state, state.cardRotation + 180, CARD_HALF_SPIN_MS);
    elements.fortuneEl.classList.remove("loading");
    elements.tarotCardEl?.removeAttribute("aria-busy");
    setShareEnabled(elements, canShare);
    updateSaveButtonState(elements, state);
    updateShareHint(elements, "Карта перевернулась і показала новий знак.");
  } catch (error) {
    console.error("Помилка завантаження передбачень:", error);
    state.currentFortune = "";
    elements.fortuneEl.classList.remove("loading");
    elements.fortuneEl.textContent = "Не вдалося завантажити передбачення. Спробуйте пізніше.";
    elements.tarotCardEl?.removeAttribute("aria-busy");
    setShareEnabled(elements, false);
    updateSaveButtonState(elements, state);
    updateShareHint(elements, "Поширення стане доступним після успішного завантаження передбачення.");
  }
}

function saveCurrentFortune(elements, state) {
  if (!state.currentFortune || isFortuneSaved(state.savedFortunes, state.currentFortune)) {
    updateSaveButtonState(elements, state);
    if (state.currentFortune) {
      updateShareHint(elements, "Це передбачення вже збережене.");
    }
    return;
  }

  state.savedFortunes = addSavedFortune(state.savedFortunes, state.currentFortune);
  persistAndRenderSaved(elements, state);
  updateShareHint(elements, "Передбачення збережено.");
}

function removeSavedById(elements, state, id) {
  state.savedFortunes = removeSavedFortune(state.savedFortunes, id);
  persistAndRenderSaved(elements, state);
  updateShareHint(elements, "Збережене передбачення видалено.");
}

function handleSavedListClick(elements, state, event) {
  const actionEl = event.target.closest("[data-saved-action]");
  const itemEl = event.target.closest(".saved-item");
  if (!actionEl || !itemEl) {
    return;
  }

  const item = state.savedFortunes.find((entry) => entry.id === itemEl.dataset.id);
  if (!item) {
    return;
  }

  if (actionEl.dataset.savedAction === "copy") {
    copyFortune(elements, state, item.text, "Збережене передбачення скопійовано!");
    return;
  }

  if (actionEl.dataset.savedAction === "remove") {
    removeSavedById(elements, state, item.id);
  }
}

function handleCardActivate(elements, state, badgeEl, event) {
  if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") {
    return;
  }

  if (event.type === "keydown") {
    event.preventDefault();
  }

  if (elements.saveBtn?.contains(event.target)) {
    return;
  }

  showFortune(elements, state, badgeEl);
}

async function selectDeck(elements, state, badgeEl, deckId) {
  state.selectedDeckId = deckId;
  resetFortuneView(elements, state);
  updateShareHint(elements, "Обрана тематична колода. Торкнись карти, щоб відкрити перше передбачення.");

  try {
    const deck = await refreshDeckAppearance(elements, state, badgeEl);
    setActiveView(elements, "main");
    closeMenu(elements);
    updateShareHint(elements, `Колода «${deck.name}» готова. Торкнись карти, щоб відкрити передбачення.`);
  } catch (error) {
    console.error("Помилка перемикання колоди:", error);
    updateShareHint(elements, "Не вдалося відкрити колоду. Спробуйте пізніше.");
  }
}

async function resetToActiveDeck(elements, state, badgeEl) {
  state.selectedDeckId = null;
  resetFortuneView(elements, state);
  setActiveView(elements, "main");
  closeMenu(elements);

  try {
    const deck = await refreshDeckAppearance(elements, state, badgeEl);
    updateShareHint(elements, `Повернуто активну колоду «${deck.name}». Торкнись карти, щоб відкрити передбачення.`);
  } catch (error) {
    console.error("Помилка скидання до активної колоди:", error);
    updateShareHint(elements, "Не вдалося повернути активну колоду. Спробуйте пізніше.");
  }
}

function bindEvents(elements, state, badgeEl) {
  elements.tarotCardEl?.addEventListener("click", (event) => handleCardActivate(elements, state, badgeEl, event));
  elements.tarotCardEl?.addEventListener("keydown", (event) => handleCardActivate(elements, state, badgeEl, event));
  elements.saveBtn?.addEventListener("click", () => saveCurrentFortune(elements, state));
  elements.copyBtn?.addEventListener("click", () => {
    copyFortune(elements, state).then((copied) => {
      if (copied) {
        updateShareHint(elements, "Текст передбачення скопійовано в буфер обміну.");
      }
    });
  });
  elements.shareBtn?.addEventListener("click", () => shareNative(elements, state));
  elements.downloadBtn?.addEventListener("click", () => downloadImage(elements, state));
  elements.themeToggleBtn?.addEventListener("click", () => toggleTheme(elements.themeToggleBtn));
  elements.menuToggleBtn?.addEventListener("click", () => openMenu(elements));
  elements.menuCloseBtn?.addEventListener("click", () => closeMenu(elements));
  elements.menuBackdropEl?.addEventListener("click", () => closeMenu(elements));
  elements.homeLinkBtn?.addEventListener("click", () => {
    resetToActiveDeck(elements, state, badgeEl);
  });
  elements.savedShortcutBtn?.addEventListener("click", () => setActiveView(elements, "saved"));
  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const targetView = event.currentTarget?.dataset.viewTarget;
      if (!targetView) {
        return;
      }

      setActiveView(elements, targetView);
      closeMenu(elements);
    });
  });
  elements.savedListEl?.addEventListener("click", (event) => handleSavedListClick(elements, state, event));
  elements.deckGalleryEl?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-deck-id]");
    if (!button) {
      return;
    }

    selectDeck(elements, state, badgeEl, button.dataset.deckId);
  });
}

export function bootstrapApp() {
  const elements = getElements();
  const state = createAppState();
  const badgeEl = createBadge(elements.cardShellEl);

  loadTheme(elements.themeToggleBtn);
  state.savedFortunes = loadSavedFortunes();
  renderSavedFortunes(elements, state);
  renderDeckGallery(elements.deckGalleryEl, listGalleryDecks());
  setActiveView(elements, "main");
  updateSaveButtonState(elements, state);
  bindEvents(elements, state, badgeEl);
  maybeShowMenuTooltip(elements);

  loadCurrentDeckFortunes(state)
    .then(({ deck }) => {
      applyDeckAppearance(elements, badgeEl, state, deck);
    })
    .catch(() => {});
}
