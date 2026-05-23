import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // ← tambahkan ini
  },
  reactStrictMode: false,
};

module.exports = {
  allowedDevOrigins: ["meredith-toylike-jeana.ngrok-free.dev"],
};
export default nextConfig;
