import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://flagcdn.com/w20/**')],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
