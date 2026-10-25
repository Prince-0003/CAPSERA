import Link from "next/link";
import { CartContents } from "@/components/cart-contents";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { brandFontClassName } from "@/lib/brand-fonts";

export default function CartPage() {
  return (
    <main className={`commerce-page cart-page ${brandFontClassName}`}>
      <SiteHeader />
      <div className="commerce-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Cart</span>
        </nav>
        <h1 className="commerce-heading">Your Cart</h1>
        <CartContents />
      </div>
      <SiteFooter />
    </main>
  );
}