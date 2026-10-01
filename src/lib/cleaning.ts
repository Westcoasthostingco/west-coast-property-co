// Cleaning jobs: shared by the admin turnover board and the cleaner portal.
// Reads Supabase when configured, otherwise sample data derived from bookings.
import { bookings as mockBookings, properties as mockProperties } from "./mock";
import { supabaseAdmin, supabaseConfigured, supabaseForUser } from "./supabase";

export type Cleaner = { id: string; clerkUserId?: string | null; name: string; email?: string | null; phone?: string | null; payRate: number; active: boolean };
export type CleaningStatus = "unassigned" | "assigned" | "in_progress" | "done" | "skipped";
export type ChecklistItem = { label: string; done: boolean };
export type CleaningJob = {
  id: string;
  propertyId: string;
  bookingId?: string | null;
  scheduledDate: string;      // YYYY-MM-DD, the check-out day
  windowStart?: string | null; // "11:00"
  windowEnd?: string | null;   // "16:00"
  cleanerId?: string | null;
  status: CleaningStatus;
  checklist: ChecklistItem[];
  notes?: string | null;
  cost?: number | null;        // USD
  completedAt?: string | null;
  nextCheckIn?: string | null; // next guest's check-in date, if any
};

export const defaultChecklist = (): ChecklistItem[] =>
  ["Strip and remake beds", "Bathrooms", "Kitchen and dishes", "Floors", "Trash and recycling", "Restock supplies", "Check for damage", "Lock up and set thermostat"].map((label) => ({ label, done: false }));

export const mockCleaners: Cleaner[] = [
  { id: "c1", clerkUserId: null, name: "Jordan Reyes", email: "jordan@example.com", phone: "253-555-0101", payRate: 120, active: true },
  { id: "c2", clerkUserId: null, name: "Sam Kowalski", email: "sam@example.com", phone: "360-555-0144", payRate: 110, active: true },
];

// One job per completed or confirmed stay, on its check-out day. Property p1 and p2 default to c1, p3 to c2.
export const mockJobs: CleaningJob[] = (() => {
  const today = new Date().toISOString().slice(0, 10);
  const byProp = new Map<string, typeof mockBookings>();
  for (const b of mockBookings) if (b.status !== "cancelled" && b.status !== "pending") byProp.set(b.propertyId, [...(byProp.get(b.propertyId) ?? []), b]);
  const jobs: CleaningJob[] = [];
  for (const [pid, list] of byProp) {
    list.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    list.forEach((b, i) => {
      const past = b.checkOut < today;
      const cleanerId = pid === "p3" ? "c2" : "c1";
      jobs.push({
        id: `j_${b.id}`, propertyId: pid, bookingId: b.id, scheduledDate: b.checkOut, windowStart: "11:00", windowEnd: "16:00",
        cleanerId, status: past ? "done" : i % 5 === 0 ? "unassigned" : "assigned",
        checklist: defaultChecklist().map((c) => ({ ...c, done: past })), notes: null,
        cost: past ? mockCleaners.find((c) => c.id === cleanerId)?.payRate ?? null : null,
        completedAt: past ? `${b.checkOut}T22:30:00Z` : null, nextCheckIn: list[i + 1]?.checkIn ?? null,
      });
      if (!past && i % 5 === 0) jobs[jobs.length - 1].cleanerId = null;
    });
  }
  return jobs.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
})();

type Row = Record<string, unknown>;
const toJob = (r: Row): CleaningJob => ({
  id: r.id as string, propertyId: r.property_id as string, bookingId: r.booking_id as string | null,
  scheduledDate: r.scheduled_date as string, windowStart: r.window_start as string | null, windowEnd: r.window_end as string | null,
  cleanerId: r.cleaner_id as string | null, status: r.status as CleaningStatus,
  checklist: (r.checklist as ChecklistItem[]) ?? [], notes: r.notes as string | null,
  cost: r.cost_cents != null ? (r.cost_cents as number) / 100 : null, completedAt: r.completed_at as string | null,
  nextCheckIn: (r.next_check_in as string | null) ?? null,
});
const toCleaner = (r: Row): Cleaner => ({
  id: r.id as string, clerkUserId: r.clerk_user_id as string | null, name: r.name as string, email: r.email as string | null,
  phone: r.phone as string | null, payRate: ((r.pay_rate_cents as number) ?? 0) / 100, active: Boolean(r.active),
});

// Admin (service role)
export async function getCleaners(): Promise<Cleaner[]> {
  if (!supabaseConfigured) return mockCleaners;
  const { data, error } = await supabaseAdmin().from("cleaners").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toCleaner);
}
export async function getAllJobs(): Promise<CleaningJob[]> {
  if (!supabaseConfigured) return mockJobs;
  const { data, error } = await supabaseAdmin().from("cleaning_jobs").select("*").order("scheduled_date");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toJob);
}

// Cleaner portal (user client; RLS scopes to the signed-in cleaner)
export async function getCleanerForClerkUser(clerkUserId: string): Promise<Cleaner | undefined> {
  if (!supabaseConfigured) return mockCleaners[0]; // demo cleaner
  const { data } = await supabaseForUser().from("cleaners").select("*").eq("clerk_user_id", clerkUserId).maybeSingle();
  return data ? toCleaner(data) : undefined;
}
export async function getJobsForCleaner(cleanerId: string): Promise<CleaningJob[]> {
  if (!supabaseConfigured) return mockJobs.filter((j) => j.cleanerId === cleanerId);
  const { data, error } = await supabaseForUser().from("cleaning_jobs").select("*").eq("cleaner_id", cleanerId).order("scheduled_date");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toJob);
}
export async function getJob(id: string): Promise<CleaningJob | undefined> {
  if (!supabaseConfigured) return mockJobs.find((j) => j.id === id);
  const { data } = await supabaseForUser().from("cleaning_jobs").select("*").eq("id", id).maybeSingle();
  return data ? toJob(data) : undefined;
}

export const propertyBasics = (id: string) => {
  const p = mockProperties.find((x) => x.id === id);
  return p ? { name: p.name, city: p.city, slug: p.slug } : { name: id, city: "", slug: "" };
};
