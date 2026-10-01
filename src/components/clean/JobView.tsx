"use client";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type { CleaningJob, CleaningStatus } from "@/lib/cleaning";
import { markDone, reportIssue, revealDoorCode, saveNotes, startJob, toggleChecklistItem, uploadPhoto, type ActionResult } from "@/lib/cleaner-actions";
import type { PropertyInfo } from "@/app/clean/_data";
import StatusChip from "./StatusChip";
import { formatDay, formatTime, relativeDay } from "./dates";

type Props = { job: CleaningJob; property: PropertyInfo; photos: string[]; isToday: boolean; sampleMode: boolean };

const btn = "ui inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-base font-medium transition-colors disabled:opacity-50";
const btnPrimary = `${btn} bg-teal text-white hover:bg-teal-dark active:bg-teal-dark`;
const btnQuiet = `${btn} border border-line bg-white text-charcoal hover:bg-mist active:bg-mist`;

export default function JobView({ job, property, photos, isToday, sampleMode }: Props) {
  const [status, setStatus] = useState<CleaningStatus>(job.status);
  const [checklist, setChecklist] = useState(job.checklist);
  const [notes, setNotes] = useState(job.notes ?? "");
  const [notesState, setNotesState] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [door, setDoor] = useState<{ code: string | null; message: string } | null>(null);
  const [doorBusy, setDoorBusy] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueMsg, setIssueMsg] = useState<string | null>(null);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(photos.length);
  const [pending, start] = useTransition();
  const issueForm = useRef<HTMLFormElement>(null);

  const done = status === "done";
  const remaining = checklist.filter((c) => !c.done).length;

  const show = (r: ActionResult, fallback?: string) => {
    setToast(r.message ?? (r.ok ? fallback ?? "Saved" : "Something went wrong"));
    window.setTimeout(() => setToast(null), 3500);
  };

  const toggle = (i: number) => {
    if (done) return;
    const next = checklist.map((c, idx) => (idx === i ? { ...c, done: !c.done } : c));
    const prev = checklist;
    setChecklist(next);
    start(async () => {
      const r = await toggleChecklistItem(job.id, i, next[i].done);
      if (!r.ok) { setChecklist(prev); show(r); }
    });
  };

  const onStart = () => start(async () => {
    const r = await startJob(job.id);
    if (r.ok) setStatus("in_progress");
    show(r);
  });

  const onDone = () => {
    if (remaining > 0 && !window.confirm(`${remaining} checklist ${remaining === 1 ? "item isn't" : "items aren't"} ticked. Mark the job done anyway?`)) return;
    start(async () => {
      const r = await markDone(job.id);
      if (r.ok) { setStatus("done"); setChecklist((c) => c.map((x) => ({ ...x, done: true }))); }
      show(r);
    });
  };

  const onSaveNotes = () => {
    setNotesState("Saving…");
    start(async () => {
      const r = await saveNotes(job.id, notes);
      setNotesState(r.ok ? "Saved" : r.message ?? "Couldn't save");
      window.setTimeout(() => setNotesState(null), 2500);
    });
  };

  const onDoor = async () => {
    setDoorBusy(true);
    try { setDoor(await revealDoorCode(job.id)); } finally { setDoorBusy(false); }
  };

  const onIssue = (fd: FormData) => start(async () => {
    const r = await reportIssue(job.id, fd);
    setIssueMsg(r.message ?? (r.ok ? "Sent." : "Couldn't send."));
    if (r.ok) { issueForm.current?.reset(); window.setTimeout(() => { setIssueOpen(false); setIssueMsg(null); }, 2500); }
  });

  const onPhotos = (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setPhotoMsg(`Uploading ${list.length} ${list.length === 1 ? "photo" : "photos"}…`);
    start(async () => {
      let saved = 0, last: ActionResult | null = null;
      for (const f of list) {
        const fd = new FormData();
        fd.set("photo", f);
        last = await uploadPhoto(job.id, fd);
        if (last.ok && !last.sample) saved++;
      }
      setPhotoCount((n) => n + saved);
      setPhotoMsg(last?.sample ? "Sample mode: not saved." : last?.ok ? `${saved} ${saved === 1 ? "photo" : "photos"} saved.` : last?.message ?? "Upload failed.");
    });
  };

  return (
    <>
      <header className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="caps-tight text-xs text-sky">{relativeDay(job.scheduledDate)} · {formatDay(job.scheduledDate, { year: true })}</p>
          <StatusChip status={status} />
        </div>
        <h1 className="display mt-2 text-4xl leading-tight">{property.name}</h1>
        <p className="mt-1 text-lg text-muted">{property.address ? `${property.address}, ${property.city}` : property.city}</p>
        {property.address && (
          <a href={`https://maps.apple.com/?q=${encodeURIComponent(`${property.address}, ${property.city}`)}`} target="_blank" rel="noreferrer" className="ui mt-2 inline-flex min-h-[44px] items-center text-base text-teal-dark underline decoration-wave underline-offset-4">Open in Maps</a>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 text-base">
          <div>
            <dt className="caps-tight text-[11px] text-sky">Clean window</dt>
            <dd className="mt-0.5 font-medium">{job.windowStart ? `${formatTime(job.windowStart)} – ${formatTime(job.windowEnd) || "whenever"}` : "Flexible"}</dd>
          </div>
          <div>
            <dt className="caps-tight text-[11px] text-sky">Next check-in</dt>
            <dd className="mt-0.5 font-medium">{job.nextCheckIn ? `${formatDay(job.nextCheckIn)} · ${formatTime(property.checkInTime)}` : "Nobody yet"}</dd>
          </div>
        </dl>
      </header>

      {/* Door code: fetched on tap, only released on the day of the clean. */}
      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="caps text-xs text-sky">Door code</h2>
        {door?.code ? (
          <div className="mt-3">
            <p className="display text-5xl tracking-[0.2em] text-charcoal">{door.code}</p>
            <p className="mt-2 text-sm text-muted">{door.message} Please don&apos;t share it.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {door && <p className="text-base text-muted">{door.message}</p>}
            {!door && <p className="text-base text-muted">{isToday ? "Tap to see today's code." : "Shows up here on the day of the clean."}</p>}
            <button type="button" onClick={onDoor} disabled={doorBusy} className={`${btnQuiet} w-full`}>{doorBusy ? "One sec…" : "Show door code"}</button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="caps text-xs text-sky">Checklist</h2>
          <p className="text-sm text-muted">{remaining === 0 ? "All ticked" : `${remaining} to go`}</p>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {checklist.map((c, i) => (
            <li key={`${c.label}-${i}`}>
              <button
                type="button"
                onClick={() => toggle(i)}
                disabled={done}
                aria-pressed={c.done}
                className="flex min-h-[56px] w-full items-center gap-4 py-2 text-left disabled:cursor-default"
              >
                <span aria-hidden className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${c.done ? "border-teal bg-teal text-white" : "border-line bg-white"}`}>
                  {c.done && <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8" /></svg>}
                </span>
                <span className={`text-lg ${c.done ? "text-muted line-through" : "text-charcoal"}`}>{c.label}</span>
              </button>
            </li>
          ))}
          {checklist.length === 0 && <li className="py-3 text-base text-muted">No checklist for this job.</li>}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="caps text-xs text-sky">Photos</h2>
        <p className="mt-2 text-base text-muted">{photoCount === 0 ? "A few shots of each room when you're done helps the team and the owner." : `${photoCount} ${photoCount === 1 ? "photo" : "photos"} on this job.`}</p>
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.map((src) => (
              <a key={src} href={src} target="_blank" rel="noreferrer" className="relative aspect-square overflow-hidden rounded-lg bg-mist">
                <Image src={src} alt="" fill unoptimized sizes="33vw" className="object-cover" />
              </a>
            ))}
          </div>
        )}
        <label className={`${btnQuiet} mt-4 w-full cursor-pointer`}>
          <input type="file" accept="image/*" capture="environment" multiple className="sr-only" onChange={(e) => { onPhotos(e.target.files); e.target.value = ""; }} disabled={pending} />
          Add photos
        </label>
        {photoMsg && <p className="mt-2 text-sm text-muted">{photoMsg}</p>}
        {sampleMode && !photoMsg && <p className="mt-2 text-sm text-muted">Sample mode: photos aren&apos;t saved.</p>}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <label htmlFor="notes" className="caps text-xs text-sky">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Anything the team or the next cleaner should know."
          className="mt-3 w-full rounded-xl border border-line bg-cream p-3 text-lg leading-relaxed text-charcoal placeholder:text-muted/70 focus:border-teal focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">{notesState ?? (notes !== (job.notes ?? "") ? "Unsaved changes" : "")}</p>
          <button type="button" onClick={onSaveNotes} disabled={pending || notes === (job.notes ?? "")} className={btnQuiet}>Save notes</button>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="caps text-xs text-sky">Something off?</h2>
        {!issueOpen ? (
          <>
            <p className="mt-2 text-base text-muted">Broken, missing, or damaged? Let the team know and they&apos;ll sort it.</p>
            <button type="button" onClick={() => setIssueOpen(true)} className={`${btnQuiet} mt-4 w-full`}>Report an issue</button>
          </>
        ) : (
          <form ref={issueForm} action={onIssue} className="mt-3 space-y-3">
            <div>
              <label htmlFor="issue-title" className="caps-tight text-[11px] text-sky">What is it?</label>
              <input id="issue-title" name="title" required maxLength={200} placeholder="e.g. Hot tub cover torn" className="mt-1 min-h-[48px] w-full rounded-xl border border-line bg-cream px-3 text-lg text-charcoal placeholder:text-muted/70 focus:border-teal focus:outline-none" />
            </div>
            <div>
              <label htmlFor="issue-detail" className="caps-tight text-[11px] text-sky">Details</label>
              <textarea id="issue-detail" name="detail" rows={3} maxLength={4000} placeholder="Where it is, how bad, anything else." className="mt-1 w-full rounded-xl border border-line bg-cream p-3 text-lg leading-relaxed text-charcoal placeholder:text-muted/70 focus:border-teal focus:outline-none" />
            </div>
            {issueMsg && <p className="text-base text-teal-dark">{issueMsg}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setIssueOpen(false); setIssueMsg(null); }} className={`${btnQuiet} flex-1`}>Cancel</button>
              <button type="submit" disabled={pending} className={`${btnPrimary} flex-1`}>Send to team</button>
            </div>
          </form>
        )}
      </section>

      {done && job.completedAt && (
        <p className="text-center text-base text-muted">Finished {new Date(job.completedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" })}.</p>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto max-w-xl">
          {toast && <p role="status" className="mb-2 text-center text-sm text-teal-dark">{toast}</p>}
          {status === "in_progress" ? (
            <button type="button" onClick={onDone} disabled={pending} className={`${btnPrimary} min-h-[56px] w-full text-lg`}>{pending ? "Saving…" : "Mark done"}</button>
          ) : done ? (
            <div className={`${btn} min-h-[56px] w-full border border-wave bg-mist text-lg text-teal-dark`}>Done. Thank you!</div>
          ) : (
            <button type="button" onClick={onStart} disabled={pending} className={`${btnPrimary} min-h-[56px] w-full text-lg`}>{pending ? "Starting…" : "Start job"}</button>
          )}
        </div>
      </div>
    </>
  );
}
