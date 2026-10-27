import { describeAuthError } from "@/lib/auth/errors";
import { isJsonRecord, passwordField } from "@/lib/request-validation";
import { accountsNotConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

/** Sets a new password for the signed-in customer: the recovery session from a reset email, or a normal session. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit a valid new password." }, { status: 400 });
  }
  const password = isJsonRecord(body) ? passwordField(body.password) : null;
  if (!password || !isJsonRecord(body) || body.password !== body.confirmPassword) {
    return Response.json({ message: "Enter matching passwords of 8 to 128 characters." }, { status: 400 });
  }

  const { supabase, user } = await getCurrentUser();
  if (!supabase) return accountsNotConfigured();
  if (!user) {
    return Response.json({ message: "Your reset link has expired or was already used. Request a new one." }, { status: 401 });
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const failure = describeAuthError(error, "update-password");
    if (failure.status >= 500) console.error("Supabase password update failed.", error.code, error.status);
    return Response.json({ message: failure.message }, { status: failure.status });
  }
  return Response.json({ message: "Your password has been updated.", redirectTo: "/account?password=updated" });
}
