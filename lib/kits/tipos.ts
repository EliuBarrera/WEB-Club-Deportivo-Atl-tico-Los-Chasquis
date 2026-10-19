import type { EstadoPago } from "@prisma/client";

// Tipos y helpers de la entrega de kits (Fase 13.2) compartidos entre el
// servidor (lib/admin/kits.ts) y el celular del voluntario
// (components/admin/EntregaKits.tsx). Sin "server-only": todo lo de aquí
// puede viajar al cliente.

// Lo que el celular guarda de cada inscripción. Nunca datos médicos,
// celular ni email; del documento solo los últimos dígitos (para mostrar)
// y un hash (para la búsqueda manual sin conexión).
export type InscripcionKit = {
  id: string;
  nombreCompleto: string;
  documentoFinal: string;
  documentoHash: string;
  estadoPago: EstadoPago;
  categoria: string | null;
  tallaCamiseta: string | null;
  dorsal: number | null;
  derechos: string[];
  kitEntregadoEn: string | null;
  kitEntregadoPor: string | null;
};

export type ListaKits = {
  eventoId: string;
  inscripciones: InscripcionKit[];
  descargadaEn: string;
};

// Entrega hecha en el celular, pendiente de llegar al servidor.
export type EntregaPendiente = {
  inscripcionId: string;
  entregadoEn: string;
  entregadoPor: string;
};

// Kit que dos celulares entregaron estando ambos sin señal: queda el que
// llegó primero al servidor; el otro se muestra para que la mesa revise.
export type ConflictoEntrega = {
  inscripcionId: string;
  nombreAtleta: string;
  entregadoPor: string | null;
  entregadoEn: string | null;
  intentadoPor: string;
};

export type ResultadoSincronizacion = {
  aplicadas: string[];
  conflictos: ConflictoEntrega[];
  // Ya no se puede entregar (inscripción borrada o pago revertido).
  rechazadas: string[];
};

export const MAX_ENTREGAS_POR_ENVIO = 500;

// "1.049.123.456", "1049 123456" → "1049123456". Las letras se conservan
// (pasaportes) en mayúscula.
export function normalizarDocumento(documento: string): string {
  return documento.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
}

// Mismo texto de entrada en servidor (node:crypto) y en el celular
// (crypto.subtle) para que los hashes coincidan. El eventoId funciona como
// sal: el hash de un documento no sirve para otro evento.
export function textoHashDocumento(eventoId: string, documento: string) {
  return `${eventoId}:${normalizarDocumento(documento)}`;
}
