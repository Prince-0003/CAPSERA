"use client";

import { useCart } from "@/components/cart-provider";
import { skincareKit } from "@/lib/product";

export function BuyNowButton() {
  const { addItem } = useCart();

  function buyNow() {
    addItem(skincareKit.id);
    window.location.assign("/checkout");
  }

  return (
    <button className="button button-outline buy-now-button" type="button" onClick={buyNow}>
      Buy Now
    </button>
  );
}
