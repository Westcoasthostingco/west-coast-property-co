"use client";
import { useEffect } from "react";
import Link from "next/link";

// Error screen for the portals. Shows the error reference so it can be matched
// to the Vercel runtime log, and lets the user retry.
export default function PortalError({ error, reset, label }: { error: Error & { digest?: string }; reset: () => void; label: string }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6" role="alert">
      <p className="caps text-xs text-deep">{label}</p>
      <h1 className="display mt-3 text-4xl text-charcoal">This page could not load.</h1>
      <p className="mt-4 leading-relaxed text-muted">
        Something failed on the server while loading this page. Try again; if it keeps happening, send the reference below to the site admin.
      </p>
      {error.digest && <p className="ui mt-4 rounded-xl bg-mist px-4 py-3 text-sm text-charcoal">Reference: <code>{error.digest}</code></p>}
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-deep px-5 py-2.5 text-sm text-white hover:bg-dusk">Try again</button>
        <Link href="/" className="rounded-full border border-deep px-5 py-2.5 text-sm text-deep hover:bg-deep hover:text-white">Back to the site</Link>
      </div>
    </div>
  );
}
