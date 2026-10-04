import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/personal-dashboard",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
