import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { brandFontClassName } from "@/lib/brand-fonts";
import { skincareKit } from "@/lib/product";

export default function AboutPage() {
  return (
    <main className={`commerce-page about-page ${brandFontClassName}`}>
      <SiteHeader />
      <div className="commerce-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">About</span>
        </nav>
        <section className="about-story">
          <div>
            <p className="eyebrow">THE IDEA BEHIND CAPSÉRA</p>
            <h1 className="commerce-heading">A thoughtful ritual, one step at a time.</h1>
            <p>CAPSÉRA brings seven familiar skincare steps together in one complete kit. Each capsule represents a step in a simple routine, from cleansing through sun protection.</p>
            <p>Our idea is straightforward: make a multi-step ritual easier to follow, without turning the steps into separate purchases.</p>
            <a className="button button-navy" href="/shop">Discover the kit</a>
          </div>
          {/* The existing water image as a backdrop, with the kit artwork in front so the panel is never an empty gradient. */}
          <div className="about-image">
            <Image className="about-image-backdrop" src="/img/file_000000007a208208ac7752e14e1f80f1.png" alt="" fill sizes="(min-width: 900px) 45vw, 100vw" />
            <Image className="about-image-kit" src={skincareKit.image} alt={skincareKit.imageAlt} width={1024} height={1536} />
          </div>
        </section>
        <section className="about-steps" aria-labelledby="about-steps-title">
          <p className="eyebrow">ONE COMPLETE KIT</p>
          <h2 id="about-steps-title">Seven steps in {skincareKit.name}</h2>
          <ol className="about-step-grid">
            {skincareKit.steps.map((step) => (
              <li key={step.number}>
                <Image src={step.image} alt="" width={120} height={120} />
                <span className="about-step-number">{step.number}</span>
                <strong>{step.name}</strong>
                <span>{step.product}</span>
              </li>
            ))}
          </ol>
          <p className="about-steps-note">Product formulations, ingredients, certifications, and clinical evidence have not been provided. Please refer to verified product packaging for formula and use details.</p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
