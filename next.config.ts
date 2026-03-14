import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use turbopack root on Windows local dev
  ...(process.platform === "win32" ? { turbopack: { root: process.cwd() } } : {}),
};

export default nextConfig;
