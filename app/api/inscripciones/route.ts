import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { inscripcionSchema } from "@/lib/validation/inscripcion";
import { generarFirmaIntegridad } from "@/lib/wompi";

// Endpoint de inscripción (Fase 4). El precio, la elegibilidad de
// categoría/prueba/costo y el requisito de acudiente por edad se
// recalculan aquí siempre contra la base de datos: nunca se confía en lo
// que envíe el cliente para esos datos.

// Edad cumplida en `fechaReferencia` (la fecha del evento), calculada en
// UTC para ser consistente con el resto del proyecto (ver lib/format.ts).
function calcularEdad(fechaNacimiento: Date, fechaReferencia: Date): number {
  let edad =
    fechaReferencia.getUTCFullYear() - fechaNacimiento.getUTCFullYear();
  const noHaCumplidoAnios =
    fechaReferencia.getUTCMonth() < fechaNacimiento.getUTCMonth() ||
    (fechaReferencia.getUTCMonth() === fechaNacimiento.getUTCMonth() &&
      fechaReferencia.getUTCDate() < fechaNacimiento.getUTCDate());
  if (noHaCumplidoAnios) edad -= 1;
  return edad;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const puedeIntentar = await checkRateLimit(ip);
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

  const resultado = inscripcionSchema.safeParse(body);
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

  const captchaValido = await verifyTurnstileToken(datos.turnstileToken, ip);
  if (!captchaValido) {
    return NextResponse.json(
      { error: "Verificación de CAPTCHA fallida" },
      { status: 403 }
    );
  }

  const evento = await prisma.evento.findUnique({
    where: { id: datos.eventoId },
    select: {
      id: true,
      estado: true,
      fecha: true,
      precio: true,
      descuento: true,
      categorias: {
        select: {
          id: true,
          pruebas: {
            select: { prueba: { select: { key: true, genero: true } } },
          },
        },
      },
      costos: { select: { id: true, valor: true } },
    },
  });

  if (!evento) {
    return NextResponse.json(
      { error: "El evento no existe" },
      { status: 404 }
    );
  }
  if (evento.estado !== "ABIERTO") {
    return NextResponse.json(
      { error: "Este evento no tiene inscripciones abiertas" },
      { status: 400 }
    );
  }

  let categoriaId: string | null = null;
  let costoId: string | null = null;
  let pruebasIds: string[] = [];
  let totalPago: number;

  if (evento.categorias.length > 0) {
    const categoria = evento.categorias.find(
      (c) => c.id === datos.categoriaId
    );
    if (!categoria) {
      return NextResponse.json(
        { error: "La categoría no pertenece a este evento" },
        { status: 400 }
      );
    }

    const keysValidas = new Set(
      categoria.pruebas
        .filter(
          (cp) =>
            cp.prueba.genero === null || cp.prueba.genero === datos.genero
        )
        .map((cp) => cp.prueba.key)
    );
    const pruebasInvalidas = datos.pruebasIds.filter(
      (key) => !keysValidas.has(key)
    );
    if (pruebasInvalidas.length > 0) {
      return NextResponse.json(
        { error: "Una o más pruebas seleccionadas no son válidas" },
        { status: 400 }
      );
    }

    categoriaId = categoria.id;
    pruebasIds = datos.pruebasIds;
    totalPago = Math.max(0, evento.precio - evento.descuento);
  } else if (evento.costos.length > 0) {
    const costo = evento.costos.find((c) => c.id === datos.costoId);
    if (!costo) {
      return NextResponse.json(
        { error: "El tipo de costo no pertenece a este evento" },
        { status: 400 }
      );
    }
    costoId = costo.id;
    totalPago = costo.valor;
  } else {
    return NextResponse.json(
      { error: "Este evento aún no tiene inscripciones configuradas" },
      { status: 400 }
    );
  }

  const fechaNacimiento = new Date(datos.fechaNacimiento);
  const edad = calcularEdad(fechaNacimiento, evento.fecha);

  if (edad < 18) {
    const faltaAcudiente =
      !datos.nombresAcudiente?.trim() ||
      !datos.apellidosAcudiente?.trim() ||
      !datos.documentoAcudiente?.trim() ||
      !datos.celularAcudiente?.trim();
    if (faltaAcudiente) {
      return NextResponse.json(
        {
          error:
            "El atleta es menor de edad: los datos del acudiente son obligatorios",
        },
        { status: 400 }
      );
    }
  }

  try {
    const inscripcion = await prisma.inscripcion.create({
      data: {
        eventoId: evento.id,
        categoriaId,
        costoId,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        tipoDocumento: datos.tipoDocumento,
        numeroDocumento: datos.numeroDocumento,
        fechaNacimiento,
        edad,
        genero: datos.genero,
        pruebasIds,
        celular: datos.celular,
        email: datos.email,
        ciudad: datos.ciudad,
        departamento: datos.departamento,
        club: datos.club || null,
        condicionesMedicas: datos.condicionesMedicas || null,
        nombresAcudiente: datos.nombresAcudiente || null,
        apellidosAcudiente: datos.apellidosAcudiente || null,
        documentoAcudiente: datos.documentoAcudiente || null,
        celularAcudiente: datos.celularAcudiente || null,
        aceptaTerminos: datos.aceptaTerminos,
        aceptaImagenes: datos.aceptaImagenes,
        totalPago,
        estadoPago: "PENDIENTE",
      },
      select: { id: true },
    });

    // La referencia que se le manda a Wompi es el id de la inscripción: ya
    // es único, así que no hace falta generar ni guardar otro valor aparte.
    const firmaIntegridad = generarFirmaIntegridad({
      reference: inscripcion.id,
      amountInCents: totalPago * 100,
      currency: "COP",
    });

    return NextResponse.json(
      { id: inscripcion.id, totalPago, firmaIntegridad },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando inscripción:", error);
    return NextResponse.json(
      { error: "No se pudo procesar la inscripción, intenta de nuevo" },
      { status: 500 }
    );
  }
}
