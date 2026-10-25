"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { skincareKit } from "@/lib/product";

/** Puts the kit in the cart (without adding another if it's already there) and goes to checkout. */
export function BuyNowButton({ quantity = 1 }: { quantity?: number }) {
  const { ensureInCart, addItem, getQuantity, isReady } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [navigating, setNavigating] = useState(false);

  function buyNow() {
    setError("");
    // A chosen quantity above what's already in the cart tops the cart up to it; otherwise keep the cart as is.
    const missing = quantity - getQuantity(skincareKit.id);
    const result = missing > 0 ? addItem(skincareKit.id, missing) : ensureInCart(skincareKit.id);
    if (result.status === "added" || result.status === "max") {
      setNavigating(true);
      router.push("/checkout");
    } else {
      setError("The kit could not be added. Please refresh and try again.");
    }
  }

  return (
    <div className="add-to-cart-control">
      <button className="button button-outline buy-now-button" type="button" onClick={buyNow} disabled={!isReady || navigating} aria-busy={navigating}>
        {navigating ? "Going to checkout…" : "Buy Now"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
