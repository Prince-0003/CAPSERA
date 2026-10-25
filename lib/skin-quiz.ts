import { skincareKit, verifiedStepInfo, type KitStepName } from "./product";

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

export type SkinTypeAnswer = "normal" | "oily" | "dry" | "combination" | "sensitive" | "not_sure";
export type AfterCleansingAnswer = "tight_dry" | "oily_quickly" | "balanced" | "mixed" | "irritated" | "not_sure";
export type ConcernAnswer =
  | "acne"
  | "dark_spots"
  | "uneven_tone"
  | "dullness"
  | "oiliness_pores"
  | "dryness"
  | "redness_sensitivity"
  | "maintenance";
export type BreakoutAnswer = "rarely" | "occasionally" | "frequently" | "constantly";
export type ReactionAnswer = "rarely" | "sometimes" | "often" | "not_sure";
export type GoalAnswer = "acne_oil" | "dark_spots" | "tone_glow" | "hydration" | "sensitive" | "maintain" | "complete";

export type QuizAnswers = {
  skinType: SkinTypeAnswer | "";
  afterCleansing: AfterCleansingAnswer | "";
  concerns: ConcernAnswer[];
  breakouts: BreakoutAnswer | "";
  reaction: ReactionAnswer | "";
  goal: GoalAnswer | "";
};

export type CompletedQuizAnswers = {
  skinType: SkinTypeAnswer;
  afterCleansing: AfterCleansingAnswer;
  concerns: ConcernAnswer[];
  breakouts: BreakoutAnswer;
  reaction: ReactionAnswer;
  goal: GoalAnswer;
};

type QuestionOption<T extends string> = { value: T; label: string };
type SingleQuestion<K extends keyof QuizAnswers, T extends string> = {
  id: K;
  kind: "single";
  prompt: string;
  hint?: string;
  options: readonly QuestionOption<T>[];
};
type MultiQuestion = {
  id: "concerns";
  kind: "multiple";
  prompt: string;
  hint?: string;
  options: readonly QuestionOption<ConcernAnswer>[];
};

const skinTypeOptions = [
  { value: "normal", label: "Normal" },
  { value: "oily", label: "Oily" },
  { value: "dry", label: "Dry" },
  { value: "combination", label: "Combination" },
  { value: "sensitive", label: "Sensitive" },
  { value: "not_sure", label: "Not sure" },
] as const satisfies readonly QuestionOption<SkinTypeAnswer>[];

const afterCleansingOptions = [
  { value: "tight_dry", label: "Tight or dry" },
  { value: "oily_quickly", label: "Oily again quickly" },
  { value: "balanced", label: "Comfortable and balanced" },
  { value: "mixed", label: "Dry in some areas but oily in others" },
  { value: "irritated", label: "Itchy or irritated" },
  { value: "not_sure", label: "Not sure" },
] as const satisfies readonly QuestionOption<AfterCleansingAnswer>[];

const concernOptions = [
  { value: "acne", label: "Pimples & Acne" },
  { value: "dark_spots", label: "Dark Spots & Acne Marks" },
  { value: "uneven_tone", label: "Uneven Skin Tone" },
  { value: "dullness", label: "Dullness & Lack of Glow" },
  { value: "oiliness_pores", label: "Oiliness & Visible Pores" },
  { value: "dryness", label: "Dryness & Dehydration" },
  { value: "redness_sensitivity", label: "Redness & Skin Sensitivity" },
  { value: "maintenance", label: "General Skin Maintenance" },
] as const satisfies readonly QuestionOption<ConcernAnswer>[];

const breakoutOptions = [
  { value: "rarely", label: "Rarely or never" },
  { value: "occasionally", label: "Occasionally" },
  { value: "frequently", label: "Frequently" },
  { value: "constantly", label: "Almost constantly" },
] as const satisfies readonly QuestionOption<BreakoutAnswer>[];

