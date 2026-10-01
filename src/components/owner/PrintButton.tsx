"use client";

// The only client code on the statement page: the browser's print dialog
// doubles as "save as PDF".
export default function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()}
      className="caps-tight rounded-full bg-deep px-5 py-2 text-[0.7rem] text-white transition hover:bg-dusk print:hidden">
      {label}
    </button>
  );
}
