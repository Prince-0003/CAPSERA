import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { ServiceForm } from "@/components/service-form";

export default function ForgotPasswordPage() {
  return (
    <main className="commerce-page auth-page recovery-page">
      <SiteHeader />
      <div className="commerce-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/signin">Sign In</Link>
          <span aria-hidden="true">›</span><span aria-current="page">Password Recovery</span>
        </nav>
        <section className="form-page-card auth-card">
          <p className="eyebrow">ACCOUNT SUPPORT</p>
          <h1 className="commerce-heading">Reset your password</h1>
          <p className="setup-notice">Password recovery is not configured yet. No email will be sent.</p>
          <ServiceForm kind="forgot-password" submitLabel="Check recovery setup" />
          <p className="form-links"><a href="/signin">Back to Sign In</a></p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
