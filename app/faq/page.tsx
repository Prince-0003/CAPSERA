import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

const faqs = [
  { question: "What is included in the CAPSÉRA kit?", answer: "One complete kit with all seven steps: Face Wash, Hydrating Serum, Pimple Serum, Vitamin C Serum, Repair Serum, Moisturiser, and Sunscreen." },
  { question: "Can I buy capsules individually?", answer: "No. The seven capsules are offered together as one complete skincare kit." },
  { question: "How should I use the routine?", answer: "Follow the seven-step order shown on the product packaging. Specific product directions have not been provided, so use verified packaging instructions." },
  { question: "Which skin types is the kit for?", answer: "The kit contents are listed above. Suitability for individual skin types has not been verified; review the final ingredient lists and ask a qualified professional if you have concerns." },
  { question: "What are the shipping and delivery policies?", answer: "Shipping regions, prices, and delivery estimates have not been configured." },
  { question: "What is the returns policy?", answer: "A returns policy has not been provided. Please configure and publish the policy before accepting orders." },
  { question: "Which payment methods do you accept?", answer: "Online payment is not configured yet, and no payment methods are currently available." },
  { question: "How do I create or access an account?", answer: "Create an account on the Sign Up page, then sign in any time to see your profile. Order history isn't available yet because online checkout hasn't launched." },
];

export default function FaqPage() {
  return (
    <main className="commerce-page faq-page">
      <SiteHeader />
      <div className="commerce-content faq-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">FAQ</span>
        </nav>
        <section className="form-page-card">
          <p className="eyebrow">A FEW HELPFUL DETAILS</p>
          <h1 className="commerce-heading">Frequently Asked Questions</h1>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
