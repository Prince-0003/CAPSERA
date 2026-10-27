import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

/**
 * Supabase client for Client Components. It shares the session cookies with the server client, so it sees the
 * same signed-in user. Uses only the publishable key. Returns null when Supabase isn't configured.
 * The site's own forms go through the /api routes, which validate input on the server first.
 */
export function createClient() {
  const config = getSupabaseConfig();
  return config ? createBrowserClient(config.url, config.key) : null;
}
