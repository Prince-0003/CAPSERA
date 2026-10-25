"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getProduct, lineTotalMinor, MAX_CART_QUANTITY, skincareKit, type ProductId } from "@/lib/product";

/** Stored cart line. Name, price, and image are read from the product catalogue so they can't go stale. */
type CartItem = {
  productId: ProductId;
  quantity: number;
};

export type CartLine = CartItem & {
  product: typeof skincareKit;
  /** Unit price × quantity, in paise. */
  lineTotalMinor: number;
};

export type AddResult =
  | { status: "added"; quantity: number }
  | { status: "max"; quantity: number }
  | { status: "not-ready" }
  | { status: "unknown-product" };

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  /** Sum of the line totals, in paise. */
  subtotalMinor: number;
  isReady: boolean;
  storageMessage: string;
  addItem: (productId: string, quantity?: number) => AddResult;
  /** Adds one kit only if it isn't already in the cart (used by Buy Now). */
  ensureInCart: (productId: string) => AddResult;
  setQuantity: (productId: string, quantity: number) => boolean;
  removeItem: (productId: string) => void;
  getQuantity: (productId: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "capsera-cart";

/** Reads saved lines, dropping unknown products and merging duplicates instead of discarding the whole cart. */
function parseStoredCart(raw: string | null): { items: CartItem[]; recovered: boolean } {
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState("");
  // Mirrors the latest cart synchronously so several updates in one event (double clicks,
  // two buttons at once) build on each other instead of on a stale render's copy.
  const itemsRef = useRef<CartItem[]>([]);
  const readyRef = useRef(false);

  useEffect(() => {
    function load() {
      try {
        const { items: stored, recovered } = parseStoredCart(window.localStorage.getItem(STORAGE_KEY));
        itemsRef.current = stored;
        setItems(stored);
        // Save the corrected cart so the invalid lines don't come back on the next load.
        if (recovered) {
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
          } catch {
            // The corrected cart still works for this session.
          }
        }
        setStorageMessage(recovered ? "Some saved cart details were invalid and have been corrected." : "");
      } catch (error) {
        console.error("Unable to load the saved CAPSÉRA cart.", error);
        setStorageMessage("Your saved cart could not be loaded. You can still shop this session.");
      }
    }
    load();
    readyRef.current = true;
    setIsReady(true);

    // Keep other open tabs in sync.
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((nextItems: CartItem[]) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
      setStorageMessage("");
    } catch (error) {
      console.error("Unable to save the CAPSÉRA cart.", error);
      setStorageMessage("Your cart is available for this session but could not be saved.");
    }
  }, []);

  const addItem = useCallback(
    (productId: string, quantity = 1): AddResult => {
      if (!readyRef.current) return { status: "not-ready" };
      const product = getProduct(productId);
      if (!product || !Number.isInteger(quantity) || quantity < 1) return { status: "unknown-product" };
      const current = itemsRef.current;
      const existing = current.find((item) => item.productId === product.id);
      const currentQuantity = existing?.quantity ?? 0;
      if (currentQuantity >= MAX_CART_QUANTITY) return { status: "max", quantity: currentQuantity };
      const nextQuantity = Math.min(currentQuantity + quantity, MAX_CART_QUANTITY);
      commit(
        existing
          ? current.map((item) => (item.productId === product.id ? { ...item, quantity: nextQuantity } : item))
          : [...current, { productId: product.id, quantity: nextQuantity }]
      );
      return { status: "added", quantity: nextQuantity };
    },
    [commit]
  );

  const ensureInCart = useCallback(
    (productId: string): AddResult => {
      if (!readyRef.current) return { status: "not-ready" };
      const existing = itemsRef.current.find((item) => item.productId === productId);
      return existing ? { status: "added", quantity: existing.quantity } : addItem(productId, 1);
    },
    [addItem]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (!readyRef.current || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CART_QUANTITY) return false;
      if (!itemsRef.current.some((item) => item.productId === productId)) return false;
      commit(itemsRef.current.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
      return true;
    },
    [commit]
  );

  const removeItem = useCallback(
    (productId: string) => {
      if (!readyRef.current) return;
      commit(itemsRef.current.filter((item) => item.productId !== productId));
    },
    [commit]
  );

  const getQuantity = useCallback(
    (productId: string) => items.find((item) => item.productId === productId)?.quantity ?? 0,
    [items]
  );

  const value = useMemo(() => {
    const lines: CartLine[] = items.flatMap((item) => {
      const product = getProduct(item.productId);
      return product ? [{ ...item, product, lineTotalMinor: lineTotalMinor(item.quantity) }] : [];
    });
    const subtotalMinor = lines.reduce((total, line) => total + line.lineTotalMinor, 0);
    return {
      lines,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      subtotalMinor,
      isReady,
      storageMessage,
      addItem,
      ensureInCart,
      setQuantity,
      removeItem,
      getQuantity,
    };
  }, [items, isReady, storageMessage, addItem, ensureInCart, setQuantity, removeItem, getQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
