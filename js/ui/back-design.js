function createIcon(icon, x, y, size, rotation, opacity) {
  const mark = document.createElement("span");
  mark.className = "tarot-card__sigil-mark";
  mark.textContent = icon;
  mark.style.setProperty("--sigil-x", `${x}%`);
  mark.style.setProperty("--sigil-y", `${y}%`);
  mark.style.setProperty("--sigil-size", `${size}rem`);
  mark.style.setProperty("--sigil-rotate", `${rotation}deg`);
  mark.style.setProperty("--sigil-opacity", `${opacity}`);
  return mark;
}

function buildCenterLayout(icons) {
  return [createIcon(icons[0] || "✦", 50, 50, 4, 0, 1)];
}

function buildDiagonalLayout(icons) {
  const marks = [];
  const rows = 5;
  const columns = 4;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const icon = icons[(row + col) % icons.length] || "✦";
      const x = 18 + col * 21 + (row % 2 ? 5 : 0);
      const y = 14 + row * 18;
      const size = 1.1 + ((row + col) % 3) * 0.3;
      const rotation = -28 + ((row + col) % 5) * 14;
      const opacity = 0.26 + ((row + col) % 4) * 0.1;
      marks.push(createIcon(icon, x, y, size, rotation, opacity));
    }
  }

  return marks;
}

export function renderBackDesign(container, backFace, design = {}) {
  if (!container || !backFace) {
    return;
  }

  const icons = Array.isArray(design.icons) && design.icons.length ? design.icons : ["✦"];
  const layout = design.layout || "center";

  container.innerHTML = "";
  backFace.dataset.backLayout = layout;

  const marks = layout === "diagonal" ? buildDiagonalLayout(icons) : buildCenterLayout(icons);
  marks.forEach((mark) => container.appendChild(mark));
}
