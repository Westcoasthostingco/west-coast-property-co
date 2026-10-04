import { SITE_URL } from "@/lib/seo";

// IndexNow tells Bing (which also feeds ChatGPT search, Copilot and others),
// Yandex, Seznam and Naver that pages changed, so they recrawl quickly.
// The key is public by design: search engines fetch it from /indexnow-key.txt
// to confirm the submission comes from this site. Override with INDEXNOW_KEY.
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "be8616b7485831749e024c7ca2d53c6a";
export const INDEXNOW_KEY_URL = `${SITE_URL}/indexnow-key.txt`;

export async function submitToIndexNow(urls: string[]): Promise<{ status: number; submitted: number }> {
  const host = new URL(SITE_URL).host;
  const urlList = urls.filter((u) => new URL(u).host === host).slice(0, 10_000);
  if (urlList.length === 0) return { status: 204, submitted: 0 };
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: INDEXNOW_KEY_URL, urlList }),
    signal: AbortSignal.timeout(10_000),
  });
  return { status: res.status, submitted: urlList.length };
}
