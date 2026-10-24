import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAPSÉRA | Skincare in a Capsule",
  description:
    "A simpler skincare ritual. Explore CAPSÉRA's seven-step capsule skincare concept and personalize a kit for your skin type.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
