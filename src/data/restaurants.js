export const restaurants = {
  "yummo-rouen": {
    id: "yummo-rouen",
    slug: "yummo-rouen",
    name: "YumM\u00f3",
    title: "YumM\u00f3 - Yumzy",
    heroSub: "Street food asiatique - Rouen",
    heroImage: null,
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
        note: "Extase & Reconfort"
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
    cta: "J'y vais"
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
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc500f?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Nems maison",
        note: "Croustillant & Fondant",
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Pho",
        note: "Bouillon & Herbes",
        image: "https://images.unsplash.com/photo-1604908811879-0a021d7d65aa?auto=format&fit=crop&w=800&q=80"
      }
    ],
    infoValues: ["20-30 EUR", "Vietnamien", "Cozy"],
    cta: "J'y vais"
  }
};

export function getRestaurantBySlug(slug) {
  return restaurants[slug] || restaurants["yummo-rouen"];
}

export function getRestaurantSlugFromPath(pathname) {
  const match = pathname.match(/^\/r\/([^/?#]+)/);
  return match?.[1] || "yummo-rouen";
}
