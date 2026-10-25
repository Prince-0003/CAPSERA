import { Instagram, Youtube } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Skincare", href: "/#steps" },
  { label: "Our Ritual", href: "/#how-to-use" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link className="footer-wordmark" href="/#home">CAPSÉRA</Link>
        <p>Thoughtful skincare, brought together in one complete routine.</p>
      </div>
      <nav aria-label="Footer navigation">
        {footerLinks.map((item) => (
          <a key={item.label} href={item.href}>{item.label}</a>
        ))}
      </nav>
      <div className="social-links" aria-label="Social media">
        <a href="https://www.instagram.com/capsera.care/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <Instagram />
        </a>
        <span role="img" aria-label="YouTube"><Youtube /></span>
      </div>
    </footer>
  );
}