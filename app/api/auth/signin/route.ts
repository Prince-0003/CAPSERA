import { describeAuthError } from "@/lib/auth/errors";
import { safeNextPath } from "@/lib/auth/redirects";
import { emailField, isJsonRecord, passwordField } from "@/lib/request-validation";
import { accountsNotConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit valid sign-in details." }, { status: 400 });
  }

  if (!isJsonRecord(body)) {
    return Response.json({ message: "Enter a valid email and password." }, { status: 400 });
  }

  const email = emailField(body.email);
  const password = passwordField(body.password, 1);

  if (!email || !password) {
    return Response.json({ message: "Enter a valid email and password." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) return accountsNotConfigured();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const failure = describeAuthError(error, "signin");
    if (failure.status >= 500) console.error("Supabase sign-in failed.", error.code, error.status);
    return Response.json({ message: failure.message, code: failure.code }, { status: failure.status });
  }

  // The session cookies were set by the server client; the form continues to the requested page.
  return Response.json({ message: "Signed in successfully.", redirectTo: safeNextPath(body.next) }, { status: 200 });
}
