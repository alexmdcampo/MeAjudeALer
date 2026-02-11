import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  devIndicators: false,
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
