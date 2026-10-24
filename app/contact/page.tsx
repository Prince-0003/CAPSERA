import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { ServiceForm } from "@/components/service-form";

export default function ContactPage() {
  return (
    <main className="commerce-page contact-page">
      <SiteHeader />
      <div className="commerce-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Contact</span>
        </nav>
        <section className="form-page-card">
          <p className="eyebrow">GET IN TOUCH</p>
          <h1 className="commerce-heading">Contact CAPSÉRA</h1>
          <p className="setup-notice">The contact delivery service is not configured. A valid submission will not be sent until an email or support provider is connected.</p>
          <ServiceForm kind="contact" submitLabel="Check contact setup" />
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
