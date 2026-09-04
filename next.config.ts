import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Tell Turbopack to treat this directory as the project root.
  // Without this, Turbopack may pick up package-lock.json files from
  // parent directories (e.g. C:\Users\yuvii), causing a warning.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

