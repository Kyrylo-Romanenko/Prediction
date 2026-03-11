import { getDeckById, resolveActiveDeck } from "../config/decks.js";

const fortunesCache = new Map();

export async function loadFortunesForDeck(deck) {
  if (!deck?.id) {
    throw new Error("Deck is required");
  }

  if (fortunesCache.has(deck.id)) {
    return { deck, fortunes: fortunesCache.get(deck.id) };
  }

  const response = await fetch(deck.dataUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("Invalid fortunes payload");
  }

  fortunesCache.set(deck.id, payload);
  return { deck, fortunes: payload };
}

export async function loadFortunesByDeckId(deckId) {
  return loadFortunesForDeck(getDeckById(deckId));
}

export async function loadActiveFortunes(today = new Date()) {
  return loadFortunesForDeck(resolveActiveDeck(today));
}

export function pickRandomFortune(fortunes) {
  if (!Array.isArray(fortunes) || fortunes.length === 0) {
    return null;
  }

  const item = fortunes[Math.floor(Math.random() * fortunes.length)];
  return item?.text || null;
}
