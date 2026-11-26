import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["mantra-engine"],
  webpack(config) {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js","mjs"]
    };
    return config;
  }
};

export default nextConfig;
