import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  experimental: {
    // Property and cleaning photo uploads go through server actions.
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/**" }] : [],
  },
};

export default nextConfig;
