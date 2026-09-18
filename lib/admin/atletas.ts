import "server-only";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import type { TipoDocumento } from "@prisma/client";

export type AtletaUnico = {
  numeroDocumento: string;
  tipoDocumento: TipoDocumento;
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
  ciudad: string;
  departamento: string;
  club: string | null;
  totalInscripciones: number;
  eventos: string[];
  ultimaInscripcionEn: Date;
};

// Directorio de atletas únicos (CRM, Fase 11): una persona puede tener
// varias Inscripcion (una por evento al que se registró), todas con el
// mismo numeroDocumento — acá se deduplica por ese campo (ya indexado en
// el modelo) en vez de mostrar una fila por inscripción como hace
// getInscripcionesPorEvento. Como viene ordenado del más reciente al más
// viejo, el primer hit por documento define los datos de contacto
// "canónicos" (los más recientes); los siguientes solo suman al contador.
// Esta misma función es la fuente de destinatarios del botón de difusión
// (lib/admin/difusion.ts) — un solo lugar de verdad para "quiénes son
// nuestros atletas".
export async function getAtletasUnicos(): Promise<AtletaUnico[]> {
  await verifySession();

  const inscripciones = await prisma.inscripcion.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      numeroDocumento: true,
      tipoDocumento: true,
      nombres: true,
      apellidos: true,
      celular: true,
      email: true,
      ciudad: true,
      departamento: true,
      club: true,
      createdAt: true,
      evento: { select: { titulo: true } },
    },
  });

  const porDocumento = new Map<string, AtletaUnico>();

  for (const inscripcion of inscripciones) {
    const existente = porDocumento.get(inscripcion.numeroDocumento);
    if (!existente) {
      porDocumento.set(inscripcion.numeroDocumento, {
        numeroDocumento: inscripcion.numeroDocumento,
        tipoDocumento: inscripcion.tipoDocumento,
        nombres: inscripcion.nombres,
        apellidos: inscripcion.apellidos,
        celular: inscripcion.celular,
        email: inscripcion.email,
        ciudad: inscripcion.ciudad,
        departamento: inscripcion.departamento,
        club: inscripcion.club,
        totalInscripciones: 1,
        eventos: [inscripcion.evento.titulo],
        ultimaInscripcionEn: inscripcion.createdAt,
      });
      continue;
    }

    existente.totalInscripciones += 1;
    if (!existente.eventos.includes(inscripcion.evento.titulo)) {
      existente.eventos.push(inscripcion.evento.titulo);
    }
  }

  return [...porDocumento.values()];
}
