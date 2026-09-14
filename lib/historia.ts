import { prisma } from "@/lib/prisma";

// Lectura pública para la línea de tiempo de la home (Fase 9). El admin
// gestiona la lista desde /admin/historia — ver lib/admin/dal.ts para la
// variante que usa el panel.
export async function getHitosHistoricos() {
  return prisma.hitoHistorico.findMany({
    orderBy: { orden: "asc" },
    select: {
      id: true,
      anio: true,
      titulo: true,
      descripcion: true,
      imagenUrl: true,
    },
  });
}

export type HitoHistoricoPublico = Awaited<
  ReturnType<typeof getHitosHistoricos>
>[number];
