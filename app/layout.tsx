import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/components/cart-provider";
import { ToastProvider } from "@/components/toast-provider";
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
        <CartProvider>
          <ToastProvider>{children}</ToastProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
