import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { skincareKit } from "@/lib/product";

export default function AboutPage() {
  return (
    <main className="commerce-page about-page">
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
          <div className="about-image">
            <Image src="/img/file_000000007a208208ac7752e14e1f80f1.png" alt="Icy blue water-inspired CAPSÉRA brand imagery" width={1024} height={1024} />
          </div>
        </section>
        <section className="about-steps">
          <p className="eyebrow">ONE COMPLETE KIT</p>
          <h2>Seven steps in {skincareKit.name}</h2>
          <ol className="kit-steps">
            {skincareKit.steps.map((step) => <li key={step.number}><span>{step.number}</span><strong>{step.name}</strong><span>{step.product}</span></li>)}
          </ol>
          <p>Product formulations, ingredients, certifications, and clinical evidence have not been provided. Please refer to verified product packaging for formula and use details.</p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
