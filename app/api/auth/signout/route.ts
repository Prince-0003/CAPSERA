import { endSession } from "@/app/_lib/session";

export async function POST(request: Request) {
  await endSession();
  // A form post from the account page gets redirected to sign-in; fetch callers get JSON.
  const isFormPost = (request.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded");
  if (isFormPost) {
    return Response.redirect(new URL("/signin", request.url), 303);
  }
  return Response.json({ message: "Signed out." });
}
