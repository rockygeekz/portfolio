import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["img.youtube.com"],
  },
};

export default nextConfig;
