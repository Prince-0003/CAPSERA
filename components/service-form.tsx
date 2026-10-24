"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";

type FormKind = "contact" | "signin" | "signup" | "forgot-password" | "checkout";
export type CheckoutField = { name: string; label?: string; type?: string; required?: boolean; autoComplete?: string; minLength?: number; value?: string };
type Field = CheckoutField;

const formFields: Record<FormKind, Field[]> = {
  contact: [
    { name: "name", label: "Name", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "subject", label: "Subject" },
    { name: "message", label: "Message" },
  ],
  signin: [
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "password", label: "Password", type: "password", autoComplete: "current-password", minLength: 8 },
  ],
  signup: [
    { name: "name", label: "Name", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "password", label: "Password", type: "password", autoComplete: "new-password", minLength: 8 },
    { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password", minLength: 8 },
  ],
  "forgot-password": [{ name: "email", label: "Email", type: "email", autoComplete: "email" }],
  checkout: [
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "name", label: "Full name", autoComplete: "name" },
    { name: "address", label: "Street address", autoComplete: "street-address" },
    { name: "city", label: "City", autoComplete: "address-level2" },
    { name: "region", label: "State or region", autoComplete: "address-level1" },
    { name: "postalCode", label: "Postal code", autoComplete: "postal-code" },
    { name: "country", label: "Country", autoComplete: "country-name" },
  ],
};

const endpoints: Record<FormKind, string> = {
  contact: "/api/contact",
  signin: "/api/auth/signin",
  signup: "/api/auth/signup",
  "forgot-password": "/api/auth/forgot-password",
  checkout: "/api/checkout",
};

const setupMessages: Record<FormKind, string> = {
  contact: "Your form is valid, but contact delivery is not configured. Your message has not been sent.",
  "forgot-password": "Password recovery is not configured. No email was sent.",
  checkout: "Checkout is not configured. No order was created and no payment was taken.",
  signin: "We could not sign you in.",
  signup: "We could not create your account.",
};

export function ServiceForm({
  kind,
  submitLabel,
  fields,
}: {
  kind: FormKind;
  submitLabel: string;
  fields?: Field[];
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if (kind === "signup" && data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (kind === "checkout") {
      const consent = form.querySelector<HTMLInputElement>('[name="paymentMethod"]');
      if (!consent?.checked) {
        setError("Select the payment setup acknowledgement to continue.");
        return;
      }
      if (!Number.isInteger(data.quantity === undefined ? NaN : Number(data.quantity)) || Number(data.quantity) < 1) {
        setError("Your cart quantity is invalid. Return to the cart and try again.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch(endpoints[kind], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: { message?: string; user?: { name?: string; email?: string } } = await response.json();
      if (!response.ok) {
        setMessage(result.message ?? setupMessages[kind]);
        return;
      }
      if (kind === "signup" || kind === "signin") {
        const user = result.user ?? {
          name: kind === "signup" ? String(data.name ?? "") : undefined,
          email: String(data.email ?? ""),
        };

        if (typeof window !== "undefined") {
          window.localStorage.setItem("capsera-account", JSON.stringify({
            name: user.name ?? "Capséra customer",
            email: user.email ?? "",
          }));
          window.location.assign("/account");
        }
      }
      setMessage(result.message ?? "Request received.");
      form.reset();
    } catch (caught) {
      console.error(`Unable to submit ${kind} form.`, caught);
      setError("The request could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="service-form" onSubmit={handleSubmit} noValidate>
      {(fields ?? formFields[kind]).map((field) => (
        field.type === "hidden" ? (
          <input key={field.name} name={field.name} type="hidden" value={field.value ?? ""} />
        ) : (
        <div className="form-field" key={field.name}>
          <label className="field-label" htmlFor={`${kind}-${field.name}`}>{field.label}</label>
          {field.name === "message" ? (
            <textarea id={`${kind}-${field.name}`} name={field.name} required minLength={10} maxLength={4000} rows={5} />
          ) : (
            <div className={kind === "signin" || kind === "signup" ? "input-shell" : undefined}>
              {(kind === "signin" || kind === "signup") && field.name === "name" && <UserRound className="input-icon" aria-hidden="true" />}
              {(kind === "signin" || kind === "signup") && field.name === "email" && <Mail className="input-icon" aria-hidden="true" />}
              {(kind === "signin" || kind === "signup") && (field.name === "password" || field.name === "confirmPassword") && <LockKeyhole className="input-icon" aria-hidden="true" />}
              <input
                id={`${kind}-${field.name}`}
                name={field.name}
                type={(kind === "signin" || kind === "signup") && (field.name === "password" || field.name === "confirmPassword") && visiblePasswords[field.name] ? "text" : field.type ?? "text"}
                required
                autoComplete={field.autoComplete}
                minLength={field.minLength}
                maxLength={field.name === "password" || field.name === "confirmPassword" ? 128 : 200}
                value={field.value}
              />
              {(kind === "signin" || kind === "signup") && (field.name === "password" || field.name === "confirmPassword") && (
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={visiblePasswords[field.name] ? "Hide password" : "Show password"}
                  onClick={() => setVisiblePasswords((current) => ({ ...current, [field.name]: !current[field.name] }))}
                >
                  {visiblePasswords[field.name] ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              )}
            </div>
          )}
        </div>
        )
      ))}
      {kind === "checkout" && (
        <label className="payment-choice">
          <input name="paymentMethod" type="checkbox" required />
          <span>Online payment is not yet available. I understand this is a setup-only checkout form.</span>
        </label>
      )}
      {kind === "signup" && (
        <label className="signup-terms">
          <input name="terms" type="checkbox" required />
          <span>I agree to the Terms &amp; Conditions and Privacy Policy.</span>
        </label>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-status" role="status">{message}</p>}
      <button className="button button-navy" type="submit" disabled={submitting}>
        {submitting ? "Please wait…" : submitLabel}
        {kind === "signup" && !submitting && <ArrowRight aria-hidden="true" />}
      </button>
    </form>
  );
}
