import { prisma } from "@/lib/prisma";

// Campos necesarios para el carrusel de /eventos, la columna izquierda
// de la vista de inscripción (Fase 2) y el panel de tabs con el detalle
// completo del evento (Fase 3). Se trae todo en una sola consulta porque
// la vista de inscripción alterna entre eventos del lado del cliente,
// sin una ruta propia por evento.
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
      mapUrl: true,
      descripcion: true,
      imagenUrl: true,
      resultadosUrl: true,
      terminosUrl: true,
      cierreInscripciones: true,
      aval: true,
      organizador: true,
      categorias: {
        orderBy: { orden: "asc" },
        select: {
          id: true,
          nombre: true,
          edad: true,
          rama: true,
          pruebas: {
            select: {
              prueba: { select: { nombre: true, icon: true, genero: true } },
            },
          },
        },
      },
      costos: {
        select: { id: true, tipo: true, valor: true },
      },
      recorrido: {
        select: {
          distancia: true,
          desnivel: true,
          salida: true,
          meta: true,
          modalidad: true,
          terreno: true,
          programacion: {
            orderBy: { orden: "asc" },
            select: { id: true, url: true, alt: true },
          },
        },
      },
      premios: {
        select: {
          efectivoUrl: true,
          ceremoniaHora: true,
          ceremoniaLugar: true,
          condiciones: {
            orderBy: { orden: "asc" },
            select: { id: true, texto: true },
          },
        },
      },
      reglamento: {
        select: {
          competencia: {
            orderBy: { orden: "asc" },
            select: { id: true, texto: true },
          },
          seguridad: {
            orderBy: { orden: "asc" },
            select: { id: true, texto: true },
          },
          controles: {
            orderBy: { orden: "asc" },
            select: { id: true, texto: true },
          },
        },
      },
      logistica: {
        select: {
          servicios: {
            orderBy: { orden: "asc" },
            select: { id: true, texto: true },
          },
          recomendaciones: {
            orderBy: { orden: "asc" },
            select: { id: true, texto: true },
          },
          kit: {
            orderBy: { orden: "asc" },
            select: { id: true, texto: true },
          },
        },
      },
      noticias: {
        orderBy: { orden: "asc" },
        select: { id: true, titulo: true, fecha: true, contenido: true },
      },
    },
  });
}

export type EventoPublicado = Awaited<
  ReturnType<typeof getEventosPublicados>
>[number];
