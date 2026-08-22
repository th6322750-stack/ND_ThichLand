const isProduction = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https:",
  "frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Let isolated tooling (for example Playwright) use its own build cache
  // without stopping a developer's already-running `next dev` process.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Don't auto-generate AGENTS.md/CLAUDE.md — this repo's agent docs live in .webby/.
  agentRules: false,
  async headers() {
    const noIndexHeaders = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }];
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin/:path*", headers: noIndexHeaders },
      { source: "/api/:path*", headers: noIndexHeaders },
    ];
  },
  experimental: {
    globalNotFound: true,
    // Server Actions default to a 1MB body, which is smaller than everything
    // lib/server/media/validate.ts says it accepts: 8MB images, 50MB video,
    // 25MB PDFs. Uploads over 1MB were failing at the action boundary with
    // "Body exceeded 1 MB limit" before the validator ever saw them — that is
    // most phone photos, so this was not a PDF-only problem. Raised to the
    // largest size the validator allows so the two agree.
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
