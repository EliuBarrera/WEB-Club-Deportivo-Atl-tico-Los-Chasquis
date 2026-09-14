import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verificarSesion } from "@/lib/atletas/sesion";

// Data Access Layer pública de /atletas (Fase 10). A diferencia de
// lib/admin/dal.ts, no hay redirect a un "login": si no hay sesión válida
// simplemente no hay datos que mostrar (la página renderiza el formulario
// de búsqueda en su lugar).
export async function getSesionAtleta() {
  const jar = await cookies();
  return verificarSesion(jar.get("atleta_sesion")?.value);
}

// La cookie solo identifica al atleta (numeroDocumento+email); el listado
// se vuelve a consultar en cada carga para reflejar cambios de estado de
// pago en vivo, nunca se cachea en la cookie.
export async function getInscripcionesAtleta() {
  const sesion = await getSesionAtleta();
  if (!sesion) return null;

  return prisma.inscripcion.findMany({
    where: {
      numeroDocumento: sesion.numeroDocumento,
      email: sesion.email,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      estadoPago: true,
      totalPago: true,
      pruebasIds: true,
      createdAt: true,
      evento: { select: { id: true, titulo: true, fecha: true, imagenUrl: true } },
      categoria: { select: { nombre: true } },
      costo: { select: { tipo: true } },
    },
  });
}

export type InscripcionAtleta = NonNullable<
  Awaited<ReturnType<typeof getInscripcionesAtleta>>
>[number];
