import Image from "next/image";
import Link from "next/link";
import { KitPurchasePanel } from "@/components/kit-purchase-panel";
import { formatPrice, skincareKit, verifiedStepInfo } from "@/lib/product";

export function KitDetails() {
  const verifiedSteps = skincareKit.steps.filter((step) => verifiedStepInfo[step.name]?.ingredients || verifiedStepInfo[step.name]?.directions);

  return (
    <div className="details-copy">
      <p className="eyebrow">THE COMPLETE RITUAL</p>
      <h1>{skincareKit.name}</h1>
      <p>{skincareKit.description}</p>
      <p className="shop-product-price">
        {skincareKit.priceMinor === null ? "Price not listed" : formatPrice(skincareKit.priceMinor)}
      </p>
      <KitPurchasePanel />
      <p className="single-product-note">All seven capsules come together as one kit; they aren&apos;t sold separately.</p>
      <Link className="text-link" href="/shop">Back to Shop</Link>

      <section className="product-information" aria-labelledby="included-steps">
        <h2 id="included-steps">Seven steps, one complete kit</h2>
        <ol className="kit-steps kit-steps-media">
          {skincareKit.steps.map((step) => (
            <li key={step.number}>
              <Image src={step.image} alt="" width={120} height={120} />
              <span>{step.number}</span>
              <strong>{step.name}</strong>
              <span>{step.product}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="product-information" aria-labelledby="how-to-use">
        <h2 id="how-to-use">How to use</h2>
        <p>Use the capsules in the listed order as a single seven-step routine. Follow the product packaging for the specific directions for each capsule.</p>
      </section>
      <section className="product-information" aria-labelledby="ingredients">
        <h2 id="ingredients">Ingredients</h2>
        {verifiedSteps.length === 0 ? (
          <p>Ingredient lists and usage directions have not been provided yet. Check the final product packaging before use.</p>
        ) : (
          <dl className="ingredient-list">
            {verifiedSteps.map((step) => (
              <div key={step.number}>
                <dt>{step.name} · {step.product}</dt>
                {verifiedStepInfo[step.name]?.ingredients && <dd>{verifiedStepInfo[step.name]?.ingredients}</dd>}
                {verifiedStepInfo[step.name]?.directions && <dd>{verifiedStepInfo[step.name]?.directions}</dd>}
              </div>
            ))}
          </dl>
        )}
      </section>
      <section className="product-information" aria-labelledby="reviews">
        <h2 id="reviews">Reviews</h2>
        <p>Customer reviews are not available.</p>
      </section>
      <section className="product-information" aria-labelledby="product-questions">
        <h2 id="product-questions">Product questions</h2>
        <details>
          <summary>What is included in the kit?</summary>
          <p>One complete kit with seven capsules: {skincareKit.steps.map((step) => step.product).join(", ")}.</p>
        </details>
        <details>
          <summary>Can I buy each capsule separately?</summary>
          <p>No. CAPSÉRA offers the seven capsules together as one complete kit.</p>
        </details>
        <details>
          <summary>Which steps suit my skin?</summary>
          <p>The <Link href="/quiz">Skin Quiz</Link> highlights the steps most relevant to the concerns you report. It&apos;s general guidance, not a diagnosis.</p>
        </details>
      </section>
    </div>
  );
}