const reactionOptions = [
  { value: "rarely", label: "Rarely reacts" },
  { value: "sometimes", label: "Sometimes becomes dry or irritated" },
  { value: "often", label: "Often experiences redness, burning, or itching" },
  { value: "not_sure", label: "Not sure" },
] as const satisfies readonly QuestionOption<ReactionAnswer>[];

const goalOptions = [
  { value: "acne_oil", label: "Manage pimples, acne, and excess oil" },
  { value: "dark_spots", label: "Improve the appearance of dark spots and acne marks" },
  { value: "tone_glow", label: "Improve uneven skin tone and dullness" },
  { value: "hydration", label: "Improve hydration and softness" },
  { value: "sensitive", label: "Support a gentle routine for sensitive skin" },
  { value: "maintain", label: "Maintain balanced, healthy-looking skin" },
  { value: "complete", label: "Build a complete daily skincare routine" },
] as const satisfies readonly QuestionOption<GoalAnswer>[];

export const quizQuestions = [
  { id: "skinType", kind: "single", prompt: "How would you describe your skin most days?", options: skinTypeOptions },
  { id: "afterCleansing", kind: "single", prompt: "How does your skin feel after cleansing?", options: afterCleansingOptions },
  { id: "concerns", kind: "multiple", prompt: "What are your main skin concerns?", hint: "Choose all that apply.", options: concernOptions },
  { id: "breakouts", kind: "single", prompt: "How often do you experience pimples or acne breakouts?", options: breakoutOptions },
  { id: "reaction", kind: "single", prompt: "How does your skin react to new skincare products?", options: reactionOptions },
  { id: "goal", kind: "single", prompt: "What is your main skincare goal?", options: goalOptions },
] as const satisfies readonly (
  | SingleQuestion<"skinType", SkinTypeAnswer>
  | SingleQuestion<"afterCleansing", AfterCleansingAnswer>
  | MultiQuestion
  | SingleQuestion<"breakouts", BreakoutAnswer>
  | SingleQuestion<"reaction", ReactionAnswer>
  | SingleQuestion<"goal", GoalAnswer>
)[];

export type QuizQuestion = (typeof quizQuestions)[number];

export const emptyQuizAnswers: QuizAnswers = {
  skinType: "",
  afterCleansing: "",
  concerns: [],
  breakouts: "",
  reaction: "",
  goal: "",
};

/** Completed answers for the results page. */
export const QUIZ_STORAGE_KEY = "capsera-skin-quiz";
/** In-progress answers and the current question, so a refresh or Back from results keeps progress. */
export const QUIZ_PROGRESS_KEY = "capsera-skin-quiz-progress";

export function labelFor(questionId: QuizQuestion["id"], value: string): string {
  const question = quizQuestions.find((item) => item.id === questionId);
  const option = question?.options.find((item: QuestionOption<string>) => item.value === value);
  return option?.label ?? value;
}

export function isQuestionAnswered(question: QuizQuestion, answers: QuizAnswers): boolean {
  return question.kind === "multiple" ? answers.concerns.length > 0 : answers[question.id] !== "";
}

/* ------------------------------------------------------------------ */
/* Stored-answer validation                                            */
/* ------------------------------------------------------------------ */

function isOneOf<T extends string>(value: unknown, options: readonly QuestionOption<T>[], allowEmpty: boolean): value is T | "" {
  if (allowEmpty && value === "") return true;
  return typeof value === "string" && options.some((option) => option.value === value);
}

