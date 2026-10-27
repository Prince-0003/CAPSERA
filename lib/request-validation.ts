export type JsonRecord = Record<string, unknown>;

export function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function textField(value: unknown, minLength = 1, maxLength = 200) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) return null;
  return normalized;
}

/** Passwords are taken exactly as typed (never trimmed): spaces can be part of a password. */
export function passwordField(value: unknown, minLength = 8, maxLength = 128) {
  return typeof value === "string" && value.length >= minLength && value.length <= maxLength ? value : null;
}

export function emailField(value: unknown) {
  const email = textField(value, 3, 254);
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
