// Fase 12.1: pasa los eventos existentes del modelo precio/descuento/Costo
// al modelo de rondas. Idempotente (omite eventos que ya tienen rondas).
// Por defecto solo simula; escribe en la base solo con `--aplicar`:
//   npx tsx prisma/migrar-precios-rondas.ts            (simulación)
//   npx tsx prisma/migrar-precios-rondas.ts --aplicar
//
// Cada evento queda con UNA ronda que cierra en la fecha del evento y el
// precio que el sistema realmente cobraba: `precio - descuento` (el código
// anterior restaba el descuento siempre — `fechaLimiteDescuento` está
// vacío en todos los eventos, así que no hay fecha de corte real que
// reconstruir) o el valor de cada `Costo`. No se inventan rondas.
import "dotenv/config";
import { prisma } from "../lib/prisma";

const aplicar = process.argv.includes("--aplicar");

async function main() {
  const eventos = await prisma.evento.findMany({
    orderBy: { fecha: "asc" },
    select: {
      id: true,
      titulo: true,
      fecha: true,
      precio: true,
      descuento: true,
      _count: { select: { rondas: true } },
      categorias: { select: { id: true } },
      costos: { select: { id: true, tipo: true, valor: true } },
    },
  });

  for (const evento of eventos) {
    if (evento._count.rondas > 0) {
      console.log(`· "${evento.titulo}": ya tiene rondas, se omite`);
      continue;
    }

    let grupos: { nombre: string; valor: number; costoId?: string }[];
    if (evento.categorias.length > 0) {
      grupos = [
        { nombre: "General", valor: Math.max(0, evento.precio - evento.descuento) },
      ];
    } else if (evento.costos.length > 0) {
      grupos = evento.costos.map((c) => ({
        nombre: c.tipo,
        valor: c.valor,
        costoId: c.id,
      }));
    } else {
      console.log(
        `! "${evento.titulo}": sin categorías ni costos, se omite (configurar rondas desde el admin)`
      );
      continue;
    }

    console.log(
      `${aplicar ? "✓" : "→"} "${evento.titulo}": ronda única hasta ${evento.fecha.toISOString().slice(0, 10)}, ` +
        grupos.map((g) => `${g.nombre} $${g.valor}`).join(", ")
    );
    if (!aplicar) continue;

    await prisma.$transaction(async (tx) => {
      const ronda = await tx.rondaInscripcion.create({
        data: {
          eventoId: evento.id,
          orden: 1,
          nombre: "Inscripción",
          fechaCierre: evento.fecha,
        },
      });

      for (const [i, g] of grupos.entries()) {
        const grupo = await tx.grupoTarifa.create({
          data: { eventoId: evento.id, nombre: g.nombre, orden: i },
        });
        await tx.tarifaInscripcion.create({
          data: { rondaId: ronda.id, grupoTarifaId: grupo.id, valor: g.valor },
        });

        if (g.costoId) {
          await tx.inscripcion.updateMany({
            where: { costoId: g.costoId },
            data: { grupoTarifaId: grupo.id },
          });
        } else {
          await tx.categoria.updateMany({
            where: { eventoId: evento.id },
            data: { grupoTarifaId: grupo.id },
          });
        }
      }
    });
  }

  if (!aplicar) console.log("\nSimulación: no se escribió nada. Use --aplicar.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
