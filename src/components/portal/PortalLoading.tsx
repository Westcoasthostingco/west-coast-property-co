// Shown immediately when a portal page is requested, so a click always gives
// feedback while the server loads the data.
export default function PortalLoading({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6" role="status" aria-live="polite">
      <p className="caps text-xs text-deep">{label}</p>
      <div className="mt-4 flex items-center gap-3 text-muted">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-wave border-t-deep" aria-hidden="true" />
        <span className="ui text-sm">Loading…</span>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist" />)}
      </div>
    </div>
  );
}
