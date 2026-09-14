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
