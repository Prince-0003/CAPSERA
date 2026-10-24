"use client";

import { useState } from "react";

export type QuizAnswers = {
  skinType: string;
  concerns: string[];
  routinePreference: string;
  routineTime: string;
};

const skinTypes = ["Normal", "Oily", "Dry", "Combination", "Sensitive"];
const concerns = ["Hydration", "Oiliness", "Uneven texture", "Breakouts", "Dull-looking skin"];
const STORAGE_KEY = "capsera-skin-quiz";

const initialAnswers: QuizAnswers = {
  skinType: "",
  concerns: [],
  routinePreference: "",
  routineTime: "",
};

export function QuizFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [error, setError] = useState("");

  function nextStep() {
    if (step === 0 && !answers.skinType) {
      setError("Select a skin type to continue.");
      return;
    }
    if (step === 1 && answers.concerns.length === 0) {
      setError("Select at least one skin concern to continue.");
      return;
    }
    setError("");
    setStep(step + 1);
  }

  function finishQuiz() {
    if (!answers.routinePreference || !answers.routineTime) {
      setError("Choose a routine style and a time of day to continue.");
      return;
    }
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      window.location.assign("/quiz/results");
    } catch {
      setError("Your browser could not save these answers. Please enable session storage and try again.");
    }
  }

  function toggleConcern(concern: string) {
    setAnswers((current) => ({
      ...current,
      concerns: current.concerns.includes(concern)
        ? current.concerns.filter((item) => item !== concern)
        : [...current.concerns, concern],
    }));
    setError("");
  }

  return (
    <section className="quiz-card" aria-labelledby="quiz-title">
      <div className="quiz-progress">
        <span>STEP {step + 1} OF 3</span>
        <progress value={step + 1} max={3} aria-label={`Step ${step + 1} of 3`} />
      </div>
      <h1 id="quiz-title">A ritual that feels like yours</h1>
      <p className="quiz-intro">A few simple preferences help us tailor routine guidance. This quiz is not medical advice.</p>

      {step === 0 && (
        <fieldset className="quiz-options">
          <legend>How would you describe your skin?</legend>
          {skinTypes.map((type) => (
            <label className="choice-card" key={type}>
              <input
                type="radio"
                name="skinType"
                value={type}
                checked={answers.skinType === type}
                onChange={() => { setAnswers({ ...answers, skinType: type }); setError(""); }}
              />
              <span>{type}</span>
            </label>
          ))}
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="quiz-options">
          <legend>What would you like your routine to focus on?</legend>
          <p className="form-hint">Choose any that feel relevant.</p>
          {concerns.map((concern) => (
            <label className="choice-card" key={concern}>
              <input
                type="checkbox"
                checked={answers.concerns.includes(concern)}
                onChange={() => toggleConcern(concern)}
              />
              <span>{concern}</span>
            </label>
          ))}
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="quiz-options">
          <legend>What fits your routine?</legend>
          <label className="field-label" htmlFor="routine-preference">Routine style</label>
          <select
            id="routine-preference"
            value={answers.routinePreference}
            onChange={(event) => { setAnswers({ ...answers, routinePreference: event.target.value }); setError(""); }}
            required
          >
            <option value="">Choose a routine style</option>
            <option value="Simple and unhurried">Simple and unhurried</option>
            <option value="A little time for each step">A little time for each step</option>
          </select>
          <label className="field-label" htmlFor="routine-time">When do you prefer your routine?</label>
          <select
            id="routine-time"
            value={answers.routineTime}
            onChange={(event) => { setAnswers({ ...answers, routineTime: event.target.value }); setError(""); }}
            required
          >
            <option value="">Choose a time of day</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Morning and evening">Morning and evening</option>
          </select>
        </fieldset>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="quiz-controls">
        {step > 0 && <button className="button button-outline" type="button" onClick={() => { setError(""); setStep(step - 1); }}>Back</button>}
        {step < 2
          ? <button className="button button-navy" type="button" onClick={nextStep}>Next</button>
          : <button className="button button-gold" type="button" onClick={finishQuiz}>See My Results</button>}
      </div>
    </section>
  );
}

export { STORAGE_KEY as QUIZ_STORAGE_KEY };
