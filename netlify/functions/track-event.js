const ALLOWED_EVENTS = new Set(["qr_scan", "dish_click"]);

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
  return Netlify?.env?.get(name) || process.env[name] || "";
}

function cleanProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties || {}).filter(([, value]) => value !== undefined && value !== "")
  );
}

export default async (request) => {
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
  if (!ALLOWED_EVENTS.has(event)) {
    return json({ ok: false, error: "Event non autorise." }, 400);
  }

  const properties = cleanProperties(payload?.properties);
  const distinctId = properties.distinct_id || crypto.randomUUID();

  const response = await fetch(`${posthogHost.replace(/\/$/, "")}/i/v0/e/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: posthogKey,
      event,
      distinct_id: distinctId,
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
};

export const config = {
  path: "/api/track-event",
  method: ["GET", "POST"]
};
