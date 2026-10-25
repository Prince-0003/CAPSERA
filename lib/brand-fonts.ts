import { Cormorant_Garamond, DM_Sans } from "next/font/google";

// Brand fonts (Cormorant Garamond headings, DM Sans text). They only define CSS variables, applied via a
// page wrapper's className (skin quiz, shop page), so the global header/hero typography is unchanged.
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-brand-heading", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-brand-body", display: "swap" });

export const brandFontClassName = `${cormorant.variable} ${dmSans.variable}`;
