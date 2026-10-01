"use server";
import { redirect } from "next/navigation";
import { createCheckout, parseCheckoutForm } from "@/lib/checkout";

export type BookingState = { error?: string; field?: string };

export async function startCheckout(_prev: BookingState, form: FormData): Promise<BookingState> {
  const result = await createCheckout(parseCheckoutForm(form));
  if ("url" in result) redirect(result.url); // throws NEXT_REDIRECT; must stay outside try/catch
  return { error: result.error, field: result.field };
}
