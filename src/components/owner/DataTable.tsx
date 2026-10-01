import type { ReactNode } from "react";

// Table that accepts rich cells (links, pills). Numbers right-align via `align`.
type Column = { label: string; align?: "left" | "right"; wrap?: boolean };

export default function DataTable({ columns, rows, empty = "Nothing here yet.", footer }: {
  columns: Column[];
  rows: ReactNode[][];
  empty?: string;
  footer?: ReactNode[];
}) {
  const cls = (c: Column) => (c.align === "right" ? "text-right" : "text-left");
  const wrap = (c: Column) => (c.wrap ? "whitespace-normal min-w-[9rem]" : "whitespace-nowrap");
  return (
    <div className="relative">
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="ui w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th key={c.label} className={`caps-tight whitespace-nowrap px-4 py-3 text-[0.62rem] font-medium text-deep ${cls(c)}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-muted">{empty}</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line first:border-t-0">
              {r.map((cell, j) => <td key={j} className={`${wrap(columns[j])} px-4 py-3 text-charcoal ${cls(columns[j])}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr className="border-t-2 border-line bg-mist/60 font-medium">
              {footer.map((cell, j) => <td key={j} className={`whitespace-nowrap px-4 py-3 ${cls(columns[j])}`}>{cell}</td>)}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-2xl bg-gradient-to-l from-white to-transparent sm:hidden print:hidden" />
    </div>
  );
}
