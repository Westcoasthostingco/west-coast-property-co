"use server";
// Cleaner portal writes. RLS gives cleaners select-only on cleaning_jobs, so
// every write here first proves the signed-in user is the job's cleaner (or an
// admin) and then uses the service role client. In sample mode (no Supabase
// env) the in-memory mockJobs array is mutated so the demo feels live.
import { revalidatePath } from "next/cache";
import { requireRole, type Role } from "./auth";
import { getCleanerForClerkUser, mockCleaners, mockJobs, type Cleaner, type CleaningJob, type CleaningStatus } from "./cleaning";
import { supabaseAdmin, supabaseConfigured } from "./supabase";

export type ActionResult = { ok: boolean; message?: string; sample?: boolean };
export type DoorCodeResult = { code: string | null; message: string };

const PHOTO_BUCKET = "cleaning-photos";
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

// Today's date where the houses are. scheduled_date is a plain calendar date
// in Pacific time, so comparing against the Pacific date avoids revealing the
// code a day early (or hiding it after 4pm) the way a UTC compare would.
const todayPacific = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

type Row = Record<string, unknown>;
const toJob = (r: Row): CleaningJob => ({
  id: r.id as string, propertyId: r.property_id as string, bookingId: r.booking_id as string | null,
  scheduledDate: r.scheduled_date as string, windowStart: r.window_start as string | null, windowEnd: r.window_end as string | null,
  cleanerId: r.cleaner_id as string | null, status: r.status as CleaningStatus,
  checklist: (r.checklist as CleaningJob["checklist"]) ?? [], notes: r.notes as string | null,
  cost: r.cost_cents != null ? (r.cost_cents as number) / 100 : null, completedAt: r.completed_at as string | null,
  nextCheckIn: null,
});

type Authorized = { job: CleaningJob; cleaner: Cleaner | undefined; role: Role; userId: string };

// Loads the job with the service role and checks it belongs to the signed-in
// cleaner. Admins may act on any job (they pass requireRole("cleaner") too).
async function authorizeJob(jobId: string): Promise<Authorized> {
  const { userId, role } = await requireRole("cleaner");
  const cleaner = await getCleanerForClerkUser(userId);
  let job: CleaningJob | undefined;
  if (!supabaseConfigured) {
    job = mockJobs.find((j) => j.id === jobId);
  } else {
    const { data, error } = await supabaseAdmin().from("cleaning_jobs").select("*").eq("id", jobId).maybeSingle();
    if (error) throw new Error(error.message);
    job = data ? toJob(data) : undefined;
  }
  if (!job) throw new Error("We couldn't find that job.");
  if (role !== "admin") {
    if (!cleaner) throw new Error("Your login isn't linked to a cleaner profile yet. Text Christi or Melissa.");
    if (job.cleanerId !== cleaner.id) throw new Error("That job isn't assigned to you.");
  }
  return { job, cleaner, role, userId };
}

function revalidate(jobId: string) {
  revalidatePath("/clean", "layout");
  revalidatePath(`/clean/jobs/${jobId}`);
  revalidatePath("/admin/cleaning");
}

async function updateJob(jobId: string, patch: Partial<CleaningJob>, columns: Row): Promise<void> {
  if (!supabaseConfigured) {
    const j = mockJobs.find((x) => x.id === jobId);
    if (j) Object.assign(j, patch);
    return;
  }
  const { error } = await supabaseAdmin().from("cleaning_jobs").update(columns).eq("id", jobId);
  if (error) throw new Error(error.message);
}

const fail = (e: unknown): ActionResult => ({ ok: false, message: e instanceof Error ? e.message : "Something went wrong. Try again." });

export async function toggleChecklistItem(jobId: string, index: number, done: boolean): Promise<ActionResult> {
  try {
    const { job } = await authorizeJob(jobId);
    if (index < 0 || index >= job.checklist.length) return { ok: false, message: "That item is gone. Reload the page." };
    const checklist = job.checklist.map((c, i) => (i === index ? { ...c, done } : c));
    await updateJob(jobId, { checklist }, { checklist });
    revalidate(jobId);
    return { ok: true, sample: !supabaseConfigured };
  } catch (e) { return fail(e); }
}

export async function saveNotes(jobId: string, notes: string): Promise<ActionResult> {
  try {
    await authorizeJob(jobId);
    const trimmed = notes.trim().slice(0, 4000);
    await updateJob(jobId, { notes: trimmed || null }, { notes: trimmed || null });
    revalidate(jobId);
    return { ok: true, message: "Saved", sample: !supabaseConfigured };
  } catch (e) { return fail(e); }
}

