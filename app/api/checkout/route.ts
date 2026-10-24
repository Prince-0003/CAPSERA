import { skincareKit } from "@/lib/product";
import { emailField, isJsonRecord, textField } from "@/lib/request-validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Submit valid checkout details." }, { status: 400 });
  }
  if (
    !isJsonRecord(body) ||
    !emailField(body.email) ||
    !textField(body.name, 2, 120) ||
    !textField(body.address, 3, 200) ||
    !textField(body.city, 2, 100) ||
    !textField(body.region, 2, 100) ||
    !textField(body.postalCode, 3, 20) ||
    !textField(body.country, 2, 100) ||
    body.productId !== skincareKit.id ||
    typeof body.quantity !== "string" ||
    !/^[1-9]\d{0,1}$/.test(body.quantity) ||
    Number(body.quantity) > 99
  ) {
    return Response.json({ message: "Check your contact, delivery, and cart details." }, { status: 400 });
  }
  if (skincareKit.price === null) {
    return Response.json(
      { message: "The kit price is not configured. No order was created and no payment was taken." },
      { status: 503 }
    );
  }
  return Response.json(
    { message: "Payment processing is not configured. No order was created and no payment was taken." },
    { status: 503 }
  );
}
