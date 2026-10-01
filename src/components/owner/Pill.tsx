// Small status label. Teal for good news, mist for neutral, charcoal for attention.
const tones = {
  good: "bg-teal/15 text-teal-dark",
  neutral: "bg-mist text-muted",
  attention: "bg-charcoal/10 text-charcoal",
} as const;

export type Tone = keyof typeof tones;

export default function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`caps-tight inline-block rounded-full px-2.5 py-1 text-[0.6rem] ${tones[tone]}`}>{children}</span>;
}

export const payoutTone = (status: string): Tone =>
  status === "paid" ? "good" : status === "failed" || status === "reversed" ? "attention" : "neutral";

export const stayTone = (status: string): Tone =>
  status === "confirmed" || status === "completed" ? "good" : status === "cancelled" ? "attention" : "neutral";

export const invoiceTone = (status: string): Tone =>
  status === "paid" ? "good" : status === "overdue" ? "attention" : "neutral";
