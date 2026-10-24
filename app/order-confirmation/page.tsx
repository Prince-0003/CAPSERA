import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export default function OrderConfirmationPage() {
  return (
    <main className="commerce-page order-confirmation-page">
      <SiteHeader />
      <div className="commerce-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Order status</span>
        </nav>
        <section className="order-status-card">
          <p className="eyebrow">ORDER STATUS</p>
          <h1 className="commerce-heading">No confirmed order</h1>
          <p>No order has been created. Checkout and payment processing are not configured, so this page cannot confirm a purchase.</p>
          <a className="button button-navy" href="/shop">Return to Shop</a>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
