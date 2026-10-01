// Minimal iCalendar support for channel calendar sync. No dependency.
// Airbnb, Vrbo and Booking.com publish one VEVENT per reserved or blocked range,
// with DTSTART/DTEND as dates (DTEND is the check-out day, exclusive).

export type IcalEvent = { uid: string; start: string; end: string; summary: string };

const unfold = (text: string) => text.replace(/\r?\n[ \t]/g, "");
const toISO = (v: string) => {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : v.slice(0, 10);
};

export function parseIcal(text: string): IcalEvent[] {
  const out: IcalEvent[] = [];
  for (const block of unfold(text).split("BEGIN:VEVENT").slice(1)) {
    const body = block.split("END:VEVENT")[0];
    const get = (key: string) => body.match(new RegExp(`^${key}[^:]*:(.*)$`, "m"))?.[1]?.trim() ?? "";
    const start = get("DTSTART"), end = get("DTEND");
    if (!start) continue;
    out.push({ uid: get("UID") || `${start}-${end}`, start: toISO(start), end: toISO(end || start), summary: get("SUMMARY") });
  }
  return out;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const fold = (line: string) => line.match(/.{1,73}/g)?.join("\r\n ") ?? line;

export function buildIcal(name: string, stays: { uid: string; start: string; end: string; summary: string }[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//West Coast Hosting Co//Calendar//EN", "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${esc(name)}`,
    ...stays.flatMap((s) => [
      "BEGIN:VEVENT",
      `UID:${s.uid}@westcoasthostingco.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${s.start.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${s.end.replace(/-/g, "")}`,
      `SUMMARY:${esc(s.summary)}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
