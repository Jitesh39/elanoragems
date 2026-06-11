import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // existing options …
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "res.cloudinary.com",
    }],
  },
};

export default nextConfig;
