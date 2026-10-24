import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export default function ResetPasswordPage() {
  return (
    <main className="commerce-page auth-page recovery-page">
      <SiteHeader />
      <div className="commerce-content">
        <section className="form-page-card auth-card">
          <p className="eyebrow">ACCOUNT SUPPORT</p>
          <h1 className="commerce-heading">Password reset unavailable</h1>
          <p className="setup-notice">A password reset can only be completed after an authentication provider is configured. No reset link has been issued.</p>
          <a className="button button-navy" href="/signin">Back to Sign In</a>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
