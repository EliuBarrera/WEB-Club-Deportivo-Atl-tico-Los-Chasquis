import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  mapEstadoPago,
  verificarFirmaEvento,
  type WompiEventPayload,
} from "@/lib/wompi";

// Webhook de confirmación de Wompi (Fase 5). Se verifica la firma/checksum
// del evento con WOMPI_EVENTS_SECRET antes de procesar cualquier cambio de
// estado, para que nadie pueda falsificar un pago aprobado llamando
// directamente a este endpoint.
export async function POST(request: NextRequest) {
  let payload: WompiEventPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la petición no es JSON válido" },
      { status: 400 }
    );
  }

  if (!verificarFirmaEvento(payload)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (payload.event !== "transaction.updated") {
    return NextResponse.json({ recibido: true });
  }

  const { transaction } = payload.data;

  try {
    // `update` con los mismos valores no duplica ni rompe nada si Wompi
    // reenvía el mismo evento — el endpoint es idempotente por construcción.
    await prisma.inscripcion.update({
      where: { id: transaction.reference },
      data: {
        estadoPago: mapEstadoPago(transaction.status),
        wompiTransactionId: transaction.id,
        wompiReference: transaction.reference,
      },
    });
  } catch (error) {
    // La inscripción referenciada no existe: no hay nada que reintentar, así
    // que se registra y se responde 200 igual para no generar reintentos.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error(
        `Webhook de Wompi: inscripción no encontrada para reference=${transaction.reference}`
      );
    } else {
      console.error("Error procesando webhook de Wompi:", error);
    }
  }

  return NextResponse.json({ recibido: true });
}
