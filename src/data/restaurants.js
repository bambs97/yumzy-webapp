export const defaultRestaurantFields = {
  heroImage: "/assets/yummo-hero.jpeg",
  rating: "4.6",
  ratingCount: "",
  trending: "Tendance",
  reviewSummary: {
    title: "Resume IA des avis",
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

export const restaurants = {
  "yummo-rouen": {
    id: "yummo-rouen",
    slug: "yummo-rouen",
    name: "YumM\u00f3",
    title: "YumM\u00f3 - Yumzy",
    heroSub: "Street food asiatique - Rouen",
    heroImage: "/assets/yummo-hero.jpeg",
    rating: "4.6",
    ratingCount: "+400 avis",
    trending: "Tendance",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=YumM%C3%B3%20Rouen",
    reviewSummary: {
      title: "Resume IA des avis",
      lines: [
        "YumM\u00f3 : une adresse chinoise reputee a Rouen pour ses plats maison genereux inspires de Shanghai et Xi'an.",
        "Les avis reviennent souvent sur les portions copieuses, les saveurs reconfortantes et l'accueil chaleureux.",
        "Ideal pour un dejeuner rapide, un repas entre amis ou une grosse envie de comfort food a bon prix."
      ],
      insight: "Le verdict : simple, authentique et tres fiable."
    },
    favoriteDishesTitle: "Les plats favoris",
    favoriteDishesSubtitle: "Les plats que les clients recommandent le plus",
    dishes: [
      {
        name: "Bouillon Mixian",
        note: "Extase & Reconfort",
        image: "/assets/yummo-bouillon-mixian.png"
      },
      {
        name: "Baos",
        note: "Nuage & Gourmandise",
        image: "/assets/yummo-baos.png"
      },
      {
        name: "Raviolis / Bouchees",
        note: "Finesse & Explosion",
        image: "/assets/yummo-raviolis.png"
      }
    ],
    infoValues: ["20-30 EUR", "Comfort food", "Entre amis"],
    cta: "J'y vais",
    translations: {
      en: {
        heroSub: "Asian street food - Rouen",
        ratingCount: "+400 reviews",
        trending: "Trending",
        reviewSummary: {
          title: "AI review summary",
          lines: [
            "YumM\u00f3 is a popular Chinese spot in Rouen for generous homemade dishes inspired by Shanghai and Xi'an.",
            "Reviews often mention large portions, comforting flavors and a warm welcome.",
            "Ideal for a quick lunch, a meal with friends or a serious comfort food craving at a fair price."
          ],
          insight: "The verdict: simple, authentic and very reliable."
        },
        favoriteDishesTitle: "Favorite dishes",
        favoriteDishesSubtitle: "The dishes customers recommend most",
        dishes: [
          { name: "Mixian broth", note: "Comforting & rich", image: "/assets/yummo-bouillon-mixian.png" },
          { name: "Baos", note: "Soft & indulgent", image: "/assets/yummo-baos.png" },
          { name: "Dumplings / bites", note: "Delicate & punchy", image: "/assets/yummo-raviolis.png" }
        ],
        infoValues: ["20-30 EUR", "Comfort food", "With friends"],
        cta: "I'm going"
      }
    }
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
    trending: "Trending",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bistrot%20Saigon%20Paris",
    reviewSummary: {
      title: "Resume IA des avis",
      lines: [
        "Cuisine vietnamienne saluee pour son authenticite et ses portions genereuses.",
        "Accueil chaleureux et humain, rare dans la restauration rapide.",
        "Le Bo Bun Royal : le plat signature ultra-genereux qui fait l'unanimite."
      ],
      insight: "Le verdict : genereux, chaleureux et tres gourmand."
    },
    favoriteDishesTitle: "Les plats favoris",
    favoriteDishesSubtitle: "Les plats que les clients recommandent le plus",
    dishes: [
      {
        name: "Bo Bun Royal",
        note: "Signature & Genereux",
        image: "/assets/bistrot-saigon-hero.jpg"
      },
      {
        name: "Nems maison",
        note: "Croustillant & Fondant"
      },
      {
        name: "Pho",
        note: "Bouillon & Herbes"
      }
    ],
    infoValues: ["20-30 EUR", "Vietnamien", "Cozy"],
    cta: "J'y vais",
    translations: {
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
          { name: "Royal Bo Bun", note: "Signature & generous", image: "/assets/bistrot-saigon-hero.jpg" },
          { name: "Homemade nems", note: "Crispy & tender" },
          { name: "Pho", note: "Broth & herbs" }
        ],
        infoValues: ["20-30 EUR", "Vietnamese", "Cozy"],
        cta: "I'm going"
      }
    }
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

  if (!translation) return restaurant;

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
