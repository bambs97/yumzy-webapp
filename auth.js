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

function readRestaurantPasswords() {
  try {
    return JSON.parse(getEnv("YUMZY_RESTAURANT_PASSWORDS") || "{}");
  } catch (error) {
    return {};
  }
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
};

export const config = {
  path: "/api/auth",
  method: ["GET", "POST"]
};
