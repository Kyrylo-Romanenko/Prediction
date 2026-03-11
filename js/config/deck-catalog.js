function buildDeck({
  id,
  file,
  generator = null,
  badge = "",
  name = "Базова колода",
  title = "Fortune",
  description = "",
  priority = 0,
  galleryOrder = null,
  showInGallery = true,
  activeFrom = null,
  activeTo = null,
  backDesign
}) {
  return {
    id,
    badge,
    name,
    title,
    description,
    priority,
    galleryOrder,
    showInGallery,
    activeFrom,
    activeTo,
    dataUrl: file ? new URL(`../../data/${file}`, import.meta.url).toString() : null,
    generator,
    backDesign
  };
}

export const DECK_CATALOG = {
  default: buildDeck({
    id: "default",
    file: "fortunes.json",
    name: "Основна",
    title: "Fortune",
    description: "Базові щоденні передбачення без сезонної тематики.",
    priority: 0,
    galleryOrder: 0,
    showInGallery: false,
    backDesign: {
      layout: "center",
      icons: ["✦"],
      background: {}
    }
  }),
  spring: buildDeck({
      id: "spring",
      file: "fortunes_spring.json",
      badge: "🌸",
      name: "Весняні передбачення",
      title: "Весна",
      description: "Коли земля пахне дощем, а вітер ще не визначився — тепло чи холодно.",
      priority: 1,
      galleryOrder: 90,
      showInGallery: true,
      activeFrom: { month: 2, day: 1 },
      activeTo: { month: 4, day: 31 },
      backDesign: {
        layout: "diagonal",
        icons: ["🌻", "☀️",  "☀", "✿"],
        background: {
          dark: "linear-gradient(135deg, #1f1418 0%, #3d2030 50%, #2a1822 100%)",
          light: "linear-gradient(135deg, #fff5f7 0%, #fde8ef 40%, #fad4e4 100%)"
        }
      }
    }),
  summer: buildDeck({
      id: "summer",
      file: "fortunes_summer.json",
      badge: "☀️",
      name: "Літній вайб",
      title: "ЛІТО",
      description: "Сонце вже гріє, навіть якщо ти досі в офісі",
      priority: 1,
      galleryOrder: 92,
      showInGallery: true,
      activeFrom: { month: 5, day: 1 },
      activeTo: { month: 7, day: 31 },
      backDesign: {
        layout: "diagonal",
        icons: ["☼", "◇", "✦", "✺"],
        background: {
            dark: "linear-gradient(135deg, #0f3d56 0%, #1f6f8b 45%, #f4a261 100%)",
            light: "linear-gradient(135deg, #fff4d6 0%, #ffd6a5 45%, #bde0fe 100%)"
        }

      }
    }),

  mystic: buildDeck({
      id: "mystic",
      file: "fortunes_mystic.json",
      badge: "🔮",
      name: "Містика і знаки",
      title: "ЗНАК",
      description: "Щось відбувається між рядками — збіги, передчуття, деталі, які не варто ігнорувати.",
      priority: 6,
      galleryOrder: 7,
      showInGallery: true,
      activeFrom: { month: 8, day: 1 },
      activeTo: { month: 10, day: 30 },
      backDesign: {
        layout: "center",
        icons: ["🌒"],
        background: {
      dark: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      light: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)"
    }
      }
    }),
  emojiOracle: buildDeck({
    id: "emojiOracle",
    generator: "emoji-oracle",
    badge: "🎲",
    name: "Emoji-оракул",
    title: "EMOJI",
    description: "Алгоритмічна колода, де передбачення щоразу збирається наново з емодзі, настрою, дії і дивного збігу.",
    priority: 0,
    galleryOrder: 12,
    showInGallery: true,
    backDesign: {
      layout: "diagonal",
      icons: ["⑧"],
      background: {
        dark: "linear-gradient(135deg, #111827 0%, #1f2937 42%, #4c1d95 100%)",
        light: "linear-gradient(135deg, #fef3c7 0%, #fde68a 35%, #bfdbfe 100%)"
      }
    }
  }),

  liminal: buildDeck({
      id: "liminal",
      file: "fortunes_liminal.json",
      badge: "门",
      name: "Поза часом",
      title: "ТУТ",
      description: "Простір між тим, що вже закінчилося, і тим, що ще не почалося.",
      priority: 50,
      galleryOrder: 12,
      showInGallery: true,

      backDesign: {
        layout: "diagonal",
        icons: ["✧", "◈", "☾"],
        background: {
          dark: "linear-gradient(135deg, #1a1a1a 0%, #434343 100%)",
          light: "linear-gradient(135deg, #e0e0e0 0%, #8d8d8d 100%)"
        }
      }
    }),

  april: buildDeck({
    id: "april",
    file: "fortunes_1april.json",
    badge: "😏",
    name: "Першоквітнева",
    title: "АГА",
    description: "Колода, яка існує тільки для одного жарту.",
    priority: 120,
    showInGallery: false,
    activeFrom: { month: 3, day: 1 },
    activeTo: { month: 3, day: 1 },
    backDesign: {
      layout: "diagonal",
      icons: ["☻", "✦", "😏", "☼"],
      background: {
        dark: "linear-gradient(135deg, #261915 0%, #4b2e24 100%)",
        light: "linear-gradient(135deg, #fff1e6 0%, #f6d7bf 100%)"
      }
    }
  }),

  xmas: buildDeck({
    id: "xmas",
    file: "fortunes_christmas.json",
    badge: "🎄",
    name: "Різдвяна",
    title: "Noel",
    description: "Тепла зимова колода з м'яким святковим настроєм.",
    priority: 10,
    galleryOrder: 80,
    activeFrom: { month: 11, day: 1 },
    activeTo: { month: 11, day: 31 },
    backDesign: {
      layout: "diagonal",
      icons: ["🎄"],
      background: {
        dark: "radial-gradient(circle at 50% 50%, rgba(144,196,112,0.18), transparent 28%), radial-gradient(circle at 50% 50%, rgba(144,196,112,0.06), transparent 56%), linear-gradient(180deg, rgba(10, 32, 24, 0.98), rgba(6, 19, 15, 0.98))",
        light: "radial-gradient(circle at 50% 50%, rgba(106,150,87,0.16), transparent 28%), radial-gradient(circle at 50% 50%, rgba(106,150,87,0.05), transparent 56%), linear-gradient(180deg, rgba(243, 249, 239, 0.98), rgba(232, 241, 226, 0.98))"
      }
    }
  })
};
