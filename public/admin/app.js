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
  setText("restaurant_view", "...");
  setText("go_click", "...");
  setText("conversionRate", "...");
}

function render(data) {
  elements.setupBanner.hidden = !data.setupRequired;
  const restaurants = mergeRestaurants(data.restaurants || []);

  setText("qr_scan", formatNumber(data.totals.qr_scan));
  setText("restaurant_view", formatNumber(data.totals.restaurant_view));
  setText("go_click", formatNumber(data.totals.go_click));
  setText("conversionRate", `${formatNumber(data.conversionRate)}%`);
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
  const visitors = Number(data.totals.restaurant_view || 0);
  const decisions = Number(data.totals.go_click || 0);
  const rate = Number(data.conversionRate || 0);
  const days = Number(data.period?.days || state.days);
  const periodLabel = days === 1 ? "aujourd'hui" : `sur les ${days} derniers jours`;

  if (!visitors) {
    setText("decisionSummary", "Votre fiche commence a collecter des donnees.");
    return;
  }

  if (decisions) {
    setText(
      "decisionSummary",
      `${periodLabel[0].toUpperCase()}${periodLabel.slice(1)}, ${decisions} personne${decisions > 1 ? "s" : ""} sur ${visitors} ont decide de venir apres avoir consulte votre fiche.`
    );
    return;
  }

  setText(
    "decisionSummary",
    `Votre fiche a convaincu ${formatNumber(rate)} % des visiteurs ${periodLabel}.`
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
    return;
  }

  const max = Math.max(...timeline.flatMap((point) => [point.views, point.goClicks]), 1);
  elements.chart.style.setProperty("--cols", timeline.length);
  elements.chart.innerHTML = timeline.map((point) => {
    const viewsHeight = Math.max((point.views / max) * 100, point.views ? 6 : 0);
    const clicksHeight = Math.max((point.goClicks / max) * 100, point.goClicks ? 6 : 0);
    const label = new Date(point.day).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

    return `
      <div class="bar-group" title="${formatNumber(point.views)} vues, ${formatNumber(point.goClicks)} clics">
        <div class="bar" style="height:${viewsHeight}%"></div>
        <div class="bar clicks" style="height:${clicksHeight}%"></div>
        <div class="bar-label">${label}</div>
      </div>
    `;
  }).join("");
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

  elements.restaurants.innerHTML = restaurants.map((restaurant) => `
    <div class="table-row">
      <div>
        <strong>${escapeHtml(restaurant.name)}</strong>
        <span>${escapeHtml(restaurant.id)}</span>
      </div>
      <div class="metric"><strong>${formatNumber(restaurant.scans)}</strong><span>QR</span></div>
      <div class="metric"><strong>${formatNumber(restaurant.views)}</strong><span>Vues</span></div>
      <div class="metric"><strong>${formatNumber(restaurant.goClicks)}</strong><span>J'y vais</span></div>
      <div class="metric"><strong>${formatNumber(restaurant.dishClicks)}</strong><span>Plats</span></div>
    </div>
  `).join("");
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
  setText("restaurant_view", "0");
  setText("go_click", "0");
  setText("conversionRate", "0%");
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
