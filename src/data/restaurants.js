const yummoDishImages = {
  mixian: "/assets/yummo-bouillon-mixian.png",
  baos: "/assets/yummo-baos.png",
  raviolis: "/assets/yummo-raviolis.png"
};

const bistrotDishImages = {
  bobun: "/assets/bistrot-saigon-hero.jpg"
};

export const defaultRestaurantFields = {
  heroImage: "/assets/yummo-hero.jpeg",
  rating: "4.6",
  ratingCount: "",
  trending: "Tendance",
  reviewSummary: {
    title: "Résumé IA des avis",
    lines: [],
    insight: ""
  },
  favoriteDishesTitle: "Les plats favoris",
  favoriteDishesSubtitle: "Les plats que les clients recommandent le plus",
  dishes: [],
  infoValues: [],
  cta: "J'y vais",
  translations: {}
};

const yummoTranslations = {
  en: {
    heroSub: "Asian street food - Rouen",
    ratingCount: "+400 reviews",
    trending: "Trending",
    reviewSummary: {
      title: "AI review summary",
      lines: [
        "YumMó is a popular Chinese spot in Rouen for generous homemade dishes inspired by Shanghai and Xi'an.",
        "Reviews often mention large portions, comforting flavors and a warm welcome.",
        "Ideal for a quick lunch, a meal with friends or a serious comfort food craving at a fair price."
      ],
      insight: "The verdict: simple, authentic and very reliable."
    },
    favoriteDishesTitle: "Favorite dishes",
    favoriteDishesSubtitle: "The dishes customers recommend most",
    dishes: [
      { name: "Mixian broth", note: "Comforting & rich", image: yummoDishImages.mixian },
      { name: "Baos", note: "Soft & indulgent", image: yummoDishImages.baos },
      { name: "Dumplings / bites", note: "Delicate & punchy", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "Comfort food", "With friends"],
    cta: "I'm going"
  },
  es: {
    heroSub: "Street food asiática - Rouen",
    ratingCount: "+400 reseñas",
    trending: "Tendencia",
    reviewSummary: {
      title: "Resumen IA de reseñas",
      lines: [
        "YumMó es una dirección china muy apreciada en Rouen por sus platos caseros generosos inspirados en Shanghái y Xi'an.",
        "Las reseñas destacan a menudo las porciones abundantes, los sabores reconfortantes y la bienvenida cálida.",
        "Ideal para un almuerzo rápido, una comida con amigos o un antojo de comfort food a buen precio."
      ],
      insight: "El veredicto: sencillo, auténtico y muy fiable."
    },
    favoriteDishesTitle: "Platos favoritos",
    favoriteDishesSubtitle: "Los platos que más recomiendan los clientes",
    dishes: [
      { name: "Caldo Mixian", note: "Éxtasis y confort", image: yummoDishImages.mixian },
      { name: "Baos", note: "Suave y goloso", image: yummoDishImages.baos },
      { name: "Raviolis / bocados", note: "Fino e intenso", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "Comfort food", "Con amigos"],
    cta: "Voy"
  },
  it: {
    heroSub: "Street food asiatica - Rouen",
    ratingCount: "+400 recensioni",
    trending: "Di tendenza",
    reviewSummary: {
      title: "Riassunto IA delle recensioni",
      lines: [
        "YumMó è un indirizzo cinese apprezzato a Rouen per i suoi piatti casalinghi generosi ispirati a Shanghai e Xi'an.",
        "Le recensioni citano spesso porzioni abbondanti, sapori confortanti e un'accoglienza calorosa.",
        "Ideale per un pranzo veloce, un pasto con amici o una voglia di comfort food a buon prezzo."
      ],
      insight: "Il verdetto: semplice, autentico e molto affidabile."
    },
    favoriteDishesTitle: "Piatti preferiti",
    favoriteDishesSubtitle: "I piatti più consigliati dai clienti",
    dishes: [
      { name: "Brodo Mixian", note: "Comfort e intensità", image: yummoDishImages.mixian },
      { name: "Baos", note: "Soffici e golosi", image: yummoDishImages.baos },
      { name: "Ravioli / bocconi", note: "Finezza e carattere", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "Comfort food", "Con amici"],
    cta: "Ci vado"
  },
  pt: {
    heroSub: "Street food asiática - Rouen",
    ratingCount: "+400 avaliações",
    trending: "Tendência",
    reviewSummary: {
      title: "Resumo IA das avaliações",
      lines: [
        "YumMó é um endereço chinês conhecido em Rouen pelos pratos caseiros generosos inspirados em Xangai e Xi'an.",
        "As avaliações destacam porções fartas, sabores reconfortantes e um atendimento acolhedor.",
        "Ideal para um almoço rápido, uma refeição com amigos ou vontade de comfort food por bom preço."
      ],
      insight: "O veredito: simples, autêntico e muito confiável."
    },
    favoriteDishesTitle: "Pratos favoritos",
    favoriteDishesSubtitle: "Os pratos que os clientes mais recomendam",
    dishes: [
      { name: "Caldo Mixian", note: "Conforto e sabor", image: yummoDishImages.mixian },
      { name: "Baos", note: "Macio e guloso", image: yummoDishImages.baos },
      { name: "Raviolis / bocados", note: "Fino e intenso", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "Comfort food", "Com amigos"],
    cta: "Vou lá"
  },
  de: {
    heroSub: "Asiatisches Streetfood - Rouen",
    ratingCount: "+400 Bewertungen",
    trending: "Im Trend",
    reviewSummary: {
      title: "KI-Zusammenfassung der Bewertungen",
      lines: [
        "YumMó ist eine beliebte chinesische Adresse in Rouen für großzügige hausgemachte Gerichte aus Shanghai und Xi'an.",
        "Bewertungen nennen oft große Portionen, wohltuende Aromen und einen herzlichen Empfang.",
        "Ideal für ein schnelles Mittagessen, Essen mit Freunden oder gute Comfort Food zum fairen Preis."
      ],
      insight: "Das Urteil: einfach, authentisch und sehr zuverlässig."
    },
    favoriteDishesTitle: "Lieblingsgerichte",
    favoriteDishesSubtitle: "Die Gerichte, die Gäste am häufigsten empfehlen",
    dishes: [
      { name: "Mixian-Brühe", note: "Wärmend und reichhaltig", image: yummoDishImages.mixian },
      { name: "Baos", note: "Weich und genussvoll", image: yummoDishImages.baos },
      { name: "Teigtaschen / Bissen", note: "Fein und intensiv", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "Comfort Food", "Mit Freunden"],
    cta: "Ich gehe hin"
  },
  vi: {
    heroSub: "Ẩm thực đường phố châu Á - Rouen",
    ratingCount: "+400 đánh giá",
    trending: "Đang thịnh hành",
    reviewSummary: {
      title: "Tóm tắt đánh giá bằng AI",
      lines: [
        "YumMó là một địa chỉ món Hoa được yêu thích ở Rouen với các món nhà làm đầy đặn, lấy cảm hứng từ Thượng Hải và Tây An.",
        "Khách thường nhắc đến khẩu phần hào phóng, hương vị ấm áp và sự đón tiếp thân thiện.",
        "Lý tưởng cho bữa trưa nhanh, bữa ăn cùng bạn bè hoặc khi thèm comfort food giá hợp lý."
      ],
      insight: "Kết luận: đơn giản, chân thực và rất đáng tin cậy."
    },
    favoriteDishesTitle: "Món được yêu thích",
    favoriteDishesSubtitle: "Những món khách hàng đề xuất nhiều nhất",
    dishes: [
      { name: "Nước dùng Mixian", note: "Ấm áp và đậm đà", image: yummoDishImages.mixian },
      { name: "Baos", note: "Mềm và hấp dẫn", image: yummoDishImages.baos },
      { name: "Sủi cảo / món nhỏ", note: "Tinh tế và bùng vị", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "Comfort food", "Đi cùng bạn bè"],
    cta: "Tôi sẽ đến"
  },
  ja: {
    heroSub: "アジアンストリートフード - ルーアン",
    ratingCount: "400件以上のレビュー",
    trending: "人気",
    reviewSummary: {
      title: "AIレビュー要約",
      lines: [
        "YumMóは、上海と西安に着想を得た手作りのボリュームある中華料理でルーアンで人気のお店です。",
        "レビューでは、たっぷりした量、ほっとする味、温かい接客がよく挙げられています。",
        "手早いランチ、友人との食事、手頃な価格のコンフォートフードにぴったりです。"
      ],
      insight: "結論：シンプルで本格的、そしてとても信頼できます。"
    },
    favoriteDishesTitle: "人気メニュー",
    favoriteDishesSubtitle: "お客様が最もおすすめする料理",
    dishes: [
      { name: "ミーシェンのスープ", note: "温かく濃厚", image: yummoDishImages.mixian },
      { name: "包子", note: "ふんわり満足", image: yummoDishImages.baos },
      { name: "餃子 / 小皿", note: "繊細で力強い味", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "コンフォートフード", "友人と"],
    cta: "行ってみる"
  },
  zh: {
    heroSub: "亚洲街头美食 - 鲁昂",
    ratingCount: "400+ 条评价",
    trending: "热门",
    reviewSummary: {
      title: "AI 评价摘要",
      lines: [
        "YumMó 是鲁昂一家受欢迎的中餐馆，以受上海和西安启发的丰盛家常菜闻名。",
        "评价中经常提到分量足、味道温暖、服务热情。",
        "非常适合快速午餐、朋友聚餐，或想吃高性价比治愈系美食的时候。"
      ],
      insight: "结论：简单、地道、非常可靠。"
    },
    favoriteDishesTitle: "人气菜品",
    favoriteDishesSubtitle: "顾客最推荐的菜",
    dishes: [
      { name: "米线汤", note: "温暖浓郁", image: yummoDishImages.mixian },
      { name: "包子", note: "松软满足", image: yummoDishImages.baos },
      { name: "饺子 / 小点", note: "细腻有层次", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "治愈系美食", "朋友聚餐"],
    cta: "我要去"
  },
  ru: {
    heroSub: "Азиатская уличная еда - Руан",
    ratingCount: "400+ отзывов",
    trending: "В тренде",
    reviewSummary: {
      title: "AI-сводка отзывов",
      lines: [
        "YumMó - популярное китайское место в Руане с щедрыми домашними блюдами, вдохновленными Шанхаем и Сианем.",
        "В отзывах часто отмечают большие порции, уютные вкусы и теплый прием.",
        "Идеально для быстрого обеда, встречи с друзьями или сытной comfort food по хорошей цене."
      ],
      insight: "Вердикт: просто, аутентично и очень надежно."
    },
    favoriteDishesTitle: "Любимые блюда",
    favoriteDishesSubtitle: "Блюда, которые чаще всего рекомендуют гости",
    dishes: [
      { name: "Бульон Mixian", note: "Сытно и уютно", image: yummoDishImages.mixian },
      { name: "Бао", note: "Мягко и аппетитно", image: yummoDishImages.baos },
      { name: "Пельмени / закуски", note: "Тонко и ярко", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "Comfort food", "С друзьями"],
    cta: "Я иду"
  }
};

const bistrotSaigonTranslations = {
  en: {
    heroSub: "Vietnamese street food - Paris",
    ratingCount: "24 reviews",
    trending: "Trending",
    reviewSummary: {
      title: "AI review summary",
      lines: [
        "Vietnamese food praised for its authenticity and generous portions.",
        "Warm, human service, rare in fast casual dining.",
        "The Royal Bo Bun: the ultra-generous signature dish everyone agrees on."
      ],
      insight: "The verdict: generous, warm and deeply comforting."
    },
    favoriteDishesTitle: "Favorite dishes",
    favoriteDishesSubtitle: "The dishes customers recommend most",
    dishes: [
      { name: "Royal Bo Bun", note: "Signature & generous", image: bistrotDishImages.bobun },
      { name: "Homemade nems", note: "Crispy & tender" },
      { name: "Pho", note: "Broth & herbs" }
    ],
    infoValues: ["20-30 EUR", "Vietnamese", "Cozy"],
    cta: "I'm going"
  },
  es: {
    heroSub: "Street food vietnamita - París",
    ratingCount: "24 reseñas",
    trending: "Tendencia",
    reviewSummary: {
      title: "Resumen IA de reseñas",
      lines: [
        "Cocina vietnamita apreciada por su autenticidad y sus porciones generosas.",
        "Atención cálida y humana, poco común en la restauración rápida.",
        "El Bo Bun Royal: el plato estrella, muy generoso y recomendado por todos."
      ],
      insight: "El veredicto: generoso, cálido y muy sabroso."
    },
    favoriteDishesTitle: "Platos favoritos",
    favoriteDishesSubtitle: "Los platos que más recomiendan los clientes",
    dishes: [
      { name: "Bo Bun Royal", note: "Firma y generoso", image: bistrotDishImages.bobun },
      { name: "Nems caseros", note: "Crujientes y tiernos" },
      { name: "Pho", note: "Caldo y hierbas" }
    ],
    infoValues: ["20-30 EUR", "Vietnamita", "Acogedor"],
    cta: "Voy"
  },
  it: {
    heroSub: "Street food vietnamita - Parigi",
    ratingCount: "24 recensioni",
    trending: "Di tendenza",
    reviewSummary: {
      title: "Riassunto IA delle recensioni",
      lines: [
        "Cucina vietnamita apprezzata per autenticità e porzioni generose.",
        "Accoglienza calda e umana, rara nella ristorazione veloce.",
        "Il Bo Bun Royal: il piatto signature molto generoso che mette tutti d'accordo."
      ],
      insight: "Il verdetto: generoso, caloroso e molto goloso."
    },
    favoriteDishesTitle: "Piatti preferiti",
    favoriteDishesSubtitle: "I piatti più consigliati dai clienti",
    dishes: [
      { name: "Bo Bun Royal", note: "Signature e generoso", image: bistrotDishImages.bobun },
      { name: "Nems fatti in casa", note: "Croccanti e teneri" },
      { name: "Pho", note: "Brodo ed erbe" }
    ],
    infoValues: ["20-30 EUR", "Vietnamita", "Accogliente"],
    cta: "Ci vado"
  },
  pt: {
    heroSub: "Street food vietnamita - Paris",
    ratingCount: "24 avaliações",
    trending: "Tendência",
    reviewSummary: {
      title: "Resumo IA das avaliações",
      lines: [
        "Cozinha vietnamita elogiada pela autenticidade e pelas porções generosas.",
        "Atendimento acolhedor e humano, raro na restauração rápida.",
        "O Bo Bun Royal: o prato assinatura ultra-generoso que agrada a todos."
      ],
      insight: "O veredito: generoso, acolhedor e muito saboroso."
    },
    favoriteDishesTitle: "Pratos favoritos",
    favoriteDishesSubtitle: "Os pratos que os clientes mais recomendam",
    dishes: [
      { name: "Bo Bun Royal", note: "Assinatura e generoso", image: bistrotDishImages.bobun },
      { name: "Nems caseiros", note: "Crocantes e macios" },
      { name: "Pho", note: "Caldo e ervas" }
    ],
    infoValues: ["20-30 EUR", "Vietnamita", "Acolhedor"],
    cta: "Vou lá"
  },
  de: {
    heroSub: "Vietnamesisches Streetfood - Paris",
    ratingCount: "24 Bewertungen",
    trending: "Im Trend",
    reviewSummary: {
      title: "KI-Zusammenfassung der Bewertungen",
      lines: [
        "Vietnamesische Küche, gelobt für Authentizität und großzügige Portionen.",
        "Herzlicher, menschlicher Service, selten in der schnellen Gastronomie.",
        "Der Bo Bun Royal: das sehr großzügige Signature-Gericht, das alle überzeugt."
      ],
      insight: "Das Urteil: großzügig, herzlich und sehr lecker."
    },
    favoriteDishesTitle: "Lieblingsgerichte",
    favoriteDishesSubtitle: "Die Gerichte, die Gäste am häufigsten empfehlen",
    dishes: [
      { name: "Bo Bun Royal", note: "Signature und großzügig", image: bistrotDishImages.bobun },
      { name: "Hausgemachte Nems", note: "Knusprig und zart" },
      { name: "Pho", note: "Brühe und Kräuter" }
    ],
    infoValues: ["20-30 EUR", "Vietnamesisch", "Gemütlich"],
    cta: "Ich gehe hin"
  },
  vi: {
    heroSub: "Ẩm thực đường phố Việt Nam - Paris",
    ratingCount: "24 đánh giá",
    trending: "Đang thịnh hành",
    reviewSummary: {
      title: "Tóm tắt đánh giá bằng AI",
      lines: [
        "Ẩm thực Việt Nam được khen vì sự chân thực và khẩu phần hào phóng.",
        "Dịch vụ ấm áp, gần gũi, hiếm thấy trong mô hình ăn nhanh.",
        "Bo Bun Royal: món đặc trưng rất đầy đặn và được nhiều người yêu thích."
      ],
      insight: "Kết luận: hào phóng, ấm áp và rất ngon miệng."
    },
    favoriteDishesTitle: "Món được yêu thích",
    favoriteDishesSubtitle: "Những món khách hàng đề xuất nhiều nhất",
    dishes: [
      { name: "Bo Bun Royal", note: "Đặc trưng và hào phóng", image: bistrotDishImages.bobun },
      { name: "Nem nhà làm", note: "Giòn và mềm" },
      { name: "Phở", note: "Nước dùng và rau thơm" }
    ],
    infoValues: ["20-30 EUR", "Món Việt", "Ấm cúng"],
    cta: "Tôi sẽ đến"
  },
  ja: {
    heroSub: "ベトナムストリートフード - パリ",
    ratingCount: "24件のレビュー",
    trending: "人気",
    reviewSummary: {
      title: "AIレビュー要約",
      lines: [
        "本格的な味とたっぷりした量で評価されるベトナム料理です。",
        "ファストカジュアルでは珍しい、温かく人間味のあるサービス。",
        "Bo Bun Royalは、誰もが納得するボリューム満点の看板メニューです。"
      ],
      insight: "結論：ボリュームがあり、温かく、とても満足できます。"
    },
    favoriteDishesTitle: "人気メニュー",
    favoriteDishesSubtitle: "お客様が最もおすすめする料理",
    dishes: [
      { name: "Bo Bun Royal", note: "看板メニューで大満足", image: bistrotDishImages.bobun },
      { name: "自家製ネム", note: "カリッと柔らかい" },
      { name: "フォー", note: "スープとハーブ" }
    ],
    infoValues: ["20-30 EUR", "ベトナム料理", "居心地が良い"],
    cta: "行ってみる"
  },
  zh: {
    heroSub: "越南街头美食 - 巴黎",
    ratingCount: "24 条评价",
    trending: "热门",
    reviewSummary: {
      title: "AI 评价摘要",
      lines: [
        "越南料理因其地道风味和丰盛分量而受到好评。",
        "服务热情有人情味，在快餐式餐饮中并不常见。",
        "Bo Bun Royal 是招牌菜，分量十足，几乎人人推荐。"
      ],
      insight: "结论：丰盛、温暖、非常美味。"
    },
    favoriteDishesTitle: "人气菜品",
    favoriteDishesSubtitle: "顾客最推荐的菜",
    dishes: [
      { name: "Bo Bun Royal", note: "招牌且丰盛", image: bistrotDishImages.bobun },
      { name: "自制越南春卷", note: "酥脆又柔嫩" },
      { name: "越南粉", note: "汤底与香草" }
    ],
    infoValues: ["20-30 EUR", "越南菜", "舒适"],
    cta: "我要去"
  },
  ru: {
    heroSub: "Вьетнамская уличная еда - Париж",
    ratingCount: "24 отзыва",
    trending: "В тренде",
    reviewSummary: {
      title: "AI-сводка отзывов",
      lines: [
        "Вьетнамскую кухню хвалят за аутентичность и щедрые порции.",
        "Теплый, человечный сервис, редкий для быстрого формата.",
        "Bo Bun Royal - фирменное, очень щедрое блюдо, которое нравится почти всем."
      ],
      insight: "Вердикт: щедро, тепло и очень вкусно."
    },
    favoriteDishesTitle: "Любимые блюда",
    favoriteDishesSubtitle: "Блюда, которые чаще всего рекомендуют гости",
    dishes: [
      { name: "Bo Bun Royal", note: "Фирменное и щедрое", image: bistrotDishImages.bobun },
      { name: "Домашние немы", note: "Хрустящие и нежные" },
      { name: "Фо", note: "Бульон и травы" }
    ],
    infoValues: ["20-30 EUR", "Вьетнамская кухня", "Уютно"],
    cta: "Я иду"
  }
};

export const restaurants = {
  "yummo-rouen": {
    id: "yummo-rouen",
    slug: "yummo-rouen",
    name: "YumMó",
    title: "YumMó - Yumzy",
    heroSub: "Street food asiatique - Rouen",
    heroImage: "/assets/yummo-hero.jpeg",
    rating: "4.6",
    ratingCount: "+400 avis",
    trending: "Tendance",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=YumM%C3%B3%20Rouen",
    reviewSummary: {
      title: "Résumé IA des avis",
      lines: [
        "YumMó : une adresse chinoise réputée à Rouen pour ses plats maison généreux inspirés de Shanghai et Xi'an.",
        "Les avis reviennent souvent sur les portions copieuses, les saveurs réconfortantes et l'accueil chaleureux.",
        "Idéal pour un déjeuner rapide, un repas entre amis ou une grosse envie de comfort food à bon prix."
      ],
      insight: "Le verdict : simple, authentique et très fiable."
    },
    favoriteDishesTitle: "Les plats favoris",
    favoriteDishesSubtitle: "Les plats que les clients recommandent le plus",
    dishes: [
      { name: "Bouillon Mixian", note: "Extase & Réconfort", image: yummoDishImages.mixian },
      { name: "Baos", note: "Nuage & Gourmandise", image: yummoDishImages.baos },
      { name: "Raviolis / Bouchées", note: "Finesse & Explosion", image: yummoDishImages.raviolis }
    ],
    infoValues: ["20-30 EUR", "Comfort food", "Entre amis"],
    cta: "J'y vais",
    translations: yummoTranslations
  },
  "bistrot-saigon-paris": {
    id: "bistrot-saigon-paris",
    slug: "bistrot-saigon-paris",
    name: "Bistrot Saigon",
    title: "Bistrot Saigon - Yumzy",
    heroSub: "Street food vietnamienne - Paris",
    heroImage: "/assets/bistrot-saigon-hero.jpg",
    rating: "4.7",
    ratingCount: "24 avis",
    trending: "Tendance",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bistrot%20Saigon%20Paris",
    reviewSummary: {
      title: "Résumé IA des avis",
      lines: [
        "Cuisine vietnamienne saluée pour son authenticité et ses portions généreuses.",
        "Accueil chaleureux et humain, rare dans la restauration rapide.",
        "Le Bo Bun Royal : le plat signature ultra-généreux qui fait l'unanimité."
      ],
      insight: "Le verdict : généreux, chaleureux et très gourmand."
    },
    favoriteDishesTitle: "Les plats favoris",
    favoriteDishesSubtitle: "Les plats que les clients recommandent le plus",
    dishes: [
      { name: "Bo Bun Royal", note: "Signature & Généreux", image: bistrotDishImages.bobun },
      { name: "Nems maison", note: "Croustillant & Fondant" },
      { name: "Pho", note: "Bouillon & Herbes" }
    ],
    infoValues: ["20-30 EUR", "Vietnamien", "Cozy"],
    cta: "J'y vais",
    translations: bistrotSaigonTranslations
  }
};

export function getRestaurantBySlug(slug) {
  return normalizeRestaurant(restaurants[slug] || restaurants["yummo-rouen"]);
}

export function getRestaurantView(restaurant, language) {
  const normalizedRestaurant = normalizeRestaurant(restaurant);
  if (language === "fr") return normalizedRestaurant;

  const normalizedLanguage = language || "en";
  const translation =
    normalizedRestaurant.translations?.[normalizedLanguage] ||
    normalizedRestaurant.translations?.en;

  if (!translation) return normalizedRestaurant;

  return {
    ...normalizedRestaurant,
    ...translation,
    reviewSummary: {
      ...normalizedRestaurant.reviewSummary,
      ...translation.reviewSummary
    },
    dishes: translation.dishes || normalizedRestaurant.dishes,
    infoValues: translation.infoValues || normalizedRestaurant.infoValues
  };
}

function normalizeRestaurant(restaurant) {
  return {
    ...defaultRestaurantFields,
    ...restaurant,
    title: restaurant.title || `${restaurant.name} - Yumzy`,
    heroSub: restaurant.heroSub || "",
    mapsUrl:
      restaurant.mapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name || "")}`,
    reviewSummary: {
      ...defaultRestaurantFields.reviewSummary,
      ...restaurant.reviewSummary
    },
    dishes: restaurant.dishes || [],
    infoValues: restaurant.infoValues || [],
    translations: restaurant.translations || {}
  };
}

export function getRestaurantSlugFromPath(pathname) {
  const match = pathname.match(/^\/r\/([^/?#]+)/);
  return match?.[1] || "yummo-rouen";
}
