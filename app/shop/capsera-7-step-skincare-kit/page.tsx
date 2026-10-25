import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { KitDetails } from "@/components/kit-details";
import { ProductGallery } from "@/components/product-gallery";

export default function SkincareKitDetailsPage() {
  return (
    <main className="commerce-page product-page">
      <SiteHeader />
      <div className="commerce-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/shop">Shop</Link>
          <span aria-hidden="true">›</span><span aria-current="page">The 7-Step Kit</span>
        </nav>
        <article className="details-card">
          <ProductGallery />
          <KitDetails />
        </article>
      </div>
      <SiteFooter />
    </main>
  );
}