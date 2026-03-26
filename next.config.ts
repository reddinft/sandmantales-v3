import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // fal.ai CDN for illustrations
        protocol: 'https',
        hostname: '**.fal.media',
      },
      {
        // fal.ai storage
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        // Supabase storage for any user-uploaded content
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
