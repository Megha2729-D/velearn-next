import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "velearn.in",
      },
      {
        protocol: "https",
        hostname: "velearn-next.onrender.com",
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