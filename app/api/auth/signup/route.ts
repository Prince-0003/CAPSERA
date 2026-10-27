import { describeAuthError } from "@/lib/auth/errors";
import { authRedirectOrigin } from "@/lib/auth/redirects";
import { emailField, isJsonRecord, passwordField, textField } from "@/lib/request-validation";
import { accountsNotConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit valid account details." }, { status: 400 });
  }

  if (!isJsonRecord(body)) {
    return Response.json({ message: "Check your name, email, and matching passwords." }, { status: 400 });
  }

  const name = textField(body.name, 2, 100);
  const email = emailField(body.email);
  const password = passwordField(body.password);

  if (!name || !email || !password || body.password !== body.confirmPassword) {
    return Response.json({ message: "Check your name, email, and matching passwords." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) return accountsNotConfigured();

  // Supabase Auth hashes and stores the password; the name travels as user metadata and the database trigger
  // (handle_new_user) copies it into public.profiles.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${authRedirectOrigin(request.url)}/auth/confirm?next=/account`,
    },
  });

  if (error) {
    const failure = describeAuthError(error, "signup");
    if (failure.status >= 500) console.error("Supabase sign-up failed.", error.code, error.status);
    return Response.json({ message: failure.message }, { status: failure.status });
  }

  if (data.session) {
    // Email confirmation is off: the session cookies are already set.
    return Response.json({ message: "Your account was created successfully.", redirectTo: "/account" }, { status: 201 });
  }

  // Email confirmation is on. Supabase gives the same reply for an email that is already registered, so this
  // message deliberately doesn't reveal whether an account exists.
  return Response.json(
    {
      message: `Almost there: we've sent a confirmation link to ${email}. Open it to activate your account, then sign in.`,
      needsConfirmation: true,
    },
    { status: 201 },
  );
}
