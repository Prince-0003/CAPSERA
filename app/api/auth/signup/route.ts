import { createAccount } from "@/lib/auth-store";
import { startSession } from "@/app/_lib/session";
import { emailField, isJsonRecord, textField } from "@/lib/request-validation";

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
  const password = textField(body.password, 8, 128);

  if (!name || !email || !password || body.password !== body.confirmPassword) {
    return Response.json({ message: "Check your name, email, and matching passwords." }, { status: 400 });
  }

  try {
    const user = await createAccount(name, email, password);
    await startSession(user.id);
    return Response.json(
      {
        message: "Your account was created successfully.",
        user: { name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return Response.json({ message: error.message }, { status: 409 });
    }
    console.error("Unable to create account.", error);
    return Response.json({ message: "Your account could not be created. Please try again." }, { status: 500 });
  }
}
