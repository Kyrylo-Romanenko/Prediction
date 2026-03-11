import { renderBackDesign } from "./back-design.js";
import { applyDeckBackBackground } from "./deck-appearance.js";

function buildDeckPreview(deck) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "deck-gallery__item";
  button.dataset.deckId = deck.id;
  button.setAttribute("aria-label", `Відкрити колоду ${deck.name}`);

  button.innerHTML = `
    <div class="deck-gallery__card-shell">
      <div class="deck-gallery__badge"${deck.badge ? "" : ' hidden'}>${deck.badge || ""}</div>
      <article class="deck-gallery__card">
        <div class="deck-gallery__face tarot-card__face tarot-card__face--back">
          <div class="tarot-card__ornament tarot-card__ornament--outer"></div>
          <div class="tarot-card__ornament tarot-card__ornament--inner"></div>
          <div class="tarot-card__sigil-layer" aria-hidden="true"></div>
          <p class="tarot-card__label">${deck.title || "Fortune"}</p>
        </div>
      </article>
    </div>
    <div class="deck-gallery__copy">
      <div class="deck-gallery__name">${deck.name}</div>
      <p class="deck-gallery__description">${deck.description || ""}</p>
    </div>
  `;

  const backFace = button.querySelector(".tarot-card__face--back");
  const iconLayer = button.querySelector(".tarot-card__sigil-layer");
  applyDeckBackBackground(backFace, deck.backDesign?.background);
  renderBackDesign(iconLayer, backFace, deck.backDesign);

  return button;
}

export function renderDeckGallery(container, decks) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  decks.forEach((deck) => {
    container.appendChild(buildDeckPreview(deck));
  });
}
