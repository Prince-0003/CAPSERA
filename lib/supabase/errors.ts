/** True when a PostgREST/Postgres error means the table doesn't exist yet (the migrations haven't been applied). */
export function isMissingTableError(error: { code?: string } | null | undefined) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}
