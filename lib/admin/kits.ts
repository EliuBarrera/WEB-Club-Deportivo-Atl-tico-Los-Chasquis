import "server-only";
import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { verifySession } from "@/lib/admin/dal";
import { prisma } from "@/lib/prisma";
import {
  normalizarDocumento,
  textoHashDocumento,
  type ConflictoEntrega,
  type EntregaPendiente,
  type InscripcionKit,
  type ListaKits,
  type ResultadoSincronizacion,
} from "@/lib/kits/tipos";

// Entrega de kits (Fase 13.2). Hay dos formas de entrar:
//  - Usuario del panel (ADMIN/EDITOR): /admin/entrega-kits/[eventoId],
//    con verifySession().
//  - Voluntario sin cuenta: /kits/[token], con el enlace que genera el
//    panel (Evento.tokenEntregaKits). No se le aplica checkRateLimit: el
//    token tiene 192 bits aleatorios (no se puede adivinar) y ese límite
//    (5 intentos/10 min por IP) bloquearía la sincronización cada 15 s de
//    varios celulares que salen por la misma IP del lugar.
//
// Las funciones de datos de más abajo reciben un eventoId ya autorizado:
// llamarlas solo después de accesoKitsPorSesion/accesoKitsPorToken.

export type AccesoKits = { eventoId: string; titulo: string; fecha: Date };

export async function accesoKitsPorSesion(
  eventoId: string,
): Promise<AccesoKits | null> {
  await verifySession();
  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    select: { id: true, titulo: true, fecha: true },
  });
  return evento
    ? { eventoId: evento.id, titulo: evento.titulo, fecha: evento.fecha }
    : null;
}

export async function accesoKitsPorToken(
  token: string,
): Promise<AccesoKits | null> {
  if (!token || token.length > 64) return null;
  const evento = await prisma.evento.findUnique({
    where: { tokenEntregaKits: token },
    select: {
      id: true,
      titulo: true,
      fecha: true,
      tokenEntregaKitsExpira: true,
    },
  });
  if (
    !evento ||
    !evento.tokenEntregaKitsExpira ||
    evento.tokenEntregaKitsExpira < new Date()
  ) {
    return null;
  }
  return { eventoId: evento.id, titulo: evento.titulo, fecha: evento.fecha };
}

// Enlace de voluntarios: vence 2 días después de Evento.fecha (guardada a
// medianoche UTC), o sea al terminar el día siguiente al evento.
const VIGENCIA_TRAS_EVENTO_MS = 2 * 24 * 60 * 60 * 1000;

export async function generarTokenEntregaKits(eventoId: string) {
  await verifySession();
  const evento = await prisma.evento.findUniqueOrThrow({
    where: { id: eventoId },
    select: { fecha: true },
  });
  await prisma.evento.update({
    where: { id: eventoId },
    data: {
      tokenEntregaKits: crypto.randomBytes(24).toString("base64url"),
      tokenEntregaKitsExpira: new Date(
        evento.fecha.getTime() + VIGENCIA_TRAS_EVENTO_MS,
      ),
    },
  });
}

export async function revocarTokenEntregaKits(eventoId: string) {
  await verifySession();
  await prisma.evento.update({
    where: { id: eventoId },
    data: { tokenEntregaKits: null, tokenEntregaKitsExpira: null },
  });
}

export async function getEnlaceEntregaKits(eventoId: string) {
  await verifySession();
  return prisma.evento.findUnique({
    where: { id: eventoId },
    select: { tokenEntregaKits: true, tokenEntregaKitsExpira: true },
  });
}

export async function getEventosEntregaKits() {
  await verifySession();
  // Última semana en adelante: la entrega suele ser los días previos al
  // evento, con margen para revisar pendientes justo después.
  const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return prisma.evento.findMany({
    where: { fecha: { gte: desde } },
    orderBy: { fecha: "asc" },
    select: { id: true, titulo: true, fecha: true },
  });
}

const SELECT_INSCRIPCION_KIT = {
  id: true,
  nombres: true,
  apellidos: true,
  numeroDocumento: true,
  estadoPago: true,
  tallaCamiseta: true,
  dorsal: true,
  kitEntregadoEn: true,
  kitEntregadoPor: true,
  categoria: {
    select: {
      nombre: true,
      grupoTarifa: { select: { derechos: true } },
    },
  },
  grupoTarifa: { select: { nombre: true, derechos: true } },
} satisfies Prisma.InscripcionSelect;

type FilaKit = Prisma.InscripcionGetPayload<{
  select: typeof SELECT_INSCRIPCION_KIT;
}>;

function hashDocumento(eventoId: string, documento: string) {
  return crypto
    .createHash("sha256")
    .update(textoHashDocumento(eventoId, documento))
    .digest("hex");
}

function aInscripcionKit(
  eventoId: string,
  fila: FilaKit,
  kitEvento: string[],
): InscripcionKit {
  const derechosGrupo =
    fila.categoria?.grupoTarifa?.derechos ?? fila.grupoTarifa?.derechos ?? [];
  const documento = normalizarDocumento(fila.numeroDocumento);
  return {
    id: fila.id,
    nombreCompleto: `${fila.nombres} ${fila.apellidos}`,
    documentoFinal: documento.slice(-4),
    documentoHash: hashDocumento(eventoId, fila.numeroDocumento),
    estadoPago: fila.estadoPago,
    categoria: fila.categoria?.nombre ?? fila.grupoTarifa?.nombre ?? null,
    tallaCamiseta: fila.tallaCamiseta,
    dorsal: fila.dorsal,
    // Respaldo del kit para eventos sin derechos por grupo de tarifa (mismo
    // criterio que el portal del atleta, Fase 12.6).
    derechos: derechosGrupo.length > 0 ? derechosGrupo : kitEvento,
    kitEntregadoEn: fila.kitEntregadoEn?.toISOString() ?? null,
    kitEntregadoPor: fila.kitEntregadoPor,
  };
}

