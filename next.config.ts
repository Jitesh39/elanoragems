import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "res.cloudinary.com",
    }],
  },
  async rewrites() {
    return [
      {
        source: "/category/:category",
        destination: "/collections/:category",
      },
    ];
  },
};

export default nextConfig;
