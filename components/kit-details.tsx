import AddToCartButton from "@/components/add-to-cart-button";
import { BuyNowButton } from "@/components/buy-now-button";
import { skincareKit } from "@/lib/product";

export function KitDetails() {
  return (
    <div className="details-copy">
      <p className="eyebrow">THE COMPLETE RITUAL</p>
      <h1>{skincareKit.name}</h1>
      <p>{skincareKit.description}</p>
      <p className="shop-product-price">
        {skincareKit.price === null ? "Price not listed" : `${skincareKit.currency} ${skincareKit.price}`}
      </p>
      <AddToCartButton />
      <BuyNowButton />
      <a className="text-link" href="/shop">Back to Shop</a>

      <section className="product-information" aria-labelledby="included-steps">
        <h2 id="included-steps">Seven steps, one complete kit</h2>
        <ol className="kit-steps">
          {skincareKit.steps.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <strong>{step.name}</strong>
              <span>{step.product}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="product-information">
        <h2>How to use</h2>
        <p>Use the capsules in the listed order as a single seven-step routine. Follow product packaging for the specific directions for each capsule.</p>
      </section>
      <section className="product-information">
        <h2>Ingredients</h2>
        <p>Ingredient lists have not been provided. Check the final product packaging before use.</p>
      </section>
      <section className="product-information">
        <h2>Reviews</h2>
        <p>Customer reviews are not available.</p>
      </section>
      <section className="product-information">
        <h2>Product questions</h2>
        <details>
          <summary>What is included in the kit?</summary>
          <p>One complete kit with seven capsules: Face Wash, Hydrating Serum, Pimple Serum, Vitamin C Serum, Repair Serum, Moisturiser, and Sunscreen.</p>
        </details>
        <details>
          <summary>Can I buy each capsule separately?</summary>
          <p>No. CAPSÉRA offers the seven capsules together as one complete kit.</p>
        </details>
      </section>
    </div>
  );
}
