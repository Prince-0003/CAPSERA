"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { skincareKit } from "@/lib/product";

type CartItem = {
  productId: typeof skincareKit.id;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  isReady: boolean;
  storageMessage: string;
  addItem: (productId: typeof skincareKit.id) => void;
  setQuantity: (productId: typeof skincareKit.id, quantity: number) => void;
  removeItem: (productId: typeof skincareKit.id) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "capsera-cart";

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    item.productId === skincareKit.id &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState("");

  useEffect(() => {
    try {
      const storedItems = window.localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        const parsed: unknown = JSON.parse(storedItems);
        if (!Array.isArray(parsed) || !parsed.every(isCartItem)) {
          throw new Error("Saved cart data has an unexpected format.");
        }
        setItems(parsed);
      }
    } catch (error) {
      console.error("Unable to load the saved CAPSÉRA cart.", error);
      setStorageMessage("Your saved cart could not be loaded. You can still shop this session.");
    } finally {
      setIsReady(true);
    }
  }, []);

  const updateCart = useCallback((nextItems: CartItem[]) => {
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
    (productId: typeof skincareKit.id) => {
      const existingItem = items.find((item) => item.productId === productId);
      const nextItems = existingItem
        ? items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
              : item
          )
        : [...items, { productId, quantity: 1 }];
      updateCart(nextItems);
    },
    [items, updateCart]
  );

  const setQuantity = useCallback(
    (productId: typeof skincareKit.id, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return;
      }
      updateCart(
        items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    },
    [items, updateCart]
  );

  const removeItem = useCallback(
    (productId: typeof skincareKit.id) => {
      updateCart(items.filter((item) => item.productId !== productId));
    },
    [items, updateCart]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      isReady,
      storageMessage,
      addItem,
      setQuantity,
      removeItem,
    }),
    [items, isReady, storageMessage, addItem, setQuantity, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}