/** Validates answers read from storage (which may be stale or from an older quiz version). */
export function parseQuizAnswers(value: unknown, { requireComplete = false } = {}): QuizAnswers | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const allowEmpty = !requireComplete;
  if (
    !isOneOf(record.skinType, skinTypeOptions, allowEmpty) ||
    !isOneOf(record.afterCleansing, afterCleansingOptions, allowEmpty) ||
    !isOneOf(record.breakouts, breakoutOptions, allowEmpty) ||
    !isOneOf(record.reaction, reactionOptions, allowEmpty) ||
    !isOneOf(record.goal, goalOptions, allowEmpty) ||
    !Array.isArray(record.concerns) ||
    !record.concerns.every((concern) => isOneOf(concern, concernOptions, false)) ||
    (requireComplete && record.concerns.length === 0)
  ) {
    return null;
  }
  return {
    skinType: record.skinType,
    afterCleansing: record.afterCleansing,
    concerns: [...new Set(record.concerns as ConcernAnswer[])],
    breakouts: record.breakouts,
    reaction: record.reaction,
    goal: record.goal,
  };
}

export function isQuizComplete(answers: QuizAnswers): answers is CompletedQuizAnswers {
  return quizQuestions.every((question) => isQuestionAnswered(question, answers));
}

/* ------------------------------------------------------------------ */
/* Analysis                                                            */
/* ------------------------------------------------------------------ */

export type SkinType = "normal" | "oily" | "dry" | "combination";
export type Confidence = "high" | "medium" | "low";
export type SensitivityLevel = "frequent" | "some" | "none_reported" | "unknown";
export type StepRelevance = "foundation" | "focus" | "supporting";

export type StepRecommendation = {
  number: string;
  name: KitStepName;
  product: string;
  relevance: StepRelevance;
  reasons: string[];
  /** True when ingredients or directions for this product have not been verified. */
  needsVerification: boolean;
  verificationNote?: string;
};

export type SkinAnalysis = {
  /** null when the answers cannot confidently determine a skin type. */
  skinType: SkinType | null;
  /** Types the answers point to; two entries when Q1 and Q2 disagree. */
  possibleSkinTypes: SkinType[];
  confidence: Confidence;
  skinTypeExplanation: string;
  primaryConcern: ConcernAnswer;
  secondaryConcerns: ConcernAnswer[];
  breakoutFrequency: BreakoutAnswer;
  frequentBreakouts: boolean;
  sensitivity: SensitivityLevel;
  sensitivitySignals: string[];
  goal: GoalAnswer;
  steps: StepRecommendation[];
  /** Morning/evening routine, only when every included step has verified time-of-day directions. */
  schedule: { morning: KitStepName[]; evening: KitStepName[] } | null;
  scheduleNote: string;
  notes: string[];
  cautions: string[];
  summary: string;
};

const skinTypeLabels: Record<SkinType, string> = { normal: "Normal", oily: "Oily", dry: "Dry", combination: "Combination" };
export const confidenceLabels: Record<Confidence, string> = { high: "High", medium: "Moderate", low: "Low" };
export const sensitivityLabels: Record<SensitivityLevel, string> = {
  frequent: "Frequent reactions reported",
  some: "Some sensitivity reported",
  none_reported: "No sensitivity reported",
  unknown: "Not sure",
};

export function skinTypeLabel(analysis: Pick<SkinAnalysis, "skinType" | "possibleSkinTypes">): string {
  if (analysis.skinType) return skinTypeLabels[analysis.skinType];
  if (analysis.possibleSkinTypes.length > 0) {
    return `Uncertain (possibly ${analysis.possibleSkinTypes.map((type) => skinTypeLabels[type].toLowerCase()).join(" or ")})`;
  }
  return "Uncertain";
}

