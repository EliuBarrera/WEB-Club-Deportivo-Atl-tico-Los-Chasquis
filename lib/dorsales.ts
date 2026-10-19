import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Asignación de dorsal (Fase 13.1). Se llama solo cuando la inscripción
// queda APROBADA (webhook de Wompi y camino gratuito de 12.2) — nunca se
// recibe el número del cliente.
//
// Es idempotente: si la inscripción ya tiene dorsal, devuelve ese mismo.
// Dos aprobaciones simultáneas pueden calcular el mismo "siguiente" número;
// el índice único (eventoId, dorsal) rechaza al segundo y ese intento se
// repite con el máximo ya actualizado.

const INTENTOS_MAXIMOS = 5;

export async function asignarDorsal(
  inscripcionId: string,
  eventoId: string,
): Promise<number> {
  for (let intento = 0; intento < INTENTOS_MAXIMOS; intento++) {
    const actual = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      select: { dorsal: true },
    });
    if (actual?.dorsal) return actual.dorsal;

    const maximo = await prisma.inscripcion.aggregate({
      where: { eventoId },
      _max: { dorsal: true },
    });
    const siguiente = (maximo._max.dorsal ?? 0) + 1;

    try {
      await prisma.inscripcion.update({
        where: { id: inscripcionId, dorsal: null },
        data: { dorsal: siguiente },
      });
      return siguiente;
    } catch (error) {
      // P2002: otro dorsal igual ya existe en el evento (carrera de dos
      // aprobaciones). P2025: otra petición ya asignó dorsal a esta
      // inscripción. En ambos casos se vuelve a leer y reintentar.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2002" || error.code === "P2025")
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `No se pudo asignar dorsal a la inscripción ${inscripcionId} tras ${INTENTOS_MAXIMOS} intentos`,
  );
}
