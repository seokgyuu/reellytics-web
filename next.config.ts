import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.output = config.output || {};
    config.output.clean = true;
    return config;
  },
  basePath: "", 
};

export default nextConfig;
