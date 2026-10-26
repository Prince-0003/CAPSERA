"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

type FormKind = "contact" | "signin" | "signup" | "forgot-password";
type Field = { name: string; label: string; type?: string; autoComplete?: string; minLength?: number };

const formFields: Record<FormKind, Field[]> = {
  contact: [
    { name: "name", label: "Name", autoComplete: "name", minLength: 2 },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "subject", label: "Subject", minLength: 3 },
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
};

const endpoints: Record<FormKind, string> = {
  contact: "/api/contact",
  signin: "/api/auth/signin",
  signup: "/api/auth/signup",
  "forgot-password": "/api/auth/forgot-password",
};

const setupMessages: Record<FormKind, string> = {
  contact: "Your form is valid, but contact delivery is not configured. Your message has not been sent.",
  "forgot-password": "Password recovery is not configured. No email was sent.",
  signin: "We could not sign you in.",
  signup: "We could not create your account.",
};

export function ServiceForm({ kind, submitLabel }: { kind: FormKind; submitLabel: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Guards against a second submit (double click / Enter) before the disabled state renders.
  const inFlight = useRef(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setError("");
    setMessage("");
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if (kind === "signup" && data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    let redirecting = false;
    try {
      const response = await fetch(endpoints[kind], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: { message?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        // 503 means "this service isn't configured yet" (a neutral notice); anything else is a real error.
        if (response.status === 503) setMessage(result.message ?? setupMessages[kind]);
        else setError(result.message ?? setupMessages[kind]);
        return;
      }
      if (kind === "signup" || kind === "signin") {
        // The server has set an HttpOnly session cookie; drop the old client-only "session" if present.
        window.localStorage.removeItem("capsera-account");
        redirecting = true;
        window.location.assign("/account");
        return;
      }
      setMessage(result.message ?? "Request received.");
      form.reset();
    } catch (caught) {
      console.error(`Unable to submit ${kind} form.`, caught);
      setError("The request could not reach the server. Please try again.");
    } finally {
      // Keep the button disabled while the browser navigates to the account page.
      if (!redirecting) {
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  }

  return (
    <form className="service-form" onSubmit={handleSubmit} noValidate>
      {formFields[kind].map((field) => (
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
      ))}
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
