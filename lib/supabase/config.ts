/**
 * Public Supabase settings: the project URL and the publishable key are designed to be visible in the browser
 * (Row Level Security protects the data). Returns null until both are set, so the rest of the site keeps working
 * without customer accounts, e.g. in a fresh checkout or a preview deployment without the variables.
 * Never put the secret / service-role key in a NEXT_PUBLIC_ variable.
 */
export function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

/** Reply for account features when the Supabase variables are missing (503 = "not configured", shown as a neutral notice). */
export function accountsNotConfigured() {
  return Response.json(
    { message: "Customer accounts aren't available right now. Please try again later." },
    { status: 503 },
  );
}
