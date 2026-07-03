import type { NextConfig } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.pcsmonthlypla.online";

const csp = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https:",
  "connect-src 'self' wss: ws: https://cloudflareinsights.com",
].join("; ");

const nextConfig: NextConfig = {
  // Allow dev access via LAN IP or tunneled production hostname.
  allowedDevOrigins: [
    "192.168.0.169:3000",
    "192.168.0.169",
    "app.pcsmonthlypla.online",
  ],

  // HTTP static assets 500 behind Cloudflare; force HTTPS in production.
  async redirects() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    return [
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: `${appUrl}/:path*`,
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;