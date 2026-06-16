// ── Email domain validation — single source of truth ─────────────────────────
// Only @railway.gov.in addresses are permitted across ALL roles and entry points.

export const ALLOWED_DOMAIN = "railway.gov.in";

export const DOMAIN_ERROR =
  "Access is restricted to official Railway email accounts (@railway.gov.in).";

/**
 * Returns true only if the email ends with @railway.gov.in (case-insensitive).
 * Also rejects subdomains like @sub.railway.gov.in to prevent bypass.
 */
export function isValidRailwayEmail(email) {
  if (!email || typeof email !== "string") return false;
  const lower = email.trim().toLowerCase();
  // Must match exactly user@railway.gov.in — no subdomain bypass
  return /^[^\s@]+@railway\.gov\.in$/.test(lower);
}
