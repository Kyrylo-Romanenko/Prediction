import { getDeckById, resolveActiveDeck } from "../config/decks.js";
import { generateEmojiOracleFortune } from "./emoji-oracle.js";

const fortunesCache = new Map();

const deckGenerators = {
  "emoji-oracle": generateEmojiOracleFortune
};

export async function loadFortunesForDeck(deck) {
  if (!deck?.id) {
    throw new Error("Deck is required");
  }

  if (deck.generator) {
    return { deck, fortunes: [] };
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

export function pickRandomFortune(fortunes, deck = null) {
  const generator = deck?.generator ? deckGenerators[deck.generator] : null;
  if (generator) {
    return generator();
  }

  if (!Array.isArray(fortunes) || fortunes.length === 0) {
    return null;
  }

  const item = fortunes[Math.floor(Math.random() * fortunes.length)];
  return item?.text || null;
}
