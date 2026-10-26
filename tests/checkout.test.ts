import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { POST } from "@/app/api/checkout/route";
import { checkoutFieldError, checkoutFields } from "@/lib/checkout-fields";

const valid = {
  email: "riya@example.com",
  name: "Riya Shah",
  address: "12 Lake Road",
  city: "Pune",
  region: "Maharashtra",
  postalCode: "411001",
  country: "India",
  quantity: "2",
  productId: "capsera-7-step-skincare-kit",
};

// Calls the route handler directly; no server, payment provider or network is involved.
async function post(body: unknown) {
  const response = await POST(
    new Request("http://localhost/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
  return { status: response.status, message: ((await response.json()) as { message: string }).message };
}

const field = (name: string) => {
  const found = checkoutFields.find((item) => item.name === name);
  assert.ok(found, name);
  return found;
};

describe("checkout field rules", () => {
  it("accepts a complete, valid address", () => {
    for (const item of checkoutFields) assert.equal(checkoutFieldError(item, valid[item.name]), null, item.name);
  });

  it("requires every field and trims whitespace first", () => {
    for (const item of checkoutFields) {
      assert.notEqual(checkoutFieldError(item, ""), null, item.name);
      assert.notEqual(checkoutFieldError(item, "   "), null, item.name);
      assert.notEqual(checkoutFieldError(item, undefined), null, item.name);
    }
  });

  it("applies minimum and maximum lengths", () => {
    assert.equal(checkoutFieldError(field("name"), "A"), "Full name needs at least 2 characters.");
    assert.equal(checkoutFieldError(field("name"), "Al"), null);
    assert.equal(checkoutFieldError(field("name"), "a".repeat(120)), null);
    assert.equal(checkoutFieldError(field("name"), "a".repeat(121)), "Full name can be at most 120 characters.");
    assert.notEqual(checkoutFieldError(field("postalCode"), "41"), null);
    assert.notEqual(checkoutFieldError(field("postalCode"), "1".repeat(21)), null);
  });

  it("checks the email format", () => {
    for (const email of ["riya", "riya@", "riya@example", "ri ya@example.com"]) {
      assert.equal(checkoutFieldError(field("email"), email), "Enter a valid email address, like name@example.com.", email);
    }
  });
});

describe("POST /api/checkout", () => {
  it("never reports a successful order: valid details get an honest 503", async () => {
    assert.deepEqual(await post(valid), {
      status: 503,
      message: "Payment processing is not configured. No order was created and no payment was taken.",
    });
  });

  it("ignores price fields sent by the client", async () => {
    const result = await post({ ...valid, price: 1, priceMinor: 1, total: 1, subtotalMinor: 1 });
    assert.equal(result.status, 503);
    assert.doesNotMatch(result.message, /success|confirmed|placed/i);
  });

  it("rejects malformed bodies with 400", async () => {
    for (const body of ["{not json", "null", "[]", '"text"']) {
      assert.equal((await post(body)).status, 400, body);
    }
  });

  it("rejects tampered cart details with 400", async () => {
    for (const change of [
      { productId: "cleanse-capsule" },
      { productId: undefined },
      { quantity: "0" },
      { quantity: "100" },
      { quantity: "500" },
      { quantity: "-1" },
      { quantity: "1.5" },
      { quantity: "1e1" },
      { quantity: 2 },
      { quantity: "" },
    ]) {
      assert.equal((await post({ ...valid, ...change })).status, 400, JSON.stringify(change));
    }
  });

  it("accepts quantities 1 and 99", async () => {
    assert.equal((await post({ ...valid, quantity: "1" })).status, 503);
    assert.equal((await post({ ...valid, quantity: "99" })).status, 503);
  });

  it("rejects missing or invalid contact and delivery fields with 400", async () => {
    for (const item of checkoutFields) {
      assert.equal((await post({ ...valid, [item.name]: "" })).status, 400, item.name);
      assert.equal((await post({ ...valid, [item.name]: 42 })).status, 400, item.name);
    }
    assert.equal((await post({ ...valid, email: "not-an-email" })).status, 400);
  });
});
