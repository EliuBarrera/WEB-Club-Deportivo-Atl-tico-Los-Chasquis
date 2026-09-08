import { prisma } from "@/lib/prisma";

// Lectura pública para la sección de respaldo institucional de la home
// (Fase 9). El admin gestiona la lista desde /admin/socios — ver
// lib/admin/dal.ts para la variante que usa el panel.
export async function getSocios() {
  return prisma.socio.findMany({
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true, logoUrl: true },
  });
}

export type SocioPublico = Awaited<ReturnType<typeof getSocios>>[number];
