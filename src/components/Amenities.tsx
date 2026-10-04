// Amenities, light on the eye: up to eight standout amenities as icon tiles, and
// the full list from the listing tucked behind "Show all", as compact chips.

type Group = { title: string; items: string[] };

// Standouts in priority order. The first match for each wins; items can only be used once.
const FEATURED: { match: RegExp; icon: IconName; label?: string }[] = [
  { match: /^Hot tub/i, icon: "hottub" },
  { match: /^Waterfront/i, icon: "water" },
  { match: /^Beach access/i, icon: "beach" },
  { match: /^(Private patio or balcony|Balcony|Deck)/i, icon: "deck", label: "Private deck" },
  { match: /^Fire pit/i, icon: "fire" },
  { match: /^Indoor fireplace/i, icon: "fireplace", label: "Fireplace" },
  { match: /^Kitchen\b/i, icon: "kitchen", label: "Full kitchen" },
  { match: /^Wifi/i, icon: "wifi" },
  { match: /^Free parking/i, icon: "car", label: "Free parking" },
  { match: /^Washer/i, icon: "washer", label: "Washer" },
  { match: /^Air conditioning/i, icon: "snow" },
  { match: /^BBQ grill/i, icon: "grill" },
  { match: /^Pets allowed/i, icon: "paw", label: "Pets allowed" },
  { match: /^Self check-in/i, icon: "key" },
  { match: /^Board games/i, icon: "dice", label: "Games" },
  { match: /^TV\b/i, icon: "tv" },
];

const clean = (s: string) => s.replace(/\s*\([^)]*\)\s*$/, "");

export default function Amenities({ groups, notIncluded = [] }: { groups: Group[]; notIncluded?: string[] }) {
  const all = groups.flatMap((g) => g.items);
  const used = new Set<string>();
  const featured: { label: string; icon: IconName }[] = [];
  for (const f of FEATURED) {
    if (featured.length >= 8) break;
    const hit = all.find((a) => !used.has(a) && f.match.test(a));
    if (hit) {
      used.add(hit);
      featured.push({ label: f.label ?? clean(hit), icon: f.icon });
    }
  }

  return (
    <div>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {featured.map((f) => (
          <li key={f.label} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4">
            <Icon name={f.icon} />
            <span className="ui text-sm text-charcoal">{f.label}</span>
          </li>
        ))}
      </ul>

      <details className="group mt-5">
        <summary className="ui inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-deep px-5 py-2.5 text-[0.8rem] font-medium text-deep transition hover:bg-deep hover:text-white">
          <span className="group-open:hidden">Show all {all.length} amenities</span>
          <span className="hidden group-open:inline">Hide amenities</span>
        </summary>
        <dl className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
          {groups.map((g) => (
            <div key={g.title} className="grid gap-3 px-5 py-4 sm:grid-cols-[11rem_1fr]">
              <dt className="caps-tight pt-1 text-[0.62rem] text-muted">{g.title}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {g.items.map((a) => (
                  <span key={a} className="ui rounded-full bg-mist px-3 py-1 text-xs text-charcoal">{clean(a)}</span>
                ))}
              </dd>
            </div>
          ))}
          {notIncluded.length > 0 && (
            <div className="grid gap-3 px-5 py-4 sm:grid-cols-[11rem_1fr]">
              <dt className="caps-tight pt-1 text-[0.62rem] text-muted">Not included</dt>
              <dd className="flex flex-wrap gap-1.5">
                {notIncluded.map((a) => (
                  <span key={a} className="ui rounded-full border border-line px-3 py-1 text-xs text-muted line-through decoration-muted/50">{clean(a)}</span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </details>
    </div>
  );
}

type IconName = "hottub" | "water" | "beach" | "deck" | "fire" | "fireplace" | "kitchen" | "wifi" | "car" | "washer" | "snow" | "grill" | "paw" | "key" | "dice" | "tv";

// Simple 24px line icons in the site's deep teal.
const paths: Record<IconName, string> = {
  hottub: "M3 13h18v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-4ZM7 9c0-1.5 1-1.5 1-3M11 9c0-1.5 1-1.5 1-3M15 9c0-1.5 1-1.5 1-3",
  water: "M2 9c2 0 2-1.5 4-1.5S8 9 10 9s2-1.5 4-1.5S16 9 18 9s2-1.5 4-1.5M2 14c2 0 2-1.5 4-1.5S8 14 10 14s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 19c2 0 2-1.5 4-1.5S8 19 10 19s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5",
  beach: "M12 21V9M4 9a8 6 0 0 1 16 0H4ZM3 21h18",
  deck: "M3 11h18M5 11v9M19 11v9M3 16h18M8 4l-3 7M16 4l3 7M8 4h8",
  fire: "M12 21c-3.5 0-6-2.3-6-5.5C6 11 10 9 10 4c3 2 8 5.5 8 11.5 0 3.2-2.5 5.5-6 5.5ZM12 21c-1.4 0-2.5-1-2.5-2.5 0-2 2.5-3 2.5-5 1.5 1 2.5 2.7 2.5 5 0 1.5-1.1 2.5-2.5 2.5Z",
  fireplace: "M3 21V5h18v16M3 9h18M7 21v-8h10v8M12 20c-1.2 0-2-.8-2-1.8 0-1.4 2-2 2-3.2 1 .7 2 1.8 2 3.2 0 1-.8 1.8-2 1.8Z",
  kitchen: "M4 10h16v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8ZM2 10h20M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2",
  wifi: "M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01",
  car: "M5 16h14M3 16v-3l2-5h14l2 5v3a1 1 0 0 1-1 1h-1M4 17H3M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  washer: "M4 3h16v18H4V3ZM4 7h16M12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM7 5h.01M10 5h.01",
  snow: "M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2",
  grill: "M4 10h16a8 8 0 0 1-16 0ZM12 18v3M8 17l-2 4M16 17l2 4M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2",
  paw: "M8 9.5a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4ZM16 9.5a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4ZM4.5 13a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4ZM19.5 13a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4ZM12 12c-3 0-5 3.5-5 5.5S9 20 12 20s5-.5 5-2.5S15 12 12 12Z",
  key: "M15 9a4 4 0 1 1-3.5 6L4 22.5V19h3v-3h3l1.5-1.5A4 4 0 0 1 15 9ZM16.5 7.5h.01",
  dice: "M4 4h16v16H4V4ZM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01",
  tv: "M3 6h18v12H3V6ZM8 21h8M12 18v3",
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-deep" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
