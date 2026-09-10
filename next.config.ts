import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default 1MB is too small for menu photos — several JPEGs/a PDF per
    // upload need more headroom than a typical form submission.
    serverActions: { bodySizeLimit: "20mb" },
  },
  // sharp ships a native binary — keeping it out of the bundled function
  // code (loaded from node_modules at runtime instead) keeps the deployed
  // function smaller, which matters for serverless cold-start time.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
