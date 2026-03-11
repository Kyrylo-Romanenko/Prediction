function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      return;
    }

    if (line) {
      lines.push(line);
    }
    line = word;
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

function fitTextBlock(ctx, text, maxWidth, initialFontSize, minFontSize) {
  let fontSize = initialFontSize;
  let lines = [];

  while (fontSize >= minFontSize) {
    ctx.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
    lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= 5) {
      break;
    }
    fontSize -= 4;
  }

  return { fontSize, lines };
}

function getShareThemePalette(theme) {
  if (theme === "light") {
    return {
      backgroundTop: "#F7F1E7",
      backgroundBottom: "#EFE5D6",
      haloStart: "rgba(139,106,45,0.18)",
      haloEnd: "rgba(139,106,45,0)",
      topAuraStart: "rgba(151,175,217,0.18)",
      topAuraEnd: "rgba(151,175,217,0)",
      starPrimary: "#8B6A2D",
      starSecondary: "#5B6475",
      cardFill: "rgba(255,249,241,0.97)",
      cardStroke: "rgba(112,127,161,0.16)",
      frameOuter: "rgba(165,136,78,0.22)",
      frameInner: "rgba(139,106,45,0.24)",
      frameDash: "rgba(139,106,45,0.12)",
      innerGlowStart: "rgba(139,106,45,0.12)",
      innerGlowMid: "rgba(151,175,217,0.08)",
      titlePillFill: "rgba(255,249,241,0.78)",
      titlePillStroke: "rgba(139,106,45,0.22)",
      accent: "#8B6A2D",
      textPrimary: "#1B1B1D",
      textSecondary: "rgba(27,27,29,0.82)",
      footerText: "rgba(91,100,117,0.95)",
      footerLine: "rgba(139,106,45,0.18)",
      shadow: "rgba(139,106,45,0.12)"
    };
  }

  return {
    backgroundTop: "#0F1420",
    backgroundBottom: "#07090D",
    haloStart: "rgba(201,176,122,0.22)",
    haloEnd: "rgba(201,176,122,0)",
    topAuraStart: "rgba(79,101,174,0.18)",
    topAuraEnd: "rgba(79,101,174,0)",
    starPrimary: "#C9B07A",
    starSecondary: "#EDF1F7",
    cardFill: "rgba(12,15,22,0.97)",
    cardStroke: "rgba(203,215,255,0.16)",
    frameOuter: "rgba(126,147,207,0.22)",
    frameInner: "rgba(72,89,144,0.26)",
    frameDash: "rgba(201,176,122,0.12)",
    innerGlowStart: "rgba(201,176,122,0.14)",
    innerGlowMid: "rgba(62,90,160,0.08)",
    titlePillFill: "rgba(14,18,27,0.72)",
    titlePillStroke: "rgba(201,176,122,0.24)",
    accent: "#C9B07A",
    textPrimary: "#EDF1F7",
    textSecondary: "rgba(237,241,247,0.82)",
    footerText: "rgba(147,160,181,0.95)",
    footerLine: "rgba(201,176,122,0.18)",
    shadow: "rgba(0,0,0,0.28)"
  };
}

function drawEmojiOracleBlock(ctx, text, canvasWidth, centerY, palette) {
  const [topLine = "", emojiLine = "", bottomLine = ""] = text.split("\n");

  ctx.textAlign = "center";
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 18;

  ctx.fillStyle = palette.accent;
  ctx.font = '600 40px Georgia, "Times New Roman", serif';
  ctx.fillText("MYSTIC", canvasWidth / 2, centerY - 232);

  ctx.fillStyle = palette.textPrimary;
  ctx.font = '700 62px Georgia, "Times New Roman", serif';
  ctx.fillText(topLine, canvasWidth / 2, centerY - 72);

  ctx.fillStyle = palette.textPrimary;
  ctx.font = '700 146px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(emojiLine, canvasWidth / 2, centerY + 74);

  ctx.fillStyle = palette.textSecondary;
  ctx.font = '700 58px Georgia, "Times New Roman", serif';
  ctx.fillText(bottomLine, canvasWidth / 2, centerY + 176);

  ctx.shadowBlur = 0;
}

