import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

/** Supabase stores the session in cookies named sb-<project ref>-auth-token (split into .0, .1… when large). */
function hasAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
}

/**
 * Keeps the Supabase session fresh: when the access token has expired, the refresh token is exchanged for a new
 * one and the cookies are rewritten on both the request (for this render) and the response (for the browser).
 * Visitors without a session cookie skip the Auth round trip entirely.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  if (!config || !hasAuthCookie(request)) return response;

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // No-store headers so a CDN never serves one visitor's refreshed session cookies to another.
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Nothing may run between creating the client and this call: it is what refreshes an expired session.
  await supabase.auth.getClaims();
  return response;
}
