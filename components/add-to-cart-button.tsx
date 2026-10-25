"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";
import { MAX_CART_QUANTITY, skincareKit } from "@/lib/product";

const CONFIRMATION_MS = 2000;

export default function AddToCartButton({ quantity = 1, className = "button button-navy" }: { quantity?: number; className?: string }) {
  const { addItem, isReady } = useCart();
  const { showToast } = useToast();
  const [justAdded, setJustAdded] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function handleAddToCart() {
    setError("");
    const result = addItem(skincareKit.id, quantity);
    if (result.status === "added") {
      setJustAdded(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setJustAdded(false), CONFIRMATION_MS);
      showToast({
        tone: "success",
        message: `${skincareKit.name} added. ${result.quantity} in your cart.`,
        action: { label: "View cart", href: "/cart" },
      });
    } else if (result.status === "max") {
      setError(`Your cart already has the maximum of ${MAX_CART_QUANTITY} kits.`);
    } else if (result.status === "not-ready") {
      setError("Your cart is still loading. Please try again.");
    } else {
      setError("This product could not be added. Please refresh and try again.");
    }
  }

  return (
    <div className="add-to-cart-control">
      <button
        className={`${className} add-to-cart-button${justAdded ? " is-added" : ""}`}
        type="button"
        onClick={handleAddToCart}
        disabled={!isReady}
        aria-busy={!isReady}
      >
        {justAdded ? <Check aria-hidden="true" /> : <ShoppingBag aria-hidden="true" />}
        {!isReady ? "Loading…" : justAdded ? "Added" : "Add to Cart"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
