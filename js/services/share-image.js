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
  const { text, deckTitle = "Fortune", badge = "" } = options || {};
  if (!text) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1520;
  canvas.height = 2120;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#0F1420");
  gradient.addColorStop(1, "#07090D");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const halo = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 220);
  halo.addColorStop(0, "rgba(201,176,122,0.22)");
  halo.addColorStop(1, "rgba(201,176,122,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const topAura = ctx.createRadialGradient(canvas.width / 2, 280, 0, canvas.width / 2, 280, 520);
  topAura.addColorStop(0, "rgba(79,101,174,0.18)");
  topAura.addColorStop(1, "rgba(79,101,174,0)");
  ctx.fillStyle = topAura;
  ctx.fillRect(0, 0, canvas.width, 720);

  drawStar(ctx, 240, 220, 16, "#C9B07A", 0.5);
  drawStar(ctx, 1280, 300, 11, "#EDF1F7", 0.4);
  drawStar(ctx, 1180, 1700, 9, "#C9B07A", 0.35);
  drawStar(ctx, 320, 1820, 13, "#EDF1F7", 0.25);

  const cardX = 0;
  const cardY = 0;
  const cardWidth = canvas.width;
  const cardHeight = canvas.height;

  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 36);
  ctx.fillStyle = "rgba(12,15,22,0.97)";
  ctx.fill();
  ctx.strokeStyle = "rgba(203,215,255,0.16)";
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, cardX + 28, cardY + 28, cardWidth - 56, cardHeight - 56, 30);
  ctx.strokeStyle = "rgba(126,147,207,0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, cardX + 58, cardY + 58, cardWidth - 116, cardHeight - 116, 24);
  ctx.strokeStyle = "rgba(72,89,144,0.26)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawRoundedRect(ctx, cardX + 84, cardY + 84, cardWidth - 168, cardHeight - 168, 20);
  ctx.strokeStyle = "rgba(201,176,122,0.12)";
  ctx.setLineDash([10, 10]);
  ctx.stroke();
  ctx.setLineDash([]);

  const innerGlow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 180);
  innerGlow.addColorStop(0, "rgba(201,176,122,0.14)");
  innerGlow.addColorStop(0.45, "rgba(62,90,160,0.08)");
  innerGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = innerGlow;
  ctx.fillRect(cardX + 70, cardY + 140, cardWidth - 140, cardHeight - 280);

  drawRoundedRect(ctx, cardX + 510, cardY + 180, 500, 74, 37);
  ctx.fillStyle = "rgba(14,18,27,0.72)";
  ctx.fill();
  ctx.strokeStyle = "rgba(201,176,122,0.24)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#C9B07A";
  ctx.font = '600 34px Georgia, "Times New Roman", serif';
  ctx.textAlign = "center";
  ctx.fillText(deckTitle.toUpperCase(), canvas.width / 2, cardY + 228);

  if (badge) {
    ctx.fillStyle = "rgba(237,241,247,0.92)";
    ctx.font = '400 42px Georgia, "Times New Roman", serif';
    ctx.fillText(badge, canvas.width / 2, cardY + 328);
  }

  ctx.fillStyle = "#EDF1F7";
  const { fontSize, lines } = fitTextBlock(ctx, text, 760, 68, 44);
  ctx.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
  const lineHeight = Math.round(fontSize * 1.45);
  const startY = cardY + 1030 - ((lines.length - 1) * lineHeight) / 2;
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 18;
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
  });
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(147,160,181,0.95)";
  ctx.font = '400 36px Georgia, "Times New Roman", serif';
  ctx.fillText("Передбачення ✦", canvas.width / 2, cardY + cardHeight - 152);

  ctx.strokeStyle = "rgba(201,176,122,0.18)";
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
