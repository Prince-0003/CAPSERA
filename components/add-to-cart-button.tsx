"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { skincareKit } from "@/lib/product";

export default function AddToCartButton() {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem(skincareKit.id);
    setAdded(true);
  }

  return (
    <div className="add-to-cart-control">
      <button className="button button-navy" onClick={handleAddToCart}>
        Add to Cart
      </button>
      {added && (
        <p className="cart-added-message" role="status">
          Added to your cart.
        </p>
      )}
    </div>
  );
}