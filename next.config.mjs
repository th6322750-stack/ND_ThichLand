/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Let isolated tooling (for example Playwright) use its own build cache
  // without stopping a developer's already-running `next dev` process.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Don't auto-generate AGENTS.md/CLAUDE.md — this repo's agent docs live in .webby/.
  agentRules: false,
  experimental: {
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
