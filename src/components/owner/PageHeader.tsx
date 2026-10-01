import type { ReactNode } from "react";

// Eyebrow + headline for every owner page. Actions (buttons, links) sit to the right on wide screens.
export default function PageHeader({ eyebrow, title, intro, actions }: { eyebrow: string; title: string; intro?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="caps text-xs text-deep">{eyebrow}</p>
        <h1 className="display mt-2 text-4xl text-charcoal sm:text-5xl">{title}</h1>
        {intro && <p className="mt-3 leading-relaxed text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2 print:hidden">{actions}</div>}
    </div>
  );
}
