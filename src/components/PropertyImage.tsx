// Placeholder until photos are uploaded: a sea-to-sky gradient per home.
// Replace with next/image from Supabase Storage (property_photos) in step 4.
const tints: Record<string, string> = {
  "the-grand-view": "from-[#5a93a6] via-[#8fc0ce] to-[#dbe9ee]",
  "the-leonora-by-the-sea": "from-[#4f8aa0] via-[#6ba8bc] to-[#a8d0dc]",
  "the-bedrock": "from-[#3a4448] via-[#5a7580] to-[#a8ccd8]",
  hero: "from-[#3f7f95] via-[#6ba8bc] to-[#c9e2ea]",
};
export default function PropertyImage({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const tint = tints[slug] ?? "from-teal via-sky to-wave";
  return (
    <div role="img" aria-label={`${name} photo`} className={`relative overflow-hidden bg-gradient-to-br ${tint} ${className}`}>
      <span className="caps absolute bottom-3 left-3 text-[0.6rem] text-white/70">Photo coming soon</span>
    </div>
  );
}
