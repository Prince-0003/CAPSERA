"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { ServiceForm, type CheckoutField } from "@/components/service-form";
import { formatPrice, skincareKit } from "@/lib/product";

export function CheckoutContent() {
  const { lines, subtotalMinor, isReady } = useCart();
  const kit = lines.find((line) => line.productId === skincareKit.id);

  if (!isReady) return <p className="cart-feedback" role="status">Loading your checkout…</p>;
  if (!kit) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty.</h2>
        <p>Add the complete CAPSÉRA kit before continuing.</p>
        <Link className="button button-navy" href="/shop">Visit the shop</Link>
      </div>
    );
  }

  const fields: CheckoutField[] = [
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "name", label: "Full name", autoComplete: "name" },
    { name: "address", label: "Street address", autoComplete: "street-address" },
    { name: "city", label: "City", autoComplete: "address-level2" },
    { name: "region", label: "State or region", autoComplete: "address-level1" },
    { name: "postalCode", label: "Postal code", autoComplete: "postal-code" },
    { name: "country", label: "Country", autoComplete: "country-name" },
    { name: "quantity", type: "hidden", value: String(kit.quantity) },
    { name: "productId", type: "hidden", value: kit.productId },
  ];

  return (
    <div className="checkout-layout">
      <section className="checkout-form-panel">
        <h2>Contact &amp; delivery</h2>
        <p className="setup-notice">Checkout is not active: the kit price and a payment provider have not been configured. This form checks your details but cannot create an order or take payment.</p>
        <ServiceForm kind="checkout" submitLabel="Check checkout setup" fields={fields} />
      </section>
      <aside className="cart-summary checkout-summary" aria-labelledby="checkout-summary-title">
        <h2 id="checkout-summary-title">Order summary</h2>
        <p>{kit.product.name} <span>× {kit.quantity}</span></p>
        <p>Unit price <span>{kit.product.priceMinor === null ? "Price not listed" : formatPrice(kit.product.priceMinor)}</span></p>
        <p>Subtotal <span>{subtotalMinor === null ? "Price not listed" : formatPrice(subtotalMinor)}</span></p>
        <p className="cart-price-note">{subtotalMinor === null ? "Totals can't be calculated until the kit price is set." : "Payment provider setup is required."}</p>
        <Link className="text-link" href="/cart">Return to cart</Link>
      </aside>
    </div>
  );
}
