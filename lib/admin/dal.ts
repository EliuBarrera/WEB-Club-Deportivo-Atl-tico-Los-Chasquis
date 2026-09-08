import "server-only";
import { redirect } from "next/navigation";
import type { EstadoPago } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Data Access Layer del panel admin (Fase 6, incremento 1). Cada función
// que lee/escribe datos de admin pasa por aquí y repite la verificación de
// sesión/rol, sin depender de que proxy.ts ya haya filtrado la petición
// (ver la nota en proxy.ts sobre por qué esto no es opcional).

export async function verifySession() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}

export class NoAutorizadoError extends Error {
  constructor() {
    super("No autorizado");
  }
}

// Variante para Route Handlers (ej. export de CSV): en vez de redirigir,
// lanza para que el handler responda 401/403 explícitamente — ahí no
// queremos que Next intente hacer un `redirect` sobre una descarga de archivo.
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "ADMIN") {
    throw new NoAutorizadoError();
  }
  return session;
}

export async function getEventosParaFiltro() {
  await verifySession();
  return prisma.evento.findMany({
    orderBy: { fecha: "desc" },
    select: { id: true, titulo: true, fecha: true },
  });
}

type FiltrosInscripciones = {
  eventoId: string;
  estadoPago?: EstadoPago;
  categoriaId?: string;
};

// Campos suficientes para la tabla en pantalla. El CSV (que sí necesita
// también los datos de acudiente/condiciones médicas) usa
// getInscripcionesParaExport en su lugar.
export async function getInscripcionesPorEvento(filtros: FiltrosInscripciones) {
  await verifySession();
  return prisma.inscripcion.findMany({
    where: {
      eventoId: filtros.eventoId,
      estadoPago: filtros.estadoPago,
      categoriaId: filtros.categoriaId,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      tipoDocumento: true,
      numeroDocumento: true,
      categoria: { select: { nombre: true } },
      costo: { select: { tipo: true } },
      pruebasIds: true,
      estadoPago: true,
      totalPago: true,
      celular: true,
      email: true,
      createdAt: true,
    },
  });
}

export type InscripcionAdmin = Awaited<
  ReturnType<typeof getInscripcionesPorEvento>
>[number];

// Dashboard de ingresos (Fase 6): todo se calcula desde la base local,
// nunca contra la API de Wompi — el webhook de la Fase 5 ya mantiene
// `estadoPago` sincronizado. Solo cuenta inscripciones APROBADO: nunca
// sumar pendientes/rechazadas/declinadas/con error.
export async function getDashboardIngresos() {
  await verifySession();

  const [totalGeneral, porEvento, eventos] = await Promise.all([
    prisma.inscripcion.aggregate({
      where: { estadoPago: "APROBADO" },
      _sum: { totalPago: true },
      _count: true,
    }),
    prisma.inscripcion.groupBy({
      by: ["eventoId"],
      where: { estadoPago: "APROBADO" },
      _sum: { totalPago: true },
      _count: true,
    }),
    prisma.evento.findMany({
      orderBy: { fecha: "desc" },
      select: { id: true, titulo: true, fecha: true, estado: true },
    }),
  ]);

  const porEventoMap = new Map(porEvento.map((fila) => [fila.eventoId, fila]));

  return {
    totalRecaudado: totalGeneral._sum.totalPago ?? 0,
    totalPagos: totalGeneral._count,
    eventos: eventos
      .map((evento) => {
        const fila = porEventoMap.get(evento.id);
        return {
          id: evento.id,
          titulo: evento.titulo,
          fecha: evento.fecha,
          estado: evento.estado,
          recaudado: fila?._sum.totalPago ?? 0,
          inscritos: fila?._count ?? 0,
        };
      })
      .filter((evento) => evento.inscritos > 0),
  };
}

export type DashboardIngresos = Awaited<ReturnType<typeof getDashboardIngresos>>;

// CRUD de eventos (Fase 6)

export async function getEventosParaAdmin() {
  await verifySession();
  return prisma.evento.findMany({
    orderBy: { fecha: "desc" },
    select: { id: true, titulo: true, fecha: true, estado: true, imagenUrl: true },
  });
}

export type EventoAdmin = Awaited<ReturnType<typeof getEventosParaAdmin>>[number];

