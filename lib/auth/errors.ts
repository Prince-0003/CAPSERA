/** The parts of a Supabase AuthError the site relies on (supabase-js sets `code` on API errors). */
export type AuthErrorLike = { code?: string; status?: number; message?: string; name?: string };

export type AuthFailure = { status: number; message: string; code?: string };

type Context = "signin" | "signup" | "recovery" | "update-password" | "resend";

const fallbackMessages: Record<Context, string> = {
  signin: "We couldn't sign you in. Please try again.",
  signup: "Your account could not be created. Please try again.",
  recovery: "We couldn't send a reset link. Please try again.",
  "update-password": "Your password could not be updated. Please try again.",
  resend: "We couldn't send a new confirmation email. Please try again.",
};

/** Turns a Supabase Auth error into a customer-facing message and HTTP status. Never echoes raw server text. */
export function describeAuthError(error: AuthErrorLike, context: Context): AuthFailure {
  const code = error.code ?? "";
  if (error.status === 429 || (code.startsWith("over_") && code.endsWith("rate_limit"))) {
    return { status: 429, message: "Too many attempts. Please wait a few minutes and try again." };
  }
  switch (code) {
    case "invalid_credentials":
      return { status: 401, message: "The email or password is incorrect." };
    case "email_not_confirmed":
      return { status: 403, code, message: "Please confirm your email address first. Use the link we emailed you when you signed up." };
    case "user_already_exists":
    case "email_exists":
      return { status: 409, message: "An account with that email already exists. Sign in instead." };
    case "weak_password":
      return { status: 400, message: "That password is too weak. Use at least 8 characters, mixing letters, numbers and symbols." };
    case "same_password":
      return { status: 400, message: "Choose a password that's different from your current one." };
    case "email_address_invalid":
      return { status: 400, message: "Enter a valid email address." };
    case "signup_disabled":
    case "email_provider_disabled":
      return { status: 403, message: "New accounts can't be created right now." };
    case "session_not_found":
    case "session_expired":
    case "refresh_token_not_found":
    case "user_not_found":
      return { status: 401, message: "Your session has expired. Please sign in again." };
  }
  // Network failures (AuthRetryableFetchError) and 5xx responses: the service, not the input, is the problem.
  if (error.name === "AuthRetryableFetchError" || (error.status ?? 0) >= 500 || error.status === 0) {
    return { status: 503, message: "The account service couldn't be reached. Please try again in a moment." };
  }
  return { status: 400, message: fallbackMessages[context] };
}
