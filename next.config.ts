import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === "production" ? {
      properties: ["^data-node-id$", "^data-figma-.*$"],
    } : false,
  },
};

export default nextConfig;