export async function startJob(jobId: string): Promise<ActionResult> {
  try {
    const { job } = await authorizeJob(jobId);
    if (job.status === "done") return { ok: false, message: "This job is already done." };
    await updateJob(jobId, { status: "in_progress" }, { status: "in_progress" });
    revalidate(jobId);
    return { ok: true, message: "Started. Have a good one.", sample: !supabaseConfigured };
  } catch (e) { return fail(e); }
}

// Cost is the assigned cleaner's pay rate at the time the job is marked done.
export async function markDone(jobId: string): Promise<ActionResult> {
  try {
    const { job } = await authorizeJob(jobId);
    if (job.status === "done") return { ok: true, message: "Already marked done." };
    let payRate = 0;
    if (!supabaseConfigured) {
      payRate = mockCleaners.find((c) => c.id === job.cleanerId)?.payRate ?? 0;
    } else if (job.cleanerId) {
      const { data } = await supabaseAdmin().from("cleaners").select("pay_rate_cents").eq("id", job.cleanerId).maybeSingle();
      payRate = ((data?.pay_rate_cents as number | undefined) ?? 0) / 100;
    }
    const completedAt = new Date().toISOString();
    const checklist = job.checklist.map((c) => ({ ...c, done: true }));
    await updateJob(
      jobId,
      { status: "done", completedAt, cost: payRate, checklist },
      { status: "done", completed_at: completedAt, cost_cents: Math.round(payRate * 100), checklist },
    );
    revalidate(jobId);
    return { ok: true, message: "All done. Thank you!", sample: !supabaseConfigured };
  } catch (e) { return fail(e); }
}

export async function reportIssue(jobId: string, formData: FormData): Promise<ActionResult> {
  try {
    const { job, cleaner, userId } = await authorizeJob(jobId);
    const title = String(formData.get("title") ?? "").trim().slice(0, 200);
    const detail = String(formData.get("detail") ?? "").trim().slice(0, 4000);
    if (!title) return { ok: false, message: "Give the issue a short title so the team knows what it is." };
    if (!supabaseConfigured) {
      revalidate(jobId);
      return { ok: true, sample: true, message: "Thanks. (Sample mode: the ticket wasn't saved, but the team would see it here.)" };
    }
    const { error } = await supabaseAdmin().from("maintenance_tickets").insert({
      property_id: job.propertyId, cleaning_job_id: job.id, reported_by: cleaner?.name ?? userId,
      title, detail: detail || null, status: "open",
    });
    if (error) throw new Error(error.message);
    revalidate(jobId);
    revalidatePath("/admin");
    return { ok: true, message: "Thanks. The team has it and will follow up." };
  } catch (e) { return fail(e); }
}

// The door code is only handed out on the day of the clean, to the assigned
// cleaner. The page never renders it; the client asks for it on tap.
export async function revealDoorCode(jobId: string): Promise<DoorCodeResult> {
  try {
    const { job } = await authorizeJob(jobId);
    if (job.scheduledDate !== todayPacific()) return { code: null, message: "Available on the day of the clean." };
    if (!supabaseConfigured) return { code: "4821", message: "Sample door code." };
    const { data, error } = await supabaseAdmin().from("property_integrations").select("manual_door_code").eq("property_id", job.propertyId).maybeSingle();
    if (error) throw new Error(error.message);
    const code = (data?.manual_door_code as string | null | undefined)?.trim();
    if (!code) return { code: null, message: "No door code on file for this house yet. Text Christi or Melissa." };
    return { code, message: "Door code for today." };
  } catch (e) {
    return { code: null, message: e instanceof Error ? e.message : "Couldn't fetch the code. Try again." };
  }
}

// Photos go to Supabase Storage under {jobId}/ and are listed in cleaning_photos.
export async function uploadPhoto(jobId: string, formData: FormData): Promise<ActionResult> {
  try {
    const { job } = await authorizeJob(jobId);
    const file = formData.get("photo");
    if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Pick a photo first." };
    if (!file.type.startsWith("image/")) return { ok: false, message: "Photos only, please." };
    if (file.size > MAX_PHOTO_BYTES) return { ok: false, message: "That photo is over 10 MB. Try a smaller one." };
    if (!supabaseConfigured) return { ok: true, sample: true, message: "Sample mode: not saved." };
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${job.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const admin = supabaseAdmin();
    const { error } = await admin.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { error: rowError } = await admin.from("cleaning_photos").insert({ job_id: job.id, storage_path: path });
    if (rowError && !/does not exist/i.test(rowError.message)) throw new Error(rowError.message);
    revalidate(jobId);
    return { ok: true, message: "Photo saved." };
  } catch (e) { return fail(e); }
}
