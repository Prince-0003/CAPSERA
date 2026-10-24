import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { QuizResults } from "@/components/quiz-results";

export default function QuizResultsPage() {
  return (
    <main className="commerce-page quiz-results-page">
      <SiteHeader />
      <div className="commerce-content quiz-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/quiz">Skin Quiz</Link>
          <span aria-hidden="true">›</span><span aria-current="page">Your Results</span>
        </nav>
        <QuizResults />
      </div>
      <SiteFooter />
    </main>
  );
}
