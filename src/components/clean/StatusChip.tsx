import type { CleaningStatus } from "@/lib/cleaning";

const styles: Record<CleaningStatus, { label: string; cls: string }> = {
  unassigned: { label: "Unassigned", cls: "bg-white text-muted border-line" },
  assigned: { label: "Scheduled", cls: "bg-white text-charcoal border-line" },
  in_progress: { label: "In progress", cls: "bg-deep text-white border-deep" },
  done: { label: "Done", cls: "bg-mist text-deep border-wave" },
  skipped: { label: "Skipped", cls: "bg-white text-muted border-line line-through" },
};

export default function StatusChip({ status, size = "md" }: { status: CleaningStatus; size?: "sm" | "md" }) {
  const s = styles[status];
  return (
    <span className={`caps-tight inline-flex items-center rounded-full border ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"} ${s.cls}`}>
      {s.label}
    </span>
  );
}
