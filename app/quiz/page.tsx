import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { QuizFlow } from "@/components/quiz-flow";

export default function QuizPage() {
  return (
    <main className="commerce-page quiz-page">
      <SiteHeader />
      <div className="commerce-content quiz-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Skin Quiz</span>
        </nav>
        <QuizFlow />
      </div>
      <SiteFooter />
    </main>
  );
}
