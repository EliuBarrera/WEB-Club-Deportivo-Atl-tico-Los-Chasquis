import { z } from "zod";

export const terminosSchema = z.object({
  contenido: z.string().trim().min(1).max(20000),
});

export type TerminosInput = z.infer<typeof terminosSchema>;
