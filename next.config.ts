import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'bayut-production.s3.eu-central-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.bayut.com',
      },
    ],
  },
};

export default nextConfig;
