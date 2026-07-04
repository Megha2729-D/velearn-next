import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "velearn.in",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://velearn.in/velearn-crm/api/:path*",
      },
    ];
  },
};

export default nextConfig;