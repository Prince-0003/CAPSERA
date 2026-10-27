import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck2, Layers, Sparkles, Smile } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { ServiceForm } from "@/components/service-form";
import { safeNextPath } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/supabase/server";

const benefits = [
  { label: "Thoughtfully Crafted Skincare", icon: Sparkles },
  { label: "Seven Steps, One Kit", icon: Layers },
  { label: "Made for Your Routine", icon: CalendarCheck2 },
  { label: "A More Confident You", icon: Smile },
];

/** Notices for visitors arriving from an email link (see app/auth/confirm/route.ts). */
const linkNotices: Record<string, string> = {
  confirmed: "Your email address is confirmed. Sign in to continue.",
  invalid: "That link is invalid or has expired. Sign in below; if your email isn't confirmed yet, you can request a new link.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : undefined);
  const notice = typeof params.link === "string" ? linkNotices[params.link] : undefined;
  const { user } = await getCurrentUser();
  if (user) redirect(next);
  return (
    <main className="commerce-page auth-page signin-page">
      <SiteHeader />
      <section className="signin-stage" aria-labelledby="signin-title">
        <div className="signin-layout">
          <div className="signin-welcome">
            <p className="signin-eyebrow">WELCOME BACK</p>
            <h1 id="signin-title">CAPSÉRA</h1>
            <p className="signin-tagline">Skincare in a capsule, care for your radiant skin.</p>
            <div className="signin-benefits">
              {benefits.map(({ label, icon: Icon }) => (
                <div className="signin-benefit" key={label}>
                  <span className="benefit-icon"><Icon aria-hidden="true" /></span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <section className="signin-card" aria-labelledby="signin-card-title">
            <p className="signin-card-label">SIGN IN</p>
            <h2 id="signin-card-title">Welcome Back</h2>
            <p className="signin-card-intro">Sign in to your CAPSÉRA account to see your profile and get back to your skincare ritual.</p>
            {notice && <p className="form-status auth-link-notice" role="status">{notice}</p>}
            <ServiceForm kind="signin" submitLabel="Sign In" next={next === "/account" ? undefined : next} />
            <Link className="signin-forgot" href="/forgot-password">Forgot Password?</Link>
            <div className="signin-divider"><span>OR</span></div>
            <p className="signin-account-prompt">Don&apos;t have an account? <Link href="/signup">Sign Up</Link></p>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
