import { prisma } from "@/lib/prisma";

// Lectura pública para la sección de testimonios de la home (Fase 9). El
// admin gestiona la lista desde /admin/testimonios — ver lib/admin/dal.ts
// para la variante que usa el panel.
export async function getTestimonios() {
  return prisma.testimonio.findMany({
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true, rol: true, cita: true, fotoUrl: true },
  });
}

export type TestimonioPublico = Awaited<
  ReturnType<typeof getTestimonios>
>[number];
