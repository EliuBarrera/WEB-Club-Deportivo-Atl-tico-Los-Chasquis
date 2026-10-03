import "server-only";
import { prisma } from "@/lib/prisma";
import { fechaCierreDesdeInput } from "@/lib/precios";
import type { PreciosInput } from "@/lib/validation/precios";

// Guarda la tabla de precios de un evento (Fase 12.1) — rondas, grupos de
// tarifa y tarifas — en una transacción. `datos` ya viene validado por
// preciosSchema; aquí se valida lo que depende de la base: que los ids
// sean de este evento y que no se quite una ronda o un grupo con
// inscripciones (su FK es SET NULL y se perdería con qué ronda/grupo pagó
// cada quien). Quitar un grupo sí deja sin grupo a sus categorías.
export async function guardarPreciosEvento(
  eventoId: string,
  datos: PreciosInput,
): Promise<{ ok: true } | { error: string }> {
  const actual = await prisma.evento.findUnique({
    where: { id: eventoId },
    select: {
      rondas: {
        select: {
          id: true,
          nombre: true,
          _count: { select: { inscripciones: true } },
        },
      },
      gruposTarifa: {
        select: {
          id: true,
          nombre: true,
          _count: { select: { inscripciones: true } },
        },
      },
    },
  });
  if (!actual) return { error: "El evento no existe." };

  const idsRondas = new Set(actual.rondas.map((r) => r.id));
  const idsGrupos = new Set(actual.gruposTarifa.map((g) => g.id));
  if (
    datos.rondas.some((r) => r.id && !idsRondas.has(r.id)) ||
    datos.grupos.some((g) => g.id && !idsGrupos.has(g.id))
  ) {
    return { error: "Datos inválidos." };
  }

  const rondasQuedan = new Set(
    datos.rondas.flatMap((r) => (r.id ? [r.id] : [])),
  );
  const gruposQuedan = new Set(
    datos.grupos.flatMap((g) => (g.id ? [g.id] : [])),
  );
  const rondasBorradas = actual.rondas.filter((r) => !rondasQuedan.has(r.id));
  const gruposBorrados = actual.gruposTarifa.filter(
    (g) => !gruposQuedan.has(g.id),
  );

  const rondaUsada = rondasBorradas.find((r) => r._count.inscripciones > 0);
  if (rondaUsada) {
    return {
      error: `No se puede quitar la ronda "${rondaUsada.nombre}": ya tiene inscripciones.`,
    };
  }
  const grupoUsado = gruposBorrados.find((g) => g._count.inscripciones > 0);
  if (grupoUsado) {
    return {
      error: `No se puede quitar el grupo "${grupoUsado.nombre}": ya tiene inscripciones.`,
    };
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.rondaInscripcion.deleteMany({
        where: { id: { in: rondasBorradas.map((r) => r.id) } },
      });
      await tx.grupoTarifa.deleteMany({
        where: { id: { in: gruposBorrados.map((g) => g.id) } },
      });

      // Valores temporales para no chocar con los índices únicos
      // (eventoId+orden, eventoId+nombre) al reordenar o renombrar.
      for (const [i, id] of [...rondasQuedan].entries()) {
        await tx.rondaInscripcion.update({
          where: { id },
          data: { orden: 1000 + i },
        });
      }
      for (const id of gruposQuedan) {
        await tx.grupoTarifa.update({
          where: { id },
          data: { nombre: `__tmp__${id}` },
        });
      }

      const idPorClave = new Map<string, string>();
      for (const [i, r] of datos.rondas.entries()) {
        const data = {
          nombre: r.nombre,
          orden: i + 1,
          fechaCierre: fechaCierreDesdeInput(r.fechaCierre),
        };
        const fila = r.id
          ? await tx.rondaInscripcion.update({ where: { id: r.id }, data })
          : await tx.rondaInscripcion.create({ data: { ...data, eventoId } });
        idPorClave.set(`r:${r.clave}`, fila.id);
      }
      for (const [i, g] of datos.grupos.entries()) {
        const data = { nombre: g.nombre, orden: i, derechos: g.derechos };
        const fila = g.id
          ? await tx.grupoTarifa.update({ where: { id: g.id }, data })
          : await tx.grupoTarifa.create({ data: { ...data, eventoId } });
        idPorClave.set(`g:${g.clave}`, fila.id);
      }

      await tx.tarifaInscripcion.deleteMany({ where: { ronda: { eventoId } } });
      await tx.tarifaInscripcion.createMany({
        data: datos.tarifas.map((t) => ({
          rondaId: idPorClave.get(`r:${t.ronda}`)!,
          grupoTarifaId: idPorClave.get(`g:${t.grupo}`)!,
          valor: t.valor,
        })),
      });
    },
    { timeout: 20_000 },
  );

  return { ok: true };
}
