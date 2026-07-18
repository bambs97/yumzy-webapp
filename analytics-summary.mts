const POSTHOG_EVENTS = ["restaurant_view", "qr_scan", "go_click", "dish_click"];
const TRACKABLE_EVENTS = new Set(["qr_scan", "dish_click"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

function getEnv(name) {
  // Netlify expose les variables aux fonctions. Le fallback process.env aide selon le runtime.
  return Netlify?.env?.get(name) || process.env[name] || "";
}

function base64UrlEncode(value) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return atob(padded);
}

async function hmac(message) {
  const secret = getEnv("YUMZY_AUTH_SECRET") || getEnv("YUMZY_ADMIN_PASSWORD") || "yumzy-dev-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  const bytes = String.fromCharCode(...new Uint8Array(signature));
  return base64UrlEncode(bytes);
}

async function createSession(user) {
  const payload = {
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

async function readSession(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !token.includes(".")) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = await hmac(encodedPayload);
  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

function safeDays(value) {
  const days = Number(value || 7);
  return Number.isFinite(days) ? Math.min(Math.max(Math.round(days), 1), 90) : 7;
}

function sqlString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function eventFilter(days, restaurantId) {
  const restaurantClause = restaurantId
    ? ` AND properties.restaurant_id = '${sqlString(restaurantId)}'`
    : "";

  return `
    event IN ('${POSTHOG_EVENTS.join("','")}')
    AND timestamp >= now() - INTERVAL ${days} DAY
    ${restaurantClause}
  `;
}

async function runHogql(query, { host, projectId, apiKey }) {
  const response = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`PostHog API ${response.status}: ${message}`);
  }

  return response.json();
}

function rows(result) {
  return Array.isArray(result?.results) ? result.results : [];
}

function toCountMap(result) {
  return rows(result).reduce((acc, row) => {
    acc[row[0]] = Number(row[1] || 0);
    return acc;
  }, {});
}

function cleanProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties || {}).filter(([, value]) => value !== undefined && value !== "")
  );
}

function readRestaurantPasswords() {
  try {
    return JSON.parse(getEnv("YUMZY_RESTAURANT_PASSWORDS") || "{}");
  } catch (error) {
    return {};
  }
}

async function handleAuth(request) {
  if (request.method === "GET") {
    const user = await readSession(request);
    return user ? json({ ok: true, user }) : json({ ok: false }, 401);
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ ok: false, error: "Body JSON invalide." }, 400);
  }

  const role = String(payload?.role || "");
  const password = String(payload?.password || "");
  const restaurantId = String(payload?.restaurant_id || "");

  if (role === "admin") {
    const adminPassword = getEnv("YUMZY_ADMIN_PASSWORD");
    if (!adminPassword) return json({ ok: false, error: "YUMZY_ADMIN_PASSWORD manquant dans Netlify." }, 500);
    if (password !== adminPassword) return json({ ok: false, error: "Identifiants incorrects." }, 401);

    const user = { role: "admin", name: "Admin Yumzy" };
    return json({ ok: true, user, token: await createSession(user) });
  }

  if (role === "restaurant") {
    const restaurantPasswords = readRestaurantPasswords();
    if (!restaurantId || !restaurantPasswords[restaurantId]) {
      return json({ ok: false, error: "Restaurant non configure." }, 401);
    }
    if (password !== restaurantPasswords[restaurantId]) {
      return json({ ok: false, error: "Identifiants incorrects." }, 401);
    }

    const user = { role: "restaurant", restaurant_id: restaurantId, name: restaurantId };
    return json({ ok: true, user, token: await createSession(user) });
  }

  return json({ ok: false, error: "Role inconnu." }, 400);
}

