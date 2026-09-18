"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySessionAdmin } from "@/lib/admin/dal";
import { ESTADOS_PAGO_PURGABLES } from "@/lib/estadoPagoBadge";

// Borrado manual de inscripciones fallidas y definitivas (ERROR,
// RECHAZADO, DECLINADO) de eventos que ya pasaron — a pedido del club,
// para no dejar crecer la tabla Inscripcion con intentos que nunca se van
// a reintentar. Requiere rol ADMIN, no EDITOR (verifySessionAdmin), mismo
// criterio que la difusión masiva: es una acción irreversible sobre datos
// de muchos atletas a la vez, no el borrado de un solo registro.
// El conteo que el admin confirma antes de llamar esto (ver
// PurgarInscripcionesButton) sale de getConteoInscripcionesPurgables en
// lib/admin/dal.ts, con exactamente el mismo criterio.
export async function purgarInscripcionesFallidas() {
  await verifySessionAdmin();

  const resultado = await prisma.inscripcion.deleteMany({
    where: {
      estadoPago: { in: [...ESTADOS_PAGO_PURGABLES] },
      evento: { fecha: { lt: new Date() } },
    },
  });

  revalidatePath("/admin/inscripciones");
  redirect(`/admin/inscripciones?purgado=${resultado.count}`);
}
