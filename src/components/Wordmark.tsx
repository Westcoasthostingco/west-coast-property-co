import Link from "next/link";

// Primary lockup from the brand guide: tracked caps over an italic serif, wave accent.
export default function Wordmark({ size = "sm", reversed = false, href = "/" }: { size?: "sm" | "lg"; reversed?: boolean; href?: string | null }) {
  const color = reversed ? "text-white" : "text-teal";
  const caps = reversed ? "text-white/80" : "text-sky";
  const inner = (
    <span className={`inline-flex flex-col items-center leading-none ${size === "lg" ? "wave" : ""}`}>
      <span className={`caps ${caps} ${size === "lg" ? "text-sm sm:text-base" : "text-[0.6rem]"}`}>West Coast</span>
      <span className={`display ${color} ${size === "lg" ? "text-6xl sm:text-7xl mt-1" : "text-2xl mt-0.5"}`}>Hosting Co</span>
    </span>
  );
  return href ? <Link href={href} aria-label="West Coast Hosting Co home">{inner}</Link> : inner;
}
