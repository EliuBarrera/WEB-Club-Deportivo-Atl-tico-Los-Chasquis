import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { prellenarAtletaSchema } from "@/lib/validation/atletas";

// Autorrelleno del formulario de inscripción: si numeroDocumento+email
// coinciden con una inscripción anterior, devuelve los datos personales de
// la más reciente. Exigir ambos datos (como en /api/atletas/buscar) evita
// que con solo un documento se puedan leer datos de otra persona.
// `condicionesMedicas` no se devuelve a propósito: es un dato sensible y
// puede haber cambiado, así que el atleta lo vuelve a escribir.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const puedeIntentar = await checkRateLimit(ip, "prellenar");
  if (!puedeIntentar) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta de nuevo más tarde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la petición no es JSON válido" },
      { status: 400 }
    );
  }

  const resultado = prellenarAtletaSchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        fieldErrors: resultado.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  const datos = resultado.data;

  const filtro = {
    numeroDocumento: datos.numeroDocumento,
    email: { equals: datos.email, mode: "insensitive" as const },
  };

  const [anterior, inscripcionEvento] = await Promise.all([
    prisma.inscripcion.findFirst({
      where: filtro,
      orderBy: { createdAt: "desc" },
      select: {
        nombres: true,
        apellidos: true,
        tipoDocumento: true,
        fechaNacimiento: true,
        genero: true,
        celular: true,
        ciudad: true,
        departamento: true,
        club: true,
        nombresAcudiente: true,
        apellidosAcudiente: true,
        documentoAcudiente: true,
        celularAcudiente: true,
      },
    }),
    prisma.inscripcion.findFirst({
      where: { ...filtro, eventoId: datos.eventoId },
      select: { estadoPago: true },
    }),
  ]);

  if (!anterior) {
    return NextResponse.json({ encontrado: false });
  }

  return NextResponse.json({
    encontrado: true,
    // Solo informativo: el formulario avisa, pero no bloquea, porque un
    // atleta puede haber dejado una inscripción sin pagar y querer rehacerla.
    yaInscritoEstado: inscripcionEvento?.estadoPago ?? null,
    atleta: {
      ...anterior,
      // Formato de <input type="date">.
      fechaNacimiento: anterior.fechaNacimiento.toISOString().slice(0, 10),
    },
  });
}
