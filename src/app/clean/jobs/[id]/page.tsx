import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getCleanerForClerkUser, getJob } from "@/lib/cleaning";
import JobView from "@/components/clean/JobView";
import NotLinked from "@/components/clean/NotLinked";
import { todayPacific } from "@/components/clean/dates";
import { supabaseConfigured } from "@/lib/supabase";
import { getJobPhotoUrls, getPropertyInfo } from "../../_data";

export const dynamic = "force-dynamic";

export default async function JobPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { userId, role } = await requireRole("cleaner");
  const cleaner = await getCleanerForClerkUser(userId);
  if (!cleaner && role !== "admin") return <NotLinked />;

  const job = await getJob(id);
  // Cleaners only see their own jobs (RLS does this too when Supabase is on).
  if (!job || (role !== "admin" && job.cleanerId !== cleaner?.id)) notFound();

  const [props_, photos] = await Promise.all([getPropertyInfo([job.propertyId]), getJobPhotoUrls(job.id)]);
  const property = props_.get(job.propertyId)!;

  return (
    <div className="space-y-6">
      <Link href="/clean" className="ui inline-flex min-h-[44px] items-center text-base text-muted hover:text-charcoal">&larr; All jobs</Link>
      {/* The door code is never part of this tree: the client asks the server for it on tap. */}
      <JobView job={job} property={property} photos={photos} isToday={job.scheduledDate === todayPacific()} sampleMode={!supabaseConfigured} />
    </div>
  );
}
