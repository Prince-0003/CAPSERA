import { getProduct, MAX_CART_QUANTITY, type ProductId } from "@/lib/product";

/** Stored cart line. Name, price, and image are read from the product catalogue so they can't go stale. */
export type CartItem = {
  productId: ProductId;
  quantity: number;
};

/**
 * Reads saved lines, dropping unknown products and merging duplicates instead of discarding the whole cart.
 * Throws when the value isn't a JSON array at all.
 */
export function parseStoredCart(raw: string | null): { items: CartItem[]; recovered: boolean } {
  if (!raw) return { items: [], recovered: false };
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Saved cart data has an unexpected format.");
  const quantities = new Map<ProductId, number>();
  let recovered = false;
  for (const entry of parsed) {
    const record = typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>) : null;
    const product = record && typeof record.productId === "string" ? getProduct(record.productId) : null;
    const quantity = record?.quantity;
    if (!product || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      recovered = true;
      continue;
    }
    if (quantities.has(product.id) || quantity > MAX_CART_QUANTITY) recovered = true;
    quantities.set(product.id, Math.min((quantities.get(product.id) ?? 0) + quantity, MAX_CART_QUANTITY));
  }
  return { items: [...quantities].map(([productId, quantity]) => ({ productId, quantity })), recovered };
}

/** A typed quantity from 1 to MAX_CART_QUANTITY, or null. Whole digits only: Number() would also accept "1e1", " 5 " or "0x10". */
export function parseQuantityInput(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const quantity = Number(value);
  return quantity >= 1 && quantity <= MAX_CART_QUANTITY ? quantity : null;
}
