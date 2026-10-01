// Stylized map: Hood Canal, Gig Harbor and Randle (Mount Rainier) with a dashed
// route between the three homes. Not to scale; a brand illustration.
const C = { teal: "#6ba8bc", sky: "#8fc0ce", wave: "#a8d0dc", mist: "#eef5f7", charcoal: "#3a4448", pine: "#5a7580" };

const homes = [
  { x: 150, y: 150, name: "The Leonora", place: "Hood Canal", anchor: "end" as const, dx: -16 },
  { x: 300, y: 215, name: "The Grand View", place: "Gig Harbor", anchor: "start" as const, dx: 16 },
  { x: 460, y: 330, name: "The Bedrock", place: "Randle", anchor: "start" as const, dx: 16 },
];

export default function CoastToCascades({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 420" className={className} role="img" aria-label="Map of the three homes from Hood Canal to Mount Rainier">
      <rect width="600" height="420" rx="24" fill={C.mist} />
      {/* water: Puget Sound and Hood Canal, abstracted */}
      <path d="M190,0 c-30,60 10,90 -20,150 c-25,50 10,80 40,110 c25,25 5,70 -10,90 c-10,15 20,40 30,70 L600,420 L600,0 Z" fill={C.wave} opacity="0.55" />
      <path d="M120,0 c20,70 -10,110 20,170 c20,40 -15,70 -5,110 c8,30 40,40 50,70 c6,20 -10,45 0,70 L0,420 L0,0 Z" fill={C.mist} />
      <path d="M160,20 c-20,50 10,100 -10,150 c-15,40 20,60 30,100" fill="none" stroke={C.sky} strokeWidth="18" strokeLinecap="round" opacity="0.8" />
      {/* Olympics (left) and Cascades with Rainier (right) */}
      <g fill={C.sky}>
        <path d="M20,120 l30,-50 l25,35 l20,-30 l30,45 z" />
        <path d="M430,300 l40,-60 l30,40 l25,-30 l35,50 z" />
      </g>
      <path d="M470,240 l35,-70 l35,70 z" fill={C.teal} />
      <path d="M494,194 l11,-24 l11,24 z" fill="#fbfdfc" />
      <text x="505" y="262" textAnchor="middle" fontSize="11" fontFamily="var(--font-poppins)" letterSpacing="2" fill={C.charcoal} opacity="0.7">MT RAINIER</text>
      {/* route */}
      <path d={`M${homes[0].x},${homes[0].y} Q220,200 ${homes[1].x},${homes[1].y} Q380,260 ${homes[2].x},${homes[2].y}`} fill="none" stroke={C.teal} strokeWidth="2" strokeDasharray="6 7" strokeLinecap="round" />
      {homes.map((h) => (
        <g key={h.name}>
          <circle cx={h.x} cy={h.y} r="14" fill={C.teal} opacity="0.25" />
          <circle cx={h.x} cy={h.y} r="6" fill={C.teal} stroke="#fbfdfc" strokeWidth="2" />
          <text x={h.x + h.dx} y={h.y - 4} textAnchor={h.anchor} fontSize="18" fontStyle="italic" fontFamily="var(--font-playfair)" fill={C.charcoal}>{h.name}</text>
          <text x={h.x + h.dx} y={h.y + 14} textAnchor={h.anchor} fontSize="10" fontFamily="var(--font-poppins)" letterSpacing="2.5" fill={C.teal}>{h.place.toUpperCase()}</text>
        </g>
      ))}
      <text x="40" y="390" fontSize="22" fontStyle="italic" fontFamily="var(--font-playfair)" fill={C.teal}>Coast to Cascades</text>
      <text x="40" y="408" fontSize="9" fontFamily="var(--font-poppins)" letterSpacing="3" fill={C.charcoal} opacity="0.6">GIG HARBOR, WASHINGTON · NOT TO SCALE</text>
    </svg>
  );
}
