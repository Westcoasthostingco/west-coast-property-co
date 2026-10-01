import Stripe from "stripe";

// Server-only Stripe client. Platform account; owners are Connect Express accounts.
let client: Stripe | undefined;
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return (client ??= new Stripe(key, { appInfo: { name: "West Coast Property Co" } }));
}

export const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

// Management fee kept by the platform; everything else transfers to the owner.
export const feeCents = (grossCents: number, feePercent: number) => Math.round((grossCents * feePercent) / 100);

export const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);

// Owner funds are released the day after check-in, once the guest has arrived.
export const releaseDate = (checkIn: string) => {
  const d = new Date(checkIn);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};
