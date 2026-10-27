"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-provider";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Skincare", href: "/#steps" },
  { label: "Our Ritual", href: "/#how-to-use" },
  { label: "About", href: "/about" },
];

// Only real pages get a current-page state; the homepage section links (/#steps, /#how-to-use) never do.
function isCurrent(href: string, pathname: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

// Matches the CSS breakpoint where the desktop navigation is replaced by the menu button.
const MOBILE_NAV_QUERY = "(max-width: 900px)";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  // The header is fixed: pages whose hero shows through it (home, shop) get the solid navy bar once scrolled.
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    const desktop = window.matchMedia(MOBILE_NAV_QUERY);
    function onBreakpoint(event: MediaQueryListEvent) {
      if (!event.matches) setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [menuOpen]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`} ref={headerRef}>
      <Link className="wordmark" href="/#home" aria-label="CAPSÉRA home">
        CAPSÉRA<span>™</span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <a key={item.label} href={item.href} aria-current={isCurrent(item.href, pathname) ? "page" : undefined}>{item.label}</a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="icon-button header-search" href="/shop#product-search" aria-label="Search products" title="Search">
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
          ref={toggleRef}
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
            <a key={item.label} href={item.href} onClick={closeMenu} aria-current={isCurrent(item.href, pathname) ? "page" : undefined}>
              {item.label}
            </a>
          ))}
          <div className="mobile-nav-secondary">
            <a href="/shop#product-search" onClick={closeMenu}><Search aria-hidden="true" /> Search</a>
            <a href="/account" onClick={closeMenu}><UserRound aria-hidden="true" /> Account</a>
            <a href="/cart" onClick={closeMenu}><ShoppingBag aria-hidden="true" /> Cart ({itemCount})</a>
          </div>
        </nav>
      )}
    </header>
  );
}
