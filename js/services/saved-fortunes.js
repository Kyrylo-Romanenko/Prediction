const SAVED_STORAGE_KEY = "savedFortunes";
const MAX_SAVED_FORTUNES = 24;

export function loadSavedFortunes() {
  try {
    const raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedFortunes(items) {
  window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(items));
}

export function isFortuneSaved(items, text) {
  return Boolean(text) && items.some((item) => item.text === text);
}

export function addSavedFortune(items, text) {
  if (!text || isFortuneSaved(items, text)) {
    return items;
  }

  const nextItems = [
    {
      id: `${Date.now()}`,
      text,
      savedAt: new Date().toISOString()
    },
    ...items
  ];

  return nextItems.slice(0, MAX_SAVED_FORTUNES);
}

export function removeSavedFortune(items, id) {
  return items.filter((item) => item.id !== id);
}

export function formatSavedDate(isoString) {
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
