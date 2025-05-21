import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'storage.googleapis.com',
      'weedout-online.appspot.com'
    ],
  },
};

export default nextConfig;
