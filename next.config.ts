import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default 1MB is too small for menu photos — several JPEGs/a PDF per
    // upload need more headroom than a typical form submission.
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
