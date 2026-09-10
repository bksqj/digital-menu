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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // No legitimate reason for any page here to be framed by another
          // site — closes a clickjacking hole on auth/dashboard pages.
          { key: "X-Frame-Options", value: "DENY" },
          // Reset-password URLs carry a one-time token in the query string;
          // this keeps it out of the Referer header on any outbound link.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
