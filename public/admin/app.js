const numberFormatter = new Intl.NumberFormat("fr-FR");
const sessionKey = "yumzy_admin_session";

const state = {
  days: new URLSearchParams(window.location.search).get("days") || "7",
  restaurantId: new URLSearchParams(window.location.search).get("restaurant_id") || "",
  token: localStorage.getItem(sessionKey) || "",
  user: null
};

const elements = {
  loginView: document.getElementById("loginView"),
  loginForm: document.getElementById("loginForm"),
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
  elements.sessionLabel.textContent = user.role === "admin" ? "Admin" : `Restaurateur: ${user.restaurant_id}`;

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
  setLoggedIn(data.user);
  return true;
}

async function login(event) {
  event.preventDefault();
  elements.loginError.hidden = true;

  const body = {
    role: elements.loginRole.value,
    restaurant_id: elements.loginRestaurant.value,
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
  const params = new URLSearchParams();
  if (state.days !== "7") params.set("days", state.days);
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
  setText("qr_scan", formatNumber(data.totals.qr_scan));
  setText("restaurant_view", formatNumber(data.totals.restaurant_view));
  setText("go_click", formatNumber(data.totals.go_click));
  setText("conversionRate", `${formatNumber(data.conversionRate)}%`);
  renderDecisionSummary(data);
  renderRestaurantFilter(data.restaurants || []);
  renderChart(data.timeline || []);
  renderTopDishes(data.topDishes || []);
  renderRestaurants(data.restaurants || []);
}

function renderDecisionSummary(data) {
  const visitors = Number(data.totals.restaurant_view || 0);
  const decisions = Number(data.totals.go_click || 0);
  const rate = Number(data.conversionRate || 0);
  const periodLabel = data.period?.days === 1 ? "aujourd'hui" : "cette semaine";

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
  elements.restaurantFilter.innerHTML = `<option value="">Tous les restaurants</option>`;

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

function showError(error) {
  elements.setupBanner.hidden = false;
  elements.setupBanner.innerHTML = `<strong>Erreur analytics.</strong> ${escapeHtml(error.message)}`;
  setText("qr_scan", "0");
  setText("restaurant_view", "0");
  setText("go_click", "0");
  setText("conversionRate", "0%");
}

elements.periodFilter.value = state.days;
elements.restaurantFilter.value = state.restaurantId;
elements.loginRole.addEventListener("change", () => {
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