async function handleTrackEvent(request) {
  if (request.method === "GET") {
    return json({ ok: true, route: "/api/track-event" });
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const posthogKey = getEnv("VITE_POSTHOG_KEY");
  const posthogHost = getEnv("VITE_POSTHOG_HOST") || "https://eu.i.posthog.com";

  if (!posthogKey) {
    return json({ ok: false, error: "VITE_POSTHOG_KEY manquante dans Netlify." }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ ok: false, error: "Body JSON invalide." }, 400);
  }

  const event = String(payload?.event || "");
  if (!TRACKABLE_EVENTS.has(event)) {
    return json({ ok: false, error: "Event non autorise." }, 400);
  }

  const properties = cleanProperties(payload?.properties);
  const response = await fetch(`${posthogHost.replace(/\/$/, "")}/i/v0/e/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: posthogKey,
      event,
      distinct_id: properties.distinct_id || crypto.randomUUID(),
      properties: {
        ...properties,
        $process_person_profile: false
      }
    })
  });

  if (!response.ok) {
    return json({
      ok: false,
      error: "PostHog a refuse l'event.",
      status: response.status,
      detail: await response.text()
    }, 502);
  }

  return json({ ok: true });
}

export default async (request) => {
  const url = new URL(request.url);
  if (url.pathname === "/api/auth") {
    return handleAuth(request);
  }

  if (url.pathname === "/api/track-event") {
    return handleTrackEvent(request);
  }

  const days = safeDays(url.searchParams.get("days"));
  const user = await readSession(request);
  if (!user) {
    return json({ ok: false, error: "Connexion requise." }, 401);
  }

  const requestedRestaurantId = url.searchParams.get("restaurant_id") || "";
  const restaurantId = user.role === "restaurant" ? user.restaurant_id : requestedRestaurantId;

  const apiKey = getEnv("POSTHOG_PERSONAL_API_KEY");
  const projectId = getEnv("POSTHOG_PROJECT_ID");
  const host = getEnv("POSTHOG_API_HOST") || "https://eu.posthog.com";

  // Ces variables restent cote Netlify : elles ne sont jamais exposees dans le navigateur.
  if (!apiKey || !projectId) {
    return json({
      setupRequired: true,
      message: "La fonction Netlify ne voit pas encore les variables PostHog.",
      env: {
        hasPersonalApiKey: Boolean(apiKey),
        hasProjectId: Boolean(projectId),
        hasApiHost: Boolean(host)
      },
      period: { days },
      filters: { restaurant_id: restaurantId || null },
      user,
      totals: { restaurant_view: 0, qr_scan: 0, go_click: 0, dish_click: 0 },
      conversionRate: 0,
      restaurants: [],
      topDishes: [],
      timeline: []
    });
  }

  const filter = eventFilter(days, restaurantId);

  const totalsQuery = `
    SELECT event, count()
    FROM events
    WHERE ${filter}
    GROUP BY event
    ORDER BY event
  `;

  const restaurantsQuery = `
    SELECT
      coalesce(properties.restaurant_id, 'unknown') AS restaurant_id,
      any(coalesce(properties.restaurant_name, restaurant_id)) AS restaurant_name,
      countIf(event = 'restaurant_view') AS views,
      countIf(event = 'qr_scan') AS scans,
      countIf(event = 'go_click') AS go_clicks,
      countIf(event = 'dish_click') AS dish_clicks
    FROM events
    WHERE ${eventFilter(days, "")}
    GROUP BY restaurant_id
    ORDER BY views DESC
    LIMIT 50
  `;

  const dishesQuery = `
    SELECT
      coalesce(properties.dish_name, 'Plat inconnu') AS dish_name,
      any(coalesce(properties.restaurant_name, 'Restaurant inconnu')) AS restaurant_name,
      count() AS clicks
    FROM events
    WHERE ${filter}
      AND event = 'dish_click'
    GROUP BY dish_name
    ORDER BY clicks DESC
    LIMIT 8
  `;

  const timelineQuery = `
    SELECT
      toDate(timestamp) AS day,
      countIf(event = 'restaurant_view') AS views,
      countIf(event = 'qr_scan') AS scans,
      countIf(event = 'go_click') AS go_clicks,
      countIf(event = 'dish_click') AS dish_clicks
    FROM events
    WHERE ${filter}
    GROUP BY day
    ORDER BY day ASC
  `;

  try {
    const [totalsResult, restaurantsResult, dishesResult, timelineResult] = await Promise.all([
      runHogql(totalsQuery, { host, projectId, apiKey }),
      runHogql(restaurantsQuery, { host, projectId, apiKey }),
      runHogql(dishesQuery, { host, projectId, apiKey }),
      runHogql(timelineQuery, { host, projectId, apiKey })
    ]);

    const totals = {
      restaurant_view: 0,
      qr_scan: 0,
      go_click: 0,
      dish_click: 0,
      ...toCountMap(totalsResult)
    };

    const conversionRate = totals.restaurant_view
      ? Math.round((totals.go_click / totals.restaurant_view) * 1000) / 10
      : 0;

    return json({
      setupRequired: false,
      period: { days },
      filters: { restaurant_id: restaurantId || null },
      user,
      totals,
      conversionRate,
      restaurants: rows(restaurantsResult).map((row) => ({
        id: row[0],
        name: row[1],
        views: Number(row[2] || 0),
        scans: Number(row[3] || 0),
        goClicks: Number(row[4] || 0),
        dishClicks: Number(row[5] || 0)
      })),
      topDishes: rows(dishesResult).map((row) => ({
        name: row[0],
        restaurantName: row[1],
        clicks: Number(row[2] || 0)
      })),
      timeline: rows(timelineResult).map((row) => ({
        day: row[0],
        views: Number(row[1] || 0),
        scans: Number(row[2] || 0),
        goClicks: Number(row[3] || 0),
        dishClicks: Number(row[4] || 0)
      }))
    });
  } catch (error) {
    return json({
      setupRequired: false,
      error: "Impossible de charger les donnees PostHog.",
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
};

export const config = {
  path: ["/api/analytics-summary", "/api/track-event", "/api/auth"],
  method: ["GET", "POST"]
};
