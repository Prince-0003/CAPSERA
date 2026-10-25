"use client";

import { useState } from "react";

/** A plain form POST, so signing out works even before hydration or without JavaScript. */
export function SignOutButton({ className = "account-nav-link account-nav-button" }: { className?: string }) {
  const [pending, setPending] = useState(false);

  return (
    <form className="sign-out-form" method="post" action="/api/auth/signout" onSubmit={() => setPending(true)}>
      <button type="submit" className={className} disabled={pending} aria-busy={pending}>
        {pending ? "Signing out…" : "Sign Out"}
      </button>
    </form>
  );
}
