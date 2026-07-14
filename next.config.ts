import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.openfoodfacts.org"
      },
    ]
  },
  allowedDevOrigins: ["johnston-ratings-gave-sorted.trycloudflare.com"]
};

export default nextConfig;
