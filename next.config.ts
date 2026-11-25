import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let phones/laptops on the home network use the dev server (e.g. http://192.168.x.x:3000).
  // Without this, Next blocks its dev scripts for non-localhost origins and buttons stop working.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
