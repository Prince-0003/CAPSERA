import { describeAuthError } from "@/lib/auth/errors";
import { authRedirectOrigin } from "@/lib/auth/redirects";
import { emailField, isJsonRecord } from "@/lib/request-validation";
import { accountsNotConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit a valid email address." }, { status: 400 });
  }
  const email = isJsonRecord(body) ? emailField(body.email) : null;
  if (!email) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) return accountsNotConfigured();

  // The emailed link lands on /auth/confirm, which starts a recovery session and opens the new-password form.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${authRedirectOrigin(request.url)}/auth/confirm?next=/reset-password`,
  });
  if (error) {
    const failure = describeAuthError(error, "recovery");
    if (failure.status === 429 || failure.status >= 500) return Response.json({ message: failure.message }, { status: failure.status });
    console.error("Supabase password recovery failed.", error.code, error.status);
  }

  // Same reply whether or not the email has an account, so the form can't be used to discover customers.
  return Response.json({
    message: `If there's an account for ${email}, we've emailed a link to reset the password. Check your inbox and spam folder.`,
  });
}
