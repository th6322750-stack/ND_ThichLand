/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Don't auto-generate AGENTS.md/CLAUDE.md — this repo's agent docs live in .webby/.
  agentRules: false,
};

export default nextConfig;
