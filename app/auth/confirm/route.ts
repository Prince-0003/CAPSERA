import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/**
 * Landing page for links in Supabase auth emails (sign-up confirmation and password reset). Supports both:
 * - the recommended templates: ?token_hash=…&type=… (works even if the link is opened on another device), and
 * - the default templates: Supabase verifies the link, then redirects here with ?code=… (same browser only).
 * On success the session cookies are set and the visitor continues to `next` (a same-site path).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const isRecovery = next.startsWith("/reset-password") || url.searchParams.get("type") === "recovery";
  const redirectTo = (path: string) => {
    const response = NextResponse.redirect(new URL(path, url.origin), 303);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };
  const failure = () => redirectTo(isRecovery ? "/forgot-password?link=invalid" : "/signin?link=invalid");

  const supabase = await createClient();
  if (!supabase || url.searchParams.has("error") || url.searchParams.has("error_code")) return failure();

  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return redirectTo(next);
    return failure();
  }
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return redirectTo(next);
    // With the default templates Supabase has already confirmed the email before redirecting here; only starting
    // the session failed (usually: link opened in a different browser). The customer can simply sign in.
    return redirectTo(isRecovery ? "/forgot-password?link=other-browser" : "/signin?link=confirmed");
  }
  return failure();
}
