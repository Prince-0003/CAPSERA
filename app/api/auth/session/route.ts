import { getCurrentUser } from "@/lib/supabase/server";

export async function GET() {
  const { user } = await getCurrentUser();
  if (!user) return Response.json({ user: null }, { status: 401 });
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  return Response.json({ user: { name, email: user.email ?? "" } });
}
