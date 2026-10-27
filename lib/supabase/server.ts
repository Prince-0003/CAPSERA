import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions, bound to this request's cookies.
 * Create one per request. Returns null when Supabase isn't configured.
 */
export async function createClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't write cookies. middleware.ts refreshes the session cookies instead.
        }
      },
    },
  });
}

export type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;

/**
 * The signed-in user, verified with the Supabase Auth server (never trust an unverified cookie on the server).
 * `user` is null when signed out, when the session has expired, or when Supabase isn't configured.
 */
export async function getCurrentUser(): Promise<{ supabase: ServerSupabase | null; user: User | null }> {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };
  const { data, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : data.user };
}
