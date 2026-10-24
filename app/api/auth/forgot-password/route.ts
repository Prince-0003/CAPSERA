import { emailField, isJsonRecord } from "@/lib/request-validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit a valid email address." }, { status: 400 });
  }
  if (!isJsonRecord(body) || !emailField(body.email)) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  }
  return Response.json(
    { message: "Password recovery is not configured. No email was sent." },
    { status: 503 }
  );
}
