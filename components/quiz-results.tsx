"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/add-to-cart-button";
import { QUIZ_STORAGE_KEY, type QuizAnswers } from "@/components/quiz-flow";
import { skincareKit } from "@/lib/product";

export function QuizResults() {
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(QUIZ_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "skinType" in parsed &&
          "concerns" in parsed &&
          "routinePreference" in parsed &&
          "routineTime" in parsed &&
          typeof parsed.skinType === "string" &&
          Array.isArray(parsed.concerns) &&
          parsed.concerns.every((concern) => typeof concern === "string") &&
          typeof parsed.routinePreference === "string" &&
          typeof parsed.routineTime === "string"
        ) {
          setAnswers(parsed as QuizAnswers);
        }
      }
    } catch (error) {
      console.error("Unable to read the saved quiz answers.", error);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) return <p className="cart-feedback">Loading your results…</p>;
  if (!answers) {
    return (
      <div className="empty-cart">
        <h1>Your results are not available yet.</h1>
        <p>Complete the skin routine quiz to see guidance based on your answers.</p>
        <Link className="button button-navy" href="/quiz">Take the quiz</Link>
      </div>
    );
  }

  return (
    <div className="quiz-result-card">
      <p className="eyebrow">YOUR ROUTINE NOTES</p>
      <h1>A complete ritual for your preferences</h1>
      <dl className="answers-summary">
        <div><dt>Skin type</dt><dd>{answers.skinType}</dd></div>
        <div><dt>Focus</dt><dd>{answers.concerns.join(", ")}</dd></div>
        <div><dt>Routine style</dt><dd>{answers.routinePreference}</dd></div>
        <div><dt>Preferred time</dt><dd>{answers.routineTime}</dd></div>
      </dl>
      <p className="quiz-result-note">These preferences can help you plan your routine; they are not a diagnosis or a promise of a particular result.</p>
      <section className="routine-guidance" aria-labelledby="routine-guidance-title">
        <h2 id="routine-guidance-title">Routine guidance for your answers</h2>
        <p>
          You chose a {answers.routinePreference.toLowerCase()} routine for {answers.routineTime.toLowerCase()}.
          Follow the final directions on each product package when planning the steps.
        </p>
        <p>
          For the focus areas you selected ({answers.concerns.join(", ")}), check the final ingredient list and
          product directions to decide whether each product fits your preferences.
        </p>
        <p>
          Your selected skin type ({answers.skinType}) is recorded as a preference only; this quiz cannot confirm
          product suitability or provide medical advice.
        </p>
      </section>
      <h2>Seven steps, together in one kit</h2>
      <ol className="kit-steps">
        {skincareKit.steps.map((step) => <li key={step.number}><span>{step.number}</span><strong>{step.name}</strong><span>{step.product}</span></li>)}
      </ol>
      <div className="quiz-controls">
        <Link className="button button-outline" href="/quiz">Retake Quiz</Link>
        <AddToCartButton />
      </div>
    </div>
  );
}
