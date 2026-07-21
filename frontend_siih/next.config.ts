import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimiza el build para despliegue en Vercel
  output: "standalone",
  typescript: {
    // Permite compilar a producción ignorando errores de tipado
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Aplica estos encabezados a todas las rutas de la aplicación
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://siih-backend.onrender.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
