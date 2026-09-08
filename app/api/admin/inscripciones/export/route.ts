import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  NoAutorizadoError,
  getInscripcionesParaExport,
  requireAdmin,
} from "@/lib/admin/dal";
import { construirCsvInscripciones } from "@/lib/admin/csv";

// Debe ser un Route Handler (no un Server Component/Action) porque necesita
// devolver un archivo con `Content-Disposition: attachment`. Revalida sesión
// + rol ADMIN aquí mismo, sin confiar en proxy.ts (ver nota en proxy.ts): el
// CSV incluye datos personales de menores, es el punto más sensible del
// panel admin.
const querySchema = z.object({
  eventoId: z.string().min(1),
  estadoPago: z
    .enum(["PENDIENTE", "APROBADO", "RECHAZADO", "DECLINADO", "ERROR"])
    .optional(),
  categoriaId: z.string().min(1).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    throw error;
  }

  const resultado = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!resultado.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", fieldErrors: resultado.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const filtros = resultado.data;

  const inscripciones = await getInscripcionesParaExport(filtros);
  const csv = construirCsvInscripciones(inscripciones);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscripciones-${filtros.eventoId}.csv"`,
    },
  });
}
