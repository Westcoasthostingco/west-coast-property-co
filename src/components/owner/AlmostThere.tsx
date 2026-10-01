// Shown when a signed-in user has the owner role but no owner row yet.
export default function AlmostThere() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="caps text-xs text-deep">Owner portal</p>
      <h1 className="display mt-2 text-4xl text-charcoal">Almost there</h1>
      <p className="mt-4 leading-relaxed text-muted">
        Your login is not linked to an owner record yet. The team will finish that for you, usually within a day.
        If it has been longer, just reply to your welcome email and we will sort it out.
      </p>
    </div>
  );
}
