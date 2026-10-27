import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Pages and API routes only: static files, images and the Next.js build output never need the session.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|img/|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
