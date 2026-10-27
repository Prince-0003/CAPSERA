"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { CheckoutForm } from "@/components/checkout-form";
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

  return (
    <div className="checkout-layout">
      {/* First in the DOM so phones show what's being checked out before the form; desktop places it on the right. */}
      <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
        <h2 id="checkout-summary-title">Order summary</h2>
        <div className="checkout-summary-item">
          <div className="checkout-summary-thumb">
            <Image src={kit.product.image} alt="" width={1024} height={1536} />
          </div>
          <div>
            <p className="checkout-summary-name">
              {kit.product.name.split(/(\S+-\S+)/).map((part, index) =>
                index % 2 ? <span className="no-break" key={index}>{part}</span> : part,
              )}
            </p>
            <p className="checkout-summary-meta">Complete 7-step routine · one kit</p>
          </div>
        </div>
        <dl className="checkout-summary-rows">
          <div><dt>Quantity</dt><dd>× {kit.quantity}</dd></div>
          <div><dt>Unit price</dt><dd>{formatPrice(kit.product.priceMinor)}</dd></div>
          <div className="checkout-summary-total"><dt>Subtotal</dt><dd>{formatPrice(subtotalMinor)}</dd></div>
        </dl>
        <p className="checkout-summary-note">
          Subtotal for the kits only. Shipping and taxes haven&apos;t been configured, and online payment isn&apos;t
          available yet.
        </p>
        <Link className="checkout-return" href="/cart"><ArrowLeft aria-hidden="true" /> Return to cart</Link>
      </aside>

      <section className="checkout-form-panel" aria-labelledby="checkout-form-title">
        <h2 id="checkout-form-title">Contact &amp; delivery</h2>
        <div className="checkout-notice" role="note">
          <Info aria-hidden="true" />
          <div>
            <p className="checkout-notice-title">Online payment isn&apos;t available yet</p>
            <p>
              A payment provider hasn&apos;t been connected, so this form can check your details but can&apos;t place
              an order or take payment.
            </p>
          </div>
        </div>
        <CheckoutForm productId={kit.productId} quantity={kit.quantity} />
        <div className="checkout-notice checkout-notice-end" role="note">
          <Info aria-hidden="true" />
          <div>
            <p className="checkout-notice-title">College Project Notice</p>
            <p>
              CAPSÉRA is a college project created for educational and demonstration purposes. Orders and payments may
              not be processed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
