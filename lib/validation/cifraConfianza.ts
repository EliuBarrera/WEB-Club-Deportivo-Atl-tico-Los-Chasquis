import { z } from "zod";

export const cifraConfianzaSchema = z.object({
  etiqueta: z.string().trim().min(1).max(80),
  valor: z.string().trim().min(1).max(20),
  orden: z.coerce.number().int().nonnegative().default(0),
});

export type CifraConfianzaInput = z.infer<typeof cifraConfianzaSchema>;
