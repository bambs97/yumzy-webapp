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
  return globalThis.Netlify?.env?.get(name) || process.env[name] || "";
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

function addPassword(passwords, restaurantId, password) {
  const cleanId = String(restaurantId || "").trim().toLowerCase();
  const cleanPassword = String(password || "").trim();
  if (cleanId && cleanPassword) passwords[cleanId] = cleanPassword;
}

function readRestaurantPasswords() {
  const passwords = {};
  const raw = (
    getEnv("YUMZY_RESTAURANT_PASSWORDS") ||
    getEnv("YUMZY_RESTAURANTS_PASSWORDS") ||
    getEnv("VITE_YUMZY_RESTAURANT_PASSWORDS")
  ).trim();

  if (raw) {
    try {
      const parsed = JSON.parse(raw.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'"));
      Object.entries(parsed).forEach(([restaurantId, password]) => {
        addPassword(passwords, restaurantId, password);
      });
    } catch (error) {
      // Format simple accepte dans Netlify: yummo-rouen=motdepasse,bistrot-saigon-paris=motdepasse
      raw.split(",").forEach((pair) => {
        const separatorIndex = pair.indexOf("=");
        if (separatorIndex === -1) return;
        addPassword(passwords, pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1));
      });
    }
  }

  // Variables dediees, plus simples et moins fragiles que le JSON.
  addPassword(passwords, "yummo-rouen", getEnv("YUMZY_YUMMO_ROUEN_PASSWORD") || getEnv("YUMMO_ROUEN_PASSWORD"));
  addPassword(
    passwords,
    "bistrot-saigon-paris",
    getEnv("YUMZY_BISTROT_SAIGON_PARIS_PASSWORD") || getEnv("BISTROT_SAIGON_PARIS_PASSWORD")
  );

  // Option globale si tu veux donner le meme mot de passe a tous les restaurateurs au debut.
  const sharedPassword = getEnv("YUMZY_RESTAURANT_PASSWORD").trim();
  if (sharedPassword) {
    addPassword(passwords, "yummo-rouen", sharedPassword);
    addPassword(passwords, "bistrot-saigon-paris", sharedPassword);
  }

  return passwords;
}

function readRestaurantPassword(restaurantId) {
  const restaurantPasswords = readRestaurantPasswords();
  const normalizedId = restaurantId.trim().toLowerCase();

  return {
    password: restaurantPasswords[normalizedId],
    configuredRestaurants: Object.keys(restaurantPasswords)
  };
}

export default async (request) => {
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
    const normalizedRestaurantId = restaurantId.trim().toLowerCase();
    const { password: restaurantPassword, configuredRestaurants } = readRestaurantPassword(normalizedRestaurantId);

    if (!normalizedRestaurantId || !restaurantPassword) {
      return json({
        ok: false,
        error: "Restaurant non configure.",
        receivedRestaurantId: normalizedRestaurantId || null,
        configuredRestaurants
      }, 401);
    }
    if (password !== restaurantPassword) {
      return json({ ok: false, error: "Identifiants incorrects." }, 401);
    }

    const user = { role: "restaurant", restaurant_id: normalizedRestaurantId, name: normalizedRestaurantId };
    return json({ ok: true, user, token: await createSession(user) });
  }

  return json({ ok: false, error: "Role inconnu." }, 400);
};

export const config = {
  path: "/api/auth",
  method: ["GET", "POST"]
};
