import { describeAuthError } from "@/lib/auth/errors";
import { authRedirectOrigin } from "@/lib/auth/redirects";
import { emailField, isJsonRecord } from "@/lib/request-validation";
import { accountsNotConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Sends a fresh sign-up confirmation link (offered when sign-in says the email isn't confirmed yet). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit a valid email address." }, { status: 400 });
  }
  const email = isJsonRecord(body) ? emailField(body.email) : null;
  if (!email) return Response.json({ message: "Enter a valid email address." }, { status: 400 });

  const supabase = await createClient();
  if (!supabase) return accountsNotConfigured();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${authRedirectOrigin(request.url)}/auth/confirm?next=/account` },
  });
  if (error) {
    const failure = describeAuthError(error, "resend");
    if (failure.status === 429 || failure.status >= 500) return Response.json({ message: failure.message }, { status: failure.status });
  }
  return Response.json({ message: `If ${email} is waiting for confirmation, a new link is on its way. Check your inbox.` });
}
