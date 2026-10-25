import { getSessionAccount } from "@/app/_lib/session";

export async function GET() {
  const user = await getSessionAccount();
  if (!user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user: { name: user.name, email: user.email } });
}
