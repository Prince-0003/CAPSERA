import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { greetingName, parseProfileInput, PHONE_PATTERN } from "@/lib/account-profile";
import { describeAuthError } from "@/lib/auth/errors";
import { authRedirectOrigin, CANONICAL_ORIGIN, safeNextPath } from "@/lib/auth/redirects";
import { passwordField } from "@/lib/request-validation";

describe("auth email redirect origin", () => {
  it("keeps both production hosts", () => {
    assert.equal(authRedirectOrigin("https://capsera.shop/api/auth/signup", { NODE_ENV: "production" }), "https://capsera.shop");
    assert.equal(authRedirectOrigin("https://www.capsera.shop/api/auth/signup", { NODE_ENV: "production" }), "https://www.capsera.shop");
  });

  it("never puts an unknown (forged) host into an email", () => {
    assert.equal(authRedirectOrigin("https://evil.example/api/auth/signup", { NODE_ENV: "production" }), CANONICAL_ORIGIN);
    assert.equal(
      authRedirectOrigin("https://evil.example/x", { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://www.capsera.shop/" }),
      "https://www.capsera.shop",
    );
  });

  it("allows localhost only outside production, and this deployment's own preview URL", () => {
    assert.equal(authRedirectOrigin("http://localhost:3000/api/auth/signup", { NODE_ENV: "development" }), "http://localhost:3000");
    assert.equal(authRedirectOrigin("http://localhost:3000/api/auth/signup", { NODE_ENV: "production" }), CANONICAL_ORIGIN);
    const preview = { NODE_ENV: "production", VERCEL_ENV: "preview", VERCEL_URL: "capsera-git-x.vercel.app" };
    assert.equal(authRedirectOrigin("https://capsera-git-x.vercel.app/api", preview), "https://capsera-git-x.vercel.app");
    assert.equal(authRedirectOrigin("https://other.vercel.app/api", preview), CANONICAL_ORIGIN);
  });
});

describe("post-sign-in redirect path", () => {
  it("accepts same-site paths", () => {
    assert.equal(safeNextPath("/quiz/results?save=1"), "/quiz/results?save=1");
    assert.equal(safeNextPath("/reset-password"), "/reset-password");
  });

  it("rejects anything that could leave the site", () => {
    for (const value of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "account", "", null, 42]) {
      assert.equal(safeNextPath(value), "/account", String(value));
    }
  });
});

describe("auth error messages", () => {
  it("maps Supabase error codes to clear messages and statuses", () => {
    assert.deepEqual(describeAuthError({ code: "invalid_credentials", status: 400 }, "signin"), { status: 401, message: "The email or password is incorrect." });
    assert.equal(describeAuthError({ code: "email_not_confirmed", status: 400 }, "signin").code, "email_not_confirmed");
    assert.equal(describeAuthError({ code: "user_already_exists", status: 422 }, "signup").status, 409);
    assert.equal(describeAuthError({ code: "weak_password", status: 422 }, "signup").status, 400);
    assert.equal(describeAuthError({ code: "over_email_send_rate_limit", status: 429 }, "recovery").status, 429);
    assert.equal(describeAuthError({ name: "AuthRetryableFetchError", status: 0 }, "signin").status, 503);
  });

  it("never echoes unexpected server text", () => {
    const failure = describeAuthError({ code: "something_new", status: 400, message: "internal detail" }, "signup");
    assert.equal(failure.message, "Your account could not be created. Please try again.");
  });
});

describe("passwords", () => {
  it("are used exactly as typed, within 8 to 128 characters", () => {
    assert.equal(passwordField(" secret pass "), " secret pass ");
    assert.equal(passwordField("short"), null);
    assert.equal(passwordField("x".repeat(129)), null);
    assert.equal(passwordField(12345678), null);
  });
});

describe("profile details", () => {
  it("accepts a name and an optional phone number", () => {
    assert.deepEqual(parseProfileInput({ fullName: "  Asha   Rao ", phone: "+91 98765 43210" }), { ok: true, profile: { fullName: "Asha Rao", phone: "+91 98765 43210" } });
    assert.deepEqual(parseProfileInput({ fullName: "Asha Rao", phone: "  " }), { ok: true, profile: { fullName: "Asha Rao", phone: null } });
    assert.deepEqual(parseProfileInput({ fullName: "Asha Rao", phone: "(022) 2345-6789" }), { ok: true, profile: { fullName: "Asha Rao", phone: "(022) 2345-6789" } });
  });

  it("rejects bad names and phone numbers with field messages", () => {
    const result = parseProfileInput({ fullName: "A", phone: "call me" });
    assert.equal(result.ok, false);
    assert.ok(!result.ok && result.errors.fullName && result.errors.phone);
    assert.equal(parseProfileInput({ fullName: "x".repeat(101) }).ok, false);
    assert.equal(parseProfileInput({ fullName: "Asha", phone: "12345" }).ok, false);
    assert.equal(parseProfileInput({ fullName: "Asha", phone: "+1234567890123456" }).ok, false);
    assert.equal(parseProfileInput(null).ok, false);
  });

  it("uses the same phone rule as the database constraint", () => {
    const sql = readFileSync("supabase/migrations/20261027120000_create_profiles.sql", "utf8");
    assert.ok(sql.includes(`phone ~ '${PHONE_PATTERN.source}'`));
  });

  it("greets by first name, falling back to the email", () => {
    assert.equal(greetingName("Asha Rao", "a@example.com"), "Asha");
    assert.equal(greetingName(null, "asha.r@example.com"), "asha.r");
    assert.equal(greetingName("", undefined), "there");
  });
});
