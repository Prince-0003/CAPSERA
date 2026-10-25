"use client";

import { useRef, useState, type FormEvent } from "react";
import { CircleAlert } from "lucide-react";
import { checkoutFieldError, contactFields, deliveryFields, type CheckoutField, type CheckoutFieldName } from "@/lib/checkout-fields";

const CONSENT = "paymentMethod";
const CONSENT_ERROR = "Tick this box to confirm you understand this checkout can't place an order yet.";
type ErrorKey = CheckoutFieldName | typeof CONSENT;
type Errors = Partial<Record<ErrorKey, string>>;

/**
 * Setup-only checkout form. Validates with the same rules as /api/checkout (lib/checkout-fields.ts), shows
 * accessible inline errors, and never clears what the customer typed. The API cannot create an order or take
 * payment until a payment provider is configured; its 503 reply is shown as a neutral status.
 */
export function CheckoutForm({ productId, quantity }: { productId: string; quantity: number }) {
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Guards against a second submit (double click / Enter) before the disabled state renders.
  const inFlight = useRef(false);

  const errorCount = Object.keys(errors).length;
  const validationSummary = attempted && errorCount > 0
    ? errorCount === 1 ? "Check the highlighted field to continue." : `Check the ${errorCount} highlighted fields to continue.`
    : "";

  function setFieldError(name: ErrorKey, message: string | null) {
    setErrors((current) => {
      if ((current[name] ?? null) === message) return current;
      const next = { ...current };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    setAttempted(true);
    setRequestError("");
    setStatus("");

    const found: Errors = {};
    for (const field of [...contactFields, ...deliveryFields]) {
      const message = checkoutFieldError(field, (form.elements.namedItem(field.name) as HTMLInputElement | null)?.value);
      if (message) found[field.name] = message;
    }
    if (!(form.elements.namedItem(CONSENT) as HTMLInputElement | null)?.checked) found[CONSENT] = CONSENT_ERROR;
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setRequestError("Your cart quantity is invalid. Return to the cart and try again.");
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const result: { message?: string } = await response.json().catch(() => ({}));
      // 503 means checkout isn't configured yet (a neutral notice); any other failure is a real error.
      if (response.ok || response.status === 503) {
        setStatus(result.message ?? "Checkout is not configured. No order was created and no payment was taken.");
      } else {
        setRequestError(result.message ?? "Check your contact, delivery, and cart details.");
      }
    } catch (caught) {
      console.error("Unable to submit the checkout form.", caught);
      setRequestError("The request could not reach the server. Please try again.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  function renderField(field: CheckoutField) {
    const id = `checkout-${field.name}`;
    const error = errors[field.name];
    return (
      <div className={field.wide ? "form-field checkout-field-wide" : "form-field"} key={field.name}>
        <label className="field-label" htmlFor={id}>
          {field.label}<span className="checkout-required-mark" aria-hidden="true">*</span>
        </label>
        <input
          id={id}
          name={field.name}
          type={field.type ?? "text"}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete}
          autoCapitalize={field.autoCapitalize}
          spellCheck={field.type === "email" || field.name === "postalCode" ? false : undefined}
          required
          minLength={field.minLength}
          maxLength={field.maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          // Check on leaving a field once there's something to check; re-check while an error is showing.
          onBlur={(event) => {
            if (attempted || event.currentTarget.value.trim()) setFieldError(field.name, checkoutFieldError(field, event.currentTarget.value));
          }}
          onChange={(event) => {
            if (errors[field.name]) setFieldError(field.name, checkoutFieldError(field, event.currentTarget.value));
          }}
        />
        {error && <p className="checkout-field-error" id={`${id}-error`}><CircleAlert aria-hidden="true" />{error}</p>}
      </div>
    );
  }

  return (
    <form className="service-form checkout-form" onSubmit={handleSubmit} noValidate>
      <p className="checkout-required-note">All fields are required.</p>
      <fieldset className="checkout-fieldset">
        <legend>Contact</legend>
        <div className="checkout-grid">{contactFields.map(renderField)}</div>
      </fieldset>
      <fieldset className="checkout-fieldset">
        <legend>Delivery address</legend>
        <div className="checkout-grid">{deliveryFields.map(renderField)}</div>
      </fieldset>
      <input name="quantity" type="hidden" value={String(quantity)} />
      <input name="productId" type="hidden" value={productId} />

      <div className="checkout-consent">
        <label className="payment-choice">
          <input
            name={CONSENT}
            type="checkbox"
            required
            aria-invalid={errors[CONSENT] ? true : undefined}
            aria-describedby={errors[CONSENT] ? "checkout-consent-error" : undefined}
            onChange={(event) => { if (attempted) setFieldError(CONSENT, event.currentTarget.checked ? null : CONSENT_ERROR); }}
          />
          <span>Online payment is not yet available. I understand this is a setup-only checkout form.</span>
        </label>
        {errors[CONSENT] && <p className="checkout-field-error" id="checkout-consent-error"><CircleAlert aria-hidden="true" />{errors[CONSENT]}</p>}
      </div>

      {(validationSummary || requestError) && <p className="form-error" role="alert">{requestError || validationSummary}</p>}
      {status && <p className="form-status" role="status">{status}</p>}
      <div className="checkout-submit">
        <button className="button button-navy" type="submit" disabled={submitting} aria-describedby="checkout-submit-note">
          {submitting ? "Checking…" : "Check checkout setup"}
        </button>
        <p className="checkout-submit-note" id="checkout-submit-note">
          This only checks your details against the current setup. No order is created and no payment is taken.
        </p>
      </div>
    </form>
  );
}