/*
 * Skin type rules (no numeric scores — each outcome comes from an explicit rule):
 *
 *   Q1 (self-description) gives a "reported" type; Q2 (feel after cleansing) gives an "observed" type.
 *   Q1 "Sensitive" / "Not sure" and Q2 "Itchy or irritated" / "Not sure" carry no oil/moisture signal,
 *   so they count as "no signal" here (sensitivity is handled separately below).
 *
 *   1. Q1 and Q2 point to the same type            -> that type, HIGH confidence.
 *   2. One of them points to oily/dry/combination,
 *      the other gives no signal                     -> that type, MEDIUM confidence
 *      (oily/dry/combination are defined as "Q1 and/or Q2").
 *   3. Normal needs both: Q1 "Normal" AND Q2 "balanced". A single normal signal -> uncertain, LOW,
 *      because "normal" is the absence of a problem and one answer can't establish it.
 *   4. Q1 and Q2 point to different types           -> uncertain, LOW, both types listed.
 *   5. Neither gives a signal                         -> uncertain, LOW.
 *
 *   A direct contradiction between the type and a selected concern (dry skin + "Oiliness & Visible
 *   Pores") lowers confidence one level. Oily skin + "Dryness & Dehydration" does not, because oily
 *   skin can still feel dehydrated; it only adds a note.
 */
const reportedType: Record<SkinTypeAnswer, SkinType | null> = {
  normal: "normal",
  oily: "oily",
  dry: "dry",
  combination: "combination",
  sensitive: null,
  not_sure: null,
};
const observedType: Record<AfterCleansingAnswer, SkinType | null> = {
  balanced: "normal",
  oily_quickly: "oily",
  tight_dry: "dry",
  mixed: "combination",
  irritated: null,
  not_sure: null,
};

function lowerConfidence(confidence: Confidence): Confidence {
  return confidence === "high" ? "medium" : "low";
}

function determineSkinType(answers: CompletedQuizAnswers) {
  const reported = reportedType[answers.skinType];
  const observed = observedType[answers.afterCleansing];
  const q1 = labelFor("skinType", answers.skinType).toLowerCase();
  const q2 = labelFor("afterCleansing", answers.afterCleansing).toLowerCase();

  let skinType: SkinType | null = null;
  let possibleSkinTypes: SkinType[] = [];
  let confidence: Confidence = "low";
  let explanation: string;

  if (reported && observed && reported === observed) {
    skinType = reported;
    possibleSkinTypes = [reported];
    confidence = "high";
    explanation = `You described your skin as ${q1}, and how it feels after cleansing (${q2}) matches that.`;
  } else if (reported && observed) {
    possibleSkinTypes = [reported, observed];
    explanation = `You described your skin as ${q1}, but after cleansing it feels ${q2}, which usually points to ${skinTypeLabels[observed].toLowerCase()} skin. Because these answers differ, the quiz can't confidently determine your skin type.`;
  } else if (reported || observed) {
    const single = (reported ?? observed) as SkinType;
    possibleSkinTypes = [single];
    if (single === "normal") {
      explanation = reported
        ? `You described your skin as normal, but your answer about how it feels after cleansing (${q2}) doesn't confirm it, so the quiz can't confidently call it normal.`
        : `Your skin feels comfortable after cleansing, but you weren't able to describe your skin type, so the quiz can't confidently call it normal.`;
    } else {
      skinType = single;
      confidence = "medium";
      explanation = reported
        ? `You described your skin as ${q1}. Your answer about how it feels after cleansing (${q2}) doesn't confirm or contradict that.`
        : `How your skin feels after cleansing (${q2}) usually points to ${skinTypeLabels[single].toLowerCase()} skin. You didn't choose a skin type in the first question, so this is less certain.`;
    }
  } else {
    explanation = "Your answers about your skin type and how it feels after cleansing don't point to a specific skin type, so the quiz can't determine it.";
  }

  return { skinType, possibleSkinTypes, confidence, explanation };
}

/*
 * Sensitivity rules. Q5 asks directly about reactions to products, so it is the strongest signal:
 *   - Q5 "often reacts" on its own                                   -> frequent
 *   - two or more other signals (Q1 sensitive, Q2 itchy/irritated,
 *     Q3 redness & sensitivity, Q6 gentle-routine goal)              -> frequent
 *   - any single signal, or Q5 "sometimes"                           -> some
 *   - no signals and Q5 "not sure"                                   -> unknown
 *   - no signals and Q5 "rarely"                                     -> none reported
 */
