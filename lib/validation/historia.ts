import { z } from "zod";

// `anio` va como `null` (no `undefined`) porque así lo espera Prisma para
// un campo `Int?` — la conversión de "" a null pasa en actions.ts, no acá.
export const hitoHistoricoSchema = z.object({
  anio: z.coerce.number().int().min(1900).max(2100).nullable(),
  titulo: z.string().trim().min(1).max(160),
  descripcion: z.string().trim().min(1).max(2000),
  imagenUrl: z.string().trim().max(500).nullable(),
  orden: z.coerce.number().int().nonnegative().default(0),
});

export type HitoHistoricoInput = z.infer<typeof hitoHistoricoSchema>;
