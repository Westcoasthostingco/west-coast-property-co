import type { ReactNode } from "react";

// Table that accepts rich cells (links, pills). Numbers right-align via `align`.
type Column = { label: string; align?: "left" | "right" };

export default function DataTable({ columns, rows, empty = "Nothing here yet.", footer }: {
  columns: Column[];
  rows: ReactNode[][];
  empty?: string;
  footer?: ReactNode[];
}) {
  const cls = (c: Column) => (c.align === "right" ? "text-right" : "text-left");
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="ui w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th key={c.label} className={`caps-tight whitespace-nowrap px-4 py-3 text-[0.6rem] font-medium text-sky ${cls(c)}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-muted">{empty}</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line first:border-t-0">
              {r.map((cell, j) => <td key={j} className={`whitespace-nowrap px-4 py-3 text-charcoal ${cls(columns[j])}`}>{cell}</td>)}
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
  );
}
