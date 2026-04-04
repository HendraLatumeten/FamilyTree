import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  experimental: {
    allowedDevOrigins: ['43.157.235.159'],
  },
};

export default nextConfig;
