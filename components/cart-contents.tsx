"use client";

import Image from "next/image";
import { useCart } from "@/components/cart-provider";
import { skincareKit } from "@/lib/product";

export function CartContents() {
  const { items, isReady, removeItem, setQuantity, storageMessage } = useCart();
  const kit = items.find((item) => item.productId === skincareKit.id);

  if (!isReady) {
    return <p className="cart-feedback">Loading your cart…</p>;
  }

  return (
    <section className="cart-content" aria-label="Cart items">
      {storageMessage && <p className="cart-feedback" role="status">{storageMessage}</p>}
      {kit ? (
        <article className="cart-item">
          <a className="cart-item-image" href={skincareKit.href}>
            <Image
              src={skincareKit.image}
              alt={skincareKit.imageAlt}
              width={1024}
              height={1536}
              priority
            />
          </a>
          <div className="cart-item-info">
            <p className="eyebrow">COMPLETE 7-STEP ROUTINE</p>
            <h2><a href={skincareKit.href}>{skincareKit.name}</a></h2>
            <p>{skincareKit.description}</p>
            <div className="quantity-control" aria-label="Kit quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={kit.quantity <= 1}
                onClick={() => setQuantity(kit.productId, kit.quantity - 1)}
              >
                −
              </button>
              <span aria-live="polite">Quantity: {kit.quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={kit.quantity >= 99}
                onClick={() => setQuantity(kit.productId, kit.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="cart-item-actions">
            <p className="shop-product-price">Price not listed</p>
            <button className="text-button" onClick={() => removeItem(kit.productId)}>
              Remove
            </button>
          </div>
        </article>
      ) : (
        <div className="empty-cart">
          <h2>Your cart is waiting for a ritual.</h2>
          <p>Explore the complete CAPSÉRA skincare kit to get started.</p>
          <a className="button button-navy" href="/shop">Continue shopping</a>
        </div>
      )}
      {kit && (
        <div className="cart-summary">
          <p>Subtotal <span>{skincareKit.price === null ? "Price not listed" : `${skincareKit.currency} ${skincareKit.price * kit.quantity}`}</span></p>
          <p className="cart-price-note">{skincareKit.price === null ? "Checkout is unavailable until the kit price and payment provider are configured." : "Payment provider setup is required before checkout."}</p>
          <a className="button button-navy" href="/checkout">Continue to Checkout</a>
          <a className="button button-outline" href="/shop">Continue shopping</a>
        </div>
      )}
    </section>
  );
}
