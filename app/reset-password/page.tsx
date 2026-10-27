import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { ServiceForm } from "@/components/service-form";
import { getCurrentUser } from "@/lib/supabase/server";

/**
 * Choose a new password. Reached from the reset email (app/auth/confirm/route.ts starts a recovery session first)
 * or from the account page. Without a session the link has expired, so the form isn't shown.
 */
export default async function ResetPasswordPage() {
  const { user } = await getCurrentUser();
  return (
    <main className="commerce-page auth-page recovery-page">
      <SiteHeader />
      <div className="commerce-content">
        <section className="form-page-card auth-card">
          <p className="eyebrow">ACCOUNT SUPPORT</p>
          {user ? (
            <>
              <h1 className="commerce-heading">Choose a new password</h1>
              <p className="auth-card-intro">Set a new password for {user.email}. Use 8 to 128 characters.</p>
              <ServiceForm kind="reset-password" submitLabel="Update password" />
            </>
          ) : (
            <>
              <h1 className="commerce-heading">This reset link has expired</h1>
              <p className="setup-notice">Password reset links work once and expire after a while. Request a new link to choose a new password.</p>
              <div className="account-links">
                <a className="button button-navy" href="/forgot-password">Request a new link</a>
                <a className="button button-outline" href="/signin">Back to Sign In</a>
              </div>
            </>
          )}
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
