import posthog from "posthog-js";

let isReady = false;

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://eu.i.posthog.com";

  // La cle projet PostHog n'est pas une cle secrete, mais elle reste configurable cote Netlify.
  if (!key) return false;

  posthog.init(key, {
    api_host: host,
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    persistence: "memory",
    person_profiles: "identified_only"
  });

  isReady = true;
  return true;
}

export function getSourceFromUrl() {
  return new URLSearchParams(window.location.search).get("source") || undefined;
}

export function trackEvent(eventName, properties = {}) {
  if (!isReady) return;

  const cleanProperties = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== "")
  );

  posthog.capture(eventName, cleanProperties);
}
