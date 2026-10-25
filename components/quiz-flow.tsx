"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { brandFontClassName } from "@/lib/brand-fonts";
import {
  clearSavedQuiz,
  emptyQuizAnswers,
  isQuestionAnswered,
  isQuizComplete,
  parseQuizAnswers,
  QUIZ_PROGRESS_KEY,
  QUIZ_STORAGE_KEY,
  quizQuestions,
  type ConcernAnswer,
  type QuizAnswers,
} from "@/lib/skin-quiz";

const totalSteps = quizQuestions.length;

function readProgress(): { step: number; answers: QuizAnswers } | null {
  try {
    const stored = window.sessionStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || !("step" in parsed) || !("answers" in parsed)) return null;
    const answers = parseQuizAnswers(parsed.answers);
    const step = Number(parsed.step);
    if (!answers || !Number.isInteger(step) || step < 0 || step >= totalSteps) return null;
    return { step, answers };
  } catch {
    return null;
  }
}

export function QuizFlow() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(emptyQuizAnswers);
  const [error, setError] = useState("");
  // Saved progress is read after mount so the server and first client render match.
  const [ready, setReady] = useState(false);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const movedByUser = useRef(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("retake")) {
      // "Retake Quiz" from the results page: a brand-new attempt on Question 1 with nothing selected.
      clearSavedQuiz();
      window.history.replaceState(window.history.state, "", window.location.pathname);
      movedByUser.current = true;
      setStarted(true);
    } else {
      // Resume an unfinished attempt (e.g. after a refresh). Finished attempts are not saved here, so they never reappear.
      const progress = readProgress();
      if (progress) {
        setStarted(true);
        setStep(progress.step);
        setAnswers(progress.answers);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !started) return;
    try {
      window.sessionStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify({ step, answers }));
    } catch {
      // Progress saving is a convenience; the quiz still works without it.
    }
  }, [ready, started, step, answers]);

  // Move focus to the new question after Start / Continue / Back so keyboard and screen reader users follow along.
  useEffect(() => {
    // Wait until the question is actually on screen (after a Retake the first render is still the loading state).
    if (!movedByUser.current || !questionHeadingRef.current) return;
    movedByUser.current = false;
    questionHeadingRef.current.focus();
  }, [ready, started, step]);

  const question = quizQuestions[step];
  const isLastStep = step === totalSteps - 1;
  const answered = isQuestionAnswered(question, answers);

  function goTo(nextStep: number) {
    movedByUser.current = true;
    setError("");
    setStep(nextStep);
  }

  function startQuiz() {
    // A new attempt: forget earlier answers and results so the next results come from this attempt only.
    clearSavedQuiz();
    movedByUser.current = true;
    setStep(0);
    setAnswers(emptyQuizAnswers);
    setError("");
    setStarted(true);
  }

  function finishQuiz() {
    if (!isQuizComplete(answers)) {
      const firstMissing = quizQuestions.findIndex((item) => !isQuestionAnswered(item, answers));
      goTo(firstMissing === -1 ? step : firstMissing);
      setError("Select an answer to continue.");
      return;
    }
    try {
      window.sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(answers));
      // The attempt is finished: drop its in-progress copy so a later visit to /quiz starts fresh, not on Question 6.
      window.sessionStorage.removeItem(QUIZ_PROGRESS_KEY);
      window.location.assign("/quiz/results");
    } catch {
      setError("Your browser could not save these answers. Please enable session storage and try again.");
    }
  }

  function selectSingle(id: Exclude<keyof QuizAnswers, "concerns">, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setError("");
  }

  function toggleConcern(concern: ConcernAnswer) {
    setAnswers((current) => ({
      ...current,
      concerns: current.concerns.includes(concern)
        ? current.concerns.filter((item) => item !== concern)
        : [...current.concerns, concern],
    }));
    setError("");
  }

  if (!ready) return <div className={`ritual-quiz ${brandFontClassName}`}><p className="ritual-quiz-loading">Loading the quiz…</p></div>;

  if (!started) {
    return (
      <div className={`ritual-quiz ${brandFontClassName}`}>
        <section className="ritual-quiz-intro" aria-labelledby="quiz-title">
          <p className="ritual-quiz-eyebrow">YOUR SKIN, UNDERSTOOD</p>
          <h1 id="quiz-title">Discover Your Skin Ritual</h1>
          <p className="ritual-quiz-lead">Answer six simple questions to discover a skincare routine tailored to your skin and concerns.</p>
          <button className="ritual-quiz-button ritual-quiz-button-primary" type="button" onClick={startQuiz}>
            Start My Skin Quiz <ArrowRight size={17} aria-hidden="true" />
          </button>
          <p className="ritual-quiz-support">A personalized skincare experience in just a few steps.</p>
          <p className="ritual-quiz-fineprint">General skincare guidance only, not medical advice.</p>
        </section>
      </div>
    );
  }

  const percent = Math.round(((step + 1) / totalSteps) * 100);
  const hintId = `${question.id}-hint`;

  return (
    <div className={`ritual-quiz ${brandFontClassName}`}>
      <section className="ritual-quiz-card" aria-labelledby="quiz-question">
        <h1 className="visually-hidden">Discover Your Skin Ritual</h1>
        <div className="ritual-quiz-progress">
          <p className="ritual-quiz-counter">
            <span>Question {step + 1} of {totalSteps}</span>
            <span aria-hidden="true">{percent}%</span>
          </p>
          <div
            className="ritual-quiz-track"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuenow={step + 1}
            aria-valuetext={`Question ${step + 1} of ${totalSteps}`}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>

        <fieldset className="ritual-quiz-question" key={question.id} aria-labelledby="quiz-question" aria-describedby={hintId}>
          <h2 id="quiz-question" ref={questionHeadingRef} tabIndex={-1}>{question.prompt}</h2>
          <p className="ritual-quiz-hint" id={hintId}>
            {question.kind === "multiple" ? "Choose all that apply. Select again to remove a choice." : "Choose one answer."}
          </p>
          <div className="ritual-quiz-options">
            {question.kind === "multiple"
              ? question.options.map((option) => (
                  <label className="ritual-option ritual-option-multi" key={option.value}>
                    <input
                      type="checkbox"
                      name={question.id}
                      value={option.value}
                      checked={answers.concerns.includes(option.value)}
                      onChange={() => toggleConcern(option.value)}
                    />
                    <span className="ritual-option-mark" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                    <span className="ritual-option-label">{option.label}</span>
                  </label>
                ))
              : question.options.map((option) => (
                  <label className="ritual-option" key={option.value}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={() => selectSingle(question.id, option.value)}
                    />
                    <span className="ritual-option-mark" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                    <span className="ritual-option-label">{option.label}</span>
                  </label>
                ))}
          </div>
        </fieldset>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="ritual-quiz-controls">
          {step > 0 ? (
            <button className="ritual-quiz-button ritual-quiz-button-ghost" type="button" onClick={() => goTo(step - 1)}>
              <ArrowLeft size={17} aria-hidden="true" /> <span className="ritual-quiz-back-label">Back</span>
            </button>
          ) : <span className="ritual-quiz-controls-spacer" aria-hidden="true" />}
          {!isLastStep ? (
            <button className="ritual-quiz-button ritual-quiz-button-primary" type="button" onClick={() => goTo(step + 1)} disabled={!answered}>
              Continue <ArrowRight size={17} aria-hidden="true" />
            </button>
          ) : (
            <button className="ritual-quiz-button ritual-quiz-button-gold" type="button" onClick={finishQuiz} disabled={!answered}>
              See My Results <ArrowRight size={17} aria-hidden="true" />
            </button>
          )}
        </div>
        {/* Always rendered (space reserved) so the card doesn't jump when the hint disappears; also a stable live region. */}
        <p className="ritual-quiz-status" aria-live="polite">{answered ? "" : "Select an answer to continue."}</p>
      </section>
    </div>
  );
}
