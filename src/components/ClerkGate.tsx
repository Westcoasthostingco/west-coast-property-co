"use client";
import { useEffect, useState } from "react";
import { ClerkFailed, ClerkLoaded, ClerkLoading, useAuth } from "@clerk/nextjs";

// Wraps Clerk's sign-in and sign-up widgets. Clerk's browser script loads from
// the Clerk frontend API; while it loads a spinner shows, and if it has not
// loaded after 8 seconds (or reports a failure) the page says so instead of
// staying blank.
function frontendHost() {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const m = pk && /^pk_(?:test|live)_(.+)$/.exec(pk);
  try { return m ? atob(m[1]).replace(/\$$/, "") : "the sign-in service"; } catch { return "the sign-in service"; }
}

// Technical details for the failure message, read from the page itself: which
// Clerk script the page tried to load and whether it ran.
function readDiagnostics(): string | null {
  if (typeof window === "undefined") return null;
  const tag = document.querySelector<HTMLScriptElement>("script[data-clerk-js-script], script[src*='clerk-js'], script[src*='clerk.browser']");
  const w = window as unknown as { Clerk?: { loaded?: boolean; version?: string } };
  return [
    `page: ${location.host}`,
    `script: ${tag?.src ?? "not added to page"}`,
    `script ran: ${w.Clerk ? "yes" : "no"}`,
    w.Clerk ? `clerk loaded: ${w.Clerk.loaded ? "yes" : "no"}${w.Clerk.version ? ` (v${w.Clerk.version})` : ""}` : null,
  ].filter(Boolean).join(" · ");
}

// The failure message only renders in the browser (after Clerk fails or times
// out), so the details can be read once when it first renders.
function useDiagnostics() {
  const [info] = useState(readDiagnostics);
  return info;
}

function Failed() {
  const info = useDiagnostics();
  return (
    <div className="max-w-md text-center" role="alert">
      <h1 className="display text-3xl text-charcoal">Sign-in couldn&apos;t load</h1>
      <p className="mt-3 leading-relaxed text-muted">
        Your browser could not reach <code className="text-charcoal">{frontendHost()}</code>. Refresh the page; if it keeps happening, try another browser or turn off ad blockers for this site, or email hello@westcoasthostingco.com.
      </p>
      {info && <p className="ui mt-4 break-all rounded-xl bg-mist px-4 py-3 text-left text-xs text-charcoal">{info}</p>}
    </div>
  );
}

export default function ClerkGate({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (isLoaded) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [isLoaded]);

  return (
    <>
      {/* ClerkLoading hides as soon as Clerk is ready or reports a failure, so the
          spinner and the failure message never show together. */}
      <ClerkLoading>
        {timedOut ? <Failed /> : (
          <div className="ui flex items-center gap-3 text-sm text-muted" role="status">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-wave border-t-deep" aria-hidden="true" />
            Loading sign-in…
          </div>
        )}
      </ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
      <ClerkFailed><Failed /></ClerkFailed>
    </>
  );
}
