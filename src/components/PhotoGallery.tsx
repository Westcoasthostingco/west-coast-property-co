"use client";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import Lightbox, { type LightboxItem } from "./Lightbox";
import type { ListingPhoto } from "@/lib/listing-content";

type Props = {
  name: string;
  cover: { src: string | null; node: ReactNode };
  photos: ListingPhoto[];
  featured: number[];
  groups: [string, ListingPhoto[]][];
};

// Clickable photo grid for a home's page. Every photo opens the swipeable viewer at that photo.
export default function PhotoGallery({ name, cover, photos, featured, groups }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [rooms, setRooms] = useState(false);
  // The viewer shows the cover first (when it is a real photo), then every listing photo.
  const items: LightboxItem[] = [
    ...(cover.src ? [{ src: cover.src, alt: name }] : []),
    ...photos.map((ph) => ({ src: ph.src, alt: `${name}: ${ph.room.toLowerCase()}`, caption: ph.room })),
  ];
  const offset = cover.src ? 1 : 0;
  const indexOf = (ph: ListingPhoto) => photos.indexOf(ph) + offset;
  const tile = "group/ph relative block w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-deep";

  return (
    <>
      <div className="mt-5 grid gap-2 overflow-hidden rounded-3xl sm:grid-cols-4 sm:grid-rows-2">
        {cover.src ? (
          <button type="button" onClick={() => setOpen(0)} className={`${tile} aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto`} aria-label={`Open photos of ${name}`}>
            {cover.node}
          </button>
        ) : (
          <div className="aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto">{cover.node}</div>
        )}
        {featured.map((i) => photos[i]).filter(Boolean).map((ph) => (
          <button key={ph.src} type="button" onClick={() => setOpen(indexOf(ph))} className={`${tile} hidden aspect-[4/3] sm:block`} aria-label={`Open photo: ${ph.room}`}>
            <Image src={ph.src} alt={`${name}: ${ph.room.toLowerCase()}`} fill sizes="25vw" className="object-cover transition group-hover/ph:scale-[1.03]" />
          </button>
        ))}
      </div>

      {photos.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setOpen(offset)} className="ui inline-flex items-center gap-2 rounded-full bg-deep px-5 py-2.5 text-[0.8rem] font-medium text-white transition hover:bg-dusk">
            View all {photos.length} photos
          </button>
          <button type="button" onClick={() => setRooms((r) => !r)} aria-expanded={rooms} className="ui inline-flex items-center gap-2 rounded-full border border-deep px-5 py-2.5 text-[0.8rem] font-medium text-deep transition hover:bg-deep hover:text-white">
            {rooms ? "Hide rooms" : "Browse by room"}
          </button>
        </div>
      )}
      {rooms && <RoomGroups groups={groups} name={name} onOpen={(ph) => setOpen(indexOf(ph))} />}

      {open !== null && <Lightbox items={items} index={open} name={name} onClose={() => setOpen(null)} />}
    </>
  );
}

function RoomGroups({ groups, name, onOpen }: { groups: [string, ListingPhoto[]][]; name: string; onOpen: (ph: ListingPhoto) => void }) {
  return (
    <div className="mt-6 space-y-10">
      {groups.map(([room, list]) => (
        <div key={room}>
          <h3 className="display text-2xl text-charcoal">{room}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
            {list.map((ph) => (
              <button key={ph.src} type="button" onClick={() => onOpen(ph)} className="group/ph relative aspect-[4/3] overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-deep" aria-label={`Open photo: ${ph.room}`}>
                <Image src={ph.src} alt={`${name}: ${ph.room.toLowerCase()}`} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition group-hover/ph:scale-[1.03]" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
