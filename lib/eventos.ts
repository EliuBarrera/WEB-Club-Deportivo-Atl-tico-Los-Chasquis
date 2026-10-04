import { prisma } from "@/lib/prisma";
import { ordenarCategorias } from "@/lib/categorias";
import { ordenarNoticias } from "@/lib/noticias";
import { preciosDelEvento } from "@/lib/precios";

// Cierre automático de eventos vencidos: este proyecto no tiene cron ni
// cola (ver la nota en app/admin/(panel)/eventos/actions.ts), así que en
// vez de un job programado, esto se dispara como efecto secundario de las
// lecturas más visitadas (getEventosPublicados acá abajo, y
// getEventosParaAdmin en lib/admin/dal.ts) — mismo criterio que
// ESTADOS_PAGO_PURGABLES/checkRateLimit. Solo toca ABIERTO con `fecha` ya
// pasada; BORRADOR nunca se publica solo, y un evento que el admin cerró
// a mano antes de la fecha (ej. cupo lleno) se queda CERRADO, no se
// reabre. `app/api/inscripciones/route.ts` además valida `fecha` en el
// momento mismo de inscribirse, por si esto no alcanzó a correr todavía
// para ese evento puntual.
export async function cerrarEventosVencidos() {
  await prisma.evento.updateMany({
    where: { estado: "ABIERTO", fecha: { lt: new Date() } },
    data: { estado: "CERRADO" },
  });
}

// Campos necesarios para el carrusel de /eventos, la columna izquierda
// de la vista de inscripción (Fase 2) y el panel de tabs con el detalle
// completo del evento (Fase 3). Se trae todo en una sola consulta porque
// la vista de inscripción alterna entre eventos del lado del cliente,
// sin una ruta propia por evento.
export async function getEventosPublicados() {
  await cerrarEventosVencidos();

  const eventos = await prisma.evento.findMany({
    where: { estado: { in: ["ABIERTO", "CERRADO"] } },
    orderBy: { fecha: "asc" },
    select: {
      id: true,
      titulo: true,
      subtitulo: true,
      lema: true,
      estado: true,
      tipo: true,
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
      notasCategorias: true,
      categorias: {
        select: {
          id: true,
          nombre: true,
          edad: true,
          nacimiento: true,
          rama: true,
          grupoTarifaId: true,
          recorridoId: true,
          distancia: { select: { nombre: true } },
          vueltas: true,
          horaSalida: true,
          sitioSalida: true,
          sitioLlegada: true,
          pruebas: {
            select: {
              prueba: {
                select: { key: true, nombre: true, icon: true, genero: true },
              },
            },
          },
        },
      },
      rondas: {
        select: {
          id: true,
          orden: true,
          nombre: true,
          fechaCierre: true,
          tarifas: { select: { grupoTarifaId: true, valor: true } },
        },
      },
      gruposTarifa: {
        select: { id: true, nombre: true, derechos: true, orden: true },
      },
      recorridos: {
        orderBy: { orden: "asc" },
        select: {
          id: true,
          nombre: true,
          mapaUrl: true,
          categorias: { select: { nombre: true, nacimiento: true } },
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
        select: {
          id: true,
          titulo: true,
          fecha: true,
          contenido: true,
          createdAt: true,
        },
      },
    },
  });

  return eventos.map(({ rondas, gruposTarifa, ...evento }) => ({
    ...evento,
    categorias: ordenarCategorias(evento.categorias),
    noticias: ordenarNoticias(evento.noticias),
    recorridos: evento.recorridos.map((r) => ({
      ...r,
      categorias: ordenarCategorias(r.categorias),
    })),
    precios: preciosDelEvento({ rondas, gruposTarifa }),
  }));
}

export type EventoPublicado = Awaited<
  ReturnType<typeof getEventosPublicados>
>[number];

// Bloque institucional del modal de Términos y Condiciones (Fase 4): nunca
// se edita una fila existente (ver nota en el modelo TerminosBase), así
// que la vigente es siempre la de mayor `version`.
export async function getTerminosVigente() {
  return prisma.terminosBase.findFirst({
    orderBy: { version: "desc" },
    select: { contenido: true, version: true, vigenteDesde: true },
  });
}

export type TerminosVigente = Awaited<
  ReturnType<typeof getTerminosVigente>
>;
