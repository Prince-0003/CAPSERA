import { cookies } from "next/headers";
import { createSession, deleteSession, getAccountForSession, SESSION_MAX_AGE_SECONDS } from "@/lib/auth-store";

export const SESSION_COOKIE = "capsera_session";

/** The signed-in account for this request, from the HttpOnly session cookie. */
export async function getSessionAccount() {
  const store = await cookies();
  return getAccountForSession(store.get(SESSION_COOKIE)?.value);
}

export async function startSession(accountId: string) {
  const token = await createSession(accountId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  const store = await cookies();
  await deleteSession(store.get(SESSION_COOKIE)?.value);
  store.delete(SESSION_COOKIE);
}
