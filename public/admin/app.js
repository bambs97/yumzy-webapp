const numberFormatter = new Intl.NumberFormat("fr-FR");
const sessionKey = "yumzy_admin_session";
const knownRestaurants = [
  { id: "yummo-rouen", name: "YumMo Rouen" },
  { id: "bistrot-saigon-paris", name: "Bistrot Saigon Paris" }
];
const restaurantPortalMatch = window.location.pathname.match(/^\/restaurant\/([^/?#]+)/);
const portalRestaurantId = restaurantPortalMatch?.[1] || "";
const isRestaurantPortal = Boolean(portalRestaurantId);

const state = {
  days: new URLSearchParams(window.location.search).get("days") || "30",
  restaurantId: portalRestaurantId || new URLSearchParams(window.location.search).get("restaurant_id") || "",
  token: localStorage.getItem(sessionKey) || "",
  user: null
};

const elements = {
  loginView: document.getElementById("loginView"),
  loginForm: document.getElementById("loginForm"),
  loginCopy: document.getElementById("loginCopy"),
  loginRoleField: document.getElementById("loginRoleField"),
  loginRole: document.getElementById("loginRole"),
  loginRestaurant: document.getElementById("loginRestaurant"),
  restaurantLoginField: document.getElementById("restaurantLoginField"),
  loginPassword: document.getElementById("loginPassword"),
  loginError: document.getElementById("loginError"),
  sessionLabel: document.getElementById("sessionLabel"),
  logoutButton: document.getElementById("logoutButton"),
  setupBanner: document.getElementById("setupBanner"),
  restaurantFilter: document.getElementById("restaurantFilter"),
  periodFilter: document.getElementById("periodFilter"),
  chart: document.getElementById("chart"),
  activityPeak: document.getElementById("activityPeak"),
  topDishes: document.getElementById("topDishes"),
  restaurants: document.getElementById("restaurants")
};

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

function setLoggedIn(user) {
  state.user = user;
  elements.loginView.hidden = true;
  elements.sessionLabel.textContent = user.role === "admin" ? "Mode admin" : restaurantName(user.restaurant_id);

  const isRestaurant = user.role === "restaurant";
  elements.restaurantFilter.disabled = isRestaurant;
  if (isRestaurant) state.restaurantId = user.restaurant_id;
}

function logout() {
  localStorage.removeItem(sessionKey);
  state.token = "";
  state.user = null;
  elements.loginView.hidden = false;
}

async function verifySession() {
  if (!state.token) return false;
  const response = await fetch("/api/auth", { headers: authHeaders() });
  if (!response.ok) return false;
  const data = await response.json();
  if (isRestaurantPortal && (data.user.role !== "restaurant" || data.user.restaurant_id !== portalRestaurantId)) {
    logout();
    return false;
  }
  setLoggedIn(data.user);
  return true;
}

async function login(event) {
  event.preventDefault();
  elements.loginError.hidden = true;

  const body = {
    role: isRestaurantPortal ? "restaurant" : elements.loginRole.value,
    restaurant_id: isRestaurantPortal ? portalRestaurantId : elements.loginRestaurant.value,
    password: elements.loginPassword.value
  };

  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();

  if (!response.ok) {
    elements.loginError.textContent = data.error || "Connexion impossible.";
    elements.loginError.hidden = false;
    return;
  }

  state.token = data.token;
  localStorage.setItem(sessionKey, data.token);
  setLoggedIn(data.user);
  await loadAnalytics();
}

function updateUrl() {
  if (isRestaurantPortal) return;

  const params = new URLSearchParams();
  if (state.days !== "30") params.set("days", state.days);
  if (state.restaurantId && state.user?.role !== "restaurant") params.set("restaurant_id", state.restaurantId);
  const query = params.toString();
  history.replaceState(null, "", query ? `/admin/?${query}` : "/admin/");
}

async function loadAnalytics() {
  updateUrl();
  setLoading();

  const params = new URLSearchParams({ days: state.days });
  if (state.restaurantId) params.set("restaurant_id", state.restaurantId);

  const response = await fetch(`/api/analytics-summary?${params.toString()}`, { headers: authHeaders() });
  const data = await response.json();

  if (response.status === 401) {
    logout();
    throw new Error("Connexion requise.");
  }
  if (!response.ok) throw new Error(data.detail || data.error || "Erreur analytics");

  render(data);
}

function setLoading() {
  setText("qr_scan", "...");
  setText("go_click", "...");
  setText("conversionRate", "...");
  setText("dish_click", "...");
}

function render(data) {
  elements.setupBanner.hidden = !data.setupRequired;
  const restaurants = mergeRestaurants(data.restaurants || []);

  setText("qr_scan", formatNumber(data.totals.qr_scan));
  setText("go_click", formatNumber(data.totals.go_click));
  setText("conversionRate", `${formatNumber(data.conversionRate)}%`);
  setText("dish_click", formatNumber(data.totals.dish_click));
  renderDecisionSummary(data);
  renderRestaurantFilter(restaurants);
  renderChart(data.timeline || []);
  renderTopDishes(data.topDishes || []);
  renderRestaurants(restaurants);
}

function mergeRestaurants(restaurants) {
  const byId = new Map();

  knownRestaurants.forEach((restaurant) => {
    byId.set(restaurant.id, {
      ...restaurant,
      views: 0,
      scans: 0,
      goClicks: 0,
      dishClicks: 0
    });
  });

  restaurants.forEach((restaurant) => {
    byId.set(restaurant.id, {
      ...byId.get(restaurant.id),
      ...restaurant
    });
  });

  if (state.user?.role === "restaurant") {
    return [byId.get(state.user.restaurant_id)].filter(Boolean);
  }

  return Array.from(byId.values());
}

function renderDecisionSummary(data) {
  const scans = Number(data.totals.qr_scan || 0);
  const decisions = Number(data.totals.go_click || 0);
  const rate = Number(data.conversionRate || 0);
  const days = Number(data.period?.days || state.days);
  const periodLabel = days === 1 ? "aujourd'hui" : `sur les ${days} derniers jours`;

  if (!scans) {
    setText("decisionSummary", "Votre fiche commence a collecter des donnees.");
    return;
  }

  if (decisions) {
    setText(
      "decisionSummary",
      `${periodLabel[0].toUpperCase()}${periodLabel.slice(1)}, ${decisions} personne${decisions > 1 ? "s" : ""} sur ${scans} ont indique vouloir venir apres avoir scanne votre QR code.`
    );
    return;
  }

  setText(
    "decisionSummary",
    `Votre fiche a convaincu ${formatNumber(rate)} % des personnes ayant scanne votre QR code ${periodLabel}.`
  );
}

function renderRestaurantFilter(restaurants) {
  const current = state.restaurantId || elements.restaurantFilter.value;
  elements.restaurantFilter.innerHTML = state.user?.role === "restaurant" ? "" : `<option value="">Vue globale</option>`;

  restaurants.forEach((restaurant) => {
    const option = document.createElement("option");
    option.value = restaurant.id;
    option.textContent = restaurant.name || restaurant.id;
    elements.restaurantFilter.appendChild(option);
  });

  elements.restaurantFilter.value = current;
}

function renderChart(timeline) {
  if (!timeline.length) {
    elements.chart.style.setProperty("--cols", 1);
    elements.chart.innerHTML = `<div class="empty">Pas encore assez de donnees sur cette periode.</div>`;
    elements.activityPeak.textContent = "Aucune activite enregistree sur cette periode.";
    return;
  }

  const max = Math.max(...timeline.flatMap((point) => [point.scans, point.goClicks]), 1);
  elements.chart.style.setProperty("--cols", timeline.length);
  elements.chart.innerHTML = timeline.map((point) => {
    const scansHeight = Math.max((point.scans / max) * 82, point.scans ? 5 : 0);
    const clicksHeight = Math.max((point.goClicks / max) * 82, point.goClicks ? 5 : 0);
    const date = new Date(`${point.day}T12:00:00`);
    const weekday = date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
    const label = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

    return `
      <div class="bar-group" title="${formatNumber(point.scans)} scans, ${formatNumber(point.goClicks)} intentions">
        <div class="bar-pair">
          <div class="bar-column">
            <span class="bar-value">${formatNumber(point.scans)}</span>
            <div class="bar" style="height:${scansHeight}%" aria-label="${formatNumber(point.scans)} scans"></div>
          </div>
          <div class="bar-column">
            <span class="bar-value">${formatNumber(point.goClicks)}</span>
            <div class="bar clicks" style="height:${clicksHeight}%" aria-label="${formatNumber(point.goClicks)} intentions"></div>
          </div>
        </div>
        <div class="bar-label"><span>${weekday}</span><strong>${label}</strong></div>
      </div>
    `;
  }).join("");

  const peak = timeline.reduce((best, point) => {
    if (Number(point.scans) > Number(best.scans)) return point;
    if (Number(point.scans) === Number(best.scans) && Number(point.goClicks) > Number(best.goClicks)) return point;
    return best;
  });
  const peakDay = new Date(`${peak.day}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long" });
  const scans = Number(peak.scans || 0);
  const intentions = Number(peak.goClicks || 0);
  elements.activityPeak.textContent = `Pic d'activite ${peakDay} : ${formatNumber(scans)} scan${scans > 1 ? "s" : ""} et ${formatNumber(intentions)} intention${intentions > 1 ? "s" : ""}.`;
}

function renderTopDishes(dishes) {
  if (!dishes.length) {
    elements.topDishes.innerHTML = `<div class="empty">Aucun clic plat pour le moment.</div>`;
    return;
  }

  elements.topDishes.innerHTML = dishes.map((dish, index) => `
    <div class="item">
      <div>
        <strong>${index + 1}. ${escapeHtml(dish.name)}</strong>
        <span>${escapeHtml(dish.restaurantName)}</span>
      </div>
      <div class="pill">${formatNumber(dish.clicks)}</div>
    </div>
  `).join("");
}

function renderRestaurants(restaurants) {
  if (!restaurants.length) {
    elements.restaurants.innerHTML = `<div class="empty">Aucun restaurant detecte pour cette periode.</div>`;
    return;
  }

  elements.restaurants.innerHTML = restaurants.map((restaurant) => {
    const decisionRate = restaurant.scans
      ? Math.round((restaurant.goClicks / restaurant.scans) * 1000) / 10
      : 0;

    return `
    <div class="table-row">
      <div>
        <strong>${escapeHtml(restaurant.name)}</strong>
        <span>${escapeHtml(restaurant.id)}</span>
      </div>
      <div class="metric"><strong>${formatNumber(restaurant.scans)}</strong><span>QR</span></div>
      <div class="metric"><strong>${formatNumber(restaurant.goClicks)}</strong><span>Intentions</span></div>
      <div class="metric"><strong>${formatNumber(decisionRate)}%</strong><span>Intention</span></div>
      <div class="metric"><strong>${formatNumber(restaurant.dishClicks)}</strong><span>Plats</span></div>
    </div>
  `;
  }).join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function restaurantName(restaurantId) {
  return knownRestaurants.find((restaurant) => restaurant.id === restaurantId)?.name || restaurantId;
}

function initPortalMode() {
  if (!isRestaurantPortal) return;

  elements.loginRole.value = "restaurant";
  elements.loginRestaurant.value = portalRestaurantId;
  elements.loginRoleField.hidden = true;
  elements.restaurantLoginField.hidden = true;
  elements.restaurantFilter.disabled = true;
  elements.loginCopy.textContent = `Acces aux statistiques ${restaurantName(portalRestaurantId)}.`;
  document.title = `${restaurantName(portalRestaurantId)} - Yumzy Analytics`;
}

function showError(error) {
  elements.setupBanner.hidden = false;
  elements.setupBanner.innerHTML = `<strong>Erreur analytics.</strong> ${escapeHtml(error.message)}`;
  setText("qr_scan", "0");
  setText("go_click", "0");
  setText("conversionRate", "0%");
  setText("dish_click", "0");
}

initPortalMode();
elements.periodFilter.value = state.days;
elements.restaurantFilter.value = state.restaurantId;
elements.loginRole.addEventListener("change", () => {
  if (isRestaurantPortal) return;
  elements.restaurantLoginField.hidden = elements.loginRole.value !== "restaurant";
});
elements.loginForm.addEventListener("submit", (event) => login(event).catch(showError));
elements.logoutButton.addEventListener("click", logout);
elements.periodFilter.addEventListener("change", () => {
  state.days = elements.periodFilter.value;
  loadAnalytics().catch(showError);
});
elements.restaurantFilter.addEventListener("change", () => {
  state.restaurantId = elements.restaurantFilter.value;
  loadAnalytics().catch(showError);
});

verifySession()
  .then((valid) => {
    if (valid) return loadAnalytics();
    elements.loginView.hidden = false;
  })
  .catch(() => {
    logout();
  });
