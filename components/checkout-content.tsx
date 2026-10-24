"use client";

import { useCart } from "@/components/cart-provider";
import { ServiceForm, type CheckoutField } from "@/components/service-form";
import { skincareKit } from "@/lib/product";

export function CheckoutContent() {
  const { items, isReady } = useCart();
  const kit = items.find((item) => item.productId === skincareKit.id);

  if (!isReady) return <p className="cart-feedback">Loading your checkout…</p>;
  if (!kit) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty.</h2>
        <p>Add the complete CAPSÉRA kit before continuing.</p>
        <a className="button button-navy" href="/shop">Visit the shop</a>
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
        <p className="setup-notice">Checkout is not active: product pricing and a payment provider have not been configured. This form cannot create an order or take payment.</p>
        <ServiceForm kind="checkout" submitLabel="Check checkout setup" fields={fields} />
      </section>
      <aside className="cart-summary checkout-summary">
        <h2>Order summary</h2>
        <p>{skincareKit.name} <span>× {kit.quantity}</span></p>
        <p>Subtotal <span>{skincareKit.price === null ? "Price not listed" : `${skincareKit.currency} ${skincareKit.price * kit.quantity}`}</span></p>
        <p className="cart-price-note">{skincareKit.price === null ? "Configure a kit price to calculate totals." : "Payment provider setup is required."}</p>
        <a className="text-link" href="/cart">Return to cart</a>
      </aside>
    </div>
  );
}
