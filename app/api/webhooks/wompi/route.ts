import { NextResponse, after, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  mapEstadoPago,
  verificarFirmaEvento,
  type WompiEventPayload,
} from "@/lib/wompi";
import { enviarNotificacionPagoAprobado } from "@/lib/notificacionPago";

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
      { status: 400 },
    );
  }

  if (!verificarFirmaEvento(payload)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (payload.event !== "transaction.updated") {
    return NextResponse.json({ recibido: true });
  }

  const { transaction } = payload.data;
  const nuevoEstado = mapEstadoPago(transaction.status);

  try {
    // Se lee el estado previo antes de actualizar para saber si esto es una
    // transición real hacia APROBADO o un reenvío del mismo evento (Wompi
    // reenvía notificaciones, y el endpoint es idempotente por
    // construcción) — la notificación de pago aprobado (Fase 11) solo debe
    // dispararse una vez, no en cada reintento.
    const anterior = await prisma.inscripcion.findUnique({
      where: { id: transaction.reference },
      select: { estadoPago: true },
    });

    const inscripcion = await prisma.inscripcion.update({
      where: { id: transaction.reference },
      data: {
        estadoPago: nuevoEstado,
        wompiTransactionId: transaction.id,
        wompiReference: transaction.reference,
      },
      select: {
        nombres: true,
        celular: true,
        email: true,
        totalPago: true,
        evento: { select: { titulo: true, fecha: true, ubicacion: true } },
      },
    });

    if (nuevoEstado === "APROBADO" && anterior?.estadoPago !== "APROBADO") {
      // after() difiere el envío hasta después de responder — el webhook
      // no espera a que WhatsApp/correo terminen, pero Vercel mantiene la
      // función viva hasta que la promesa se resuelva (a diferencia de un
      // simple "fire and forget" sin await, que puede cortarse apenas se
      // envía la respuesta). enviarNotificacionPagoAprobado ya nunca lanza,
      // así que un fallo de WhatsApp/correo no puede convertirse en un
      // reintento de Wompi sobre algo que en la base sí quedó bien guardado.
      after(() => enviarNotificacionPagoAprobado(inscripcion));
    }
  } catch (error) {
    // La inscripción referenciada no existe: no hay nada que reintentar, así
    // que se registra y se responde 200 igual para no generar reintentos.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error(
        `Webhook de Wompi: inscripción no encontrada para reference=${transaction.reference}`,
      );
    } else {
      console.error("Error procesando webhook de Wompi:", error);
    }
  }

  return NextResponse.json({ recibido: true });
}