function drawStar(ctx, x, y, radius, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(radius, radius);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI / 4) * i;
    const outer = i % 2 === 0 ? 1 : 0.42;
    const px = Math.cos(angle) * outer;
    const py = Math.sin(angle) * outer;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export async function buildFortuneImageFile(options) {
  const { text, deckTitle = "Fortune", deckId = "", badge = "" } = options || {};
  if (!text) {
    return null;
  }

  const activeTheme = document.body.dataset.theme === "light" ? "light" : "dark";
  const palette = getShareThemePalette(activeTheme);

  const canvas = document.createElement("canvas");
  canvas.width = 1520;
  canvas.height = 2120;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, palette.backgroundTop);
  gradient.addColorStop(1, palette.backgroundBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const halo = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 220);
  halo.addColorStop(0, palette.haloStart);
  halo.addColorStop(1, palette.haloEnd);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const topAura = ctx.createRadialGradient(canvas.width / 2, 280, 0, canvas.width / 2, 280, 520);
  topAura.addColorStop(0, palette.topAuraStart);
  topAura.addColorStop(1, palette.topAuraEnd);
  ctx.fillStyle = topAura;
  ctx.fillRect(0, 0, canvas.width, 720);

  drawStar(ctx, 240, 220, 16, palette.starPrimary, 0.5);
  drawStar(ctx, 1280, 300, 11, palette.starSecondary, 0.4);
  drawStar(ctx, 1180, 1700, 9, palette.starPrimary, 0.35);
  drawStar(ctx, 320, 1820, 13, palette.starSecondary, 0.25);

  const cardX = 0;
  const cardY = 0;
  const cardWidth = canvas.width;
  const cardHeight = canvas.height;

  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 36);
  ctx.fillStyle = palette.cardFill;
  ctx.fill();
  ctx.strokeStyle = palette.cardStroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, cardX + 28, cardY + 28, cardWidth - 56, cardHeight - 56, 30);
  ctx.strokeStyle = palette.frameOuter;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, cardX + 58, cardY + 58, cardWidth - 116, cardHeight - 116, 24);
  ctx.strokeStyle = palette.frameInner;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawRoundedRect(ctx, cardX + 84, cardY + 84, cardWidth - 168, cardHeight - 168, 20);
  ctx.strokeStyle = palette.frameDash;
  ctx.setLineDash([10, 10]);
  ctx.stroke();
  ctx.setLineDash([]);

  const innerGlow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 180);
  innerGlow.addColorStop(0, palette.innerGlowStart);
  innerGlow.addColorStop(0.45, palette.innerGlowMid);
  innerGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = innerGlow;
  ctx.fillRect(cardX + 70, cardY + 140, cardWidth - 140, cardHeight - 280);

  ctx.textAlign = "center";

  if (deckId !== "emojiOracle") {
    drawRoundedRect(ctx, cardX + 510, cardY + 180, 500, 74, 37);
    ctx.fillStyle = palette.titlePillFill;
    ctx.fill();
    ctx.strokeStyle = palette.titlePillStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = palette.accent;
    ctx.font = '600 34px Georgia, "Times New Roman", serif';
    ctx.fillText(deckTitle.toUpperCase(), canvas.width / 2, cardY + 228);

    if (badge) {
      ctx.fillStyle = palette.textPrimary;
      ctx.font = '400 42px Georgia, "Times New Roman", serif';
      ctx.fillText(badge, canvas.width / 2, cardY + 328);
    }
  }

  if (deckId === "emojiOracle") {
    drawEmojiOracleBlock(ctx, text, canvas.width, cardY + 1030, palette);
  } else {
    ctx.fillStyle = palette.textPrimary;
    const { fontSize, lines } = fitTextBlock(ctx, text, 760, 68, 44);
    ctx.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
    const lineHeight = Math.round(fontSize * 1.45);
    const startY = cardY + 1030 - ((lines.length - 1) * lineHeight) / 2;
    ctx.shadowColor = palette.shadow;
    ctx.shadowBlur = 18;
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = palette.footerText;
  ctx.font = '400 36px Georgia, "Times New Roman", serif';
  ctx.fillText("Передбачення ✦", canvas.width / 2, cardY + cardHeight - 152);

  ctx.strokeStyle = palette.footerLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 320, cardY + cardHeight - 118);
  ctx.lineTo(cardX + cardWidth - 320, cardY + cardHeight - 118);
  ctx.stroke();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) {
    return null;
  }

  return new File([blob], "prediction-card.png", { type: "image/png" });
}
