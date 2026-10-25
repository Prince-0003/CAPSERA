import { emailField } from "@/lib/request-validation";

/**
 * Checkout contact and delivery fields. Shared by the checkout form (inputs and client-side messages) and
 * app/api/checkout/route.ts (server-side validation), so both always apply the same rules.
 */
export type CheckoutFieldName = "email" | "name" | "address" | "city" | "region" | "postalCode" | "country";

export type CheckoutField = {
  name: CheckoutFieldName;
  label: string;
  autoComplete: string;
  minLength: number;
  maxLength: number;
  type?: "email";
  inputMode?: "email";
  autoCapitalize?: "none" | "words" | "characters";
  /** Message when the field is left empty; defaults to "Enter your <label>." */
  requiredMessage?: string;
  /** Spans both columns of the two-column form grid. */
  wide?: boolean;
};

export const contactFields: CheckoutField[] = [
  { name: "email", label: "Email", type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "none", minLength: 3, maxLength: 254, requiredMessage: "Enter your email address.", wide: true },
];

export const deliveryFields: CheckoutField[] = [
  { name: "name", label: "Full name", autoComplete: "name", autoCapitalize: "words", minLength: 2, maxLength: 120, wide: true },
  { name: "address", label: "Street address", autoComplete: "street-address", minLength: 3, maxLength: 200, wide: true },
  { name: "city", label: "City", autoComplete: "address-level2", minLength: 2, maxLength: 100 },
  { name: "region", label: "State or region", autoComplete: "address-level1", minLength: 2, maxLength: 100 },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code", autoCapitalize: "characters", minLength: 3, maxLength: 20 },
  { name: "country", label: "Country", autoComplete: "country-name", minLength: 2, maxLength: 100 },
];

export const checkoutFields: CheckoutField[] = [...contactFields, ...deliveryFields];

/** What is wrong with a value (trimmed, as the server stores it), or null when it is valid. */
export function checkoutFieldError(field: CheckoutField, value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return field.requiredMessage ?? `Enter your ${field.label.toLowerCase()}.`;
  if (text.length < field.minLength) return `${field.label} needs at least ${field.minLength} characters.`;
  if (text.length > field.maxLength) return `${field.label} can be at most ${field.maxLength} characters.`;
  if (field.type === "email" && !emailField(text)) return "Enter a valid email address, like name@example.com.";
  return null;
}
