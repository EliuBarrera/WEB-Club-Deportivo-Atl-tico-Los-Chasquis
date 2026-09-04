import { prisma } from "@/lib/prisma";

// Campos necesarios para el carrusel de /eventos y la columna izquierda
// de la vista de inscripción (Fase 2). El contenido de las demás tabs
// (recorridos, premios, reglamento, logística, noticias) se agrega en
// la Fase 3.
export async function getEventosPublicados() {
  return prisma.evento.findMany({
    where: { estado: { in: ["ABIERTO", "CERRADO"] } },
    orderBy: { fecha: "asc" },
    select: {
      id: true,
      titulo: true,
      subtitulo: true,
      lema: true,
      precio: true,
      descuento: true,
      descuentoLabel: true,
      estado: true,
      fecha: true,
      horario: true,
      ubicacion: true,
      descripcion: true,
      imagenUrl: true,
      resultadosUrl: true,
      cierreInscripciones: true,
      aval: true,
      categorias: {
        orderBy: { orden: "asc" },
        select: { nombre: true },
      },
    },
  });
}

export type EventoPublicado = Awaited<
  ReturnType<typeof getEventosPublicados>
>[number];
