"use client";

import Image from "next/image";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  Headset,
  Sparkles,
} from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { skincareKit } from "@/lib/product";

const steps = skincareKit.steps;

const skinTypes = ["Normal", "Oily", "Dry", "Combination", "Sensitive"];

export default function Home() {
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

      <section className="personalize section-pad" id="personalize">
        <div className="personalize-inner">
          <div className="personalize-copy">
            <p className="eyebrow">PERSONALISED FOR YOU</p>
            <h2>Customize Your Skincare Kit<br />as <span>Your Skin Type</span></h2>
            <p>Share your skin type, concerns, and routine preferences to receive practical guidance for your seven-step kit.</p>
            <a className="button button-navy" href="/quiz">Take the quiz <ArrowRight size={17} /></a>
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

      <section className="steps-section section-pad" id="steps">
        <div className="section-heading">
          <p className="eyebrow">THE 7-STEP RITUAL</p>
          <h2>Simple Steps. <span>Radiant Skin.</span></h2>
        </div>
        <div className="steps-grid">
          {steps.map((step) => {
            const customStepImage =
              step.number === "01"
                ? "/img/Picsart_26-10-22_22-30-17-375.png"
                : step.number === "02"
                  ? "/img/Picsart_26-10-21_13-15-44-421.png"
                  : step.number === "03"
                    ? "/img/Picsart_26-10-21_13-16-41-134.png"
                    : step.number === "04"
                      ? "/img/champagne_gold_capsule_tightly_cropped.png"
                      : step.number === "05"
                        ? "/img/Picsart_26-10-21_13-18-05-932.png"
                        : step.number === "06"
                          ? "/img/Picsart_26-10-22_22-31-29-486.png"
                          : step.number === "07"
                            ? "/img/Picsart_26-10-22_22-32-30-459.png"
                            : null;

            return (
              <article className={`step-card card-${step.tone}`} key={step.number}>
                {customStepImage ? (
                  <Image
                    className="step-image"
                    src={customStepImage}
                    alt={`${step.name} capsule`}
                    width={120}
                    height={120}
                  />
                ) : (
                  <div className={`capsule-large capsule-${step.tone}`} aria-hidden="true" />
                )}
                <p className="step-number">{step.number}</p>
                <h3>{step.name}</h3>
                <p className="product-name">{step.product}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="how-to section-pad" id="how-to-use">
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
            <div className="how-step"><div className="how-number">02</div><div className="how-icon">✧</div><h3>Apply</h3><p>Use on clean skin</p></div>
            <ArrowRight className="how-arrow" />
            <div className="how-step"><div className="how-number">03</div><div className="how-icon">◌</div><h3>Follow</h3><p>Use in the recommended order</p></div>
            <ArrowRight className="how-arrow" />
            <div className="how-step"><div className="how-number">04</div><div className="how-icon">✦</div><h3>Glow</h3><p>Keep to a consistent routine</p></div>
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
