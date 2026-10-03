import { z } from "zod";

// Payload de la pestaña Precios del admin (Fase 12.1): se guarda la tabla
// completa de una vez. `clave` identifica cada fila/columna dentro del
// payload — el `id` real si ya existe, o una clave temporal si es nueva —
// para poder referenciar rondas y grupos nuevos desde `tarifas` antes de
// que tengan id en la base.
const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const preciosSchema = z
  .object({
    rondas: z
      .array(
        z.object({
          id: z.string().min(1).optional(),
          clave: z.string().min(1).max(60),
          nombre: z.string().trim().min(1).max(60),
          fechaCierre: z.string().regex(DATETIME_LOCAL),
        })
      )
      .max(10),
    grupos: z
      .array(
        z.object({
          id: z.string().min(1).optional(),
          clave: z.string().min(1).max(60),
          nombre: z.string().trim().min(1).max(60),
          derechos: z.array(z.string().trim().min(1).max(100)).max(20),
        })
      )
      .max(10),
    tarifas: z.array(
      z.object({
        ronda: z.string().min(1),
        grupo: z.string().min(1),
        valor: z.number().int().min(0).max(10_000_000),
      })
    ),
  })
  .superRefine((datos, ctx) => {
    const error = (message: string) => ctx.addIssue({ code: "custom", message });

    const unicos = (lista: string[]) => new Set(lista).size === lista.length;
    if (!unicos(datos.rondas.map((r) => r.clave)) || !unicos(datos.grupos.map((g) => g.clave))) {
      error("Claves repetidas");
    }
    if (!unicos(datos.rondas.map((r) => r.nombre.toLowerCase()))) {
      error("Hay dos rondas con el mismo nombre.");
    }
    if (!unicos(datos.grupos.map((g) => g.nombre.toLowerCase()))) {
      error("Hay dos grupos con el mismo nombre.");
    }

    // El orden de las rondas es el de la lista; sus cierres deben avanzar.
    for (let i = 1; i < datos.rondas.length; i++) {
      if (datos.rondas[i].fechaCierre <= datos.rondas[i - 1].fechaCierre) {
        error(
          `"${datos.rondas[i].nombre}" debe cerrar después de "${datos.rondas[i - 1].nombre}".`
        );
      }
    }

    // Una tarifa por cada combinación ronda × grupo, ni más ni menos.
    const esperadas = new Set(
      datos.rondas.flatMap((r) => datos.grupos.map((g) => `${r.clave}|${g.clave}`))
    );
    const recibidas = datos.tarifas.map((t) => `${t.ronda}|${t.grupo}`);
    if (
      recibidas.length !== esperadas.size ||
      !unicos(recibidas) ||
      !recibidas.every((k) => esperadas.has(k))
    ) {
      error("Falta el valor de alguna tarifa.");
    }
  });

export type PreciosInput = z.infer<typeof preciosSchema>;