// Trae el evento completo para el editor por pestañas. Solo incluye lo que
// las pestañas Información/Recorrido/Contacto/Resultados usan en este
// incremento (Premios/Reglamento/Logística/Noticias muestran "Próximamente"
// y no necesitan datos todavía).
export async function getEventoCompleto(eventoId: string) {
  await verifySession();
  return prisma.evento.findUnique({
    where: { id: eventoId },
    select: {
      id: true,
      titulo: true,
      subtitulo: true,
      fecha: true,
      horario: true,
      cierreInscripciones: true,
      ubicacion: true,
      precio: true,
      descuento: true,
      descuentoLabel: true,
      estado: true,
      descripcion: true,
      imagenUrl: true,
      resultadosUrl: true,
      organizador: true,
      aval: true,
      terminosUrl: true,
      recorrido: {
        select: {
          distancia: true,
          desnivel: true,
          salida: true,
          meta: true,
          modalidad: true,
          terreno: true,
        },
      },
      categorias: {
        orderBy: { orden: "asc" },
        select: {
          id: true,
          nombre: true,
          edad: true,
          nacimiento: true,
          rama: true,
          orden: true,
          pruebas: { select: { pruebaId: true } },
        },
      },
      premios: {
        select: {
          id: true,
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
          id: true,
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
          id: true,
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
        select: {
          id: true,
          titulo: true,
          fecha: true,
          contenido: true,
          orden: true,
        },
      },
    },
  });
}

export type EventoCompleto = NonNullable<
  Awaited<ReturnType<typeof getEventoCompleto>>
>;

// Catálogo global de pruebas (sembrado una sola vez, ver prisma/seed.ts):
// no se edita desde el panel, solo se usa para armar el checklist de
// pruebas por categoría.
export async function getPruebasCatalogo() {
  await verifySession();
  return prisma.pruebaCatalogo.findMany({
    orderBy: { nombre: "asc" },
    select: { id: true, key: true, nombre: true, icon: true, genero: true },
  });
}

export type PruebaCatalogoAdmin = Awaited<
  ReturnType<typeof getPruebasCatalogo>
>[number];

// Documentos legales (Fase 9 — Transparencia): lista completa para el CRUD
// del admin. La versión pública (sin createdAt/updatedAt) vive en
// lib/documentosLegales.ts.
export async function getDocumentosLegalesAdmin() {
  await verifySession();
  return prisma.documentoLegal.findMany({
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true, url: true, orden: true },
  });
}

export type DocumentoLegalAdmin = Awaited<
  ReturnType<typeof getDocumentosLegalesAdmin>
>[number];

// Cifras de confianza (Fase 9 — Home): lista completa para el CRUD del
// admin. La versión pública vive en lib/cifras.ts.
export async function getCifrasConfianzaAdmin() {
  await verifySession();
  return prisma.cifraConfianza.findMany({
    orderBy: { orden: "asc" },
    select: { id: true, etiqueta: true, valor: true, orden: true },
  });
}

export type CifraConfianzaAdmin = Awaited<
  ReturnType<typeof getCifrasConfianzaAdmin>
>[number];

// Testimonios (Fase 9 — Home): lista completa para el CRUD del admin. La
// versión pública vive en lib/testimonios.ts.
export async function getTestimoniosAdmin() {
  await verifySession();
  return prisma.testimonio.findMany({
    orderBy: { orden: "asc" },
    select: {
      id: true,
      nombre: true,
      rol: true,
      cita: true,
      fotoUrl: true,
      destacado: true,
      orden: true,
    },
  });
}

export type TestimonioAdmin = Awaited<
  ReturnType<typeof getTestimoniosAdmin>
>[number];

// Socios / respaldo institucional (Fase 9 — Home): lista completa para el
// CRUD del admin. La versión pública vive en lib/socios.ts.
export async function getSociosAdmin() {
  await verifySession();
  return prisma.socio.findMany({
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true, logoUrl: true, nivel: true, orden: true },
  });
}

export type SocioAdmin = Awaited<ReturnType<typeof getSociosAdmin>>[number];

// Usado solo por el Route Handler de export (Fase 6: el CSV incluye datos
// personales de menores, de ahí requireAdmin() en vez de verifySession()).
export async function getInscripcionesParaExport(filtros: FiltrosInscripciones) {
  return prisma.inscripcion.findMany({
    where: {
      eventoId: filtros.eventoId,
      estadoPago: filtros.estadoPago,
      categoriaId: filtros.categoriaId,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      tipoDocumento: true,
      numeroDocumento: true,
      fechaNacimiento: true,
      edad: true,
      genero: true,
      categoria: { select: { nombre: true } },
      costo: { select: { tipo: true } },
      pruebasIds: true,
      celular: true,
      email: true,
      ciudad: true,
      departamento: true,
      club: true,
      condicionesMedicas: true,
      nombresAcudiente: true,
      apellidosAcudiente: true,
      documentoAcudiente: true,
      celularAcudiente: true,
      estadoPago: true,
      totalPago: true,
      createdAt: true,
    },
  });
}
