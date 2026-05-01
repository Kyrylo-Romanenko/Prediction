const NFC_ANIMATION_IDS = [
  "float",
  "materialize",
  "deck-draw",
  "fall",
  "portal",
  "particle-build",
  "light-burst",
  "levitate"
];

const DEFAULT_TIMING = {
  easing: "cubic-bezier(.18,.78,.18,1)",
  fill: "none"
};

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function playElementAnimation(element, keyframes, options) {
  if (!element?.animate) {
    await wait(options.duration || 0);
    return;
  }

  const animation = element.animate(keyframes, { ...DEFAULT_TIMING, ...options });

  try {
    await Promise.race([
      animation.finished,
      wait((options.duration || 0) + 80)
    ]);
  } catch {
    await wait(options.duration || 0);
  } finally {
    animation.cancel();
  }
}

function createFxLayer(variantId) {
  const fxEl = document.createElement("div");
  fxEl.className = `nfc-fx nfc-fx--${variantId}`;
  fxEl.setAttribute("aria-hidden", "true");

  fxEl.innerHTML = `
    <span class="nfc-fx__portal"></span>
    <span class="nfc-fx__deck-card nfc-fx__deck-card--one"></span>
    <span class="nfc-fx__deck-card nfc-fx__deck-card--two"></span>
    <span class="nfc-fx__deck-card nfc-fx__deck-card--three"></span>
    ${Array.from({ length: 14 }, (_, index) => `<span class="nfc-fx__spark nfc-fx__spark--${index + 1}"></span>`).join("")}
  `;

  document.body.appendChild(fxEl);
  return fxEl;
}

function resolveVariantId(value) {
  if (!value || value === "nfc" || value === "random" || value === "master") {
    return NFC_ANIMATION_IDS[Math.floor(Math.random() * NFC_ANIMATION_IDS.length)];
  }

  if (/^\d+$/.test(value)) {
    const index = Number(value) - 1;
    return NFC_ANIMATION_IDS[index] || null;
  }

  return NFC_ANIMATION_IDS.includes(value) ? value : null;
}

