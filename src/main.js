import { getSourceFromUrl, initAnalytics, trackEvent } from "./lib/analytics.js";

const restaurant = {
  id: "yummo-rouen",
  name: "YumM\u00f3",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=YumM%C3%B3%20Rouen"
};

function getBaseEventProperties() {
  return {
    restaurant_id: restaurant.id,
    restaurant_name: restaurant.name,
    page_path: window.location.pathname,
    source: getSourceFromUrl()
  };
}

function trackRestaurantView() {
  const properties = getBaseEventProperties();

  // Un QR code peut pointer vers /r/yummo-rouen?source=qr.
  if (properties.source === "qr") {
    trackEvent("qr_scan", properties);
  }

  trackEvent("restaurant_view", properties);
}

function initGoClickTracking() {
  const button = document.querySelector("[data-analytics-event='go_click']");
  if (!button) return;

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

initAnalytics();
trackRestaurantView();
initGoClickTracking();
initDishClickTracking();
