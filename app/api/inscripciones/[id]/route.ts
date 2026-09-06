import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { consultarTransaccion, mapEstadoPago } from "@/lib/wompi";

// Consulta de estado de pago (Fase 5), usada por el frontend tras volver del
// widget de Wompi. Solo expone `estadoPago` — nunca los datos personales de
// la inscripción (esos quedan restringidos al panel de admin en Fase 6).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id },
    select: { id: true, estadoPago: true },
  });

  if (!inscripcion) {
    return NextResponse.json(
      { error: "La inscripción no existe" },
      { status: 404 }
    );
  }

  // Si el pago sigue pendiente y el cliente trae el id de transacción que
  // devolvió el widget, se reconcilia contra la API de Wompi directamente:
  // así la UI no depende de que el webhook ya haya llegado.
  const transactionId = request.nextUrl.searchParams.get("tx");
  if (inscripcion.estadoPago === "PENDIENTE" && transactionId) {
    const transaccion = await consultarTransaccion(transactionId);
    if (transaccion && transaccion.reference === inscripcion.id) {
      const actualizada = await prisma.inscripcion.update({
        where: { id: inscripcion.id },
        data: {
          estadoPago: mapEstadoPago(transaccion.status),
          wompiTransactionId: transaccion.id,
          wompiReference: transaccion.reference,
        },
        select: { estadoPago: true },
      });
      return NextResponse.json({ estadoPago: actualizada.estadoPago });
    }
  }

  return NextResponse.json({ estadoPago: inscripcion.estadoPago });
}
