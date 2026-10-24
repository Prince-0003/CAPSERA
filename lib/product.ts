export const skincareKit = {
  id: "capsera-7-step-skincare-kit",
  name: "CAPSÉRA 7-Step Skincare Kit",
  description: "Your complete skincare routine in a single kit.",
  image: "/assets/capsera-7-step-capsules.png",
  imageAlt: "All seven CAPSÉRA skincare capsules together",
  href: "/shop/capsera-7-step-skincare-kit",
  price: null,
  currency: "INR",
  steps: [
    { number: "01", name: "Cleanse", product: "Face Wash", tone: "silver" },
    { number: "02", name: "Hydrate", product: "Hydrating Serum", tone: "violet" },
    { number: "03", name: "Treat", product: "Pimple Serum", tone: "rose" },
    { number: "04", name: "Brighten", product: "Vitamin C Serum", tone: "champagne" },
    { number: "05", name: "Repair", product: "Repair Serum", tone: "blue" },
    { number: "06", name: "Nourish", product: "Moisturiser", tone: "pearl" },
    { number: "07", name: "Protect", product: "Sunscreen", tone: "gold" },
  ],
} as const;
