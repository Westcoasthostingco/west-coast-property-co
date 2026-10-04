import { INDEXNOW_KEY } from "@/lib/indexnow";

// Serves the IndexNow key so search engines can verify our submissions.
export function GET() {
  return new Response(INDEXNOW_KEY, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
