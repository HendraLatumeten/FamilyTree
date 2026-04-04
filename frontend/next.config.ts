import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  allowedDevOrigins: ['43.157.235.159'],
};

export default nextConfig;