function determineSensitivity(answers: CompletedQuizAnswers) {
  const signals: string[] = [];
  if (answers.skinType === "sensitive") signals.push("you described your skin as sensitive");
  if (answers.afterCleansing === "irritated") signals.push("your skin feels itchy or irritated after cleansing");
  if (answers.concerns.includes("redness_sensitivity")) signals.push("you selected redness and skin sensitivity as a concern");
  if (answers.goal === "sensitive") signals.push("your goal is a gentle routine for sensitive skin");
  const otherSignalCount = signals.length;

  if (answers.reaction === "often") signals.unshift("your skin often reacts to new products with redness, burning, or itching");
  if (answers.reaction === "sometimes") signals.unshift("your skin sometimes becomes dry or irritated with new products");

  let level: SensitivityLevel;
  if (answers.reaction === "often" || otherSignalCount >= 2) level = "frequent";
  else if (otherSignalCount === 1 || answers.reaction === "sometimes") level = "some";
  else if (answers.reaction === "not_sure") level = "unknown";
  else level = "none_reported";

  return { level, signals };
}

/*
 * Primary concern: the Q6 goal is the user's explicit priority, so it decides the primary concern.
 * Goals that cover two concerns use whichever of the two the user also selected in Q3 (first match);
 * "Build a complete routine" uses the first concern selected in Q3's listed order.
 * Every other Q3 selection is kept as a secondary concern.
 */
const goalConcerns: Record<GoalAnswer, ConcernAnswer[]> = {
  acne_oil: ["acne", "oiliness_pores"],
  dark_spots: ["dark_spots"],
  tone_glow: ["uneven_tone", "dullness"],
  hydration: ["dryness"],
  sensitive: ["redness_sensitivity"],
  maintain: ["maintenance"],
  complete: [],
};

function determineConcerns(answers: CompletedQuizAnswers) {
  const selected = concernOptions.map((option) => option.value).filter((value) => answers.concerns.includes(value));
  const candidates = goalConcerns[answers.goal];
  const primary =
    candidates.find((concern) => selected.includes(concern)) ??
    candidates[0] ??
    selected[0] ??
    "maintenance";
  return { primary, secondary: selected.filter((concern) => concern !== primary), selected };
}

function stepInfo(name: KitStepName) {
  const step = skincareKit.steps.find((item) => item.name === name);
  if (!step) throw new Error(`Unknown kit step: ${name}`);
  const verified = verifiedStepInfo[name];
  const needsVerification = !verified?.ingredients || !verified?.directions;
  return {
    number: step.number,
    name: step.name,
    product: step.product,
    needsVerification,
    verificationNote: needsVerification
      ? `The ${step.product} ingredients and directions haven't been provided yet. Check the final packaging before use.`
      : undefined,
  };
}

