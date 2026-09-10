import type { NextConfig } from "next";

// No nonces: a nonce-based CSP requires every page to render dynamically
// (Next.js can only inject a nonce into a per-request response), which
// would force the static landing page onto a serverless function on every
// hit — a real cold-start cost on Netlify's free tier, for marketing
// traffic that doesn't touch user data. 'unsafe-inline' on script/style is
// the tradeoff: it can't stop an inline-script XSS payload, but this app
// has no path that renders unescaped user input (no dangerouslySetInnerHTML
// anywhere, confirmed in the 2026-09-10 security audit) — the CSP's real
// job here is blocking an attacker from loading an external script/exfil
// endpoint, which 'self'-scoped src directives already do.
// React reconstructs server-side error stacks via eval() in dev mode only
// ("React will never use eval() in production mode" — confirmed by the
// error CSP itself throws without this) — production never needs it.
const isDev = process.env.NODE_ENV === "development";

const CSP_HEADER = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

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
          { key: "Content-Security-Policy", value: CSP_HEADER },
        ],
      },
    ];
  },
};

export default nextConfig;
