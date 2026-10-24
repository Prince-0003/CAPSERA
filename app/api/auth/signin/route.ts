import { authenticateAccount } from "@/lib/auth-store";
import { emailField, isJsonRecord, textField } from "@/lib/request-validation";

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
  const password = textField(body.password, 8, 128);

  if (!email || !password) {
    return Response.json({ message: "Enter a valid email and password." }, { status: 400 });
  }

  const user = await authenticateAccount(email, password);
  if (!user) {
    return Response.json({ message: "We could not find an account with that email and password." }, { status: 401 });
  }

  return Response.json(
    {
      message: "Signed in successfully.",
      user: { name: user.name, email: user.email },
    },
    { status: 200 }
  );
}
