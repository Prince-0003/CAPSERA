import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { CheckoutContent } from "@/components/checkout-content";
import { brandFontClassName } from "@/lib/brand-fonts";

export default function CheckoutPage() {
  return (
    <main className={`commerce-page checkout-page ${brandFontClassName}`}>
      <SiteHeader />
      <div className="commerce-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/cart">Cart</Link>
          <span aria-hidden="true">›</span><span aria-current="page">Checkout</span>
        </nav>
        <h1 className="commerce-heading">Checkout</h1>
        <CheckoutContent />
      </div>
      <SiteFooter />
    </main>
  );
}
