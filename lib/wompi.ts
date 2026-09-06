import crypto from "node:crypto";
import type { EstadoPago } from "@prisma/client";

// Integración con Wompi (Fase 5). Los secretos (`WOMPI_INTEGRITY_SECRET`,
// `WOMPI_EVENTS_SECRET`) solo se usan aquí, en código de servidor — nunca se
// exponen a un componente "use client" (mismo criterio que lib/turnstile.ts
// y lib/cloudinary.ts).

type EstadoWompi = "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";

export type WompiEventPayload = {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      status: EstadoWompi;
      amount_in_cents: number;
    };
  };
  timestamp: number;
  signature: {
    properties: string[];
    checksum: string;
  };
};

export type WompiTransaction = {
  id: string;
  reference: string;
  status: EstadoWompi;
  amount_in_cents: number;
};

// Firma de integridad exigida por el checkout de Wompi: sin ella (o con una
// calculada a partir de un monto distinto) Wompi rechaza la transacción, así
// que el monto nunca puede ser manipulado desde el navegador.
export function generarFirmaIntegridad(params: {
  reference: string;
  amountInCents: number;
  currency: "COP";
}): string {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) {
    throw new Error("WOMPI_INTEGRITY_SECRET no está configurada");
  }
  const cadena = `${params.reference}${params.amountInCents}${params.currency}${secret}`;
  return crypto.createHash("sha256").update(cadena).digest("hex");
}

// Resuelve un path tipo "transaction.id" contra el objeto `data` del evento.
function resolverPath(objeto: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (valor, llave) =>
        valor && typeof valor === "object"
          ? (valor as Record<string, unknown>)[llave]
          : undefined,
      objeto
    );
}

// Verifica el checksum del webhook de Wompi antes de confiar en el evento:
// se recalcula con el secreto de eventos (que nunca sale del servidor) y se
// compara contra el checksum recibido, para evitar que alguien falsifique un
// pago aprobado llamando directamente al endpoint del webhook.
export function verificarFirmaEvento(payload: WompiEventPayload): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) {
    console.error("WOMPI_EVENTS_SECRET no está configurada");
    return false;
  }
  if (!payload.signature?.checksum || !payload.signature.properties?.length) {
    return false;
  }

  const valores = payload.signature.properties
    .map((path) => resolverPath(payload.data, path))
    .join("");
  const cadena = `${valores}${payload.timestamp}${secret}`;
  const checksumCalculado = crypto
    .createHash("sha256")
    .update(cadena)
    .digest("hex");

  return (
    checksumCalculado.toLowerCase() === payload.signature.checksum.toLowerCase()
  );
}

export function mapEstadoPago(estado: EstadoWompi): EstadoPago {
  switch (estado) {
    case "APPROVED":
      return "APROBADO";
    case "DECLINED":
      return "RECHAZADO";
    case "PENDING":
      return "PENDIENTE";
    case "VOIDED":
    case "ERROR":
    default:
      return "ERROR";
  }
}

function baseUrlWompi(): string {
  const privateKey = process.env.WOMPI_PRIVATE_KEY ?? "";
  return privateKey.startsWith("prv_test_")
    ? "https://sandbox.wompi.co/v1"
    : "https://production.wompi.co/v1";
}

// Respaldo de reconciliación: consulta directamente el estado de una
// transacción en la API de Wompi (endpoint público, sin autenticación) por
// si el webhook todavía no ha llegado cuando el atleta vuelve del widget.
export async function consultarTransaccion(
  transactionId: string
): Promise<WompiTransaction | null> {
  try {
    const respuesta = await fetch(
      `${baseUrlWompi()}/transactions/${transactionId}`
    );
    if (!respuesta.ok) return null;
    const { data } = (await respuesta.json()) as { data: WompiTransaction };
    return data;
  } catch (error) {
    console.error("Error consultando transacción en Wompi:", error);
    return null;
  }
}
