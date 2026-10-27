import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { ServiceForm } from "@/components/service-form";

/** Notices for visitors sent back here from a reset link that didn't work (see app/auth/confirm/route.ts). */
const linkNotices: Record<string, string> = {
  invalid: "That reset link is invalid, has expired, or was already used. Request a new one below.",
  "other-browser": "Reset links open only in the browser you requested them from. Request a new link here and open it on this device.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ForgotPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const notice = typeof params.link === "string" ? linkNotices[params.link] : undefined;
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
          {notice ? (
            <p className="setup-notice" role="status">{notice}</p>
          ) : (
            <p className="auth-card-intro">Enter the email you use for your CAPSÉRA account and we&apos;ll send you a link to choose a new password.</p>
          )}
          <ServiceForm kind="forgot-password" submitLabel="Send reset link" />
          <p className="form-links"><a href="/signin">Back to Sign In</a></p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
