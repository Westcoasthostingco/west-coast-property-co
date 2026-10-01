// Small server-safe building blocks for the admin: page header, card, notice,
// status pill, form fields and buttons. Brand: cream page, white cards, teal actions.
import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, intro, actions }: { eyebrow: string; title: string; intro?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="caps text-xs text-deep">{eyebrow}</p>
        <h1 className="display mt-1 text-3xl text-charcoal sm:text-4xl">{title}</h1>
        {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className = "", actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="caps-tight text-[0.68rem] text-deep">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

// Reads ?notice=&ok= written by server actions.
export function Notice({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const text = typeof searchParams.notice === "string" ? searchParams.notice : null;
  if (!text) return null;
  const ok = searchParams.ok !== "0";
  return (
    <div role="status" className={`ui rounded-xl border px-4 py-2.5 text-sm ${ok ? "border-deep/40 bg-mist text-charcoal" : "border-[#e6b8a2] bg-[#fdf3ee] text-charcoal"}`}>
      {text}
    </div>
  );
}

const pillTone: Record<string, string> = {
  confirmed: "bg-mist text-deep", completed: "bg-line/60 text-muted", pending: "bg-[#fdf3ee] text-[#b6633a]", cancelled: "bg-[#fdf3ee] text-[#b6633a]",
  scheduled: "bg-mist text-deep", processing: "bg-mist text-deep", paid: "bg-deep text-white", failed: "bg-[#fdf3ee] text-[#b6633a]", reversed: "bg-line/60 text-muted",
  unassigned: "bg-[#fdf3ee] text-[#b6633a]", assigned: "bg-mist text-deep", in_progress: "bg-deep text-white", done: "bg-line/60 text-muted", skipped: "bg-line/60 text-muted",
  published: "bg-deep text-white", configured: "bg-deep text-white", missing: "bg-[#fdf3ee] text-[#b6633a]",
};
export function Pill({ value }: { value: string }) {
  return <span className={`caps-tight inline-block rounded-full px-2 py-0.5 text-[0.6rem] ${pillTone[value] ?? "bg-mist text-charcoal"}`}>{value.replace("_", " ")}</span>;
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="caps-tight block text-[0.62rem] text-muted">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="ui mt-1 block text-[0.7rem] text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass = "ui w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-charcoal outline-none focus:border-deep focus:ring-2 focus:ring-deep/20";
export const buttonClass = "ui inline-flex items-center justify-center rounded-full bg-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-dusk disabled:opacity-50";
export const ghostButtonClass = "ui inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-2 text-sm text-charcoal transition hover:border-deep hover:text-deep";
export const dangerButtonClass = "ui inline-flex items-center justify-center rounded-full border border-[#e6b8a2] bg-white px-4 py-2 text-sm text-[#b6633a] transition hover:bg-[#fdf3ee]";

export function LinkButton({ href, children, ghost = false }: { href: string; children: ReactNode; ghost?: boolean }) {
  return <Link href={href} className={ghost ? ghostButtonClass : buttonClass}>{children}</Link>;
}

// Dense data table with Poppins numbers; cells may be any node.
export function DataTable({ head, rows, empty = "Nothing here yet." }: { head: string[]; rows: ReactNode[][]; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="ui w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {head.map((h) => <th key={h} className="caps-tight whitespace-nowrap px-4 py-2.5 text-[0.62rem] font-medium text-muted">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={head.length} className="px-4 py-6 text-center text-muted">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line/70 hover:bg-mist/40">
              {r.map((c, j) => <td key={j} className="whitespace-nowrap px-4 py-2 align-middle text-charcoal">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="ui rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{children}</p>;
}
