import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { ServiceForm } from "@/components/service-form";

export default function SignUpPage() {
  return (
    <main className="commerce-page auth-page signup-page">
      <SiteHeader />
      <div className="commerce-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Create Account</span>
        </nav>
        <section className="form-page-card auth-card">
          <p className="eyebrow">YOUR CAPSÉRA ACCOUNT</p>
          <h1 className="commerce-heading">Create an Account</h1>
          <ServiceForm kind="signup" submitLabel="Create Account" />
          <p className="form-links"><a href="/signin">Already have an account? Sign in</a></p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
