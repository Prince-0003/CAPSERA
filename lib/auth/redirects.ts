/** Production hosts. capsera.shop is canonical; www.capsera.shop is accepted too. */
export const CANONICAL_ORIGIN = "https://capsera.shop";
const PRODUCTION_ORIGINS = [CANONICAL_ORIGIN, "https://www.capsera.shop"];

type Env = Partial<Record<"NEXT_PUBLIC_SITE_URL" | "VERCEL_ENV" | "VERCEL_URL" | "NODE_ENV", string>>;

function originOf(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Origin for links in auth emails (confirmation, password reset). The request's own origin is used only when it is
 * a known host, so a forged Host header can't put another domain into an email; anything else falls back to the
 * configured site URL or capsera.shop. Supabase also rejects redirects that aren't in its Redirect URLs list.
 */
export function authRedirectOrigin(requestUrl: string, env: Env = process.env): string {
  const origin = originOf(requestUrl);
  const configured = originOf(env.NEXT_PUBLIC_SITE_URL);
  const allowed = new Set(PRODUCTION_ORIGINS);
  if (configured) allowed.add(configured);
  if (env.VERCEL_ENV === "preview" && env.VERCEL_URL) allowed.add(`https://${env.VERCEL_URL}`);
  if (origin && allowed.has(origin)) return origin;
  if (origin && env.NODE_ENV !== "production" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return configured ?? CANONICAL_ORIGIN;
}

/**
 * A same-site path to continue to after signing in or following an email link, or the fallback. Rejects absolute
 * URLs and protocol-relative tricks ("//evil.example", "/\\evil.example") so it can't become an open redirect.
 */
export function safeNextPath(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  try {
    const base = "https://capsera.invalid";
    const url = new URL(value, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