async function getKitEvento(eventoId: string) {
  const logistica = await prisma.logistica.findUnique({
    where: { eventoId },
    select: { kit: { orderBy: { orden: "asc" }, select: { texto: true } } },
  });
  return logistica?.kit.map((item) => item.texto) ?? [];
}

// Lista que el celular descarga para trabajar sin conexión: solo
// inscripciones APROBADAS (las únicas con kit).
export async function getListaKits(eventoId: string): Promise<ListaKits> {
  const [filas, kitEvento] = await Promise.all([
    prisma.inscripcion.findMany({
      where: { eventoId, estadoPago: "APROBADO" },
      orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
      select: SELECT_INSCRIPCION_KIT,
    }),
    getKitEvento(eventoId),
  ]);
  return {
    eventoId,
    inscripciones: filas.map((f) => aInscripcionKit(eventoId, f, kitEvento)),
    descargadaEn: new Date().toISOString(),
  };
}

// Estado en vivo de una inscripción al escanear su QR con señal, para no
// depender de la lista local (que puede tener hasta 15 s de atraso
// respecto a lo que entregaron los otros puestos). En todos los estados de
// pago: un QR de un pago revertido debe mostrarse como "no entregar".
export async function getInscripcionKit(
  eventoId: string,
  inscripcionId: string,
): Promise<InscripcionKit | null> {
  const [fila, kitEvento] = await Promise.all([
    prisma.inscripcion.findFirst({
      where: { id: inscripcionId, eventoId },
      select: SELECT_INSCRIPCION_KIT,
    }),
    getKitEvento(eventoId),
  ]);
  return fila ? aInscripcionKit(eventoId, fila, kitEvento) : null;
}

// Mesa de incidencias, con señal: en todos los estados de pago (el caso
// típico es "pagué pero no me aparece"). numeroDocumento se guarda como lo
// escribió el atleta (puede traer puntos), así que se compara normalizado
// en vez de con un `where` exacto.
export async function buscarKitsPorDocumento(
  eventoId: string,
  documento: string,
): Promise<InscripcionKit[]> {
  const buscado = normalizarDocumento(documento);
  if (buscado.length < 3) return [];
  const [filas, kitEvento] = await Promise.all([
    prisma.inscripcion.findMany({
      where: { eventoId },
      orderBy: { createdAt: "desc" },
      select: SELECT_INSCRIPCION_KIT,
    }),
    getKitEvento(eventoId),
  ]);
  return filas
    .filter((f) => normalizarDocumento(f.numeroDocumento) === buscado)
    .slice(0, 10)
    .map((f) => aInscripcionKit(eventoId, f, kitEvento));
}

// Aplica la cola de entregas de un celular. Cada una es un `updateMany`
// condicionado a `kitEntregadoEn: null`: si dos celulares mandan el mismo
// kit, solo el primero actualiza la fila y el otro vuelve como conflicto.
// Es idempotente: si el celular reenvía una entrega que ya quedó (se cortó
// la señal antes de recibir la respuesta), coincide nombre y hora y cuenta
// como aplicada.
export async function aplicarEntregasKits(
  eventoId: string,
  entregas: EntregaPendiente[],
): Promise<ResultadoSincronizacion> {
  const resultado: ResultadoSincronizacion = {
    aplicadas: [],
    conflictos: [],
    rechazadas: [],
  };
  const ahora = Date.now();

  for (const entrega of entregas) {
    // La hora viene del celular: se acepta (puede llegar horas después),
    // pero nunca en el futuro.
    const entregadoEn = new Date(
      Math.min(new Date(entrega.entregadoEn).getTime(), ahora),
    );
    const { count } = await prisma.inscripcion.updateMany({
      where: {
        id: entrega.inscripcionId,
        eventoId,
        estadoPago: "APROBADO",
        kitEntregadoEn: null,
      },
      data: { kitEntregadoEn: entregadoEn, kitEntregadoPor: entrega.entregadoPor },
    });
    if (count === 1) {
      resultado.aplicadas.push(entrega.inscripcionId);
      continue;
    }

    const actual = await prisma.inscripcion.findFirst({
      where: { id: entrega.inscripcionId, eventoId },
      select: {
        nombres: true,
        apellidos: true,
        estadoPago: true,
        kitEntregadoEn: true,
        kitEntregadoPor: true,
      },
    });
    if (!actual || !actual.kitEntregadoEn) {
      resultado.rechazadas.push(entrega.inscripcionId);
    } else if (
      // Reenvío de la misma entrega: mismo nombre y la hora guardada es la
      // del celular, o una anterior si se recortó porque el reloj del
      // celular iba adelantado. (Dos voluntarios con el mismo nombre
      // entregando el mismo kit sin señal no se detectarían; se acepta.)
      actual.kitEntregadoPor === entrega.entregadoPor &&
      actual.kitEntregadoEn.getTime() <=
        new Date(entrega.entregadoEn).getTime()
    ) {
      resultado.aplicadas.push(entrega.inscripcionId);
    } else {
      const conflicto: ConflictoEntrega = {
        inscripcionId: entrega.inscripcionId,
        nombreAtleta: `${actual.nombres} ${actual.apellidos}`,
        entregadoPor: actual.kitEntregadoPor,
        entregadoEn: actual.kitEntregadoEn.toISOString(),
        intentadoPor: entrega.entregadoPor,
      };
      resultado.conflictos.push(conflicto);
    }
  }

  return resultado;
}
