import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { skincareKit } from "@/lib/product";
import { KitDetails } from "@/components/kit-details";

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
          <div className="details-image-wrap">
            <Image
              src={skincareKit.image}
              alt={skincareKit.imageAlt}
              width={1024}
              height={1536}
              priority
            />
          </div>
          <KitDetails />
        </article>
      </div>
      <SiteFooter />
    </main>
  );
}