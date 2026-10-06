import Image from "next/image";
import Horizon from "./art/Horizon";

// Real photos live in public/photos/<slug>-<n>.webp (and later in Supabase Storage
// via property_photos). When none exists for a slot, an illustrated scene stands in.
const scenes = { "the-grand-view": "harbor", "the-leonora-by-the-sea": "canal", "the-bedrock": "forest", "the-bay-house": "harbor", hero: "hero" } as const;
const crops = ["xMidYMid", "xMinYMin", "xMaxYMid", "xMinYMax", "xMaxYMax"] as const;
// Photos present on disk, by slug. Add a filename here when you add a photo.
const photos: Record<string, string[]> = {
  "the-grand-view": ["/photos/the-grand-view-1.webp"],
  "the-leonora-by-the-sea": ["/photos/the-leonora-by-the-sea-1.webp"],
  "the-bedrock": ["/photos/the-bedrock-1.webp"],
  "the-bay-house": ["/photos/the-bay-house-1.webp"],
  hero: ["/photos/the-grand-view-1.webp"],
};

/** Public path of a home's card/hero photo, or null when only the illustration exists. */
export function coverPhoto(slug: string): string | null {
  return photos[slug]?.[0] ?? null;
}

export default function PropertyImage({ slug, name, className = "", crop = 0, priority = false, sizes = "(min-width: 1024px) 33vw, 100vw" }: { slug: string; name: string; className?: string; crop?: number; priority?: boolean; sizes?: string }) {
  const scene = scenes[slug as keyof typeof scenes] ?? "harbor";
  const src = photos[slug]?.[crop];
  const position = /\babsolute\b|\bfixed\b/.test(className) ? "" : "relative";
  return (
    <div className={`overflow-hidden ${position} ${className}`}>
      {src ? (
        <Image src={src} alt={name} fill priority={priority} sizes={sizes} className="object-cover" />
      ) : (
        <Horizon scene={scene} align={crops[crop % crops.length]} label={`${name} illustration`} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
