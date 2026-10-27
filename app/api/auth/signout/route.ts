import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  // "local" ends this browser's session only; the customer stays signed in on their other devices.
  if (supabase) await supabase.auth.signOut({ scope: "local" });
  // A form post from the account page gets redirected to sign-in; fetch callers get JSON.
  const isFormPost = (request.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded");
  if (isFormPost) {
    return Response.redirect(new URL("/signin", request.url), 303);
  }
  return Response.json({ message: "Signed out." });
}
