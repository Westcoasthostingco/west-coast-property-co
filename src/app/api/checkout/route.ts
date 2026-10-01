import { NextResponse } from "next/server";
import { createCheckout, parseCheckoutForm } from "@/lib/checkout";

// POST /api/checkout: JSON API for non-browser clients. The website's booking
// panel uses the server action in src/app/properties/[slug]/actions.ts instead,
// so guests see errors inline rather than this JSON.
export async function POST(req: Request) {
  const result = await createCheckout(parseCheckoutForm(await req.formData()));
  if ("url" in result) return NextResponse.redirect(result.url, { status: 303 });
  return NextResponse.json({ error: result.error, field: result.field }, { status: result.status });
}
