import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseQuantityInput, parseStoredCart } from "@/lib/cart";

const kit = "capsera-7-step-skincare-kit";
const stored = (lines: unknown) => parseStoredCart(JSON.stringify(lines));

describe("parseStoredCart", () => {
  it("returns an empty cart when nothing is saved", () => {
    assert.deepEqual(parseStoredCart(null), { items: [], recovered: false });
    assert.deepEqual(parseStoredCart(""), { items: [], recovered: false });
  });

  it("keeps valid lines as they are", () => {
    assert.deepEqual(stored([{ productId: kit, quantity: 3 }]), { items: [{ productId: kit, quantity: 3 }], recovered: false });
  });

  it("never keeps a price from storage", () => {
    const { items } = stored([{ productId: kit, quantity: 2, priceMinor: 1, price: 1 }]);
    assert.deepEqual(items, [{ productId: kit, quantity: 2 }]);
  });

  it("drops unknown products and invalid quantities", () => {
    for (const line of [
      { productId: "cleanse-capsule", quantity: 1 },
      { productId: kit, quantity: "2" },
      { productId: kit, quantity: 0 },
      { productId: kit, quantity: -1 },
      { productId: kit, quantity: 1.5 },
      { productId: kit, quantity: Number.NaN },
      { productId: kit },
      null,
      "kit",
    ]) {
      assert.deepEqual(stored([line]), { items: [], recovered: true }, JSON.stringify(line));
    }
  });

  it("merges duplicate lines and caps the quantity at 99", () => {
    assert.deepEqual(stored([{ productId: kit, quantity: 1 }, { productId: kit, quantity: 2 }]), { items: [{ productId: kit, quantity: 3 }], recovered: true });
    assert.deepEqual(stored([{ productId: kit, quantity: 150 }]), { items: [{ productId: kit, quantity: 99 }], recovered: true });
    assert.deepEqual(stored([{ productId: kit, quantity: 60 }, { productId: kit, quantity: 60 }]), { items: [{ productId: kit, quantity: 99 }], recovered: true });
  });

  it("throws for values that aren't a JSON array, so the provider can report and replace them", () => {
    assert.throws(() => parseStoredCart("not json"));
    assert.throws(() => parseStoredCart('{"a":1}'));
    assert.throws(() => parseStoredCart("42"));
  });
});

describe("parseQuantityInput", () => {
  it("accepts whole numbers from 1 to 99", () => {
    assert.equal(parseQuantityInput("1"), 1);
    assert.equal(parseQuantityInput("12"), 12);
    assert.equal(parseQuantityInput("99"), 99);
    assert.equal(parseQuantityInput("07"), 7);
  });

  it("rejects everything else", () => {
    for (const value of ["", " ", "0", "100", "-3", "2.5", "abc", "1e1", "0x10", " 5", "5 ", "+5", "Infinity"]) {
      assert.equal(parseQuantityInput(value), null, JSON.stringify(value));
    }
  });
});
