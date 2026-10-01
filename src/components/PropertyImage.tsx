import Horizon from "./art/Horizon";

// Placeholder scenes until photos are uploaded (property_photos in Supabase Storage).
// `crop` shifts the framing so a gallery of placeholders does not repeat exactly.
const scenes = { "the-grand-view": "harbor", "the-leonora-by-the-sea": "canal", "the-bedrock": "forest", hero: "hero" } as const;
const crops = ["xMidYMid", "xMinYMin", "xMaxYMid", "xMinYMax", "xMaxYMax"] as const;

export default function PropertyImage({ slug, name, className = "", crop = 0 }: { slug: string; name: string; className?: string; crop?: number }) {
  const scene = scenes[slug as keyof typeof scenes] ?? "harbor";
  // Keep caller-supplied positioning (e.g. absolute inset-0) instead of forcing relative.
  const position = /\babsolute\b|\bfixed\b/.test(className) ? "" : "relative";
  return (
    <div className={`overflow-hidden ${position} ${className}`}>
      <Horizon scene={scene} align={crops[crop % crops.length]} label={`${name} illustration`} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