export function getNfcAnimationFromUrl(location = window.location) {
  const params = new URLSearchParams(location.search);
  const value = params.get("nfc") || params.get("nfcAnimation") || params.get("mode");

  if (value || params.has("nfc") || params.has("nfcAnimation") || params.has("mode")) {
    return resolveVariantId(value);
  }

  if (location.hash === "#nfc") {
    return resolveVariantId("random");
  }

  const hashMatch = location.hash.match(/^#nfc-(.+)$/);
  return hashMatch ? resolveVariantId(hashMatch[1]) : null;
}

function getEnterKeyframes(variantId) {
  const presets = {
    float: {
      shell: [
        { opacity: 0, transform: "translate3d(0, 34px, 0) scale(.9)", filter: "blur(9px) brightness(.82)" },
        { opacity: 1, transform: "translate3d(0, -18px, 0) scale(1.04)", filter: "blur(0) brightness(1.07)", offset: .5 },
        { opacity: 1, transform: "translate3d(0, 10px, 0) scale(.99)", filter: "brightness(1)", offset: .74 },
        { opacity: 1, transform: "translate3d(0, -6px, 0) scale(1)", filter: "brightness(1)" }
      ],
      inner: [
        { transform: "rotateY(0deg) rotateX(0deg)" },
        { transform: "rotateY(18deg) rotateX(5deg)", offset: .5 },
        { transform: "rotateY(-8deg) rotateX(-2deg)", offset: .74 },
        { transform: "rotateY(0deg) rotateX(0deg)" }
      ],
      duration: 1900
    },
    materialize: {
      shell: [
        { opacity: 0, transform: "scale(.34) rotateZ(-18deg)", filter: "blur(34px) brightness(1.75) saturate(1.5)" },
        { opacity: .45, transform: "scale(.78) rotateZ(10deg)", filter: "blur(18px) brightness(1.42) saturate(1.32)", offset: .42 },
        { opacity: .9, transform: "scale(1.18) rotateZ(-3deg)", filter: "blur(5px) brightness(1.2) saturate(1.12)", offset: .76 },
        { opacity: 1, transform: "scale(1) rotateZ(0deg)", filter: "blur(0) brightness(1) saturate(1)" }
      ],
      inner: [
        { transform: "rotateY(-42deg) rotateX(10deg)" },
        { transform: "rotateY(16deg) rotateX(-4deg)", offset: .74 },
        { transform: "rotateY(0deg) rotateX(0deg)" }
      ],
      duration: 2050
    },
    "deck-draw": {
      shell: [
        { opacity: 0, transform: "translate3d(-48vw, 44px, 0) scale(.72) rotateZ(-18deg)", filter: "blur(10px)" },
        { opacity: 1, transform: "translate3d(-30vw, 18px, 0) scale(.82) rotateZ(-12deg)", filter: "blur(5px)", offset: .28 },
        { opacity: 1, transform: "translate3d(-8vw, -8px, 0) scale(.98) rotateZ(-4deg)", filter: "blur(1px)", offset: .7 },
        { opacity: 1, transform: "translate3d(0, -4px, 0) scale(1.04) rotateZ(1deg)", filter: "blur(0)", offset: .9 },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1) rotateZ(0deg)" }
      ],
      inner: [
        { transform: "rotateY(0deg) rotateX(0deg)" },
        { transform: "rotateY(-28deg) rotateX(7deg)", offset: .55 },
        { transform: "rotateY(8deg) rotateX(-2deg)", offset: .9 },
        { transform: "rotateY(0deg) rotateX(0deg)" }
      ],
      duration: 2150
    },
    fall: {
      shell: [
        { opacity: 0, transform: "translate3d(0, -58vh, 0) scale(.86) rotateX(34deg) rotateZ(-16deg)", filter: "blur(10px) brightness(.82)" },
        { opacity: 1, transform: "translate3d(0, 28px, 0) scale(1.08) rotateX(-8deg) rotateZ(7deg)", filter: "blur(0) brightness(1.08)", offset: .66 },
        { opacity: 1, transform: "translate3d(0, -12px, 0) scale(.98) rotateX(2deg) rotateZ(-2deg)", offset: .84 },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1) rotateX(0deg) rotateZ(0deg)" }
      ],
      inner: [
        { transform: "rotateY(0deg) rotateX(0deg)" },
        { transform: "rotateY(30deg) rotateX(-8deg)", offset: .66 },
        { transform: "rotateY(-8deg) rotateX(3deg)", offset: .84 },
        { transform: "rotateY(0deg) rotateX(0deg)" }
      ],
      duration: 1850
    },
    portal: {
      shell: [
        { opacity: 0, transform: "scale(.22) rotateZ(34deg)", filter: "blur(24px) brightness(1.55)" },
        { opacity: .65, transform: "scale(.76) rotateZ(16deg)", filter: "blur(10px) brightness(1.34)", offset: .38 },
        { opacity: 1, transform: "scale(1.22) rotateZ(-8deg)", filter: "blur(3px) brightness(1.2)", offset: .74 },
        { opacity: 1, transform: "scale(1) rotateZ(0deg)", filter: "blur(0) brightness(1)" }
      ],
      inner: [
        { transform: "rotateY(-70deg) rotateX(14deg)" },
        { transform: "rotateY(18deg) rotateX(-4deg)", offset: .74 },
        { transform: "rotateY(0deg) rotateX(0deg)" }
      ],
      duration: 2200
    },
    "particle-build": {
      shell: [
        { opacity: 0, transform: "scale(.18)", filter: "blur(42px) saturate(1.8) brightness(1.45)" },
        { opacity: .18, transform: "scale(.54)", filter: "blur(28px) saturate(1.55) brightness(1.3)", offset: .35 },
        { opacity: .72, transform: "scale(.94)", filter: "blur(9px) saturate(1.25) brightness(1.14)", offset: .72 },
        { opacity: 1, transform: "scale(1.06)", filter: "blur(2px) saturate(1.08)", offset: .9 },
        { opacity: 1, transform: "scale(1)", filter: "blur(0) saturate(1)" }
      ],
      inner: [
        { transform: "rotateY(0deg) rotateZ(-3deg)" },
        { transform: "rotateY(0deg) rotateZ(2deg)", offset: .72 },
        { transform: "rotateY(0deg)" }
      ],
      duration: 2300
    },
    "light-burst": {
      shell: [
        { opacity: 0, transform: "scale(.74)", filter: "blur(18px) brightness(2.1)" },
        { opacity: 1, transform: "scale(1.22)", filter: "blur(2px) brightness(1.48)", offset: .32 },
        { opacity: 1, transform: "scale(.96)", filter: "blur(0) brightness(.96)", offset: .62 },
        { opacity: 1, transform: "scale(1)", filter: "blur(0) brightness(1)" }
      ],
      inner: [
        { transform: "rotateY(0deg) rotateX(0deg)" },
        { transform: "rotateY(24deg) rotateX(6deg)", offset: .42 },
        { transform: "rotateY(-6deg) rotateX(-2deg)", offset: .7 },
        { transform: "rotateY(0deg) rotateX(0deg)" }
      ],
      duration: 1600
    },
    levitate: {
      shell: [
        { opacity: 0, transform: "translate3d(26vw, 36px, 0) scale(.82) rotateZ(9deg)", filter: "blur(12px)" },
        { opacity: 1, transform: "translate3d(10vw, -22px, 0) scale(1.02) rotateZ(-5deg)", filter: "blur(0)", offset: .42 },
        { opacity: 1, transform: "translate3d(-5vw, 8px, 0) scale(1.03) rotateZ(3deg)", offset: .72 },
        { opacity: 1, transform: "translate3d(0, -7px, 0) scale(1) rotateZ(0deg)", filter: "none" }
      ],
      inner: [
        { transform: "rotateY(0deg) rotateX(0deg)" },
        { transform: "rotateY(-24deg) rotateX(6deg)", offset: .42 },
        { transform: "rotateY(12deg) rotateX(-3deg)", offset: .72 },
        { transform: "rotateY(0deg) rotateX(0deg)" }
      ],
      duration: 2050
    }
  };

  return presets[variantId] || presets.float;
}

