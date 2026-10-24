"use client";

import { useState } from "react";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Skincare", href: "/#steps" },
  { label: "Our Ritual", href: "/#how-to-use" },
  { label: "About", href: "/about" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <Link className="wordmark" href="/#home" aria-label="CAPSÉRA home">
        CAPSÉRA<span>™</span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <a key={item.label} href={item.href}>{item.label}</a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="icon-button" href="/shop#product-search" aria-label="Search products" title="Search">
          <Search />
        </a>
        <a className="icon-button cart-header-link" href="/cart" aria-label={`Cart, ${itemCount} items`} title="Cart">
          <ShoppingBag />
          {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
        </a>
        <a className="icon-button account-button" href="/account" aria-label="Account" title="My account">
          <UserRound />
        </a>
        <button
          className="icon-button mobile-menu"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && (
        <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
          {navigation.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a href="/cart" onClick={() => setMenuOpen(false)}>Cart ({itemCount})</a>
        </nav>
      )}
    </header>
  );
}