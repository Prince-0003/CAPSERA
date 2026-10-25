import Image from "next/image";
import Link from "next/link";
import { Check, Layers, Package, Search, Sparkles } from "lucide-react";
import AddToCartButton from "@/components/add-to-cart-button";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { brandFontClassName } from "@/lib/brand-fonts";
import { formatPrice, skincareKit } from "@/lib/product";

const benefits = [
  { label: "Seven Steps, One Kit", icon: Layers },
  { label: "Thoughtfully Designed Ritual", icon: Sparkles },
  { label: "Made for Your Routine", icon: Check },
  { label: "Sold as One Complete Kit", icon: Package },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  // Every word of the query must appear somewhere in the kit's name, description, or step/product names.
  const searchText = [
    skincareKit.name,
    skincareKit.description,
    "complete seven 7 steps skincare kit routine ritual capsules",
    ...skincareKit.steps.flatMap((step) => [step.name, step.product]),
  ].join(" ").toLocaleLowerCase();
  const matchesSearch = query.split(/\s+/).filter(Boolean).every((word) => searchText.includes(word));
  const matchingSteps = query
    ? skincareKit.steps.filter((step) => `${step.name} ${step.product}`.toLocaleLowerCase().includes(query))
    : [];
  const price = skincareKit.priceMinor === null ? "Price not listed" : formatPrice(skincareKit.priceMinor);

  return (
    <main className={`shop-page ${brandFontClassName}`}>
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
              <p className="filter-note">{price}</p>
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
              <span aria-live="polite">{matchesSearch ? "1 kit" : "0 results"}{query ? ` for “${q.trim()}”` : ""}</span>
            </div>
            {matchingSteps.length > 0 && (
              <p className="shop-search-note">
                {matchingSteps.map((step) => step.product).join(", ")} {matchingSteps.length > 1 ? "are" : "is"} part of the complete kit. The capsules aren&apos;t sold separately.
              </p>
            )}
            {matchesSearch ? <article className="shop-product-card">
              <Link className="shop-product-image-wrap" href={skincareKit.href} aria-label={`View ${skincareKit.name}`}>
                <Image
                  className="shop-product-image"
                  src={skincareKit.image}
                  alt={skincareKit.imageAlt}
                  width={1024}
                  height={1536}
                  priority
                />
                <span className="product-badge">THE 7-STEP KIT</span>
              </Link>
              <div className="shop-product-info">
                <p className="eyebrow">ONE COMPLETE RITUAL</p>
                {/* Hyphenated words ("7-Step") stay on one line; browsers otherwise may break the title after the hyphen. */}
                <h2>
                  {skincareKit.name.split(/(\S+-\S+)/).map((part, index) =>
                    index % 2 ? <span className="no-break" key={index}>{part}</span> : part,
                  )}
                </h2>
                <p className="shop-product-description">{skincareKit.description}</p>
                <ul className="shop-product-steps" aria-label="Included steps">
                  {skincareKit.steps.map((step) => (
                    <li key={step.number} title={`${step.number} ${step.name} · ${step.product}`}>
                      <Image src={step.image} alt="" width={120} height={120} />
                      <span>{step.name}</span>
                    </li>
                  ))}
                </ul>
                <p className="shop-product-price">{price}</p>
                <div className="shop-product-actions">
                  <Link className="button button-outline" href={skincareKit.href}>View Details</Link>
                  <AddToCartButton />
                </div>
                <p className="single-product-note">All seven steps, together as one product.</p>
              </div>
            </article> : (
              <div className="empty-cart">
                <h2>No matching skincare found.</h2>
                <p>There is one complete kit in the CAPSÉRA collection.</p>
                <Link className="button button-outline" href="/shop">Clear search</Link>
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