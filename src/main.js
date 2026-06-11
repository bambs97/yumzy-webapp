import { getSourceFromUrl, initAnalytics, trackEvent } from "./lib/analytics.js";
import { getRestaurantBySlug, getRestaurantSlugFromPath } from "./data/restaurants.js";

const restaurant = getRestaurantBySlug(getRestaurantSlugFromPath(window.location.pathname));

function getBaseEventProperties() {
  return {
    restaurant_id: restaurant.id,
    restaurant_name: restaurant.name,
    page_path: window.location.pathname,
    source: getSourceFromUrl()
  };
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value) element.textContent = value;
}

function renderReviewSummary() {
  setText(".ia-title", restaurant.reviewSummary.title);

  const copy = document.querySelector(".ia-copy");
  if (copy) {
    copy.innerHTML = restaurant.reviewSummary.lines.map((line) => `<p>${line}</p>`).join("");
  }

  const insight = document.querySelector(".ia-insight span:last-child");
  if (insight) insight.textContent = restaurant.reviewSummary.insight;
}

function renderDishes() {
  const cards = document.querySelectorAll(".dish-card");

  cards.forEach((card, index) => {
    const dish = restaurant.dishes[index];
    if (!dish) {
      card.hidden = true;
      return;
    }

    card.hidden = false;
    const button = card.querySelector(".thumb");
    const img = card.querySelector("img");

    setTextIn(card, ".dish-name", dish.name);
    setTextIn(card, ".dish-note", dish.note);

    if (button) button.setAttribute("aria-label", `Voir ${dish.name} en grand`);
    if (img) {
      if (dish.image) img.src = dish.image;
      img.alt = dish.name;
      img.style.display = "";
    }
  });
}

function setTextIn(parent, selector, value) {
  const element = parent.querySelector(selector);
  if (element && value) {
    const star = element.querySelector("span");
    element.textContent = value;
    if (star) {
      element.prepend(star);
      star.insertAdjacentText("afterend", " ");
    }
  }
}

function renderRestaurant() {
  document.title = restaurant.title;

  setText(".hero-title", restaurant.name);
  setText(".hero-sub", restaurant.heroSub);
  setText(".rating-num", restaurant.rating);
  setText(".rating-count", restaurant.ratingCount);
  setText(".trend-label", restaurant.trending);
  setText(".section-title", restaurant.favoriteDishesTitle);
  setText(".section-subtitle", restaurant.favoriteDishesSubtitle);
  setText(".cta", restaurant.cta);

  const heroImage = document.querySelector(".hero-img");
  if (heroImage && restaurant.heroImage) {
    heroImage.src = restaurant.heroImage;
    heroImage.alt = restaurant.name;
  }

  document.querySelectorAll(".info-value").forEach((element, index) => {
    if (restaurant.infoValues[index]) element.textContent = restaurant.infoValues[index];
  });

  renderReviewSummary();
  renderDishes();
}

function trackRestaurantView() {
  const properties = getBaseEventProperties();

  // Un QR code peut pointer vers /r/slug-du-restaurant?source=qr.
  if (properties.source === "qr") {
    trackEvent("qr_scan", properties);
  }

  trackEvent("restaurant_view", properties);
}

function initGoClickTracking() {
  const button = document.querySelector("[data-analytics-event='go_click']");
  if (!button) return;

  button.href = restaurant.mapsUrl;

  button.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      // On envoie l'event avant d'ouvrir Google Maps.
      trackEvent("go_click", getBaseEventProperties());
      window.open(restaurant.mapsUrl, "_blank", "noopener,noreferrer");
    },
    true
  );
}

function initDishClickTracking() {
  document.addEventListener(
    "click",
    (event) => {
      const dishButton = event.target.closest(".fav .thumb");
      const dishCard = dishButton?.closest(".dish-card");
      if (!dishButton || !dishCard) return;

      const dishName = dishCard.querySelector(".dish-name")?.textContent?.trim();

      trackEvent("dish_click", {
        ...getBaseEventProperties(),
        dish_name: dishName
      });
    },
    true
  );
}

function keepRestaurantDataAfterLanguageChange() {
  document.querySelectorAll(".lang-option").forEach((option) => {
    option.addEventListener("click", () => {
      window.setTimeout(renderRestaurant, 0);
    });
  });
}

renderRestaurant();
initAnalytics();
trackRestaurantView();
initGoClickTracking();
initDishClickTracking();
keepRestaurantDataAfterLanguageChange();
