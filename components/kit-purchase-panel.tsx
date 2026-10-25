"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AddToCartButton from "@/components/add-to-cart-button";
import { BuyNowButton } from "@/components/buy-now-button";
import { useCart } from "@/components/cart-provider";
import { MAX_CART_QUANTITY, skincareKit } from "@/lib/product";

export function KitPurchasePanel() {
  const [quantity, setQuantity] = useState(1);
  const { getQuantity, isReady } = useCart();
  const inCart = getQuantity(skincareKit.id);

  return (
    <div className="kit-purchase">
      <div className="cart-quantity">
        <span className="field-label" id="kit-quantity-label">Quantity</span>
        <div className="quantity-control" role="group" aria-labelledby="kit-quantity-label">
          <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Minus aria-hidden="true" />
          </button>
          <output aria-live="polite">{quantity}</output>
          <button type="button" aria-label="Increase quantity" disabled={quantity >= MAX_CART_QUANTITY} onClick={() => setQuantity((q) => Math.min(MAX_CART_QUANTITY, q + 1))}>
            <Plus aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="kit-purchase-actions">
        <AddToCartButton quantity={quantity} />
        <BuyNowButton quantity={quantity} />
      </div>
      {isReady && inCart > 0 && <p className="kit-in-cart">{inCart} {inCart === 1 ? "kit is" : "kits are"} already in your cart.</p>}
    </div>
  );
}
