import { checkoutFieldError, checkoutFields } from "@/lib/checkout-fields";
import { skincareKit } from "@/lib/product";
import { isJsonRecord } from "@/lib/request-validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit valid checkout details." }, { status: 400 });
  }
  if (
    !isJsonRecord(body) ||
    // Same field rules as the checkout form (lib/checkout-fields.ts).
    checkoutFields.some((field) => checkoutFieldError(field, body[field.name]) !== null) ||
    body.productId !== skincareKit.id ||
    typeof body.quantity !== "string" ||
    !/^[1-9]\d{0,1}$/.test(body.quantity) ||
    Number(body.quantity) > 99
  ) {
    return Response.json({ message: "Check your contact, delivery, and cart details." }, { status: 400 });
  }
  return Response.json(
    { message: "Payment processing is not configured. No order was created and no payment was taken." },
    { status: 503 }
  );
}
