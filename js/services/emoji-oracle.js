const TOP_LINES = [
  "Колода каже:",
  "Символи шепочуть:",
  "Карта бачить так:",
  "Знак на зараз:",
  "Оракул натякає:",
  "Сьогодні випало:",
  "Тлумач як хочеш:",
  "Космос підкинув:",
  "Карти не жартують:",
  "Сьогоднішній знак:",
  "Розклад натякає:",
  "Містика повідомляє:",
  "Тобі випало ось це:",
  "Колода наполягає:",
  "Щось у повітрі каже:"
];

const BOTTOM_LINES = [
  "Що б це не значило.",
  "Висновки роби сам.",
  "Звучить як натяк.",
  "Можливо, це серйозно.",
  "Або просто красиво.",
  "Не сперечайся з картою.",
  "Тут явно щось є.",
  "Всесвіт не пояснює.",
  "Збігів, звісно, не буває.",
  "Я б це не ігнорував.",
  "Думай над цим, як знаєш.",
  "Карта сказала достатньо.",
  "Далі вже твоя інтерпретація.",
  "Натяк доволі підозрілий.",
  "Сенс, мабуть, десь поруч."
];

const OPENERS = [
  ["🌙", "📩"],
  ["☀️", "🚪"],
  ["🎧", "✨"],
  ["☕", "🫧"],
  ["🪞", "💫"],
  ["🌧️", "🔔"],
  ["🕯️", "🌫️"],
  ["🪟", "🦋"]
];

const ACTIONS = [
  ["👀", "❗"],
  ["🫳", "🎲"],
  ["🚶", "🌈"],
  ["🫶", "🪄"],
  ["🤫", "🔓"],
  ["🧭", "⚡"],
  ["🎯", "🌀"],
  ["🛼", "💨"]
];

const OUTCOMES = [
  ["🍀", "🎁"],
  ["💌", "🥹"],
  ["🚀", "🌟"],
  ["🪙", "🎉"],
  ["🧲", "💎"],
  ["🌸", "🤍"],
  ["🔥", "👏"],
  ["🗺️", "📍"]
];

const TWISTS = [
  ["😏"],
  ["🫢"],
  ["👁️"],
  ["🎭"],
  ["🔮"],
  ["🪩"],
  ["🌪️"],
  ["💥"]
];

const recentStories = [];
const MAX_RECENT = 10;

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function composeEmojiLine(opener, action, outcome, twist) {
  const pool = shuffle([...opener, ...action, ...outcome, ...twist]);
  const count = 3 + Math.floor(Math.random() * 3);
  return pool.slice(0, count).join(" ");
}

function remember(signature) {
  recentStories.push(signature);
  if (recentStories.length > MAX_RECENT) {
    recentStories.shift();
  }
}

export function generateEmojiOracleFortune() {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const topLine = pickRandom(TOP_LINES);
    const bottomLine = pickRandom(BOTTOM_LINES);
    const opener = pickRandom(OPENERS);
    const action = pickRandom(ACTIONS);
    const outcome = pickRandom(OUTCOMES);
    const twist = pickRandom(TWISTS);
    const emojiLine = composeEmojiLine(opener, action, outcome, twist);
    const signature = `${topLine}|${emojiLine}|${bottomLine}`;

    if (recentStories.includes(signature)) {
      continue;
    }

    remember(signature);
    return `${topLine}\n${emojiLine}\n${bottomLine}`;
  }

  return "Колода каже:\n🌙 ✨ 🍀 🔮\nЩо б це не значило.";
}
