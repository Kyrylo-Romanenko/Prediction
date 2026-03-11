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
  const timedDeck = Object.values(DECK_CATALOG).find((deck) => {
    if (deck.id === DEFAULT_DECK_ID) {
      return false;
    }

    return isWithinMonthDayRange(today, deck.activeFrom, deck.activeTo);
  });

  return timedDeck || getDeckById(DEFAULT_DECK_ID);
}

export function listGalleryDecks() {
  return Object.values(DECK_CATALOG).filter((deck) => deck.showInGallery !== false);
}
