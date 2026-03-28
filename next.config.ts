import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:43000', 'localhost:3000', 'gokind.flatsync.app', '*.flatsync.app'],
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/supabase/:path*',
        destination: 'http://supabase_kong_gokind:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
