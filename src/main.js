import { getSourceFromUrl, initAnalytics, trackEvent } from "./lib/analytics.js";
import { getRestaurantBySlug, getRestaurantSlugFromPath, getRestaurantView } from "./data/restaurants.js";

const restaurant = getRestaurantBySlug(getRestaurantSlugFromPath(window.location.pathname));
let selectedLanguage = getInitialLanguage();
const defaultImage = "/assets/yummo-hero.jpeg";

function getInitialLanguage() {
  const savedLanguage = getSavedLanguage();
  if (savedLanguage && savedLanguage !== "auto") return savedLanguage;

  const browserLanguage = navigator.language?.slice(0, 2);
  return browserLanguage === "fr" ? "fr" : "en";
}

function getSavedLanguage() {
  try {
    return localStorage.getItem("yumzyLanguage");
  } catch (error) {
    return null;
  }
}

function getRenderedRestaurant() {
  return getRestaurantView(restaurant, selectedLanguage);
}

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
  const renderedRestaurant = getRenderedRestaurant();

  setText(".ia-title", renderedRestaurant.reviewSummary.title);

  const copy = document.querySelector(".ia-copy");
  if (copy) {
    copy.innerHTML = renderedRestaurant.reviewSummary.lines.map((line) => `<p>${line}</p>`).join("");
  }

  const insight = document.querySelector(".ia-insight span:last-child");
  if (insight) insight.textContent = renderedRestaurant.reviewSummary.insight;
}

function renderDishes() {
  const renderedRestaurant = getRenderedRestaurant();
  const cards = document.querySelectorAll(".dish-card");

  cards.forEach((card, index) => {
    const dish = renderedRestaurant.dishes[index];
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
      img.alt = dish.name;
      if (!dish.image) {
        img.removeAttribute("src");
        img.style.display = "none";
        return;
      }

      img.src = dish.image;
      img.style.display = "";
      img.onerror = () => {
        img.onerror = null;
        img.removeAttribute("src");
        img.style.display = "none";
      };
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
  const renderedRestaurant = getRenderedRestaurant();

  document.title = renderedRestaurant.title;

  setText(".hero-title", renderedRestaurant.name);
  setText(".hero-sub", renderedRestaurant.heroSub);
  setText(".rating-num", renderedRestaurant.rating);
  setText(".rating-count", renderedRestaurant.ratingCount);
  setText(".trend-label", renderedRestaurant.trending);
  setText(".section-title", renderedRestaurant.favoriteDishesTitle);
  setText(".section-subtitle", renderedRestaurant.favoriteDishesSubtitle);
  setText(".cta", renderedRestaurant.cta);

  const heroImage = document.querySelector(".hero-img");
  if (heroImage) {
    heroImage.src = renderedRestaurant.heroImage || defaultImage;
    heroImage.alt = renderedRestaurant.name;
    heroImage.onerror = () => {
      heroImage.onerror = null;
      heroImage.src = defaultImage;
    };
  }

  document.querySelectorAll(".info-value").forEach((element, index) => {
    if (renderedRestaurant.infoValues[index]) element.textContent = renderedRestaurant.infoValues[index];
  });

  renderReviewSummary();
  renderDishes();
  document.body.classList.remove("is-loading-restaurant");
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

  button.href = "#";
  button.removeAttribute("target");
  button.removeAttribute("rel");

  button.addEventListener(
    "pointerdown",
    () => {
      // On mesure l'intention sans changer le comportement visuel du bouton.
      trackEvent("go_click", getBaseEventProperties());
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
      const language = option.dataset.lang;
      selectedLanguage = language === "auto" ? getInitialLanguage() : language;
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
