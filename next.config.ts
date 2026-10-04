import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;
const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy. Shipped as Report-Only for now: Clerk's production
// frontend API lives on a per-instance host (clerk.<domain>) and loads its own
// scripts, so enforce only after checking the browser console on a real deploy
// (then rename the header to Content-Security-Policy). Server-side fetches
// (NOAA, Open-Meteo, Supabase, Airbnb/Vrbo iCal feeds) are not subject to CSP.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://*.clerk.accounts.dev https://clerk.westcoasthostingco.com https://challenges.cloudflare.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: https://img.clerk.com https://*.supabase.co${supabaseHost ? ` https://${supabaseHost}` : ""}`,
  "connect-src 'self' https://*.clerk.accounts.dev https://clerk.westcoasthostingco.com https://*.supabase.co https://challenges.cloudflare.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src https://challenges.cloudflare.com https://*.clerk.accounts.dev https://clerk.westcoasthostingco.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  // Clerk sign-in may post to its frontend API host.
  "form-action 'self' https://*.clerk.accounts.dev https://clerk.westcoasthostingco.com",
  "object-src 'none'",
  // upgrade-insecure-requests is omitted while this ships as Report-Only:
  // browsers ignore it there and log a console warning on every page. Add it
  // back when the header becomes Content-Security-Policy (HSTS already forces
  // HTTPS meanwhile).
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: 'camera=(self), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Property and cleaning photo uploads go through server actions.
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/**" }] : [],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Portal responses carry personal and financial data; never cache them in shared caches.
      { source: "/:portal(admin|owner|clean)/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default nextConfig;
