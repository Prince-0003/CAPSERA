"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, ShieldAlert } from "lucide-react";
import AddToCartButton from "@/components/add-to-cart-button";
import { skincareKit } from "@/lib/product";
import { brandFontClassName } from "@/lib/brand-fonts";
import {
  analyzeSkinQuiz,
  clearSavedQuiz,
  confidenceLabels,
  isQuizComplete,
  labelFor,
  parseQuizAnswers,
  QUIZ_RETAKE_PATH,
  QUIZ_STORAGE_KEY,
  sensitivityLabels,
  skinTypeLabel,
  type CompletedQuizAnswers,
  type Confidence,
  type StepRelevance,
} from "@/lib/skin-quiz";

const relevanceLabels: Record<StepRelevance, string> = {
  focus: "Focus for you",
  foundation: "Daily foundation",
  supporting: "Also in your kit",
};
const confidenceLevel: Record<Confidence, number> = { low: 1, medium: 2, high: 3 };

export function QuizResults() {
  const [answers, setAnswers] = useState<CompletedQuizAnswers | null>(null);
  const [ready, setReady] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const routineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(QUIZ_STORAGE_KEY);
      if (stored) {
        const parsed = parseQuizAnswers(JSON.parse(stored), { requireComplete: true });
        if (parsed && isQuizComplete(parsed)) setAnswers(parsed);
      }
    } catch (error) {
      console.error("Unable to read the saved quiz answers.", error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!showRoutine) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    routineRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [showRoutine]);

  const analysis = useMemo(() => (answers ? analyzeSkinQuiz(answers) : null), [answers]);

  function retakeQuiz() {
    // Clear this attempt and open the quiz on Question 1 (a full page load, so no state carries over).
    clearSavedQuiz();
    window.location.assign(QUIZ_RETAKE_PATH);
  }

  if (!ready) return <div className={`ritual-quiz ${brandFontClassName}`}><p className="ritual-quiz-loading">Loading your results…</p></div>;
  if (!analysis) {
    return (
      <div className={`ritual-quiz ${brandFontClassName}`}>
        <section className="ritual-quiz-intro">
          <p className="ritual-quiz-eyebrow">YOUR PERSONALIZED SKIN RITUAL</p>
          <h1>Your results are not available yet.</h1>
          <p className="ritual-quiz-lead">Complete the six-question skin quiz to see guidance based on your answers.</p>
          <Link className="ritual-quiz-button ritual-quiz-button-primary" href="/quiz">Take the quiz <ArrowRight size={17} aria-hidden="true" /></Link>
        </section>
      </div>
    );
  }

  const keySteps = analysis.steps.filter((step) => step.relevance !== "supporting");
  const otherSteps = analysis.steps.filter((step) => step.relevance === "supporting");
  const primaryConcern = labelFor("concerns", analysis.primaryConcern);
  const headline = analysis.skinType
    ? `${skinTypeLabel(analysis)} skin, focused on ${primaryConcern.toLowerCase()}`
    : `A ritual focused on ${primaryConcern.toLowerCase()}`;

  return (
    <div className={`ritual-quiz ritual-results ${brandFontClassName}`}>
      <section className="ritual-results-header" aria-labelledby="results-title">
        <p className="ritual-quiz-eyebrow">YOUR PERSONALIZED SKIN RITUAL</p>
        <h1 id="results-title">{headline}</h1>
        <p className="ritual-quiz-lead">{analysis.summary}</p>
      </section>

      <dl className="ritual-results-stats">
        <div>
          <dt>Likely skin type</dt>
          <dd>{skinTypeLabel(analysis)}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>
            <span className="ritual-confidence" aria-hidden="true">
              {[1, 2, 3].map((level) => <i key={level} className={level <= confidenceLevel[analysis.confidence] ? "on" : undefined} />)}
            </span>
            {confidenceLabels[analysis.confidence]}
          </dd>
        </div>
        <div>
          <dt>Primary concern</dt>
          <dd>{primaryConcern}</dd>
        </div>
        <div>
          <dt>Other concerns</dt>
          <dd>{analysis.secondaryConcerns.length ? analysis.secondaryConcerns.map((concern) => labelFor("concerns", concern)).join(", ") : "None selected"}</dd>
        </div>
        <div>
          <dt>Breakouts</dt>
          <dd>{labelFor("breakouts", analysis.breakoutFrequency)}</dd>
        </div>
        <div>
          <dt>Sensitivity</dt>
          <dd>{sensitivityLabels[analysis.sensitivity]}</dd>
        </div>
      </dl>

      <div className="ritual-results-panels">
        <section className="ritual-panel" aria-labelledby="analysis-why-title">
          <h2 id="analysis-why-title">Why these results</h2>
          <p>{analysis.skinTypeExplanation}</p>
          {analysis.sensitivitySignals.length > 0 && <p>Sensitivity: {analysis.sensitivitySignals.join("; ")}.</p>}
          {analysis.notes.map((note) => <p key={note}>{note}</p>)}
        </section>
        {analysis.cautions.length > 0 && (
          <section className="ritual-panel ritual-panel-caution" aria-labelledby="analysis-cautions-title">
            <h2 id="analysis-cautions-title"><ShieldAlert size={18} aria-hidden="true" /> Before you start</h2>
            <ul>{analysis.cautions.map((caution) => <li key={caution}>{caution}</li>)}</ul>
          </section>
        )}
      </div>

      <section className="ritual-results-steps" aria-labelledby="steps-title">
        <h2 id="steps-title">Your most relevant steps</h2>
        <p className="ritual-results-subtitle">All seven steps come together in one {skincareKit.name}; the capsules aren&apos;t sold separately.</p>
        <ol className="ritual-step-grid">
          {keySteps.map((step) => (
            <li key={step.number} className={`ritual-step ritual-step-${step.relevance}`}>
              <p className="ritual-step-top"><span>{step.number}</span><em>{relevanceLabels[step.relevance]}</em></p>
              <h3>{step.name}</h3>
              <p className="ritual-step-product">{step.product}</p>
              <p>{step.reasons[0]}</p>
            </li>
          ))}
        </ol>
        {otherSteps.length > 0 && (
          <p className="ritual-results-other">
            Also in your kit: {otherSteps.map((step) => `${step.name} (${step.product})`).join(", ")}.
          </p>
        )}
      </section>

      {showRoutine && (
        <section className="ritual-routine" id="routine-details" ref={routineRef} aria-labelledby="routine-details-title">
          <h2 id="routine-details-title">Your routine, step by step</h2>
          <ol>
            {analysis.steps.map((step) => (
              <li key={step.number} className={`ritual-routine-step ritual-routine-step-${step.relevance}`}>
                <p className="ritual-routine-heading">
                  <span>{step.number}</span>
                  <strong>{step.name} · {step.product}</strong>
                  <em>{relevanceLabels[step.relevance]}</em>
                </p>
                {step.reasons.map((reason) => <p key={reason}>{reason}</p>)}
                {step.verificationNote && <p className="ritual-routine-verify">Needs verification: {step.verificationNote}</p>}
              </li>
            ))}
          </ol>
          <h3>Morning and evening</h3>
          {analysis.schedule && (
            <dl className="ritual-routine-schedule">
              <div><dt>Morning</dt><dd>{analysis.schedule.morning.join(" → ")}</dd></div>
              <div><dt>Evening</dt><dd>{analysis.schedule.evening.join(" → ")}</dd></div>
            </dl>
          )}
          <p>{analysis.scheduleNote}</p>
        </section>
      )}

      <div className="ritual-results-actions">
        <Link className="ritual-quiz-button ritual-quiz-button-gold" href={skincareKit.href}>
          Shop the Complete Kit <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <button
          className="ritual-quiz-button ritual-quiz-button-primary"
          type="button"
          aria-expanded={showRoutine}
          aria-controls="routine-details"
          onClick={() => setShowRoutine((current) => !current)}
        >
          {showRoutine ? "Hide My Routine" : "Explore My Routine"}
        </button>
        <button className="ritual-quiz-button ritual-quiz-button-ghost" type="button" onClick={retakeQuiz}>
          <RotateCcw size={16} aria-hidden="true" /> Retake Quiz
        </button>
        <AddToCartButton />
      </div>

      <p className="ritual-results-disclaimer">
        This is general skincare guidance based only on your answers. It is not a medical diagnosis and can&apos;t
        confirm whether a product suits your skin. Product ingredients and directions haven&apos;t been verified yet,
        so check the final packaging before use. For persistent or painful skin concerns, consult a dermatologist.
      </p>
    </div>
  );
}
