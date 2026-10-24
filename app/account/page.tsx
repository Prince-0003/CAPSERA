"use client";

import { useEffect, useState } from "react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

type AccountUser = {
  name: string;
  email: string;
};

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Addresses" },
  { id: "personal-details", label: "Personal Details" },
  { id: "payment-methods", label: "Payment Methods" },
  { id: "wishlist", label: "Wishlist" },
  { id: "settings", label: "Settings" },
];

export default function AccountPage() {
  const [user, setUser] = useState<AccountUser | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("capsera-account");
    if (!stored) {
      setUser(null);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as { name?: string; email?: string };
      if (parsed.name && parsed.email) {
        setUser({ name: parsed.name, email: parsed.email });
        return;
      }
    } catch {
      // Ignore invalid cached session values.
    }

    window.localStorage.removeItem("capsera-account");
    setUser(null);
  }, []);

  const firstName = user?.name.trim().split(/\s+/)[0] ?? "there";

  const signOut = () => {
    window.localStorage.removeItem("capsera-account");
    setUser(null);
  };

  const recentOrders: Array<{ id: string; item: string; status: string; date: string }> = [];
  const savedAddresses: Array<{ label: string; details: string }> = [];

  return (
    <main className="commerce-page account-page">
      <SiteHeader />
      <div className="account-page-shell">
        {user ? (
          <div className="account-dashboard">
            <aside className="account-sidebar">
              <div className="account-sidebar-heading">My Account</div>
              <nav className="account-nav" aria-label="Account navigation">
                {navItems.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className="account-nav-link">
                    {item.label}
                  </a>
                ))}
                <button type="button" className="account-nav-link account-nav-button" onClick={signOut}>
                  Logout
                </button>
              </nav>
            </aside>

            <div className="account-main">
              <header className="account-hero" id="overview">
                <p className="eyebrow">YOUR CAPSÉRA ACCOUNT</p>
                <h1>Hello, {firstName}!</h1>
                <p className="account-welcome-message">
                  Welcome back. Your routine, details, and saved preferences are ready whenever you are.
                </p>
              </header>

              <div className="account-content-grid">
                <section className="account-card account-card-wide" id="profile-details">
                  <div className="account-card-header">
                    <h2>Profile Details</h2>
                    <a href="#personal-details">Edit</a>
                  </div>
                  <dl className="profile-list">
                    <div>
                      <dt>Full name</dt>
                      <dd>{user.name}</dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd>{user.email}</dd>
                    </div>
                    <div>
                      <dt>Account status</dt>
                      <dd>Active</dd>
                    </div>
                  </dl>
                </section>

                <section className="account-card" id="orders">
                  <div className="account-card-header">
                    <h2>Recent Orders</h2>
                    <a href="/shop">Shop now</a>
                  </div>
                  {recentOrders.length ? (
                    <ul className="account-list">
                      {recentOrders.map((order) => (
                        <li key={order.id}>
                          <div>
                            <strong>{order.item}</strong>
                            <span>{order.date}</span>
                          </div>
                          <em>{order.status}</em>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state">
                      <p>No orders yet.</p>
                      <a href="/shop" className="button button-navy">Browse product</a>
                    </div>
                  )}
                </section>

                <section className="account-card" id="addresses">
                  <div className="account-card-header">
                    <h2>Saved Addresses</h2>
                    <a href="#personal-details">Add</a>
                  </div>
                  {savedAddresses.length ? (
                    <ul className="account-list">
                      {savedAddresses.map((address, index) => (
                        <li key={`${address.label}-${index}`}>
                          <div>
                            <strong>{address.label}</strong>
                            <span>{address.details}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state small">
                      <p>No saved addresses yet.</p>
                    </div>
                  )}
                </section>

                <section className="account-card" id="settings">
                  <div className="account-card-header">
                    <h2>Account Settings</h2>
                  </div>
                  <ul className="settings-list">
                    <li>
                      <span>Email preferences</span>
                      <strong>On</strong>
                    </li>
                    <li>
                      <span>Password</span>
                      <strong>Updated</strong>
                    </li>
                    <li>
                      <span>Notifications</span>
                      <strong>Enabled</strong>
                    </li>
                    <li>
                      <span>Privacy</span>
                      <strong>Protected</strong>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <section className="account-signin-prompt">
            <p className="eyebrow">YOUR CAPSÉRA ACCOUNT</p>
            <h1>My Account</h1>
            <p className="setup-notice">You are not signed in. Create an account or sign in to access your profile.</p>
            <div className="account-links">
              <a className="button button-navy" href="/signin">Sign In</a>
              <a className="button button-outline" href="/signup">Create Account</a>
            </div>
          </section>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
