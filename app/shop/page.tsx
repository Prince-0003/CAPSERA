import Image from "next/image";
import Link from "next/link";
import { Check, FlaskConical, LockKeyhole, Search, Sparkles } from "lucide-react";
import AddToCartButton from "@/components/add-to-cart-button";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { skincareKit } from "@/lib/product";

const benefits = [
  { label: "Thoughtfully Designed Skincare", icon: Sparkles },
  { label: "Science-Backed Formulas", icon: FlaskConical },
  { label: "Made for Your Routine", icon: Check },
  { label: "Secure Checkout", icon: LockKeyhole },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  const matchesSearch = !query || [
    skincareKit.name,
    skincareKit.description,
    "complete seven steps skincare kit routine",
  ].some((value) => value.toLocaleLowerCase().includes(query));

  return (
    <main className="shop-page">
      <SiteHeader />
      <section className="shop-hero">
        <div className="shop-hero-copy">
          <p className="eyebrow">THE CAPSÉRA COLLECTION</p>
          <h1>Discover Your Skincare Ritual</h1>
          <p>Seven essential steps. One complete skincare routine.</p>
        </div>
      </section>

      <div className="shop-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Shop</span>
        </nav>

        <section className="shop-layout" aria-label="Shop skincare">
          <aside className="shop-filters" aria-labelledby="filters-title">
            <h2 id="filters-title">Shop the ritual</h2>
            <div className="filter-group">
              <h3>Routine</h3>
              <p className="filter-selected"><Check size={15} /> Complete 7-step kit</p>
              <p className="filter-note">One complete kit, never individual capsules.</p>
            </div>
            <div className="filter-group">
              <h3>Price</h3>
              <p className="filter-note">Price not listed.</p>
            </div>
            <div className="filter-group">
              <h3>Availability</h3>
              <p className="filter-note">Stock status not provided.</p>
            </div>
          </aside>

          <div className="shop-results" id="product-grid">
            <form className="shop-search" id="product-search" action="/shop" role="search">
              <Search aria-hidden="true" />
              <label className="visually-hidden" htmlFor="shop-search-input">Search skincare</label>
              <input id="shop-search-input" name="q" type="search" placeholder="Search skincare" defaultValue={q} />
              <button type="submit">Search</button>
            </form>
            <div className="shop-results-heading">
              <p>THE COMPLETE ROUTINE</p>
              <span>1 kit</span>
            </div>
            {matchesSearch ? <article className="shop-product-card">
              <a className="shop-product-image-wrap" href={skincareKit.href} aria-label={`View ${skincareKit.name}`}>
                <Image
                  className="shop-product-image"
                  src={skincareKit.image}
                  alt={skincareKit.imageAlt}
                  width={1024}
                  height={1536}
                  priority
                />
                <span className="product-badge">THE 7-STEP KIT</span>
              </a>
              <div className="shop-product-info">
                <p className="eyebrow">ONE COMPLETE RITUAL</p>
                <h2>{skincareKit.name}</h2>
                <p className="shop-product-description">{skincareKit.description}</p>
                <p className="shop-product-price">Price not listed</p>
                <div className="shop-product-actions">
                  <a className="button button-outline" href={skincareKit.href}>View Details</a>
                  <AddToCartButton />
                </div>
                <p className="single-product-note">All seven steps, together as one product.</p>
              </div>
            </article> : (
              <div className="empty-cart">
                <h2>No matching skincare found.</h2>
                <p>There is one complete kit in the CAPSÉRA collection.</p>
                <a className="button button-outline" href="/shop">Clear search</a>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="benefits-strip" aria-label="Shopping benefits">
        {benefits.map(({ label, icon: Icon }) => (
          <div className="benefit-item" key={label}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}