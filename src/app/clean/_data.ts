// Read helpers for the cleaner portal. Property details come from the service
// role client because cleaners have no RLS grant on `properties`; the jobs
// themselves are already scoped to the signed-in cleaner by getJobsForCleaner.
import { properties as mockProperties } from "@/lib/mock";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";

export type PropertyInfo = { id: string; name: string; city: string; address: string | null; checkInTime: string };

const SAMPLE_CHECK_IN = "16:00";

export async function getPropertyInfo(ids: string[]): Promise<Map<string, PropertyInfo>> {
  const unique = [...new Set(ids)];
  const map = new Map<string, PropertyInfo>();
  if (unique.length === 0) return map;
  if (!supabaseConfigured) {
    for (const id of unique) {
      const p = mockProperties.find((x) => x.id === id);
      map.set(id, { id, name: p?.name ?? "Property", city: p?.city ?? "", address: null, checkInTime: SAMPLE_CHECK_IN });
    }
    return map;
  }
  const { data, error } = await supabaseAdmin().from("properties").select("id,name,city,address,check_in_time").in("id", unique);
  if (error) throw new Error(error.message);
  for (const r of data ?? []) {
    map.set(r.id as string, {
      id: r.id as string, name: (r.name as string) ?? "Property", city: (r.city as string) ?? "",
      address: (r.address as string | null) ?? null, checkInTime: ((r.check_in_time as string | null) ?? SAMPLE_CHECK_IN).slice(0, 5),
    });
  }
  for (const id of unique) if (!map.has(id)) map.set(id, { id, name: "Property", city: "", address: null, checkInTime: SAMPLE_CHECK_IN });
  return map;
}

export const PHOTO_BUCKET = "cleaning-photos";

// Signed URLs (1 hour) for the photos already uploaded for a job.
export async function getJobPhotoUrls(jobId: string): Promise<string[]> {
  if (!supabaseConfigured) return [];
  const storage = supabaseAdmin().storage.from(PHOTO_BUCKET);
  const { data: files, error } = await storage.list(`${jobId}/`, { limit: 50, sortBy: { column: "created_at", order: "desc" } });
  if (error || !files?.length) return [];
  const paths = files.filter((f) => f.name && !f.name.startsWith(".")).map((f) => `${jobId}/${f.name}`);
  if (!paths.length) return [];
  const { data: signed } = await storage.createSignedUrls(paths, 60 * 60);
  return (signed ?? []).map((s) => s.signedUrl).filter((u): u is string => Boolean(u));
}
