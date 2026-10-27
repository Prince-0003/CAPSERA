/**
 * Customer profile fields (public.profiles). The same limits are enforced by CHECK constraints in
 * supabase/migrations/20261027120000_create_profiles.sql.
 */
export type ProfileInput = { fullName: string; phone: string | null };
export type ProfileErrors = Partial<Record<keyof ProfileInput, string>>;

export const FULL_NAME_MAX = 100;
/** Optional leading +, then digits, spaces, brackets and dashes, starting with a digit or "(" and ending with a digit. */
export const PHONE_PATTERN = /^\+?[0-9(][0-9 ()-]{5,18}[0-9]$/;

export function parseProfileInput(value: unknown): { ok: true; profile: ProfileInput } | { ok: false; errors: ProfileErrors } {
  const record = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const errors: ProfileErrors = {};

  const fullName = typeof record.fullName === "string" ? record.fullName.trim().replace(/\s+/g, " ") : "";
  if (fullName.length < 2) errors.fullName = "Enter your full name (at least 2 characters).";
  else if (fullName.length > FULL_NAME_MAX) errors.fullName = `Your name can be at most ${FULL_NAME_MAX} characters.`;

  const rawPhone = typeof record.phone === "string" ? record.phone.trim().replace(/\s+/g, " ") : "";
  const digits = rawPhone.replace(/\D/g, "").length;
  if (rawPhone && (!PHONE_PATTERN.test(rawPhone) || digits < 7 || digits > 15)) {
    errors.phone = "Enter a phone number of 7 to 15 digits, like +91 98765 43210, or leave it blank.";
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, profile: { fullName, phone: rawPhone || null } };
}

/** First name for greetings, from the profile name or the email's local part. */
export function greetingName(fullName: string | null | undefined, email: string | null | undefined) {
  return fullName?.trim().split(/\s+/)[0] || email?.split("@")[0] || "there";
}
