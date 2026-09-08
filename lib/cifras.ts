import { prisma } from "@/lib/prisma";

// Lectura pública para la franja de confianza de la home (Fase 9). El
// admin gestiona la lista desde /admin/cifras — ver lib/admin/dal.ts para
// la variante que usa el panel.
export async function getCifrasConfianza() {
  return prisma.cifraConfianza.findMany({
    orderBy: { orden: "asc" },
    select: { id: true, etiqueta: true, valor: true },
  });
}

export type CifraConfianzaPublica = Awaited<
  ReturnType<typeof getCifrasConfianza>
>[number];
