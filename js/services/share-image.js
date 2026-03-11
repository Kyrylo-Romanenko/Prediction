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

export async function buildFortuneImageFile(text) {
  if (!text) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 760;
  canvas.height = 1060;
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

  ctx.fillStyle = "#C9B07A";
  ctx.font = '600 24px Georgia, "Times New Roman", serif';
  ctx.textAlign = "center";
  ctx.fillText("MYSTIC", canvas.width / 2, cardY + 250);

  ctx.fillStyle = "#EDF1F7";
  ctx.font = '700 28px Georgia, "Times New Roman", serif';
  const lines = wrapText(ctx, text, 330);
  const lineHeight = 42;
  const startY = cardY + 520 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
  });

  ctx.fillStyle = "rgba(147,160,181,0.95)";
  ctx.font = '400 20px Georgia, "Times New Roman", serif';
  ctx.fillText("Передбачення ✦", canvas.width / 2, cardY + cardHeight - 78);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) {
    return null;
  }

  return new File([blob], "prediction-card.png", { type: "image/png" });
}
