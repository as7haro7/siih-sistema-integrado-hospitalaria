import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimiza el build para despliegue en Vercel
  output: "standalone",
  typescript: {
    // Permite compilar a producción ignorando errores de tipado
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

