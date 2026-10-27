import { buildQuizResultRecord, parseCompletedAnswers, UUID_PATTERN } from "@/lib/quiz-record";
import { isJsonRecord } from "@/lib/request-validation";
import { isMissingTableError } from "@/lib/supabase/errors";
import { getCurrentUser } from "@/lib/supabase/server";

/**
 * Submit a completed quiz. Answers are validated and analysed on the server (lib/skin-quiz.ts). For a signed-in
 * customer the result is saved to their account; for anonymous visitors nothing is stored on the server (their
 * answers stay in their own browser tab) and the reply says so.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit valid quiz answers." }, { status: 400 });
  }
  const answers = isJsonRecord(body) ? parseCompletedAnswers(body.answers) : null;
  if (!answers) {
    return Response.json({ message: "Answer every question with one of the listed options to see your results." }, { status: 400 });
  }
  const record = buildQuizResultRecord(answers);

  const { supabase, user } = await getCurrentUser();
  if (!supabase || !user) return Response.json({ saved: false, reason: "signed-out" });

  // user_id always comes from the verified session, never from the request; RLS rejects any other id as well.
  const { data, error } = await supabase
    .from("skin_quiz_results")
    .insert({ ...record, user_id: user.id })
    .select("id, created_at")
    .single();
  if (error) {
    console.error("Unable to save quiz result.", error.code);
    return Response.json(
      {
        saved: false,
        reason: "error",
        message: isMissingTableError(error)
          ? "Saving results to your account isn't available yet. Your results are still shown below."
          : "We couldn't save these results to your account. Your results are still shown below.",
      },
      { status: isMissingTableError(error) ? 503 : 500 },
    );
  }
  return Response.json({ saved: true, id: data.id, createdAt: data.created_at }, { status: 201 });
}

/** A saved result of the signed-in customer: ?id=<uuid>, or the latest one. RLS hides other customers' rows. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (id !== null && !UUID_PATTERN.test(id)) return Response.json({ message: "That result link isn't valid." }, { status: 400 });

  const { supabase, user } = await getCurrentUser();
  if (!supabase || !user) return Response.json({ message: "Sign in to see your saved results." }, { status: 401 });

  let query = supabase.from("skin_quiz_results").select("id, created_at, answers").eq("user_id", user.id);
  if (id) query = query.eq("id", id);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) {
    console.error("Unable to load quiz result.", error.code);
    return Response.json({ message: "Your saved results couldn't be loaded. Please try again." }, { status: isMissingTableError(error) ? 503 : 500 });
  }
  const answers = data ? parseCompletedAnswers(data.answers) : null;
  if (!data || !answers) return Response.json({ message: "No saved results found." }, { status: 404 });
  return Response.json({ id: data.id, createdAt: data.created_at, answers });
}
