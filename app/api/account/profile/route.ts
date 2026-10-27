import { parseProfileInput } from "@/lib/account-profile";
import { accountsNotConfigured } from "@/lib/supabase/config";
import { isMissingTableError } from "@/lib/supabase/errors";
import { getCurrentUser } from "@/lib/supabase/server";

/** Updates the signed-in customer's own profile (name and phone). RLS also limits the write to their own row. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit valid profile details." }, { status: 400 });
  }
  const parsed = parseProfileInput(body);
  if (!parsed.ok) {
    return Response.json({ message: "Check the highlighted fields.", errors: parsed.errors }, { status: 400 });
  }

  const { supabase, user } = await getCurrentUser();
  if (!supabase) return accountsNotConfigured();
  if (!user) return Response.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });

  // Upsert, so a customer whose profile row is missing (e.g. created before the sign-up trigger existed) gets one.
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name: parsed.profile.fullName, phone: parsed.profile.phone }, { onConflict: "id" })
    .select("full_name, phone")
    .single();

  if (error) {
    console.error("Unable to save profile.", error.code);
    return isMissingTableError(error)
      ? Response.json({ message: "Profiles aren't set up yet. Please try again later." }, { status: 503 })
      : Response.json({ message: "Your profile could not be saved. Please try again." }, { status: 500 });
  }
  return Response.json({ message: "Your profile has been updated.", profile: { fullName: data.full_name, phone: data.phone } });
}
