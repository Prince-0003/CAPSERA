import Link from "next/link";
import { UserRound } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { SignOutButton } from "@/components/sign-out-button";
import { getSessionAccount } from "@/app/_lib/session";
import { brandFontClassName } from "@/lib/brand-fonts";

const navItems = [
  { href: "#overview", label: "Overview" },
  { href: "#personal-details", label: "Profile Details" },
  { href: "#orders", label: "Orders" },
  { href: "#skin-ritual", label: "Skin Ritual" },
];

export default async function AccountPage() {
  const user = await getSessionAccount();
  const firstName = user?.name.trim().split(/\s+/)[0] || "there";
  const memberSince = user
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(user.createdAt))
    : "";

  return (
    <main className={`commerce-page account-page ${brandFontClassName}`}>
      <SiteHeader />
      <div className="account-page-shell">
        {user ? (
          <div className="account-dashboard">
            <aside className="account-sidebar">
              <div className="account-sidebar-heading">My Account</div>
              <nav className="account-nav" aria-label="Account navigation">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href} className="account-nav-link">
                    {item.label}
                  </a>
                ))}
                <SignOutButton />
              </nav>
            </aside>

            <div className="account-main">
              <header className="account-hero" id="overview">
                <p className="eyebrow">YOUR CAPSÉRA ACCOUNT</p>
                <h1>Hello, {firstName}!</h1>
                <p className="account-welcome-message">
                  Welcome back. Here are your account details and the quickest way back to your skincare ritual.
                </p>
              </header>

              <div className="account-content-grid">
                <section className="account-card account-card-wide" id="personal-details">
                  <div className="account-card-header">
                    <h2>Profile Details</h2>
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
                      <dt>Member since</dt>
                      <dd>{memberSince}</dd>
                    </div>
                  </dl>
                  <p className="account-card-note">Editing your profile and password isn&apos;t available yet.</p>
                </section>

                <section className="account-card" id="orders">
                  <div className="account-card-header">
                    <h2>Orders</h2>
                  </div>
                  <div className="empty-state">
                    <p>No orders yet. Online checkout isn&apos;t available yet, so orders can&apos;t be placed or tracked here.</p>
                    <Link href="/shop" className="button button-navy">Browse the kit</Link>
                  </div>
                </section>

                <section className="account-card" id="skin-ritual">
                  <div className="account-card-header">
                    <h2>Your Skin Ritual</h2>
                  </div>
                  <div className="empty-state">
                    <p>Answer six questions to see which steps of the kit are most relevant to your skin.</p>
                    <Link href="/quiz" className="button button-outline">Take the Skin Quiz</Link>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <section className="account-signin-prompt">
            <div className="account-prompt-icon" aria-hidden="true">
              <UserRound />
            </div>
            <p className="eyebrow">YOUR CAPSÉRA ACCOUNT</p>
            <h1>My Account</h1>
            <p className="setup-notice">Sign in to see your profile details, or create an account to get started.</p>
            <div className="account-links">
              <Link className="button button-navy" href="/signin">Sign In</Link>
              <Link className="button button-outline" href="/signup">Create Account</Link>
            </div>
          </section>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
