"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

type FormKind = "contact" | "signin" | "signup" | "forgot-password" | "reset-password";
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
  "reset-password": [
    { name: "password", label: "New password", type: "password", autoComplete: "new-password", minLength: 8 },
    { name: "confirmPassword", label: "Confirm new password", type: "password", autoComplete: "new-password", minLength: 8 },
  ],
};

const endpoints: Record<FormKind, string> = {
  contact: "/api/contact",
  signin: "/api/auth/signin",
  signup: "/api/auth/signup",
  "forgot-password": "/api/auth/forgot-password",
  "reset-password": "/api/auth/reset-password",
};

const setupMessages: Record<FormKind, string> = {
  contact: "Your form is valid, but contact delivery is not configured. Your message has not been sent.",
  "forgot-password": "We couldn't send a reset link.",
  "reset-password": "We couldn't update your password.",
  signin: "We could not sign you in.",
  signup: "We could not create your account.",
};

/** Forms whose fields use the icon + show/hide password input shell. */
const shellKinds: FormKind[] = ["signin", "signup", "reset-password"];

type FormResult = { message?: string; redirectTo?: string; code?: string };

export function ServiceForm({ kind, submitLabel, next }: { kind: FormKind; submitLabel: string; next?: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Guards against a second submit (double click / Enter) before the disabled state renders.
  const inFlight = useRef(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  // Set when sign-in fails because the email isn't confirmed yet, to offer a new confirmation link.
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const usesShell = shellKinds.includes(kind);

  async function resendConfirmation() {
    if (resending) return;
    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unconfirmedEmail }),
      });
      const result: FormResult = await response.json().catch(() => ({}));
      if (response.ok) {
        setError("");
        setUnconfirmedEmail("");
        setMessage(result.message ?? "A new confirmation link is on its way.");
      } else {
        setError(result.message ?? "We couldn't send a new confirmation email. Please try again.");
      }
    } catch {
      setError("The request could not reach the server. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setError("");
    setMessage("");
    setUnconfirmedEmail("");
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if ((kind === "signup" || kind === "reset-password") && data.password !== data.confirmPassword) {
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
      const result: FormResult = await response.json().catch(() => ({}));
      if (!response.ok) {
        // 503 means "this service isn't available yet" (a neutral notice); anything else is a real error.
        if (response.status === 503) setMessage(result.message ?? setupMessages[kind]);
        else setError(result.message ?? setupMessages[kind]);
        if (result.code === "email_not_confirmed" && typeof data.email === "string") setUnconfirmedEmail(data.email);
        return;
      }
      if (result.redirectTo) {
        // Signed in (Supabase set the session cookies): continue to the account or the page the visitor came from.
        window.localStorage.removeItem("capsera-account");
        redirecting = true;
        window.location.assign(result.redirectTo);
        return;
      }
      // e.g. sign-up waiting for email confirmation, or a password reset email sent.
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
            <div className={usesShell ? "input-shell" : undefined}>
              {usesShell && field.name === "name" && <UserRound className="input-icon" aria-hidden="true" />}
              {usesShell && field.name === "email" && <Mail className="input-icon" aria-hidden="true" />}
              {usesShell && (field.name === "password" || field.name === "confirmPassword") && <LockKeyhole className="input-icon" aria-hidden="true" />}
              <input
                id={`${kind}-${field.name}`}
                name={field.name}
                type={usesShell && (field.name === "password" || field.name === "confirmPassword") && visiblePasswords[field.name] ? "text" : field.type ?? "text"}
                required
                autoComplete={field.autoComplete}
                minLength={field.minLength}
                maxLength={field.name === "password" || field.name === "confirmPassword" ? 128 : 200}
              />
              {usesShell && (field.name === "password" || field.name === "confirmPassword") && (
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
      {next && <input type="hidden" name="next" value={next} />}
      {error && <p className="form-error" role="alert">{error}</p>}
      {unconfirmedEmail && (
        <button className="text-button form-inline-action" type="button" onClick={resendConfirmation} disabled={resending}>
          {resending ? "Sending…" : "Resend the confirmation email"}
        </button>
      )}
      {message && <p className="form-status" role="status">{message}</p>}
      <button className="button button-navy" type="submit" disabled={submitting}>
        {submitting ? "Please wait…" : submitLabel}
        {kind === "signup" && !submitting && <ArrowRight aria-hidden="true" />}
      </button>
    </form>
  );
}
