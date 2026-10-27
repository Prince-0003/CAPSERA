import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";
import { getProduct, skincareKit } from "@/lib/product";
import { buildQuizResultRecord, parseCompletedAnswers, recommendProducts, summarizeStoredResult } from "@/lib/quiz-record";
import { analyzeSkinQuiz, quizQuestions, type CompletedQuizAnswers } from "@/lib/skin-quiz";

const answers: CompletedQuizAnswers = {
  skinType: "oily",
  afterCleansing: "oily_quickly",
  concerns: ["acne", "dark_spots"],
  breakouts: "frequently",
  reaction: "rarely",
  goal: "acne_oil",
};

describe("server-side quiz validation", () => {
  it("accepts complete answers and rejects incomplete or unknown ones", () => {
    assert.deepEqual(parseCompletedAnswers(answers), answers);
    assert.equal(parseCompletedAnswers({ ...answers, goal: "" }), null);
    assert.equal(parseCompletedAnswers({ ...answers, concerns: [] }), null);
    assert.equal(parseCompletedAnswers({ ...answers, skinType: "greasy" }), null);
    assert.equal(parseCompletedAnswers({ ...answers, concerns: ["acne", "wrinkles"] }), null);
    assert.equal(parseCompletedAnswers("oily"), null);
  });

  it("stores only the six answers, even if extra fields are sent", () => {
    const parsed = parseCompletedAnswers({ ...answers, email: "a@example.com", name: "Asha" });
    assert.deepEqual(Object.keys(parsed ?? {}).sort(), ["afterCleansing", "breakouts", "concerns", "goal", "reaction", "skinType"]);
  });
});

describe("saved quiz result", () => {
  it("matches the analysis shown on the results page", () => {
    const analysis = analyzeSkinQuiz(answers);
    const record = buildQuizResultRecord(answers);
    assert.equal(record.skin_type, "oily");
    assert.equal(record.confidence, analysis.confidence);
    assert.equal(record.primary_concern, "acne");
    assert.deepEqual(record.concerns, ["acne", "dark_spots"]);
    assert.equal(record.sensitivity, "none_reported");
    assert.deepEqual(record.recommendations.steps.map((step) => [step.name, step.relevance]), analysis.steps.map((step) => [step.name, step.relevance]));
    assert.deepEqual(record.recommendations.products, recommendProducts(analysis));
  });

  it("keeps an inconclusive skin type as null", () => {
    assert.equal(buildQuizResultRecord({ ...answers, skinType: "dry" }).skin_type, null);
  });

  it("summarises a stored row for the account page and ignores unusable rows", () => {
    const summary = summarizeStoredResult({ id: "8f9e2c1a-0000-4000-8000-000000000001", created_at: "2026-10-27T10:00:00Z", answers });
    assert.equal(summary?.skinType, "Oily");
    assert.equal(summary?.primaryConcern, "Pimples & Acne");
    assert.ok(summary?.keySteps.includes("Treat"));
    assert.equal(summarizeStoredResult({ id: "x", created_at: "2026-10-27T10:00:00Z", answers: { skinType: "oily" } }), null);
    assert.equal(summarizeStoredResult(null), null);
  });
});

describe("product recommendations", () => {
  it("recommend only catalogue products, with a reason naming the key steps", () => {
    for (const goal of ["acne_oil", "hydration", "complete"] as const) {
      const recommendations = recommendProducts(analyzeSkinQuiz({ ...answers, goal }));
      assert.ok(recommendations.length > 0);
      for (const recommendation of recommendations) {
        assert.ok(getProduct(recommendation.productId), recommendation.productId);
        const stepNames = skincareKit.steps.map((step) => step.name as string);
        assert.ok(recommendation.keySteps.every((name) => stepNames.includes(name)));
        assert.match(recommendation.reason, /aren't sold separately/);
        assert.doesNotMatch(recommendation.reason, /cure|treats? acne|diagnos/i);
      }
    }
  });
});

describe("database migration stays in sync with the quiz", () => {
  const sql = readdirSync("supabase/migrations")
    .filter((file) => file.endsWith(".sql"))
    .map((file) => readFileSync(`supabase/migrations/${file}`, "utf8"))
    .join("\n");

  it("lists exactly the quiz's answer values in its CHECK constraints", () => {
    for (const question of quizQuestions) {
      const values = question.options.map((option) => option.value);
      const listed = values.map((value) => `'${value}'`).join(", ");
      const expected = question.kind === "multiple"
        ? `'${JSON.stringify(values).replace(/","/g, '", "')}'::jsonb`
        : `answers ->> '${question.id}' in (${listed})`;
      assert.ok(sql.includes(expected), `${question.id}: expected ${expected}`);
    }
  });

  it("enables Row Level Security and grants nothing to signed-out visitors", () => {
    for (const table of ["profiles", "skin_quiz_results"]) {
      assert.ok(sql.includes(`alter table public.${table} enable row level security;`), table);
      assert.ok(sql.includes(`revoke all on table public.${table} from anon, authenticated;`), table);
      assert.doesNotMatch(sql, new RegExp(`grant [^;]* on table public\\.${table} to [^;]*anon`));
    }
  });
});
