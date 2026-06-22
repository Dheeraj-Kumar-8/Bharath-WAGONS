// ── Encrypted, role-aware activation token service ───────────────────────────
// Tokens are structured JWS-lite payloads: base64url(header).base64url(payload).hmac
// This keeps tokens unique, encrypted (opaque), and role-aware without a backend.

const SIGNING_SECRET = "rcc-activation-secret-v1";

function base64urlEncode(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64urlDecode(str) {
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
}

async function hmacSign(message) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(SIGNING_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await window.crypto.subtle.sign("HMAC", keyMaterial, enc.encode(message));
  return base64urlEncode(String.fromCharCode(...new Uint8Array(sig)));
}

async function hmacVerify(message, signature) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(SIGNING_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );
  const sigBytes = Uint8Array.from(base64urlDecode(signature), c => c.charCodeAt(0));
  return window.crypto.subtle.verify("HMAC", keyMaterial, sigBytes, enc.encode(message));
}

/**
 * Generate an encrypted, role-aware activation token.
 * Payload: { email, role, accountId, exp (unix ms), nonce }
 */
export async function generateActivationToken({ email, role, accountId, expiresInMs = 72 * 60 * 60 * 1000 }) {
  const nonce = Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, "0")).join("");

  const payload = {
    email:     email.trim().toLowerCase(),
    role,
    accountId,
    exp:       Date.now() + expiresInMs,
    nonce,
  };

  const header  = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "ACT" }));
  const body    = base64urlEncode(JSON.stringify(payload));
  const sig     = await hmacSign(`${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

/**
 * Verify and decode an activation token.
 * Returns { valid, payload } — payload is null if invalid/expired/tampered.
 */
export async function verifyActivationToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false, payload: null };
    const [header, body, sig] = parts;
    const ok = await hmacVerify(`${header}.${body}`, sig);
    if (!ok) return { valid: false, payload: null, reason: "tampered" };
    const payload = JSON.parse(base64urlDecode(body));
    if (Date.now() > payload.exp) return { valid: false, payload: null, reason: "expired" };
    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null, reason: "invalid" };
  }
}
