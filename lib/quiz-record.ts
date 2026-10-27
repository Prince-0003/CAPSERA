import { skincareKit, type ProductId } from "./product";
import {
  analyzeSkinQuiz,
  isQuizComplete,
  labelFor,
  parseQuizAnswers,
  skinTypeLabel,
  type CompletedQuizAnswers,
  type ConcernAnswer,
  type Confidence,
  type SensitivityLevel,
  type SkinAnalysis,
  type SkinType,
  type StepRelevance,
} from "./skin-quiz";

/**
 * Saved skin quiz results (public.skin_quiz_results). Shared by the API route, the results page and the account
 * page, so what is stored and what is shown always come from the same analysis (lib/skin-quiz.ts).
 */

/** Bump when questions or answer values change; stored rows keep the version they were answered with. */
export const QUIZ_VERSION = 1;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Completed, valid answers, or null. The server validates with this before saving anything. */
export function parseCompletedAnswers(value: unknown): CompletedQuizAnswers | null {
  const answers = parseQuizAnswers(value, { requireComplete: true });
  return answers && isQuizComplete(answers) ? answers : null;
}

export type ProductRecommendation = { productId: ProductId; reason: string; keySteps: string[] };

/** Whether a completed attempt is saved to the customer's account. Mirrors the replies of /api/quiz/results. */
export type QuizSaveState =
  | { saved: true; id: string; createdAt: string }
  | { saved: false; reason: "signed-out" | "error"; message?: string };

/** Browser-only: submits completed answers. The server validates them, and saves them when the visitor is signed in. */
export async function submitQuizResults(answers: CompletedQuizAnswers): Promise<{ invalid: string } | QuizSaveState> {
  try {
    const response = await fetch("/api/quiz/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const result: Record<string, unknown> = await response.json().catch(() => ({}));
    const message = typeof result.message === "string" ? result.message : undefined;
    if (response.status === 400) return { invalid: message ?? "Check your answers and try again." };
    if (result.saved === true && typeof result.id === "string" && typeof result.createdAt === "string") {
      return { saved: true, id: result.id, createdAt: result.createdAt };
    }
    return { saved: false, reason: result.reason === "signed-out" ? "signed-out" : "error", message };
  } catch {
    return { saved: false, reason: "error", message: "We couldn't reach the server to save these results. They're still shown below." };
  }
}

/**
 * Products to recommend, only from the catalogue (lib/product.ts). The kit is the only product for sale and holds
 * all seven steps, so it is always the recommendation; the reason names the steps the analysis marks as most relevant.
 */
export function recommendProducts(analysis: SkinAnalysis): ProductRecommendation[] {
  const keySteps = analysis.steps.filter((step) => step.relevance !== "supporting").map((step) => step.name);
  const list = new Intl.ListFormat("en", { type: "conjunction" }).format(keySteps.map((name) => name.toLowerCase()));
  return [{
    productId: skincareKit.id,
    keySteps,
    reason: `All seven steps come together in one ${skincareKit.name}; the capsules aren't sold separately. For your answers, the ${list} steps are the most relevant.`,
  }];
}

export type QuizResultInsert = {
  quiz_version: number;
  answers: CompletedQuizAnswers;
  skin_type: SkinType | null;
  confidence: Confidence;
  primary_concern: ConcernAnswer;
  concerns: ConcernAnswer[];
  sensitivity: SensitivityLevel;
  recommendations: {
    products: ProductRecommendation[];
    steps: { number: string; name: string; product: string; relevance: StepRelevance }[];
  };
};

/** The row to store for a completed attempt (user_id is added by the caller from the verified session). */
export function buildQuizResultRecord(answers: CompletedQuizAnswers): QuizResultInsert {
  const analysis = analyzeSkinQuiz(answers);
  return {
    quiz_version: QUIZ_VERSION,
    answers,
    skin_type: analysis.skinType,
    confidence: analysis.confidence,
    primary_concern: analysis.primaryConcern,
    concerns: [analysis.primaryConcern, ...analysis.secondaryConcerns],
    sensitivity: analysis.sensitivity,
    recommendations: {
      products: recommendProducts(analysis),
      steps: analysis.steps.map(({ number, name, product, relevance }) => ({ number, name, product, relevance })),
    },
  };
}

export type StoredQuizSummary = {
  id: string;
  createdAt: string;
  skinType: string;
  primaryConcern: string;
  keySteps: string[];
};

/** Summary of a stored row for the account page, re-derived from its validated answers; null if the row is unusable. */
export function summarizeStoredResult(row: unknown): StoredQuizSummary | null {
  if (typeof row !== "object" || row === null) return null;
  const { id, created_at: createdAt, answers: rawAnswers } = row as Record<string, unknown>;
  const answers = parseCompletedAnswers(rawAnswers);
  if (typeof id !== "string" || typeof createdAt !== "string" || !answers) return null;
  const analysis = analyzeSkinQuiz(answers);
  return {
    id,
    createdAt,
    skinType: skinTypeLabel(analysis),
    primaryConcern: labelFor("concerns", analysis.primaryConcern),
    keySteps: recommendProducts(analysis)[0].keySteps,
  };
}
