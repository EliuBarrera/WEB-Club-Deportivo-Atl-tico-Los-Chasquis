import type { EstadoPago } from "@prisma/client";

// Mapa de colores del badge de estado de pago, compartido entre el
// listado de inscripciones del admin y la vista de /atletas (Fase 10) —
// antes vivía duplicado solo en el admin.
export const ESTADOS_PAGO = [
  "PENDIENTE",
  "APROBADO",
  "RECHAZADO",
  "DECLINADO",
  "ERROR",
] as const satisfies readonly EstadoPago[];

export const ESTADO_PAGO_BADGE: Record<EstadoPago, string> = {
  APROBADO: "bg-verde text-white",
  PENDIENTE: "bg-amarillo text-white",
  ERROR: "bg-rojo text-white",
  RECHAZADO: "bg-casi-negro/[0.06] text-casi-negro",
  DECLINADO: "bg-casi-negro/[0.06] text-casi-negro",
};

// Estados fallidos y definitivos (nunca se van a reintentar): candidatos a
// purgar una vez el evento ya pasó, para no dejar crecer la tabla
// Inscripcion con intentos muertos. PENDIENTE queda afuera a propósito —
// podría reconciliarse manualmente después — y APROBADO nunca se toca.
// Compartido entre lib/admin/dal.ts (conteo) y
// app/admin/(panel)/inscripciones/actions.ts (borrado), para que ambos
// usen exactamente el mismo criterio.
export const ESTADOS_PAGO_PURGABLES = [
  "ERROR",
  "RECHAZADO",
  "DECLINADO",
] as const satisfies readonly EstadoPago[];
