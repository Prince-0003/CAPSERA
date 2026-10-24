import { emailField, isJsonRecord, textField } from "@/lib/request-validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit a valid contact request." }, { status: 400 });
  }
  if (!isJsonRecord(body)) {
    return Response.json({ message: "Submit a valid contact request." }, { status: 400 });
  }
  if (
    !textField(body.name, 2, 100) ||
    !emailField(body.email) ||
    !textField(body.subject, 3, 160) ||
    !textField(body.message, 10, 4000)
  ) {
    return Response.json({ message: "Check your name, email, subject, and message." }, { status: 400 });
  }
  return Response.json(
    { message: "Contact delivery is not configured. Your message has not been sent." },
    { status: 503 }
  );
}
