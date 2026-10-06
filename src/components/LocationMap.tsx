// Google map of the home's general area. Uses Google's keyless embed, so there is
// no API key to manage. Coordinates are deliberately approximate (the host
// shares the exact address after booking), and the zoom keeps it that way.
type Props = { lat: number; lng: number; name: string; className?: string };

export default function LocationMap({ lat, lng, name, className = "" }: Props) {
  const q = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const embed = `https://www.google.com/maps?q=${q}&z=12&hl=en&output=embed`;
  const open = `https://www.google.com/maps/search/?api=1&query=${q}`;
  return (
    <div className={className}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-mist sm:aspect-[16/10]">
        <iframe
          src={embed}
          title={`Map of the area around ${name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <div className="ui mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>Approximate area. The host shares the exact address after you book.</span>
        <a href={open} target="_blank" rel="noopener noreferrer" className="text-deep underline decoration-wave underline-offset-4 hover:decoration-deep">Open in Google Maps ↗</a>
      </div>
    </div>
  );
}
