import Link from "next/link";
import { CircleHelp, Instagram, Sparkles } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { ServiceForm } from "@/components/service-form";
import { brandFontClassName } from "@/lib/brand-fonts";

export default function ContactPage() {
  return (
    <main className={`commerce-page contact-page ${brandFontClassName}`}>
      <SiteHeader />
      <div className="commerce-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Contact</span>
        </nav>
        <div className="contact-layout">
          <section className="contact-intro" aria-labelledby="contact-title">
            <p className="eyebrow">GET IN TOUCH</p>
            <h1 className="commerce-heading" id="contact-title">Contact CAPSÉRA</h1>
            <p className="contact-lead">
              Questions about the seven-step kit, the Skin Quiz, or your account? Leave us a note with the form.
            </p>
            {/* Only real destinations: existing pages and the brand's existing Instagram account. */}
            <ul className="contact-help">
              <li>
                <CircleHelp aria-hidden="true" />
                <div>
                  <strong>Quick answers</strong>
                  <span>Shipping, payment, and account questions are covered in the <Link href="/faq">FAQ</Link>.</span>
                </div>
              </li>
              <li>
                <Sparkles aria-hidden="true" />
                <div>
                  <strong>Not sure where to start?</strong>
                  <span>The <Link href="/quiz">Skin Quiz</Link> highlights the steps of the kit most relevant to you.</span>
                </div>
              </li>
              <li>
                <Instagram aria-hidden="true" />
                <div>
                  <strong>Follow along</strong>
                  <span>
                    <a href="https://www.instagram.com/capsera.care/" target="_blank" rel="noopener noreferrer">@capsera.care</a> on Instagram
                  </span>
                </div>
              </li>
            </ul>
          </section>

          <section className="form-page-card contact-card" aria-labelledby="contact-form-title">
            <h2 id="contact-form-title">Send a message</h2>
            <p className="setup-notice">The contact delivery service is not configured. A valid submission will not be sent until an email or support provider is connected.</p>
            <ServiceForm kind="contact" submitLabel="Check contact setup" />
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
