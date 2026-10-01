import type { ReactNode } from "react";

// White card with an optional small uppercase title. The portal's basic surface.
export default function Card({ title, children, className = "", aside }: { title?: string; children: ReactNode; className?: string; aside?: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      {(title || aside) && (
        <div className="mb-4 flex items-baseline justify-between gap-3">
          {title && <h2 className="caps-tight text-[0.65rem] text-sky">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
