"use server";

import { revalidatePath } from "next/cache";
import {
  accesoKitsPorSesion,
  aplicarEntregasKits,
  buscarKitsPorDocumento,
  getInscripcionKit,
  generarTokenEntregaKits,
  getListaKits,
  revocarTokenEntregaKits,
} from "@/lib/admin/kits";
import type {
  EntregaPendiente,
  InscripcionKit,
  ListaKits,
  ResultadoSincronizacion,
} from "@/lib/kits/tipos";
import {
  documentoKitsSchema,
  entregasKitsSchema,
  inscripcionIdKitsSchema,
} from "@/lib/validation/entregaKits";

// Acciones de la entrega de kits para usuarios del panel (Fase 13.2). Las
// mismas tres operaciones que app/kits/[token]/actions.ts, pero
// autorizadas por la sesión en vez del token. Devuelven `null` si no hay
// acceso; EntregaKits lo muestra como "sin acceso".

export async function listaKitsSesionAction(
  eventoId: string,
): Promise<ListaKits | null> {
  const acceso = await accesoKitsPorSesion(eventoId);
  return acceso ? getListaKits(acceso.eventoId) : null;
}

export async function sincronizarKitsSesionAction(
  eventoId: string,
  entregas: EntregaPendiente[],
): Promise<ResultadoSincronizacion | null> {
  const acceso = await accesoKitsPorSesion(eventoId);
  if (!acceso) return null;
  return aplicarEntregasKits(acceso.eventoId, entregasKitsSchema.parse(entregas));
}

// `null` = sin acceso; `{ inscripcion: null }` = no es de este evento.
export async function consultarKitSesionAction(
  eventoId: string,
  inscripcionId: string,
): Promise<{ inscripcion: InscripcionKit | null } | null> {
  const acceso = await accesoKitsPorSesion(eventoId);
  if (!acceso) return null;
  return {
    inscripcion: await getInscripcionKit(
      acceso.eventoId,
      inscripcionIdKitsSchema.parse(inscripcionId),
    ),
  };
}

export async function buscarDocumentoSesionAction(
  eventoId: string,
  documento: string,
): Promise<InscripcionKit[] | null> {
  const acceso = await accesoKitsPorSesion(eventoId);
  if (!acceso) return null;
  return buscarKitsPorDocumento(
    acceso.eventoId,
    documentoKitsSchema.parse(documento),
  );
}

export async function generarEnlaceKitsAction(eventoId: string) {
  await generarTokenEntregaKits(eventoId);
  revalidatePath(`/admin/entrega-kits/${eventoId}`);
}

export async function revocarEnlaceKitsAction(eventoId: string) {
  await revocarTokenEntregaKits(eventoId);
  revalidatePath(`/admin/entrega-kits/${eventoId}`);
}
