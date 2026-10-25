export const skincareKit = {
  id: "capsera-7-step-skincare-kit",
  name: "CAPSÉRA 7-Step Skincare Kit",
  description: "Your complete skincare routine in a single kit.",
  image: "/assets/capsera-7-step-capsules.png",
  imageAlt: "All seven CAPSÉRA skincare capsules together",
  href: "/shop/capsera-7-step-skincare-kit",
  /** Price in minor units (paise). null until a verified price is provided; never invent one. */
  priceMinor: null as number | null,
  currency: "INR",
  steps: [
    { number: "01", name: "Cleanse", product: "Face Wash", tone: "silver", image: "/img/Picsart_26-10-22_22-30-17-375.png" },
    { number: "02", name: "Hydrate", product: "Hydrating Serum", tone: "violet", image: "/img/Picsart_26-10-21_13-15-44-421.png" },
    { number: "03", name: "Treat", product: "Pimple Serum", tone: "rose", image: "/img/Picsart_26-10-21_13-16-41-134.png" },
    { number: "04", name: "Brighten", product: "Vitamin C Serum", tone: "champagne", image: "/img/champagne_gold_capsule_tightly_cropped.png" },
    { number: "05", name: "Repair", product: "Repair Serum", tone: "blue", image: "/img/Picsart_26-10-21_13-18-05-932.png" },
    { number: "06", name: "Nourish", product: "Moisturiser", tone: "pearl", image: "/img/Picsart_26-10-22_22-31-29-486.png" },
    { number: "07", name: "Protect", product: "Sunscreen", tone: "gold", image: "/img/Picsart_26-10-22_22-32-30-459.png" },
  ],
} as const;

export type ProductId = typeof skincareKit.id;

/** The kit is the only purchasable product; cart lines store just its id and quantity and read the rest from here. */
export const MAX_CART_QUANTITY = 99;

export function getProduct(productId: string) {
  return productId === skincareKit.id ? skincareKit : null;
}

export function formatPrice(minor: number, currency: string = skincareKit.currency) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(minor / 100);
}

/** Line total in minor units, or null while the price is not configured. Integer maths only. */
export function lineTotalMinor(quantity: number) {
  return skincareKit.priceMinor === null ? null : skincareKit.priceMinor * quantity;
}

export type KitStepName = (typeof skincareKit.steps)[number]["name"];

export type VerifiedStepInfo = {
  ingredients?: string;
  directions?: string;
  timeOfDay?: ("morning" | "evening")[];
};

/**
 * Verified formula and usage details per kit step. Ingredient lists and directions have not been
 * provided yet, so this is empty and the skin quiz marks every product recommendation as needing
 * verification and does not show a morning/evening schedule. Add entries only from confirmed packaging.
 */
export const verifiedStepInfo: Partial<Record<KitStepName, VerifiedStepInfo>> = {};