/** Deterministic: the same answers always give the same analysis. */
export function analyzeSkinQuiz(answers: CompletedQuizAnswers): SkinAnalysis {
  const type = determineSkinType(answers);
  const sensitivity = determineSensitivity(answers);
  const concerns = determineConcerns(answers);
  const has = (concern: ConcernAnswer) => concerns.selected.includes(concern) || concerns.primary === concern;
  const frequentBreakouts = answers.breakouts === "frequently" || answers.breakouts === "constantly";
  const notes: string[] = [];
  let confidence = type.confidence;

  const leansDry = type.skinType === "dry";
  const leansOily = type.skinType === "oily";
  if (leansDry && has("oiliness_pores")) {
    confidence = lowerConfidence(confidence);
    notes.push("You reported dry skin but also selected oiliness and visible pores. These don't usually go together, so the skin type result is less certain. Both concerns are kept in your results.");
  }
  if (leansOily && has("dryness")) {
    notes.push("Oily skin can still feel dehydrated, so dryness is kept as a concern alongside your oily skin type.");
  }
  if (frequentBreakouts && !has("acne")) {
    notes.push("You reported frequent breakouts but didn't select pimples and acne as a concern, so breakout care is included as a supporting step rather than your main focus.");
  }
  if (has("dark_spots") && !has("acne") && !frequentBreakouts) {
    notes.push("Dark spots and acne marks can remain after breakouts have cleared, so they're treated separately from active acne here.");
  }
  if (concerns.primary !== "maintenance" && !answers.concerns.includes(concerns.primary)) {
    notes.push(`Your main goal adds "${labelFor("concerns", concerns.primary)}" to the concerns you selected.`);
  }

  /* Step selection. "foundation" = part of any routine, "focus" = matches a reported concern or goal,
     "supporting" = in the kit but not specifically indicated by these answers. */
  const steps: StepRecommendation[] = [];
  const add = (name: KitStepName, relevance: StepRelevance, reasons: string[]) => steps.push({ ...stepInfo(name), relevance, reasons });

  add("Cleanse", "foundation", ["Cleansing is the starting point of the kit's seven-step routine for every skin type."]);

  const hydrateReasons: string[] = [];
  if (answers.afterCleansing === "tight_dry") hydrateReasons.push("your skin feels tight or dry after cleansing");
  if (has("dryness")) hydrateReasons.push("you selected dryness and dehydration");
  if (answers.goal === "hydration") hydrateReasons.push("your main goal is hydration and softness");
  if (leansOily && has("dryness")) hydrateReasons.push("oily skin can still need hydration");
  add("Hydrate", hydrateReasons.length ? "focus" : "supporting",
    hydrateReasons.length
      ? [`Chosen because ${hydrateReasons.join(", ")}.`]
      : ["Part of the complete routine; your answers didn't report dryness or tightness."]);

  const treatReasons: string[] = [];
  if (has("acne")) treatReasons.push("you selected pimples and acne");
  if (frequentBreakouts) treatReasons.push(`you get breakouts ${answers.breakouts === "constantly" ? "almost constantly" : "frequently"}`);
  // The goal also covers excess oil, so on its own it only counts when some breakouts are reported.
  if (answers.goal === "acne_oil" && answers.breakouts !== "rarely") treatReasons.push("your main goal is managing pimples, acne, and excess oil");
  add("Treat", treatReasons.length ? "focus" : "supporting",
    treatReasons.length
      ? [`Chosen because ${treatReasons.join(", ")}.`, "Use it for active breakouts only as the verified packaging directs."]
      : answers.breakouts === "occasionally"
        ? ["You get occasional breakouts, so this step may be useful when they happen, following the verified packaging directions."]
        : [has("dark_spots")
            ? "Not a focus for you: acne marks are different from active pimples, and you didn't report frequent breakouts."
            : "Not a focus for your answers, because you didn't report frequent breakouts or acne."]);

  const brightenReasons: string[] = [];
  if (has("dark_spots")) brightenReasons.push("you selected dark spots and acne marks");
  if (has("uneven_tone")) brightenReasons.push("you selected uneven skin tone");
  if (has("dullness")) brightenReasons.push("you selected dullness and lack of glow");
  if (answers.goal === "dark_spots" || answers.goal === "tone_glow") brightenReasons.push("your main goal is a more even, brighter-looking tone");
  add("Brighten", brightenReasons.length ? "focus" : "supporting",
    brightenReasons.length
      ? [`Chosen because ${brightenReasons.join(", ")}.`, "Whether this serum suits that use depends on its final formula, which hasn't been confirmed yet."]
      : ["Part of the complete routine; you didn't report spots, uneven tone, or dullness."]);

  add("Repair", "supporting", [
    "Included in the complete kit. Its formula and intended purpose haven't been provided, so the quiz doesn't match it to a specific concern yet.",
  ]);

  const nourishReasons: string[] = [];
  if (leansDry) nourishReasons.push("your answers point to dry skin");
  if (has("dryness")) nourishReasons.push("you selected dryness and dehydration");
  if (answers.goal === "hydration") nourishReasons.push("your main goal is hydration and softness");
  add("Nourish", nourishReasons.length ? "focus" : "supporting",
    nourishReasons.length
      ? [`Chosen because ${nourishReasons.join(", ")}.`]
      : ["Moisturising is part of the complete routine; your answers didn't report dryness."]);

  add("Protect", "foundation", [
    "Daily sun protection is widely recommended for every skin type, and it matters especially when you're working on spots or uneven tone.",
    "The SPF and directions for this sunscreen haven't been confirmed yet. Check the packaging.",
  ]);

  // Schedule only when every step has verified time-of-day directions.
  const allTimed = steps.every((step) => verifiedStepInfo[step.name]?.timeOfDay?.length);
  const schedule = allTimed
    ? {
        morning: steps.filter((step) => verifiedStepInfo[step.name]?.timeOfDay?.includes("morning")).map((step) => step.name),
        evening: steps.filter((step) => verifiedStepInfo[step.name]?.timeOfDay?.includes("evening")).map((step) => step.name),
      }
    : null;
  const scheduleNote = schedule
    ? "Based on the verified directions for each product."
    : "A morning and evening routine isn't shown yet because verified directions for each product haven't been provided. Use the steps in the kit's listed order and follow the packaging for when to use each one.";

  const cautions: string[] = [];
  if (sensitivity.level === "frequent") {
    cautions.push(
      "Because you reported frequent reactions, patch test each product on a small area first and introduce one new step at a time.",
      "Suitability of these products for sensitive skin hasn't been verified. Review the final ingredient lists before use.",
      "Stop using a product if it causes burning, swelling, or redness that doesn't settle, and consider speaking with a dermatologist.",
    );
  } else if (sensitivity.level === "some") {
    cautions.push("Your skin sometimes reacts, so introduce new steps gradually and patch test first.");
  } else if (sensitivity.level === "unknown") {
    cautions.push("You weren't sure how your skin reacts to new products, so patch testing new steps first is a sensible precaution.");
  }
  if (answers.breakouts === "constantly" || (frequentBreakouts && sensitivity.level === "frequent")) {
    cautions.push("Persistent, painful, or worsening breakouts are worth discussing with a dermatologist. This quiz can't assess acne severity.");
  }

  const focusNames = steps.filter((step) => step.relevance === "focus").map((step) => step.name.toLowerCase());
  const typePart = type.skinType
    ? `Your answers suggest ${skinTypeLabels[type.skinType].toLowerCase()} skin (${confidenceLabels[confidence].toLowerCase()} confidence)`
    : "Your answers don't clearly point to one skin type";
  const focusPart = focusNames.length
    ? `so the ${new Intl.ListFormat("en", { type: "conjunction" }).format(focusNames)} step${focusNames.length > 1 ? "s are" : " is"} most relevant to what you reported, alongside cleansing and sun protection.`
    : "so the core routine of cleansing and sun protection, with the rest of the kit as supporting steps, fits what you reported.";
  const summary = `${typePart}, and your main focus is ${labelFor("concerns", concerns.primary).toLowerCase()}, ${focusPart}`;

  return {
    skinType: type.skinType,
    possibleSkinTypes: type.possibleSkinTypes,
    confidence,
    skinTypeExplanation: type.explanation,
    primaryConcern: concerns.primary,
    secondaryConcerns: concerns.secondary,
    breakoutFrequency: answers.breakouts,
    frequentBreakouts,
    sensitivity: sensitivity.level,
    sensitivitySignals: sensitivity.signals,
    goal: answers.goal,
    steps,
    schedule,
    scheduleNote,
    notes,
    cautions,
    summary,
  };
}
