import { z } from "zod";

// nombre/rol/fotoUrl van como `null` (no `undefined`) porque así los
// espera Prisma para un campo `String?` — la conversión de "" a null pasa
// en actions.ts antes de llegar acá, no en el schema.
export const testimonioSchema = z.object({
  nombre: z.string().trim().max(120).nullable(),
  rol: z.string().trim().max(120).nullable(),
  cita: z.string().trim().min(1).max(400),
  fotoUrl: z.string().trim().max(500).nullable(),
  destacado: z.boolean().default(false),
  orden: z.coerce.number().int().nonnegative().default(0),
});

export type TestimonioInput = z.infer<typeof testimonioSchema>;
