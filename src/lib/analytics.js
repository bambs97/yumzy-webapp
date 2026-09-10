import posthog from "posthog-js";

let posthogIsReady = false;

function getAnonymousId() {
  const createId = () => {
    const randomPart = globalThis.crypto?.randomUUID?.()
      || `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    return `anon_${randomPart}`;
  };

  try {
    const existingId = localStorage.getItem("yumzy_anon_id");
    if (existingId) return existingId;

    const newId = createId();
    localStorage.setItem("yumzy_anon_id", newId);
    return newId;
  } catch (error) {
    return createId();
  }
}

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://eu.i.posthog.com";

  // La cle projet PostHog n'est pas une cle secrete, mais elle reste configurable cote Netlify.
  if (!key) return true;

  posthog.init(key, {
    api_host: host,
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    persistence: "memory",
    person_profiles: "identified_only"
  });

  posthogIsReady = true;
  return true;
}

export function getSourceFromUrl() {
  const source = new URLSearchParams(window.location.search).get("source");
  return source?.trim().toLowerCase() || undefined;
}

export function trackEvent(eventName, properties = {}) {
  const cleanProperties = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== "")
  );

  const eventProperties = {
    ...cleanProperties,
    distinct_id: getAnonymousId(),
    $current_url: window.location.href
  };

  // Tous les events passent d'abord par Netlify pour eviter les blocages sur mobile.
  fetch("/api/track-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: eventName, properties: eventProperties }),
    keepalive: true
  }).then((response) => {
    if (!response.ok) throw new Error("Track endpoint unavailable");
  }).catch(() => {
    // PostHog direct reste un secours si la fonction Netlify est indisponible.
    if (posthogIsReady) posthog.capture(eventName, eventProperties);
  });
}
