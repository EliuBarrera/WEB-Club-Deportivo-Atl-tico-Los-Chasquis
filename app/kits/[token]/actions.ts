"use server";

import {
  accesoKitsPorToken,
  aplicarEntregasKits,
  buscarKitsPorDocumento,
  getInscripcionKit,
  getListaKits,
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

// Acciones de la entrega de kits para voluntarios sin cuenta (Fase 13.2):
// cada una revalida el token del enlace, así que revocarlo en el panel
// corta el acceso en la siguiente sincronización. Devuelven `null` si el
// enlace ya no vale.

export async function listaKitsTokenAction(
  token: string,
): Promise<ListaKits | null> {
  const acceso = await accesoKitsPorToken(token);
  return acceso ? getListaKits(acceso.eventoId) : null;
}

export async function sincronizarKitsTokenAction(
  token: string,
  entregas: EntregaPendiente[],
): Promise<ResultadoSincronizacion | null> {
  const acceso = await accesoKitsPorToken(token);
  if (!acceso) return null;
  return aplicarEntregasKits(acceso.eventoId, entregasKitsSchema.parse(entregas));
}

// `null` = sin acceso; `{ inscripcion: null }` = no es de este evento.
export async function consultarKitTokenAction(
  token: string,
  inscripcionId: string,
): Promise<{ inscripcion: InscripcionKit | null } | null> {
  const acceso = await accesoKitsPorToken(token);
  if (!acceso) return null;
  return {
    inscripcion: await getInscripcionKit(
      acceso.eventoId,
      inscripcionIdKitsSchema.parse(inscripcionId),
    ),
  };
}

export async function buscarDocumentoTokenAction(
  token: string,
  documento: string,
): Promise<InscripcionKit[] | null> {
  const acceso = await accesoKitsPorToken(token);
  if (!acceso) return null;
  return buscarKitsPorDocumento(
    acceso.eventoId,
    documentoKitsSchema.parse(documento),
  );
}
