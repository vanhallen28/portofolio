import type { NextConfig } from "next";
import pkg from "./package.json";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Part of the content cache key: a new version never serves content cached by an older one.
  env: { PORTO_VERSION: pkg.version },
  images: { unoptimized: true },
  poweredByHeader: false,
  // The site has several root layouts (Indonesian, English, admin), so unmatched URLs use app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Project previews are third-party-style HTML: sandboxed without allow-same-origin, their
        // scripts run in an opaque origin and cannot read cookies or storage of this site (or /admin).
        source: "/preview/:path*",
        headers: [{ key: "Content-Security-Policy", value: "sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads" }],
      },
    ];
  },
};

export default nextConfig;
