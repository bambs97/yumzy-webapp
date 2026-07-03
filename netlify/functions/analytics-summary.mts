const POSTHOG_EVENTS = ["restaurant_view", "qr_scan", "go_click", "dish_click"];

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

export default async (request) => {
  const url = new URL(request.url);
  const days = safeDays(url.searchParams.get("days"));
  const restaurantId = url.searchParams.get("restaurant_id") || "";

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
  path: "/api/analytics-summary",
  method: ["GET"]
};
