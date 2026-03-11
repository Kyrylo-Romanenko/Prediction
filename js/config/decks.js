import { DECK_CATALOG } from "./deck-catalog.js";

const DEFAULT_DECK_ID = "default";

function isWithinMonthDayRange(date, start, end) {
  if (!start || !end) {
    return false;
  }

  const current = date.getMonth() * 100 + date.getDate();
  const startValue = start.month * 100 + start.day;
  const endValue = end.month * 100 + end.day;

  if (startValue <= endValue) {
    return current >= startValue && current <= endValue;
  }

  return current >= startValue || current <= endValue;
}

export function getDeckById(deckId) {
  return DECK_CATALOG[deckId] || DECK_CATALOG[DEFAULT_DECK_ID];
}

export function resolveActiveDeck(today = new Date()) {
  const timedDeck = Object.values(DECK_CATALOG)
    .filter((deck) => {
      if (deck.id === DEFAULT_DECK_ID) {
        return false;
      }

      return isWithinMonthDayRange(today, deck.activeFrom, deck.activeTo);
    })
    .sort((left, right) => {
      const priorityDiff = (right.priority || 0) - (left.priority || 0);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return 0;
    })[0];

  return timedDeck || getDeckById(DEFAULT_DECK_ID);
}

export function listGalleryDecks() {
  return Object.values(DECK_CATALOG)
    .filter((deck) => deck.showInGallery !== false)
    .sort((left, right) => {
      const leftOrder = left.galleryOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.galleryOrder ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.name.localeCompare(right.name, "uk");
    });
}
