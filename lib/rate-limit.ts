import { prisma } from "@/lib/prisma";

// Tipado como `Request` (no `NextRequest`) para poder reutilizarse también
// desde el `authorize` de Auth.js (auth.ts), que recibe el `Request` nativo.
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "desconocida";
}

// Rate limiting por IP basado en base de datos (no en memoria del
// proceso): el endpoint de inscripción corre en funciones serverless de
// Vercel, donde cada invocación puede caer en una instancia distinta, así
// que un límite guardado en memoria no sería confiable.
const VENTANA_MS = 10 * 60 * 1000; // 10 minutos
const RETENCION_MS = 24 * 60 * 60 * 1000; // 1 día, para no dejar crecer la tabla

// Intentos permitidos por ventana, según el flujo. Un límite único de 5
// bloqueaba usos normales: una familia o un entrenador inscribiendo a
// varios atletas, o muchas personas saliendo por la misma IP (wifi
// compartido, datos móviles). Se cuenta por IP, no por persona.
//  - inscripcion: ya la protege Turnstile contra bots.
//  - prellenar / atletas: exigen documento + correo exactos, así que no
//    sirven para adivinar datos de otra persona.
//  - admin-login: se mantiene bajo para frenar fuerza bruta de contraseñas.
const LIMITES_POR_CONTEXTO: Record<string, number> = {
  inscripcion: 20,
  prellenar: 20,
  atletas: 10,
  "admin-login": 5,
};
const LIMITE_POR_DEFECTO = 5;

// Devuelve `true` si la IP puede intentar de nuevo (y registra el
// intento); `false` si ya alcanzó el límite en la ventana actual.
// `contexto` separa el cupo por flujo (ej. "inscripcion" vs "atletas",
// Fase 10) para que no compartan el mismo límite de intentos.
export async function checkRateLimit(
  ip: string,
  contexto: string
): Promise<boolean> {
  const ahora = new Date();
  const inicioVentana = new Date(ahora.getTime() - VENTANA_MS);

  const intentosRecientes = await prisma.intentoInscripcion.count({
    where: { ip, contexto, createdAt: { gte: inicioVentana } },
  });

  const limite = LIMITES_POR_CONTEXTO[contexto] ?? LIMITE_POR_DEFECTO;
  if (intentosRecientes >= limite) {
    return false;
  }

  await prisma.intentoInscripcion.create({ data: { ip, contexto } });

  await prisma.intentoInscripcion.deleteMany({
    where: {
      ip,
      contexto,
      createdAt: { lt: new Date(ahora.getTime() - RETENCION_MS) },
    },
  });

  return true;
}
