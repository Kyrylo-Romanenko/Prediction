(() => {
  function getSeasonInfo(today = new Date()) {
    const m = today.getMonth();
    const d = today.getDate();

    if (m === 11 && d >= 1 && d <= 31) {
      return {
        key: "xmas",
        url: new URL("./data/fortunes_christmas.json", window.location.href).toString(),
        badge: "🎄"
      };
    }

    if (m === 3 && d === 1) {
      return {
        key: "april",
        url: new URL("./data/fortunes_1april.json", window.location.href).toString(),
        badge: "😄"
      };
    }

    if (m === 1 && d === 13) {
      return {
        key: "13february",
        url: new URL("./data/13february.json", window.location.href).toString(),
        badge: "❤️"
      };
    }

    return {
      key: "default",
      url: new URL("./data/fortunes.json", window.location.href).toString(),
      badge: ""
    };
  }

  let cacheKey = null;
  let fortunesCache = null;
  let currentFortune = "";

  const fortuneEl = document.getElementById("fortune-text");
  const saveBtn = document.getElementById("save-btn");
  const copyBtn = document.getElementById("copy-btn");
  const shareBtn = document.getElementById("share-btn");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const homeLinkBtn = document.getElementById("home-link");
  const shareHintEl = document.getElementById("share-hint");
  const shareLinkEls = Array.from(document.querySelectorAll("[data-share-target]"));
  const tarotCardEl = document.getElementById("tarot-card");
  const tarotCardInnerEl = tarotCardEl?.querySelector(".tarot-card__inner");
  const menuToggleBtn = document.getElementById("menu-toggle");
  const menuCloseBtn = document.getElementById("menu-close");
  const menuBackdropEl = document.getElementById("menu-backdrop");
  const siteMenuEl = document.getElementById("site-menu");
  const viewButtons = Array.from(document.querySelectorAll("[data-view-target]"));
  const viewMainEl = document.getElementById("view-main");
  const viewSavedEl = document.getElementById("view-saved");
  const savedShortcutBtn = document.getElementById("saved-shortcut");
  const savedShortcutCountEl = document.getElementById("saved-shortcut-count");
  const savedListEl = document.getElementById("saved-list");
  const savedCountEl = document.getElementById("saved-count");
  const savedEmptyEl = document.getElementById("saved-empty");

  let isRevealed = false;
  let cardRotation = 0;
  const CARD_REVEAL_MS = 900;
  const CARD_HALF_SPIN_MS = 560;
  const SAVED_STORAGE_KEY = "savedFortunes";
  let savedFortunes = [];

  const cardEl = document.querySelector(".card-shell");
  const badgeEl = document.createElement("div");
  badgeEl.className = "season-badge";
  cardEl?.insertBefore(badgeEl, cardEl.firstChild);

  function applyTheme(theme) {
    document.body.dataset.theme = theme === "light" ? "light" : "dark";
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = `<span aria-hidden="true">${document.body.dataset.theme === "light" ? "◑" : "◐"}</span>`;
    }
    themeToggleBtn?.setAttribute(
      "aria-label",
      document.body.dataset.theme === "light" ? "Увімкнути темну тему" : "Увімкнути світлу тему"
    );
    themeToggleBtn?.setAttribute(
      "title",
      document.body.dataset.theme === "light" ? "Увімкнути темну тему" : "Увімкнути світлу тему"
    );
  }

  function loadTheme() {
    const savedTheme = window.localStorage.getItem("theme");
    applyTheme(savedTheme || "dark");
  }

  function toggleTheme() {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    window.localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  }

  function setShareEnabled(enabled) {
    shareBtn.disabled = !enabled;
    saveBtn.disabled = !enabled;
    copyBtn.disabled = !enabled;
    shareLinkEls.forEach((button) => {
      button.disabled = !enabled;
    });
  }

  function updateShareHint(message) {
    if (shareHintEl) {
      shareHintEl.textContent = message;
    }
  }

  function openMenu() {
    siteMenuEl?.removeAttribute("hidden");
    menuBackdropEl?.removeAttribute("hidden");
    menuToggleBtn?.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    siteMenuEl?.setAttribute("hidden", "");
    menuBackdropEl?.setAttribute("hidden", "");
    menuToggleBtn?.setAttribute("aria-expanded", "false");
  }

  function setActiveView(viewName) {
    const isSaved = viewName === "saved";
    viewMainEl?.classList.toggle("is-active", !isSaved);
    viewSavedEl?.classList.toggle("is-active", isSaved);

    if (isSaved) {
      viewMainEl?.setAttribute("hidden", "");
      viewSavedEl?.removeAttribute("hidden");
    } else {
      viewSavedEl?.setAttribute("hidden", "");
      viewMainEl?.removeAttribute("hidden");
    }

    viewButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.viewTarget === viewName);
    });
  }

  function waitForTransformTransition() {
    return new Promise((resolve) => {
      if (!tarotCardInnerEl) {
        resolve();
        return;
      }

      const handleTransitionEnd = (event) => {
        if (event.propertyName !== "transform") return;
        tarotCardInnerEl.removeEventListener("transitionend", handleTransitionEnd);
        resolve();
      };

      tarotCardInnerEl.addEventListener("transitionend", handleTransitionEnd);
    });
  }

  async function rotateCardTo(nextRotation, durationMs) {
    cardRotation = nextRotation;

    if (tarotCardInnerEl) {
      tarotCardInnerEl.style.transitionDuration = `${durationMs}ms`;
    }

    requestAnimationFrame(() => {
      tarotCardEl?.style.setProperty("--card-rotation", `${cardRotation}deg`);
    });

    await waitForTransformTransition();
  }

  function buildShareText() {
    if (!currentFortune) return "";
    return `${currentFortune}\n\nПередбачення ✨ ${window.location.href}`;
  }

  function loadSavedFortunes() {
    try {
      const raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      savedFortunes = Array.isArray(parsed) ? parsed : [];
    } catch {
      savedFortunes = [];
    }
  }

  function persistSavedFortunes() {
    window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedFortunes));
  }

  function isCurrentFortuneSaved() {
    return Boolean(currentFortune) && savedFortunes.some((item) => item.text === currentFortune);
  }

  function updateSaveButtonState() {
    const active = isCurrentFortuneSaved();
    saveBtn?.classList.toggle("is-active", active);
    saveBtn?.setAttribute("aria-label", active ? "Передбачення збережено" : "Зберегти передбачення");
    saveBtn?.setAttribute("title", active ? "Передбачення збережено" : "Зберегти передбачення");
  }

  function formatSavedDate(isoString) {
    try {
      return new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(isoString));
    } catch {
      return "";
    }
  }

  function renderSavedFortunes() {
    if (!savedListEl || !savedCountEl || !savedEmptyEl || !savedShortcutCountEl) return;

    savedCountEl.textContent = String(savedFortunes.length);
    savedShortcutCountEl.textContent = String(savedFortunes.length);
    savedListEl.innerHTML = "";

    if (!savedFortunes.length) {
      savedEmptyEl.hidden = false;
      return;
    }

    savedEmptyEl.hidden = true;

    savedFortunes.forEach((item) => {
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
      savedListEl.appendChild(li);
    });
  }

  function saveCurrentFortune() {
    if (!currentFortune || isCurrentFortuneSaved()) {
      updateSaveButtonState();
      if (currentFortune) {
        updateShareHint("Це передбачення вже збережене.");
      }
      return;
    }

    savedFortunes.unshift({
      id: `${Date.now()}`,
      text: currentFortune,
      savedAt: new Date().toISOString()
    });

    savedFortunes = savedFortunes.slice(0, 24);
    persistSavedFortunes();
    renderSavedFortunes();
    updateSaveButtonState();
    updateShareHint("Передбачення збережено.");
  }

  function removeSavedFortune(id) {
    savedFortunes = savedFortunes.filter((item) => item.id !== id);
    persistSavedFortunes();
    renderSavedFortunes();
    updateSaveButtonState();
    updateShareHint("Збережене передбачення видалено.");
  }

  function buildShareUrl(target) {
    const text = buildShareText();
    const pageUrl = window.location.href;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(pageUrl);

    switch (target) {
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      case "x":
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentFortune)}&url=${encodedUrl}`;
      case "threads":
        return `https://www.threads.net/intent/post?text=${encodedText}`;
      default:
        return pageUrl;
    }
  }

  async function loadFortunes() {
    const { key, url, badge } = getSeasonInfo();

    if (badge) {
      badgeEl.textContent = badge;
      badgeEl.style.display = "inline-flex";
    } else {
      badgeEl.style.display = "none";
    }

    if (fortunesCache && cacheKey === key) return fortunesCache;

    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Невірний формат даних");

    cacheKey = key;
    fortunesCache = data;
    return fortunesCache;
  }

  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickFortune(fortunes) {
    if (!fortunes.length) return null;
    const item = getRandomItem(fortunes);
    return item?.text || null;
  }

  async function showFortune() {
    fortuneEl.classList.add("loading");
    tarotCardEl?.setAttribute("aria-busy", "true");
    setShareEnabled(false);

    try {
      const fortunes = await loadFortunes();
      const text = pickFortune(fortunes) || "Немає доступних передбачень.";
      const canShare = Boolean(text) && !text.startsWith("Немає доступних");

      if (!isRevealed) {
        currentFortune = text;
        fortuneEl.textContent = text;
        await rotateCardTo(180, CARD_REVEAL_MS);
        tarotCardEl?.classList.add("is-front-facing");
        fortuneEl.classList.remove("loading");
        tarotCardEl?.removeAttribute("aria-busy");
        setShareEnabled(canShare);
        updateSaveButtonState();
        updateShareHint("Карта відкрита. Можна копіювати або поширювати передбачення.");
        isRevealed = true;
        return;
      }

      await rotateCardTo(cardRotation + 180, CARD_HALF_SPIN_MS);
      tarotCardEl?.classList.remove("is-front-facing");
      currentFortune = text;
      fortuneEl.textContent = text;
      await rotateCardTo(cardRotation + 180, CARD_HALF_SPIN_MS);
      tarotCardEl?.classList.add("is-front-facing");
      fortuneEl.classList.remove("loading");
      tarotCardEl?.removeAttribute("aria-busy");
      setShareEnabled(canShare);
      updateSaveButtonState();
      updateShareHint("Карта перевернулась і показала новий знак.");
    } catch (err) {
      console.error("Помилка завантаження передбачень:", err);
      currentFortune = "";
      fortuneEl.classList.remove("loading");
      fortuneEl.textContent = "Не вдалося завантажити передбачення. Спробуйте пізніше.";
      tarotCardEl?.removeAttribute("aria-busy");
      setShareEnabled(false);
      updateSaveButtonState();
      updateShareHint("Поширення стане доступним після успішного завантаження передбачення.");
    }
  }

  function handleCardActivate(event) {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") {
      return;
    }

    if (event.type === "keydown") {
      event.preventDefault();
    }

    if (saveBtn?.contains(event.target)) {
      return;
    }

    showFortune();
  }

  async function copyFortune(customText = currentFortune, successLabel = "Скопійовано!") {
    if (!customText) return false;

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

      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.disabled = !currentFortune;
      }, 1200);
      updateShareHint(successLabel);
      return true;
    } catch {
      updateShareHint("Помилка копіювання");
      setTimeout(() => {
        copyBtn.disabled = !currentFortune;
      }, 1200);
      return false;
    }
  }

  async function shareNative() {
    if (!currentFortune) return;

    const shareData = {
      title: "Передбачення ✨",
      text: currentFortune,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        updateShareHint("Передбачення відправлено через системне меню поширення.");
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    const copied = await copyFortune(buildShareText(), "Текст для поширення скопійовано!");
    if (copied) {
      updateShareHint("Текст скопійовано. Можна вставити його у будь-який застосунок.");
    }
  }

  async function handleShareLinkClick(event) {
    const target = event.currentTarget?.dataset.shareTarget;
    if (!target || !currentFortune) return;

    if (target === "instagram") {
      const copied = await copyFortune(buildShareText(), "Скопійовано для Instagram!");
      if (copied) {
        updateShareHint("Instagram не підтримує прямий веб-шеринг тексту, тому текст скопійовано для вставки вручну.");
      }
      return;
    }

    const shareUrl = buildShareUrl(target);
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    updateShareHint(`Відкрито вікно поширення: ${event.currentTarget.getAttribute("aria-label")}.`);
  }

  function handleSavedListClick(event) {
    const actionEl = event.target.closest("[data-saved-action]");
    const itemEl = event.target.closest(".saved-item");
    if (!actionEl || !itemEl) return;

    const item = savedFortunes.find((entry) => entry.id === itemEl.dataset.id);
    if (!item) return;

    if (actionEl.dataset.savedAction === "copy") {
      copyFortune(item.text, "Збережене передбачення скопійовано!");
      return;
    }

    if (actionEl.dataset.savedAction === "remove") {
      removeSavedFortune(item.id);
    }
  }

  function handleViewChange(event) {
    const targetView = event.currentTarget?.dataset.viewTarget;
    if (!targetView) return;
    setActiveView(targetView);
    closeMenu();
  }

  function openSavedView() {
    setActiveView("saved");
  }

  function openMainView() {
    setActiveView("main");
    closeMenu();
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    loadSavedFortunes();
    renderSavedFortunes();
    setActiveView("main");
    loadFortunes().catch(() => {});
    tarotCardEl?.addEventListener("click", handleCardActivate);
    tarotCardEl?.addEventListener("keydown", handleCardActivate);
    saveBtn.addEventListener("click", saveCurrentFortune);
    copyBtn.addEventListener("click", () => {
      copyFortune().then((copied) => {
        if (copied) {
          updateShareHint("Текст передбачення скопійовано в буфер обміну.");
        }
      });
    });
    shareBtn.addEventListener("click", shareNative);
    themeToggleBtn?.addEventListener("click", toggleTheme);
    menuToggleBtn?.addEventListener("click", openMenu);
    menuCloseBtn?.addEventListener("click", closeMenu);
    menuBackdropEl?.addEventListener("click", closeMenu);
    homeLinkBtn?.addEventListener("click", openMainView);
    savedShortcutBtn?.addEventListener("click", openSavedView);
    viewButtons.forEach((button) => {
      button.addEventListener("click", handleViewChange);
    });
    shareLinkEls.forEach((button) => {
      button.addEventListener("click", handleShareLinkClick);
    });
    savedListEl?.addEventListener("click", handleSavedListClick);
    updateSaveButtonState();
  });
})();
