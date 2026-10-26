import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatPrice, getProduct, lineTotalMinor, MAX_CART_QUANTITY, skincareKit } from "@/lib/product";

describe("product price", () => {
  it("is the official ₹1,299, stored as integer paise", () => {
    assert.equal(skincareKit.priceMinor, 129900);
    assert.ok(Number.isInteger(skincareKit.priceMinor));
    assert.equal(skincareKit.currency, "INR");
  });

  it("formats rupees in en-IN style, showing paise only when there are any", () => {
    assert.equal(formatPrice(129900), "₹1,299");
    assert.equal(formatPrice(259800), "₹2,598");
    assert.equal(formatPrice(389700), "₹3,897");
    assert.equal(formatPrice(129900 * 99), "₹1,28,601");
    assert.equal(formatPrice(129950), "₹1,299.50");
  });

  it("calculates line totals with integer maths", () => {
    assert.equal(lineTotalMinor(1), 129900);
    assert.equal(lineTotalMinor(3), 389700);
    assert.equal(lineTotalMinor(MAX_CART_QUANTITY), 12860100);
  });
});

describe("product catalogue", () => {
  it("only knows the seven-step kit", () => {
    assert.equal(getProduct(skincareKit.id), skincareKit);
    assert.equal(getProduct("cleanse-capsule"), null);
    assert.equal(getProduct(""), null);
  });

  it("lists the seven steps in order", () => {
    assert.deepEqual(
      skincareKit.steps.map((step) => `${step.number} ${step.name}`),
      ["01 Cleanse", "02 Hydrate", "03 Treat", "04 Brighten", "05 Repair", "06 Nourish", "07 Protect"]
    );
  });
});
