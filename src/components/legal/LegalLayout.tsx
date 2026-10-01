import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_CONTACT, LEGAL_UPDATED, POLICY_VERSION, formatLegalDate, legalLinks } from "@/lib/legal";

export type LegalSection = { id: string; title: string };

// Shared shell for /legal/* pages: eyebrow, display title, "Last updated" chip,
// a table of contents (sticky on desktop, collapsible on phones), and the review note every page must end with.
export default function LegalLayout({ eyebrow, title, intro, sections, children }: { eyebrow: string; title: string; intro?: string; sections: LegalSection[]; children: ReactNode }) {
  const otherPages = legalLinks.slice(0, 3);
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="max-w-3xl">
        <p className="caps text-xs text-deep">{eyebrow}</p>
        <h1 className="display mt-2 text-4xl text-deep sm:text-5xl">{title}</h1>
        <div className="ui mt-5 flex flex-wrap items-center gap-2 text-[0.7rem]">
          <span className="caps-tight rounded-full border border-line bg-mist px-3 py-1 text-deep">Last updated {formatLegalDate(LEGAL_UPDATED)}</span>
          <span className="caps-tight rounded-full border border-line px-3 py-1 text-muted">Version {POLICY_VERSION}</span>
        </div>
        {intro && <p className="mt-6 text-lg leading-relaxed text-muted">{intro}</p>}
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:self-start lg:sticky lg:top-24">
          <details className="rounded-2xl border border-line bg-white p-4 lg:hidden" open={false}>
            <summary className="caps-tight cursor-pointer text-[0.7rem] text-deep">On this page</summary>
            <Toc sections={sections} />
          </details>
          <div className="hidden lg:block">
            <p className="caps-tight text-[0.7rem] text-muted">On this page</p>
            <Toc sections={sections} />
            <p className="caps-tight mt-8 text-[0.7rem] text-muted">Also see</p>
            <ul className="ui mt-3 space-y-2 text-sm">
              {otherPages.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-deep hover:text-dusk hover:underline">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </aside>

        <article className="max-w-3xl">
          <div className="space-y-12 text-[1.05rem] leading-relaxed text-charcoal">{children}</div>

          <aside className="mt-16 rounded-2xl border border-wave bg-mist p-6 text-base leading-relaxed">
            <p className="caps-tight text-[0.7rem] text-deep">Please note</p>
            <p className="mt-2">This page is a plain-language summary prepared for West Coast Hosting Co and has not yet been reviewed by a Washington attorney. Have it reviewed before relying on it.</p>
          </aside>

          <p className="mt-10 text-sm text-muted">
            Questions about this page: <a href={`mailto:${LEGAL_CONTACT.email}`} className="text-deep hover:underline">{LEGAL_CONTACT.email}</a> or {LEGAL_CONTACT.phone}. {LEGAL_CONTACT.company}, {LEGAL_CONTACT.location}.
          </p>
        </article>
      </div>
    </main>
  );
}

function Toc({ sections }: { sections: LegalSection[] }) {
  return (
    <ol className="ui mt-3 space-y-2 text-sm">
      {sections.map((s, i) => (
        <li key={s.id} className="flex gap-2">
          <span className="w-5 shrink-0 tabular-nums text-deep">{i + 1}</span>
          <a href={`#${s.id}`} className="text-charcoal hover:text-deep hover:underline">{s.title}</a>
        </li>
      ))}
    </ol>
  );
}

// Content primitives. Tailwind utilities only; no typography plugin.
export function Section({ id, title, kicker, children }: { id: string; title: string; kicker?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      {kicker && <p className="caps text-[0.65rem] text-deep">{kicker}</p>}
      <h2 className="display mt-1 text-3xl text-charcoal">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pt-2">
      <h3 className="caps-tight text-[0.75rem] text-deep">{title}</h3>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

export function Clauses({ children, start }: { children: ReactNode; start?: number }) {
  return <ol start={start} className="list-decimal space-y-3 pl-6 marker:font-[family-name:var(--font-caps)] marker:text-sm marker:text-deep">{children}</ol>;
}

export function Bullets({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-6 marker:text-wave">{children}</ul>;
}

export function Callout({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border-l-4 border-deep bg-white px-5 py-4 shadow-sm shadow-teal/5">{children}</div>;
}

// A compact schedule (tiers, penalties). Rows are [label, value, note?].
export function Schedule({ rows, head }: { rows: [string, string, string?][]; head: [string, string] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <table className="w-full text-left text-base">
        <thead className="caps-tight bg-mist text-[0.65rem] text-muted">
          <tr><th className="px-4 py-3 font-medium">{head[0]}</th><th className="px-4 py-3 font-medium">{head[1]}</th></tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {rows.map(([label, value, note]) => (
            <tr key={label}>
              <td className="px-4 py-3 align-top">{label}{note && <span className="block text-sm text-muted">{note}</span>}</td>
              <td className="px-4 py-3 align-top font-medium text-deep">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