function getRevealKeyframes(variantId) {
  const shell = [
    { transform: "translate3d(0, -6px, 0) scale(1)", filter: "brightness(1.04) drop-shadow(0 0 24px rgba(201,176,122,0.2))" },
    { transform: "translate3d(0, -10px, 0) scale(1.04)", filter: "brightness(1.14) drop-shadow(0 0 38px rgba(201,176,122,0.28))", offset: .44 },
    { transform: "translate3d(0, 0, 0) scale(1)", filter: "none" }
  ];

  const strongerShell = [
    { transform: "translate3d(0, -8px, 0) scale(1.04)", filter: "brightness(1.12) drop-shadow(0 0 30px rgba(201,176,122,0.26))" },
    { transform: "translate3d(0, -18px, 0) scale(1.16)", filter: "brightness(1.22) drop-shadow(0 0 46px rgba(201,176,122,0.34))", offset: .38 },
    { transform: "translate3d(0, 0, 0) scale(1)", filter: "none" }
  ];

  return {
    shell: ["portal", "light-burst", "particle-build"].includes(variantId) ? strongerShell : shell,
    inner: [
      { transform: "rotateY(0deg) rotateX(0deg)" },
      { transform: "rotateY(112deg) rotateX(3deg)", offset: .54 },
      { transform: "rotateY(180deg) rotateX(0deg)" }
    ],
    duration: ["deck-draw", "fall"].includes(variantId) ? 1050 : 1180
  };
}

export async function playNfcCardAnimation(elements, variantId, { onSelect } = {}) {
  const resolvedVariantId = NFC_ANIMATION_IDS.includes(variantId) ? variantId : resolveVariantId("random");
  const fxEl = createFxLayer(resolvedVariantId);
  const enter = getEnterKeyframes(resolvedVariantId);
  const reveal = getRevealKeyframes(resolvedVariantId);

  document.body.dataset.nfcVariant = resolvedVariantId;
  elements.tarotCardEl?.classList.add("tarot-card--nfc-armed");
  elements.cardShellEl?.classList.add("card-shell--nfc-active");

  try {
    await Promise.all([
      playElementAnimation(elements.cardShellEl, enter.shell, { duration: enter.duration, easing: "cubic-bezier(.18,.78,.18,1)" }),
      playElementAnimation(elements.tarotCardInnerEl, enter.inner, { duration: enter.duration, easing: "cubic-bezier(.18,.78,.18,1)" })
    ]);

    await onSelect?.();

    await Promise.all([
      playElementAnimation(elements.cardShellEl, reveal.shell, { duration: reveal.duration, easing: "cubic-bezier(.16,.82,.18,1)" }),
      playElementAnimation(elements.tarotCardInnerEl, reveal.inner, { duration: reveal.duration, easing: "cubic-bezier(.16,.82,.18,1)" })
    ]);
  } finally {
    elements.cardShellEl?.classList.remove("card-shell--nfc-active");
    elements.tarotCardEl?.classList.remove("tarot-card--nfc-armed");
    fxEl.remove();
    delete document.body.dataset.nfcVariant;
  }
}

export function listNfcAnimationIds() {
  return [...NFC_ANIMATION_IDS];
}
