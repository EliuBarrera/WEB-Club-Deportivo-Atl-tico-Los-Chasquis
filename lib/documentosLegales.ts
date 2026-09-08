import { prisma } from "@/lib/prisma";

// Lectura pública para la sección de Transparencia (Fase 9). El admin
// gestiona la lista desde /admin/documentos — ver lib/admin/dal.ts para la
// variante que usa el panel.
export async function getDocumentosLegales() {
  return prisma.documentoLegal.findMany({
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true, url: true },
  });
}

export type DocumentoLegalPublico = Awaited<
  ReturnType<typeof getDocumentosLegales>
>[number];
