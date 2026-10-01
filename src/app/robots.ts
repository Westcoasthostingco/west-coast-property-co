import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Public marketing pages are open to everyone, including AI search crawlers.
// Portals, auth, checkout, and API routes carry nothing worth indexing.
const disallow = ["/admin", "/owner", "/clean", "/api", "/sign-in", "/sign-up", "/book", "/unauthorized"];

const aiCrawlers = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiCrawlers, allow: "/", disallow },
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
