import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { skincareKit } from "@/lib/product";
import {
  analyzeSkinQuiz,
  emptyQuizAnswers,
  isQuizComplete,
  parseQuizAnswers,
  quizQuestions,
  skinTypeLabel,
  type CompletedQuizAnswers,
} from "@/lib/skin-quiz";

const base: CompletedQuizAnswers = {
  skinType: "oily",
  afterCleansing: "oily_quickly",
  concerns: ["acne"],
  breakouts: "frequently",
  reaction: "rarely",
  goal: "acne_oil",
};

const allText = (value: unknown) => JSON.stringify(value);

describe("quiz questions", () => {
  it("has the six questions in order, with concerns the only multi-select", () => {
    assert.deepEqual(quizQuestions.map((question) => question.id), ["skinType", "afterCleansing", "concerns", "breakouts", "reaction", "goal"]);
    assert.deepEqual(quizQuestions.filter((question) => question.kind === "multiple").map((question) => question.id), ["concerns"]);
  });

  it("starts empty and incomplete", () => {
    assert.equal(isQuizComplete(emptyQuizAnswers), false);
    assert.equal(isQuizComplete({ ...base, concerns: [] }), false);
    assert.equal(isQuizComplete(base), true);
  });
});

describe("parseQuizAnswers", () => {
  it("accepts valid saved answers and removes duplicate concerns", () => {
    assert.deepEqual(parseQuizAnswers({ ...base, concerns: ["acne", "acne"] }, { requireComplete: true }), base);
  });

  it("accepts partial progress unless complete answers are required", () => {
    const partial = { ...emptyQuizAnswers, skinType: "dry" };
    assert.deepEqual(parseQuizAnswers(partial), partial);
    assert.equal(parseQuizAnswers(partial, { requireComplete: true }), null);
  });

  it("rejects tampered or broken values", () => {
    for (const value of [
      null,
      "text",
      42,
      { ...base, skinType: "alien" },
      { ...base, goal: "cure_everything" },
      { ...base, concerns: "acne" },
      { ...base, concerns: ["acne", "wrinkles"] },
      { ...base, breakouts: 3 },
    ]) {
      assert.equal(parseQuizAnswers(value, { requireComplete: true }), null, JSON.stringify(value));
    }
  });
});

describe("analyzeSkinQuiz", () => {
  it("is deterministic", () => {
    assert.deepEqual(analyzeSkinQuiz(base), analyzeSkinQuiz({ ...base, concerns: [...base.concerns] }));
  });

  it("gives high confidence when both skin-type answers agree", () => {
    const result = analyzeSkinQuiz(base);
    assert.equal(result.skinType, "oily");
    assert.equal(result.confidence, "high");
    assert.equal(result.primaryConcern, "acne");
  });

  it("stays uncertain with low confidence when the answers conflict", () => {
    const result = analyzeSkinQuiz({ ...base, skinType: "normal", afterCleansing: "oily_quickly" });
    assert.equal(result.skinType, null);
    assert.equal(result.confidence, "low");
    assert.equal(skinTypeLabel(result), "Uncertain (possibly normal or oily)");
  });

  it("needs both answers to call skin normal", () => {
    assert.equal(analyzeSkinQuiz({ ...base, skinType: "normal", afterCleansing: "balanced" }).skinType, "normal");
    assert.equal(analyzeSkinQuiz({ ...base, skinType: "normal", afterCleansing: "not_sure" }).skinType, null);
  });

  it("lowers confidence for dry skin with oiliness selected", () => {
    const result = analyzeSkinQuiz({ ...base, skinType: "dry", afterCleansing: "tight_dry", concerns: ["oiliness_pores"], goal: "maintain" });
    assert.equal(result.skinType, "dry");
    assert.equal(result.confidence, "medium");
  });

  it("flags frequent sensitivity and adds patch-test cautions", () => {
    const result = analyzeSkinQuiz({ ...base, reaction: "often" });
    assert.equal(result.sensitivity, "frequent");
    assert.ok(result.cautions.some((caution) => /patch test/i.test(caution)));
  });

  it("recommends only the kit's seven steps, in kit order, each marked as needing verification", () => {
    const result = analyzeSkinQuiz(base);
    assert.deepEqual(result.steps.map((step) => step.product), skincareKit.steps.map((step) => step.product));
    assert.ok(result.steps.every((step) => step.needsVerification));
    assert.equal(result.schedule, null);
  });

  it("makes no invented claims for any combination of goal and sensitivity", () => {
    const goals = quizQuestions[5].options.map((option) => option.value);
    const reactions = quizQuestions[4].options.map((option) => option.value);
    for (const goal of goals) {
      for (const reaction of reactions) {
        const text = allText(analyzeSkinQuiz({ ...base, goal, reaction, concerns: ["acne", "dryness", "dark_spots"] }));
        assert.doesNotMatch(text, /\bcures?\b|clinically|guarantee|dermatologist[- ]tested|SPF ?\d|\d+ ?%/i, `${goal}/${reaction}`);
      }
    }
  });
});
