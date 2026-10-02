"use client";
import PortalError from "@/components/portal/PortalError";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalError error={error} reset={reset} label="Back office" />;
}
