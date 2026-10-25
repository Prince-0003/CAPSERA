"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type AnimationEvent } from "react";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  Headset,
  Sparkles,
} from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { brandFontClassName } from "@/lib/brand-fonts";
import { skincareKit } from "@/lib/product";

const steps = skincareKit.steps;

const skinTypes = ["Normal", "Oily", "Dry", "Combination", "Sensitive"];

// Reveals a section once, only after the user scrolls and it enters the viewport.
// Starts "pending" on the server too, so the section never flashes in before the reveal.
// rootMargin can shrink the trigger zone so a section reveals only once it is well into view.
function useScrollReveal(rootMargin = "0px") {
  const ref = useRef<HTMLElement>(null);
  const [reveal, setReveal] = useState<"pending" | "visible">("pending");

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      setReveal("visible");
      return;
    }

    let isInView = false;
    // A restored scroll position (reload / back navigation) counts as having scrolled.
    let hasScrolled = window.scrollY > 0;

    const tryReveal = () => {
      if (!isInView || !hasScrolled) return;
      setReveal("visible");
      cleanup();
    };
    const onScroll = () => {
      hasScrolled = true;
      tryReveal();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        tryReveal();
      },
      { threshold: 0.2, rootMargin },
    );
    const cleanup = () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(section);
    return cleanup;
  }, [rootMargin]);

  return [ref, reveal] as const;
}

const HOME_SCROLL_KEY = "capsera:home-scroll";
// Module-level so client-side navigation back to "/" (a remount, not a new document) is left alone.
let initialScrollHandled = false;

// On a full reload, start at the top of the hero instead of the browser's restored position.
// Restoration is switched to "manual" only while the page unloads, then handed back to the browser,
// so Next.js client navigation and back/forward keep their normal behaviour.
function useResetScrollOnReload() {
  useEffect(() => {
    if (!initialScrollHandled) {
      initialScrollHandled = true;
      const [navigation] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      if (navigation?.type === "reload") {
        window.scrollTo(0, 0);
      } else if (navigation?.type === "back_forward") {
        let saved: string | null = null;
        try {
          saved = sessionStorage.getItem(HOME_SCROLL_KEY);
        } catch {}
        if (saved) window.scrollTo(0, Number(saved));
      }
    }
    history.scrollRestoration = "auto";

    const onPageHide = () => {
      try {
        sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY));
      } catch {}
      history.scrollRestoration = "manual";
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);
}

// Adds .is-entered once this card's own entrance animation has finished (the card's only animation), so the hover
// lift in globals.css can never overlap the staggered slide-in. Hovering never restarts the entrance animation.
function StepCard({ step }: { step: (typeof steps)[number] }) {
  const [entered, setEntered] = useState(false);
  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) setEntered(true);
  };

  return (
    <article className={`step-card card-${step.tone}${entered ? " is-entered" : ""}`} onAnimationEnd={handleAnimationEnd}>
      <Image
        className="step-image"
        src={step.image}
        alt={`${step.name} capsule`}
        width={120}
        height={120}
      />
      <p className="step-number">{step.number}</p>
      <h3>{step.name}</h3>
      <p className="product-name">{step.product}</p>
    </article>
  );
}

