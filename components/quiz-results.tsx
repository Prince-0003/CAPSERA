"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, ShieldAlert } from "lucide-react";
import AddToCartButton from "@/components/add-to-cart-button";
import { getProduct, skincareKit } from "@/lib/product";
import { brandFontClassName } from "@/lib/brand-fonts";
import { parseCompletedAnswers, recommendProducts, submitQuizResults, UUID_PATTERN, type QuizSaveState } from "@/lib/quiz-record";
import {
  analyzeSkinQuiz,
  clearSavedQuiz,
  confidenceLabels,
  labelFor,
  QUIZ_RETAKE_PATH,
  QUIZ_SAVE_STATE_KEY,
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
const SAVE_AFTER_SIGN_IN = "/quiz/results?save=1";

type LoadProblem = "signed-out" | "not-found" | "error" | null;

function readSaveState(): QuizSaveState | null {
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(QUIZ_SAVE_STATE_KEY) ?? "null");
    if (typeof value !== "object" || value === null) return null;
    const state = value as Record<string, unknown>;
    if (state.saved === true && typeof state.id === "string" && typeof state.createdAt === "string") return { saved: true, id: state.id, createdAt: state.createdAt };
    if (state.saved === false) return { saved: false, reason: state.reason === "signed-out" ? "signed-out" : "error" };
  } catch {
    // Unreadable state: treated as "not saved yet".
  }
  return null;
}

function rememberSaveState(state: QuizSaveState) {
  try {
    window.sessionStorage.setItem(QUIZ_SAVE_STATE_KEY, JSON.stringify(state));
  } catch {
    // Only affects the notice after a refresh.
  }
}

/** A saved result of the signed-in customer (by id, or the latest), loaded through /api/quiz/results. */
async function loadSavedResult(id: string | null): Promise<{ answers: CompletedQuizAnswers; id: string; createdAt: string } | LoadProblem> {
  const response = await fetch(id ? `/api/quiz/results?id=${encodeURIComponent(id)}` : "/api/quiz/results", { cache: "no-store" });
  if (response.status === 401) return "signed-out";
  if (response.status === 404 || response.status === 400) return "not-found";
  if (!response.ok) return "error";
  const result: Record<string, unknown> = await response.json().catch(() => ({}));
  const answers = parseCompletedAnswers(result.answers);
  return answers && typeof result.id === "string" && typeof result.createdAt === "string"
    ? { answers, id: result.id, createdAt: result.createdAt }
    : "error";
}

const formatDate = (iso: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export function QuizResults() {
  const [answers, setAnswers] = useState<CompletedQuizAnswers | null>(null);
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState<LoadProblem>(null);
  const [saveState, setSaveState] = useState<QuizSaveState | null>(null);
  const [saving, setSaving] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const routineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      try {
        // 1. A saved result opened from the account page (?id=…).
        if (id !== null) {
          const saved = UUID_PATTERN.test(id) ? await loadSavedResult(id) : "not-found";
          if (cancelled) return;
          if (typeof saved === "object" && saved) {
            setAnswers(saved.answers);
            setSaveState({ saved: true, id: saved.id, createdAt: saved.createdAt });
          } else {
            setProblem(saved);
          }
          return;
        }
        // 2. This tab's latest attempt.
        const stored = window.sessionStorage.getItem(QUIZ_STORAGE_KEY);
        const current = stored ? parseCompletedAnswers(JSON.parse(stored)) : null;
        if (current) {
          setAnswers(current);
          let state = readSaveState();
          // Back from "Sign in to save": save this attempt to the account now.
          if (params.has("save") && !state?.saved) {
            window.history.replaceState(window.history.state, "", window.location.pathname);
            setSaving(true);
            const outcome = await submitQuizResults(current);
            if (cancelled) return;
            setSaving(false);
            if (!("invalid" in outcome)) {
              state = outcome;
              rememberSaveState(outcome);
            }
          }
          setSaveState(state);
          return;
        }
        // 3. Nothing in this tab (new tab, other device): a signed-in customer sees their latest saved result.
        const latest = await loadSavedResult(null);
        if (cancelled) return;
        if (typeof latest === "object" && latest) {
          setAnswers(latest.answers);
          setSaveState({ saved: true, id: latest.id, createdAt: latest.createdAt });
        }
      } catch (error) {
        console.error("Unable to load the quiz results.", error);
        if (!cancelled && id !== null) setProblem("error");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveToAccount() {
    if (!answers || saving) return;
    setSaving(true);
    const outcome = await submitQuizResults(answers);
    setSaving(false);
    if ("invalid" in outcome) {
      setSaveState({ saved: false, reason: "error", message: outcome.invalid });
      return;
    }
    if (!outcome.saved && outcome.reason === "signed-out") {
      // Sign in (or create an account), then come back here and save automatically.
      window.location.assign(`/signin?next=${encodeURIComponent(SAVE_AFTER_SIGN_IN)}`);
      return;
    }
    setSaveState(outcome);
    rememberSaveState(outcome);
  }

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
    const savedLink = problem !== null;
    const heading = problem === "signed-out" ? "Sign in to see this saved result."
      : problem === "not-found" ? "We couldn't find that saved result."
      : problem === "error" ? "Your saved results couldn't be loaded."
      : "Your results are not available yet.";
    const lead = problem === "signed-out" ? "Saved quiz results are private to your account."
      : problem === "error" ? "Please try again in a moment, or take the quiz again."
      : "Complete the six-question skin quiz to see guidance based on your answers.";
    return (
      <div className={`ritual-quiz ${brandFontClassName}`}>
        <section className="ritual-quiz-intro">
          <p className="ritual-quiz-eyebrow">YOUR PERSONALIZED SKIN RITUAL</p>
          <h1>{heading}</h1>
          <p className="ritual-quiz-lead">{lead}</p>
          {problem === "signed-out" ? (
            <Link className="ritual-quiz-button ritual-quiz-button-primary" href={`/signin?next=${encodeURIComponent(`/quiz/results${window.location.search}`)}`}>
              Sign in <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ) : (
            <Link className="ritual-quiz-button ritual-quiz-button-primary" href="/quiz">Take the quiz <ArrowRight size={17} aria-hidden="true" /></Link>
          )}
          {savedLink && <p className="ritual-quiz-support"><Link href="/account#skin-ritual">Back to your account</Link></p>}
        </section>
      </div>
    );
  }

  const [recommendation] = recommendProducts(analysis);
  const recommendedProduct = getProduct(recommendation.productId) ?? skincareKit;
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

      <div className={`ritual-results-save${saveState?.saved ? " is-saved" : ""}`} role="status" aria-live="polite">
        {saving ? (
          <p>Saving these results to your account…</p>
        ) : saveState?.saved ? (
          <p>Saved to your account on {formatDate(saveState.createdAt)}. <Link href="/account#skin-ritual">See your quiz history</Link></p>
        ) : saveState?.reason === "error" ? (
          <p>
            {saveState.message ?? "We couldn't save these results to your account."}{" "}
            <button className="text-button" type="button" onClick={saveToAccount}>Try again</button>
          </p>
        ) : (
          <p>
            These results are kept only in this browser tab.{" "}
            <button className="text-button" type="button" onClick={saveToAccount}>Save them to your account</button>
          </p>
        )}
      </div>

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
        <p className="ritual-results-subtitle">{recommendation.reason}</p>
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
        <Link className="ritual-quiz-button ritual-quiz-button-gold" href={recommendedProduct.href}>
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
