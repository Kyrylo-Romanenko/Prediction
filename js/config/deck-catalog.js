function buildDeck({
  id,
  file,
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
    dataUrl: new URL(`../../data/${file}`, import.meta.url).toString(),
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
      priority: 10,
      galleryOrder: 20,
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
  xmas: buildDeck({
    id: "xmas",
    file: "fortunes_christmas.json",
    badge: "🎄",
    name: "Різдвяна",
    title: "Noel",
    description: "Тепла зимова колода з м'яким святковим настроєм.",
    priority: 100,
    galleryOrder: 30,
    activeFrom: { month: 11, day: 1 },
    activeTo: { month: 11, day: 31 },
    backDesign: {
      layout: "diagonal",
      icons: ["✦", "❄", "✶", "✷"],
      background: {
        dark: "radial-gradient(circle at 50% 50%, rgba(144,196,112,0.18), transparent 28%), radial-gradient(circle at 50% 50%, rgba(144,196,112,0.06), transparent 56%), linear-gradient(180deg, rgba(10, 32, 24, 0.98), rgba(6, 19, 15, 0.98))",
        light: "radial-gradient(circle at 50% 50%, rgba(106,150,87,0.16), transparent 28%), radial-gradient(circle at 50% 50%, rgba(106,150,87,0.05), transparent 56%), linear-gradient(180deg, rgba(243, 249, 239, 0.98), rgba(232, 241, 226, 0.98))"
      }
    }
  }),
  april: buildDeck({
    id: "april",
    file: "fortunes_1april.json",
    badge: "😄",
    name: "Першоквітнева",
    title: "Playful",
    description: "Легка іронічна колода для грайливих і трохи дивних знаків.",
    priority: 120,
    galleryOrder: null,
    activeFrom: { month: 3, day: 1 },
    activeTo: { month: 3, day: 1 },
    showInGallery: false,
    backDesign: {
      layout: "diagonal",
      icons: ["✦", "☻", "☼", "✺"],
      background: {
        dark: "radial-gradient(circle at 50% 50%, rgba(214,142,83,0.16), transparent 26%), radial-gradient(circle at 50% 50%, rgba(214,142,83,0.06), transparent 54%), linear-gradient(180deg, rgba(38, 25, 21, 0.98), rgba(23, 15, 13, 0.98))",
        light: "radial-gradient(circle at 50% 50%, rgba(213,150,98,0.15), transparent 26%), radial-gradient(circle at 50% 50%, rgba(213,150,98,0.05), transparent 54%), linear-gradient(180deg, rgba(252, 245, 237, 0.98), rgba(245, 234, 223, 0.98))"
      }
    }
  }),
  "13february": buildDeck({
    id: "13february",
    file: "13february.json",
    badge: "❤️",
    name: "Романтична",
    title: "Velvet",
    description: "М'яка колода про симпатію, тепло і делікатні натяки.",
    priority: 110,
    galleryOrder: null,
    activeFrom: { month: 1, day: 13 },
    activeTo: { month: 1, day: 13 },
    showInGallery: false,
    backDesign: {
      layout: "diagonal",
      icons: ["❤", "❥", "✦", "♡"],
      background: {
        dark: "radial-gradient(circle at 50% 50%, rgba(192,86,107,0.18), transparent 28%), radial-gradient(circle at 50% 50%, rgba(192,86,107,0.07), transparent 56%), linear-gradient(180deg, rgba(39, 15, 24, 0.98), rgba(25, 10, 16, 0.98))",
        light: "radial-gradient(circle at 50% 50%, rgba(188,102,126,0.16), transparent 28%), radial-gradient(circle at 50% 50%, rgba(188,102,126,0.05), transparent 56%), linear-gradient(180deg, rgba(252, 241, 244, 0.98), rgba(246, 228, 233, 0.98))"
      }
    }
  })
};
