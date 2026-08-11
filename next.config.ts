import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Vercel build will not fail on ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
