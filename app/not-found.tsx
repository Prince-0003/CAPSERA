import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export default function NotFound() {
  return (
    <main className="commerce-page order-confirmation-page">
      <SiteHeader />
      <div className="commerce-content">
        <section className="order-status-card not-found-card">
          <p className="eyebrow">PAGE NOT FOUND</p>
          <h1 className="commerce-heading">We couldn&apos;t find that page</h1>
          <p>The link may be out of date, or the page may have moved.</p>
          <Link className="button button-navy" href="/">Back to Home</Link>
          <Link className="button button-outline" href="/shop">Visit the Shop</Link>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
