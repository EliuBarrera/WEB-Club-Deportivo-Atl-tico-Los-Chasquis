import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { buscarAtletaSchema } from "@/lib/validation/atletas";
import { firmarSesion } from "@/lib/atletas/sesion";

// Endpoint de identificación de /atletas (Fase 10): recibe
// numeroDocumento+email, y si coinciden con al menos una Inscripcion
// real, arma una cookie de sesión temporal firmada (lib/atletas/sesion.ts).
// Mismo mensaje de error genérico sin importar cuál de los dos datos no
// coincide, para no delatar si un documento está o no registrado (mismo
// espíritu que el hash señuelo del login admin en auth.ts).
const MENSAJE_SIN_MATCH =
  "No encontramos inscripciones con esos datos. Verifica el número de documento y el correo usados al inscribirte.";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const puedeIntentar = await checkRateLimit(ip, "atletas");
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

  const resultado = buscarAtletaSchema.safeParse(body);
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

  const coincidencia = await prisma.inscripcion.findFirst({
    where: { numeroDocumento: datos.numeroDocumento, email: datos.email },
    select: { id: true },
  });

  if (!coincidencia) {
    return NextResponse.json({ error: MENSAJE_SIN_MATCH }, { status: 404 });
  }

  const token = firmarSesion({
    numeroDocumento: datos.numeroDocumento,
    email: datos.email,
  });

  const respuesta = NextResponse.json({ ok: true }, { status: 200 });
  respuesta.cookies.set("atleta_sesion", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60,
  });
  return respuesta;
}
