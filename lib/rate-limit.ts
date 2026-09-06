import { prisma } from "@/lib/prisma";

// Rate limiting por IP basado en base de datos (no en memoria del
// proceso): el endpoint de inscripción corre en funciones serverless de
// Vercel, donde cada invocación puede caer en una instancia distinta, así
// que un límite guardado en memoria no sería confiable.
const VENTANA_MS = 10 * 60 * 1000; // 10 minutos
const LIMITE_INTENTOS = 5;
const RETENCION_MS = 24 * 60 * 60 * 1000; // 1 día, para no dejar crecer la tabla

// Devuelve `true` si la IP puede intentar de nuevo (y registra el
// intento); `false` si ya alcanzó el límite en la ventana actual.
export async function checkRateLimit(ip: string): Promise<boolean> {
  const ahora = new Date();
  const inicioVentana = new Date(ahora.getTime() - VENTANA_MS);

  const intentosRecientes = await prisma.intentoInscripcion.count({
    where: { ip, createdAt: { gte: inicioVentana } },
  });

  if (intentosRecientes >= LIMITE_INTENTOS) {
    return false;
  }

  await prisma.intentoInscripcion.create({ data: { ip } });

  await prisma.intentoInscripcion.deleteMany({
    where: { ip, createdAt: { lt: new Date(ahora.getTime() - RETENCION_MS) } },
  });

  return true;
}
