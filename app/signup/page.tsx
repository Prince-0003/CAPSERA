import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Layers, Sparkles, UserRound } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { ServiceForm } from "@/components/service-form";
import { getSessionAccount } from "@/app/_lib/session";

const benefits = [
  { title: "Personalized Guidance", text: "Take the Skin Quiz to see which kit steps suit your concerns.", icon: Sparkles },
  { title: "Seven Steps, One Kit", text: "The complete CAPSÉRA ritual, together in a single kit.", icon: Layers },
  { title: "Your Own Account", text: "Keep your profile details in one place.", icon: UserRound },
  { title: "A Healthier, Radiant You", text: "Because great skin starts here.", icon: Heart },
];

export default async function SignUpPage() {
  if (await getSessionAccount()) redirect("/account");
  return (
    <main className="commerce-page signup-page">
      <SiteHeader />
      <section className="signup-stage" aria-labelledby="signup-title">
        <div className="signup-layout">
          <div className="signup-welcome">
            <p className="signup-eyebrow">JOIN CAPSÉRA</p>
            <h1 id="signup-title">Begin Your<br />Skincare Journey</h1>
            <p className="signup-tagline">Create your CAPSÉRA account and unlock a personalized skincare experience.</p>
            <div className="signup-benefits">
              {benefits.map(({ title, text, icon: Icon }) => (
                <div className="signup-benefit" key={title}>
                  <span className="signup-benefit-icon"><Icon aria-hidden="true" /></span>
                  <span><strong>{title}</strong><small>{text}</small></span>
                </div>
              ))}
            </div>
          </div>
          <section className="signup-card" aria-labelledby="signup-card-title">
            <p className="signup-card-label">CREATE ACCOUNT</p>
            <h2 id="signup-card-title">Join CAPSÉRA</h2>
            <p className="signup-card-intro">Create your account to start your personalized skincare journey.</p>
            <ServiceForm kind="signup" submitLabel="Create Account" />
            <div className="signup-divider"><span>OR</span></div>
            <p className="signup-account-prompt">Already have an account? <Link href="/signin">Sign In</Link></p>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
