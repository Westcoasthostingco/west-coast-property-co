// Wander-style search strip: where / dates / guests. Submits to /properties as URL params.
const field = "ui w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-muted";
const label = "caps-tight block text-[0.6rem] text-deep";

export default function SearchBar({ defaults = {} as Record<string, string>, compact = false }) {
  return (
    <form action="/properties" method="get"
      className={`grid w-full gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-lg shadow-teal/10 sm:grid-cols-[1.3fr_1fr_1fr_0.8fr_auto] ${compact ? "" : "max-w-4xl"}`}>
      <label className="bg-white px-5 py-3">
        <span className={label}>Where</span>
        <select name="region" defaultValue={defaults.region ?? ""} className={field}>
          <option value="">Anywhere, coast to Cascades</option>
          <option value="Gig Harbor">Gig Harbor</option>
          <option value="Hood Canal">Hood Canal</option>
          <option value="Randle">Randle, near Mount Rainier</option>
        </select>
      </label>
      <label className="bg-white px-5 py-3"><span className={label}>Check in</span><input name="check_in" type="date" defaultValue={defaults.check_in} className={field} /></label>
      <label className="bg-white px-5 py-3"><span className={label}>Check out</span><input name="check_out" type="date" defaultValue={defaults.check_out} className={field} /></label>
      <label className="bg-white px-5 py-3"><span className={label}>Guests</span><input name="guests" type="number" min={1} max={12} defaultValue={defaults.guests ?? "2"} className={field} /></label>
      <button type="submit" className="caps-tight bg-deep px-6 text-[0.7rem] text-white transition hover:bg-dusk">Search</button>
    </form>
  );
}
