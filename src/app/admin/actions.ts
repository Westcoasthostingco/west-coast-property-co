"use server";
// Admin server actions. Each one re-checks the admin role (actions are reachable
// by direct POST), performs the write through src/lib/admin.ts, revalidates, and
// redirects back with a short notice in the query string so pages stay server
// components with no client state.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  addBookingNote, assignCleaner, cancelBooking, createManualBooking, deletePropertyPhoto, manualBookingFromForm,
  ownerInputFromForm, propertyInputFromForm, refundBooking, retryPayout, runPayoutsNow, saveOwner, saveProperty,
  setJobStatus, setReviewPublished, uploadPropertyPhoto, type ActionResult,
} from "@/lib/admin";
import type { CleaningStatus } from "@/lib/cleaning";

async function actor() {
  const { userId } = await requireRole("admin");
  return userId;
}

// Redirect target carries the notice; the page renders it with <Notice />.
function finish(path: string, r: ActionResult, extra?: Record<string, string>): never {
  const url = new URL(path, "http://x");
  url.searchParams.set("notice", r.message);
  url.searchParams.set("ok", r.ok ? "1" : "0");
  for (const [k, v] of Object.entries(extra ?? {})) url.searchParams.set(k, v);
  revalidatePath("/admin", "layout");
  redirect(url.pathname + url.search);
}

const safeReturn = (v: FormDataEntryValue | null, fallback: string) => {
  const s = String(v ?? "");
  return s.startsWith("/admin") ? s : fallback;
};

// ---- Properties ----
export async function savePropertyAction(id: string | null, fd: FormData) {
  const who = await actor();
  const r = await saveProperty(who, id, propertyInputFromForm(fd));
  finish(r.ok && r.id ? `/admin/properties/${r.id}` : id ? `/admin/properties/${id}` : "/admin/properties/new", r);
}

export async function uploadPhotoAction(propertyId: string, fd: FormData) {
  const who = await actor();
  const file = fd.get("photo");
  const r = file instanceof File ? await uploadPropertyPhoto(who, propertyId, file, String(fd.get("alt") ?? "")) : { ok: false, message: "Choose a photo first." };
  finish(`/admin/properties/${propertyId}`, r);
}

export async function deletePhotoAction(propertyId: string, photoId: string) {
  const who = await actor();
  finish(`/admin/properties/${propertyId}`, await deletePropertyPhoto(who, photoId));
}

// ---- Bookings ----
export async function addNoteAction(bookingId: string, fd: FormData) {
  const who = await actor();
  finish(`/admin/bookings/${bookingId}`, await addBookingNote(who, bookingId, String(fd.get("note") ?? "")));
}

export async function cancelBookingAction(bookingId: string) {
  const who = await actor();
  finish(`/admin/bookings/${bookingId}`, await cancelBooking(who, bookingId));
}

export async function refundBookingAction(bookingId: string) {
  const who = await actor();
  finish(`/admin/bookings/${bookingId}`, await refundBooking(who, bookingId));
}

export async function createBookingAction(fd: FormData) {
  const who = await actor();
  const r = await createManualBooking(who, manualBookingFromForm(fd));
  finish(r.ok && r.id ? `/admin/bookings/${r.id}` : "/admin/bookings/new", r);
}

// ---- Owners ----
export async function saveOwnerAction(id: string | null, fd: FormData) {
  const who = await actor();
  const r = await saveOwner(who, id, ownerInputFromForm(fd));
  finish(r.ok && r.id ? `/admin/owners/${r.id}` : id ? `/admin/owners/${id}` : "/admin/owners/new", r);
}

// ---- Cleaning ----
export async function assignCleanerAction(fd: FormData) {
  const who = await actor();
  const jobId = String(fd.get("jobId") ?? "");
  const cleanerId = String(fd.get("cleanerId") ?? "") || null;
  finish(safeReturn(fd.get("return"), "/admin/cleaning"), await assignCleaner(who, jobId, cleanerId));
}

export async function setJobStatusAction(fd: FormData) {
  const who = await actor();
  const jobId = String(fd.get("jobId") ?? "");
  const status = String(fd.get("status") ?? "") as CleaningStatus;
  const valid: CleaningStatus[] = ["unassigned", "assigned", "in_progress", "done", "skipped"];
  const r = valid.includes(status) ? await setJobStatus(who, jobId, status) : { ok: false, message: "Unknown status." };
  finish(safeReturn(fd.get("return"), "/admin/cleaning"), r);
}

// ---- Payouts ----
export async function runPayoutsAction() {
  const who = await actor();
  finish("/admin/payouts", await runPayoutsNow(who));
}

export async function retryPayoutAction(payoutId: string) {
  const who = await actor();
  finish("/admin/payouts", await retryPayout(who, payoutId));
}

// ---- Reviews ----
export async function setReviewPublishedAction(reviewId: string, published: boolean) {
  const who = await actor();
  finish("/admin/reviews", await setReviewPublished(who, reviewId, published));
}
