import type { NextConfig } from "next";

// Fase 7 (seguridad): CSP sin nonces (ver
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md) —
// la alternativa con nonces obliga a renderizar dinámicamente TODO el sitio
// (rompe la optimización estática de "/"), así que se opta por esta versión
// vía next.config.ts. 'unsafe-inline' en script-src es necesario porque el
// propio App Router de Next.js inyecta scripts inline para hidratación
// (__next_f, RSC payload) — sin nonces no hay forma de evitarlo. El resto de
// directivas sí queda restringido a los orígenes que la app realmente usa.
// 'unsafe-eval' solo en desarrollo: Turbopack/React usan eval() para el
// fast refresh y para reconstruir stack traces en modo debug (ver el error
// de consola "eval() is not supported..." con la CSP estricta de abajo).
// React nunca usa eval() en producción, así que no hace falta debilitar la
// CSP real por esto — se agrega solo cuando NODE_ENV !== "production".
const scriptSrcDev = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${scriptSrcDev} https://challenges.cloudflare.com https://checkout.wompi.co`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://res.cloudinary.com https://i.ibb.co https://images.unsplash.com https://assets.grupify.com",
  "font-src 'self' data:",
  "connect-src 'self' https://checkout.wompi.co https://challenges.cloudflare.com",
  "frame-src 'self' https://challenges.cloudflare.com https://checkout.wompi.co https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.grupify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
