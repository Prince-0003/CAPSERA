"use client";

import { useRef, useState, type FormEvent } from "react";
import { parseProfileInput, type ProfileErrors, type ProfileInput } from "@/lib/account-profile";

type Props = { fullName: string | null; phone: string | null; email: string; memberSince: string; unavailable?: boolean };

/** Profile Details card on the account page: shows the customer's own profile and lets them edit name and phone. */
export function ProfileDetails({ fullName, phone, email, memberSince, unavailable = false }: Props) {
  const [profile, setProfile] = useState<{ fullName: string | null; phone: string | null }>({ fullName, phone });
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  // Guards against a second submit (double click / Enter) before the disabled state renders.
  const inFlight = useRef(false);

  function startEditing() {
    setErrors({});
    setError("");
    setStatus("");
    setEditing(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const parsed = parseProfileInput(values);
    setError("");
    if (!parsed.ok) {
      setErrors(parsed.errors);
      (form.elements.namedItem(Object.keys(parsed.errors)[0]) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    inFlight.current = true;
    setSaving(true);
    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.profile),
      });
      const result: { message?: string; errors?: ProfileErrors; profile?: ProfileInput } = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.errors) setErrors(result.errors);
        setError(response.status === 401
          ? "Your session has expired. Sign in again to update your profile."
          : result.message ?? "Your profile could not be saved. Please try again.");
        return;
      }
      setProfile(result.profile ?? parsed.profile);
      setEditing(false);
      setStatus(result.message ?? "Your profile has been updated.");
    } catch {
      setError("The request could not reach the server. Please try again.");
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <section className="account-card account-card-wide" id="personal-details" aria-labelledby="profile-details-title">
      <div className="account-card-header">
        <h2 id="profile-details-title">Profile Details</h2>
        {!editing && !unavailable && (
          <button className="text-button account-card-action" type="button" onClick={startEditing}>Edit</button>
        )}
      </div>

      {editing ? (
        <form className="service-form profile-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="field-label" htmlFor="profile-fullName">Full name</label>
            <input
              id="profile-fullName"
              name="fullName"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={profile.fullName ?? ""}
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={errors.fullName ? "profile-fullName-error" : undefined}
            />
            {errors.fullName && <p className="form-error" id="profile-fullName-error">{errors.fullName}</p>}
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="profile-phone">Phone (optional)</label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={24}
              defaultValue={profile.phone ?? ""}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "profile-phone-error" : "profile-phone-hint"}
            />
            {errors.phone
              ? <p className="form-error" id="profile-phone-error">{errors.phone}</p>
              : <p className="profile-form-hint" id="profile-phone-hint">Include your country code, for example +91 98765 43210.</p>}
          </div>
          <p className="profile-form-hint">Email: {email} (used to sign in; it can&apos;t be changed here).</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="profile-form-actions">
            <button className="button button-navy" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            <button className="button button-outline" type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <dl className="profile-list">
            <div>
              <dt>Full name</dt>
              <dd>{profile.fullName || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{profile.phone || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{memberSince}</dd>
            </div>
          </dl>
          {status && <p className="form-status profile-status" role="status">{status}</p>}
          <p className="account-card-note">
            {unavailable
              ? "Your saved profile couldn't be loaded right now, so editing is unavailable. Please try again later."
              : <>Want a new password? <a href="/reset-password">Change your password</a>.</>}
          </p>
        </>
      )}
    </section>
  );
}