export default function Home() {
  useResetScrollOnReload();
  const [personalizeRef, personalizeReveal] = useScrollReveal();
  // Ignore the bottom 15% of the viewport so the ritual doesn't fire while it only peeks in below Customize.
  const [stepsRef, stepsReveal] = useScrollReveal("0px 0px -15% 0px");

  return (
    <main>
      <SiteHeader />

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">SKINCARE × SCIENCE × YOU</p>
          <h1>SKINCARE<br />IN A <span>CAPSULE</span></h1>
          <p className="hero-description">
            A complete 7-step skincare routine in single-use capsules — designed for your skin, your lifestyle, and your everyday glow.
          </p>
          <a className="button button-gold" href="#steps">Explore skincare <ArrowRight size={17} /></a>
        </div>
        <div className="hero-art" aria-label="CAPSÉRA seven-step skincare capsules">
          <Image
            className="hero-product-image"
            src="/assets/capsera-7-step-capsules.png"
            alt="CAPSÉRA seven-step skincare capsule product"
            width={1024}
            height={1536}
          />
        </div>
      </section>

      <section ref={personalizeRef} className={`personalize ${brandFontClassName}`} id="personalize" data-reveal={personalizeReveal}>
        <noscript>
          <style>{".personalize .personalize-copy *, .personalize .skin-type, .personalize .quiz-action { opacity: 1 !important; }"}</style>
        </noscript>
        <div className="personalize-inner">
          <div className="personalize-copy">
            <p className="eyebrow">PERSONALISED FOR YOU</p>
            <h2>Customize Your Skincare Kit<br />as <span>Your Skin Type</span></h2>
            <p>Share your skin type, concerns, and routine preferences to receive practical guidance for your seven-step kit.</p>
          </div>
          <div className="skin-quiz" id="skin-quiz">
            {skinTypes.map((type) => (
              <div key={type} className="skin-type">
                {type === "Normal" && (
                  <Image
                    className="skin-type-image"
                    src="/img/normal-skin-droplet.png"
                    alt=""
                    width={768}
                    height={1069}
                  />
                )}
                {type === "Dry" && (
                  <Image
                    className="skin-type-image"
                    src="/img/dry-skin-droplet.png"
                    alt=""
                    width={768}
                    height={979}
                  />
                )}
                {type === "Oily" && (
                  <Image
                    className="skin-type-image"
                    src="/img/oily-skin-droplet.png"
                    alt=""
                    width={768}
                    height={1012}
                  />
                )}
                {type === "Combination" && (
                  <Image
                    className="skin-type-image"
                    src="/img/combination-skin-droplet.png"
                    alt=""
                    width={768}
                    height={971}
                  />
                )}
                {type === "Sensitive" && (
                  <Image
                    className="skin-type-image"
                    src="/img/sensitive-skin-droplet.png"
                    alt=""
                    width={768}
                    height={1003}
                  />
                )}
                <span>{type}<br />Skin</span>
              </div>
            ))}
            <a className="button button-navy quiz-action" href="/quiz">Personalize my routine <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      <section ref={stepsRef} className={`steps-section section-pad ${brandFontClassName}`} id="steps" data-reveal={stepsReveal}>
        <noscript>
          <style>{".steps-section .section-heading *, .steps-section .step-card { opacity: 1 !important; }"}</style>
        </noscript>
        <div className="section-heading">
          <p className="eyebrow">THE 7-STEP RITUAL</p>
          <h2>Simple Steps. <span>Radiant Skin.</span></h2>
        </div>
        <div className="steps-grid">
          {steps.map((step) => <StepCard step={step} key={step.number} />)}
        </div>
      </section>

      <section className={`how-to ${brandFontClassName}`} id="how-to-use">
        <div className="how-inner">
          <div className="how-copy">
            <p className="eyebrow">YOUR DAILY RITUAL</p>
            <h2>How to Use</h2>
            <p>A simple 7-step ritual.</p>
            <span className="gold-line" />
          </div>
          <div className="how-steps">
            <div className="how-step"><div className="how-number">01</div><Image className="how-step-image" src="/img/how-to-twist-black-pod.png" alt="Hand holding a glossy black skincare capsule" width={837} height={768} /><h3>Twist</h3><p>Open the capsule</p></div>
            <ArrowRight className="how-arrow" />
            <div className="how-step"><div className="how-number">02</div><Image className="how-step-image apply-step-image" src="/img/Glowing Skincare Beauty Portrait.png" alt="Glowing skin after applying skincare" width={1280} height={1280} /><h3>Apply</h3><p>Use on clean skin</p></div>
            <ArrowRight className="how-arrow" />
            <div className="how-step"><div className="how-number">03</div><Image className="how-step-image" src="/img/Golden Serum Drop in Cupped Hand.png" alt="Golden serum in a cupped hand" width={1340} height={768} /><h3>Follow</h3><p>Use in the recommended order</p></div>
            <ArrowRight className="how-arrow" />
            <div className="how-step"><div className="how-number">04</div><Image className="how-step-image" src="/img/Luminous Profile Skincare Portrait.png" alt="Luminous skin after following a skincare routine" width={1280} height={1280} /><h3>Glow</h3><p>Keep to a consistent routine</p></div>
          </div>
        </div>
      </section>

      <section className="service-bar" id="about">
        <div><Package /><p><b>ONE COMPLETE KIT</b><span>Seven steps together</span></p></div>
        <div><Sparkles /><p><b>THOUGHTFUL ROUTINE</b><span>Made for everyday use</span></p></div>
        <div><ShieldCheck /><p><b>CHECKOUT SETUP</b><span>Payment options coming soon</span></p></div>
        <a className="service-contact-link" href="/contact"><Headset /><p><b>QUESTIONS?</b><span>Visit our contact page</span></p></a>
      </section>

      <SiteFooter />
      <p className="disclaimer">Product descriptions are concept copy. Final formulas, usage directions, and claims should be confirmed before launch.</p>
    </main>
  );
}
