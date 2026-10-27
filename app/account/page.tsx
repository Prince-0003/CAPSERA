import Link from "next/link";
import { UserRound } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { ProfileDetails } from "@/components/profile-details";
import { SignOutButton } from "@/components/sign-out-button";
import { greetingName } from "@/lib/account-profile";
import { brandFontClassName } from "@/lib/brand-fonts";
import { summarizeStoredResult, type StoredQuizSummary } from "@/lib/quiz-record";
import { getCurrentUser } from "@/lib/supabase/server";

const navItems = [
  { href: "#overview", label: "Overview" },
  { href: "#personal-details", label: "Profile Details" },
  { href: "#orders", label: "Orders" },
  { href: "#skin-ritual", label: "Skin Ritual" },
];

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(iso));

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  // Verified with Supabase Auth; signed-out visitors (or expired sessions) get the sign-in prompt and no data.
  const { supabase, user } = await getCurrentUser();

  let profile: { fullName: string | null; phone: string | null } | null = null;
  let profileUnavailable = false;
  let quizResults: StoredQuizSummary[] = [];
  let quizUnavailable = false;
  if (supabase && user) {
    // Row Level Security returns only this customer's own rows.
    const [profileResult, quizResult] = await Promise.all([
      supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
      supabase.from("skin_quiz_results").select("id, created_at, answers").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
    ]);
    if (profileResult.error) {
      console.error("Unable to load profile.", profileResult.error.code);
      profileUnavailable = true;
    } else if (profileResult.data) {
      profile = { fullName: profileResult.data.full_name, phone: profileResult.data.phone };
    }
    if (quizResult.error) {
      console.error("Unable to load quiz results.", quizResult.error.code);
      quizUnavailable = true;
    } else {
      quizResults = quizResult.data.map(summarizeStoredResult).filter((item): item is StoredQuizSummary => item !== null);
    }
  }

  // A missing profile row (account created before the sign-up trigger) falls back to the name given at sign-up;
  // saving the profile form creates the row.
  const metadataName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const fullName = profile?.fullName ?? metadataName;
  const firstName = greetingName(fullName, user?.email);
  const memberSince = user ? formatDate(user.created_at) : "";
  const [latestResult, ...earlierResults] = quizResults;

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
                {params.password === "updated" && <p className="form-status account-notice" role="status">Your password has been updated.</p>}
              </header>

              <div className="account-content-grid">
                <ProfileDetails
                  fullName={fullName}
                  phone={profile?.phone ?? null}
                  email={user.email ?? ""}
                  memberSince={memberSince}
                  unavailable={profileUnavailable}
                />

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
                  {latestResult ? (
                    <div className="account-quiz">
                      <p className="account-quiz-date">Latest result · {formatDate(latestResult.createdAt)}</p>
                      <dl className="account-quiz-facts">
                        <div><dt>Likely skin type</dt><dd>{latestResult.skinType}</dd></div>
                        <div><dt>Main focus</dt><dd>{latestResult.primaryConcern}</dd></div>
                        <div><dt>Key kit steps</dt><dd>{latestResult.keySteps.join(", ")}</dd></div>
                      </dl>
                      <div className="account-quiz-actions">
                        <Link href={`/quiz/results?id=${latestResult.id}`} className="button button-navy">View full results</Link>
                        <Link href="/quiz?retake=1" className="button button-outline">Retake the quiz</Link>
                      </div>
                      {earlierResults.length > 0 && (
                        <>
                          <h3 className="account-quiz-history-title">Earlier results</h3>
                          <ul className="account-list account-quiz-history">
                            {earlierResults.map((result) => (
                              <li key={result.id}>
                                <span>
                                  <strong>{formatDate(result.createdAt)}</strong>
                                  <span>{result.skinType} · {result.primaryConcern}</span>
                                </span>
                                <Link href={`/quiz/results?id=${result.id}`}>View</Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>
                        {quizUnavailable
                          ? "Your saved quiz results couldn't be loaded right now. You can still take the quiz."
                          : "Answer six questions to see which steps of the kit are most relevant to your skin. Your results are saved here."}
                      </p>
                      <Link href="/quiz" className="button button-outline">Take the Skin Quiz</Link>
                    </div>
                  )}
                  <p className="account-card-note">General skincare guidance, not a medical diagnosis.</p>
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
