import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16.3 + Vercel's adapter skips next-server.js.nft.json when standalone
  // is on, then onBuildComplete fails. Docker/CodeBuild still need standalone.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
