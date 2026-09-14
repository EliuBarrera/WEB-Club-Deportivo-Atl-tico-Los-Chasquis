import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionAtleta } from "@/lib/atletas/dal";
import { generarFirmaIntegridad } from "@/lib/wompi";

// Recalcula la firma de integridad de Wompi para que un atleta pueda
// reabrir el widget de pago desde /atletas cuando una inscripción no quedó
// APROBADO (Fase 10, backlog) — mismo cálculo que
// app/api/inscripciones/route.ts al crear la inscripción, nunca se confía
// en un monto que venga del cliente. Requiere sesión de atleta válida y que
// la inscripción sea del mismo documento+email de la sesión.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sesion = await getSesionAtleta();
  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id },
    select: {
      numeroDocumento: true,
      email: true,
      estadoPago: true,
      totalPago: true,
    },
  });

  if (
    !inscripcion ||
    inscripcion.numeroDocumento !== sesion.numeroDocumento ||
    inscripcion.email !== sesion.email
  ) {
    return NextResponse.json(
      { error: "La inscripción no existe" },
      { status: 404 }
    );
  }

  if (inscripcion.estadoPago === "APROBADO") {
    return NextResponse.json(
      { error: "Esta inscripción ya tiene el pago aprobado" },
      { status: 400 }
    );
  }

  const firmaIntegridad = generarFirmaIntegridad({
    reference: id,
    amountInCents: inscripcion.totalPago * 100,
    currency: "COP",
  });

  return NextResponse.json({
    totalPago: inscripcion.totalPago,
    firmaIntegridad,
  });
}
