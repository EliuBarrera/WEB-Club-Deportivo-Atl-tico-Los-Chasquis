import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionAtleta } from "@/lib/atletas/dal";
import { generarCertificadoPdf } from "@/lib/atletas/certificado";

// Descarga del certificado de inscripción (Fase 10, backlog). Debe ser un
// Route Handler (no un Server Component) porque devuelve un archivo con
// Content-Disposition — mismo criterio que el export de CSV del admin
// (app/api/admin/inscripciones/export/route.ts). La sesión de atleta
// (cookie httpOnly) viaja sola en la navegación normal del navegador hacia
// este endpoint, así que un <a href> simple alcanza sin necesitar fetch.
export async function GET(
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
      nombres: true,
      apellidos: true,
      numeroDocumento: true,
      email: true,
      estadoPago: true,
      evento: { select: { titulo: true, fecha: true } },
      categoria: { select: { nombre: true } },
      costo: { select: { tipo: true } },
    },
  });

  // Mismo criterio de no dar pistas que el resto de /atletas: si la
  // inscripción no existe o no es del atleta de la sesión actual, el
  // mensaje es igual (404), no se distingue el motivo.
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

  if (inscripcion.estadoPago !== "APROBADO") {
    return NextResponse.json(
      { error: "El certificado solo está disponible para pagos aprobados" },
      { status: 400 }
    );
  }

  const pdfBytes = await generarCertificadoPdf({
    nombres: inscripcion.nombres,
    apellidos: inscripcion.apellidos,
    eventoTitulo: inscripcion.evento.titulo,
    eventoFecha: inscripcion.evento.fecha,
    categoria: inscripcion.categoria?.nombre ?? inscripcion.costo?.tipo ?? null,
    inscripcionId: id,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${id}.pdf"`,
    },
  });
}
