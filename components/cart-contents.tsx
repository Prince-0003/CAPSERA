"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, type CartLine } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";
import { formatPrice, MAX_CART_QUANTITY } from "@/lib/product";

function QuantityControl({ line }: { line: CartLine }) {
  const { setQuantity } = useCart();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputId = `quantity-${line.productId}`;

  function commitDraft(value: string) {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 1 || next > MAX_CART_QUANTITY) {
      setError(`Enter a quantity from 1 to ${MAX_CART_QUANTITY}.`);
      return;
    }
    setError("");
    setQuantity(line.productId, next);
    setDraft(null);
  }

  return (
    <div className="cart-quantity">
      <label className="field-label" htmlFor={inputId}>Quantity</label>
      <div className="quantity-control">
        <button type="button" aria-label="Decrease quantity" disabled={line.quantity <= 1} onClick={() => { setError(""); setDraft(null); setQuantity(line.productId, line.quantity - 1); }}>
          <Minus aria-hidden="true" />
        </button>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_CART_QUANTITY}
          value={draft ?? String(line.quantity)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => draft !== null && commitDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") commitDraft(event.currentTarget.value); }}
        />
        <button type="button" aria-label="Increase quantity" disabled={line.quantity >= MAX_CART_QUANTITY} onClick={() => { setError(""); setDraft(null); setQuantity(line.productId, line.quantity + 1); }}>
          <Plus aria-hidden="true" />
        </button>
      </div>
      {error && <p className="form-error" id={`${inputId}-error`} role="alert">{error}</p>}
    </div>
  );
}

export function CartContents() {
  const { lines, itemCount, subtotalMinor, isReady, removeItem, storageMessage } = useCart();
  const { showToast } = useToast();

  if (!isReady) {
    return <p className="cart-feedback" role="status">Loading your cart…</p>;
  }

  return (
    <section className="cart-content" aria-label="Cart items">
      {storageMessage && <p className="cart-feedback" role="status">{storageMessage}</p>}
      {lines.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is waiting for a ritual.</h2>
          <p>Explore the complete CAPSÉRA skincare kit to get started.</p>
          <Link className="button button-navy" href="/shop">Continue shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-lines">
            {lines.map((line) => (
              <article className="cart-item" key={line.productId}>
                <Link className="cart-item-image" href={line.product.href}>
                  <Image src={line.product.image} alt={line.product.imageAlt} width={1024} height={1536} priority />
                </Link>
                <div className="cart-item-info">
                  <p className="eyebrow">COMPLETE 7-STEP ROUTINE</p>
                  <h2><Link href={line.product.href}>{line.product.name}</Link></h2>
                  <p>{line.product.description}</p>
                  <p className="cart-unit-price">
                    {line.product.priceMinor === null ? "Price not listed" : `${formatPrice(line.product.priceMinor)} each`}
                  </p>
                  <QuantityControl line={line} />
                </div>
                <div className="cart-item-actions">
                  <p className="shop-product-price">{line.lineTotalMinor === null ? "Price not listed" : formatPrice(line.lineTotalMinor)}</p>
                  <button
                    className="text-button cart-remove"
                    type="button"
                    onClick={() => {
                      removeItem(line.productId);
                      showToast({ tone: "success", message: `${line.product.name} removed from your cart.` });
                    }}
                  >
                    <Trash2 aria-hidden="true" /> Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <h2 id="cart-summary-title">Order summary</h2>
            <p>Items <span>{itemCount}</span></p>
            <p>Subtotal <span>{subtotalMinor === null ? "Price not listed" : formatPrice(subtotalMinor)}</span></p>
            <p className="cart-price-note">
              {subtotalMinor === null
                ? "Totals can't be calculated yet because the kit price hasn't been set, and online payment isn't available."
                : "Shipping and taxes haven't been configured, and online payment isn't available yet."}
            </p>
            <Link className="button button-navy" href="/checkout">Continue to Checkout</Link>
            <Link className="button button-outline" href="/shop">Continue shopping</Link>
          </aside>
        </>
      )}
    </section>
  );
}
