// Primera capa de protección de /admin/* y /api/admin/* (Fase 6). Reemplaza a
// `middleware.ts`, deprecado en Next.js 16 (ver
// node_modules/next/dist/docs/.../file-conventions/proxy.md).
//
// La documentación de Next.js 16 advierte explícitamente que las Server
// Actions viajan como POST a la misma ruta que las invoca, así que un
// matcher de Proxy que excluya una ruta también deja sin protección a sus
// Server Actions. Por eso esta capa NO es suficiente por sí sola: cada
// lectura/acción del panel admin repite la verificación de sesión/rol vía
// lib/admin/dal.ts (segunda capa, independiente de este archivo).
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
