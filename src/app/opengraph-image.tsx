import { ImageResponse } from "next/og";
import { SITE_NAME, TAGLINE } from "@/lib/seo";

// Default social card for every page that does not supply its own.
// Brand lockup: tracked caps over an italic serif, wave accent, cream background.
export const alt = `${SITE_NAME}: ${TAGLINE}. Short-term rental management and vacation homes from Hood Canal to Mount Rainier.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const cream = "#fbfdfc";
const charcoal = "#3a4448";
const teal = "#6ba8bc";
const sky = "#8fc0ce";
const wave = "#a8d0dc";
const muted = "#6b777c";

// Playfair Display italic from Google Fonts, when the network allows it at
// build time. Any failure (offline build, timeout) falls back to a serif stack.
async function playfairItalic(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(4000) },
    ).then((r) => (r.ok ? r.text() : ""));
    const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype|woff)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    return res.ok ? res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const playfair = await playfairItalic();
  const display = playfair ? "Playfair Display" : "Georgia, 'Times New Roman', serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: cream,
          color: charcoal,
          position: "relative",
        }}
      >
        {/* Soft horizon band, a nod to the water illustrations on the site */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 180,
            display: "flex",
            background: "linear-gradient(180deg, rgba(168,208,220,0) 0%, rgba(168,208,220,0.35) 100%)",
          }}
        />

        <div style={{ display: "flex", fontSize: 30, letterSpacing: "0.3em", textTransform: "uppercase", color: sky, fontFamily: "sans-serif" }}>
          West Coast
        </div>
        <div style={{ display: "flex", marginTop: 8, fontSize: 150, lineHeight: 1, fontStyle: "italic", color: teal, fontFamily: display, letterSpacing: "-0.01em" }}>
          Hosting Co
        </div>

        <svg width="192" height="20" viewBox="0 0 96 10" style={{ marginTop: 28 }}>
          <path d="M1 6c12-6 20-6 32 0s20 6 32 0 20-6 30 0" fill="none" stroke={wave} strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        <div style={{ display: "flex", marginTop: 34, fontSize: 40, fontStyle: "italic", color: charcoal, fontFamily: display }}>
          {TAGLINE}
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 22, letterSpacing: "0.18em", textTransform: "uppercase", color: muted, fontFamily: "sans-serif" }}>
          Gig Harbor · Hood Canal · Mount Rainier
        </div>
      </div>
    ),
    {
      ...size,
      ...(playfair ? { fonts: [{ name: "Playfair Display", data: playfair, style: "italic" as const, weight: 400 as const }] } : {}),
    },
  );
}
