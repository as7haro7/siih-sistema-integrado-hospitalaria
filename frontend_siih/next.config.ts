import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimiza el build para despliegue en Vercel
  output: "standalone",
};

export default nextConfig;

